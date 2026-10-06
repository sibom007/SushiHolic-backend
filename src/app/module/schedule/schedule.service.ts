import { BusinessHours, Prisma } from "../../../generated/prisma/client";
import { db } from "../../../utils/prisma";
import AppError from "../../Error/AppError";
import status from "http-status";

import {
  createBusinessHoursInput,
  createManyBusinessHoursInput,
  deleteBusinessHoursInput,
  getBusinessHoursInput,
  updateBusinessHoursInput,
} from "./schedule.types";
import { TAuthUser } from "../../../utils/supabase";
import { findUserOrThrow } from "../../../utils/findUserOrThrow";

const createScheduleInToDB = async (
  payload: createBusinessHoursInput | createManyBusinessHoursInput,
  AuthUser: TAuthUser,
): Promise<
  | BusinessHours
  | {
      count: number;
      schedules: BusinessHours[];
      skippedDates: Date[];
    }
> => {
  const existUser = await findUserOrThrow(AuthUser.id);

  if ("schedules" in payload) {
    const schedulesWithCreator = payload.schedules.map((schedule) => ({
      ...schedule,
      creatorId: existUser.id,
    }));

    // Get dates that already exist
    const existingSchedules = await db.businessHours.findMany({
      where: {
        date: {
          in: schedulesWithCreator.map((schedule) => schedule.date),
        },
      },
      select: {
        date: true,
      },
    });

    const existingDates = new Set(
      existingSchedules.map((schedule) => schedule.date.toISOString()),
    );

    // Keep only schedules whose dates don't already exist
    const schedulesToCreate = schedulesWithCreator.filter(
      (schedule) => !existingDates.has(schedule.date.toISOString()),
    );

    // Nothing new to create
    if (schedulesToCreate.length === 0) {
      return {
        count: 0,
        schedules: [],
        skippedDates: existingSchedules.map((schedule) => schedule.date),
      };
    }

    // Create and return the actual records
    const createdSchedules = await db.businessHours.createManyAndReturn({
      data: schedulesToCreate,
    });

    return {
      count: createdSchedules.length,
      schedules: createdSchedules,
      skippedDates: existingSchedules.map((schedule) => schedule.date),
    };
  }

  return await db.businessHours.create({
    data: {
      ...payload,
      creatorId: existUser.id,
    },
  });
};

const updateScheduleInToDB = async (
  payload: updateBusinessHoursInput,
): Promise<BusinessHours> => {
  const { id, ...updateData } = payload;

  // Prisma's update method automatically updates only the fields provided in updateData
  const result = await db.businessHours.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteScheduleInToDB = async (payload: deleteBusinessHoursInput) => {
  // Handle multiple deletions (payload contains "ids")
  if ("ids" in payload && Array.isArray(payload.ids)) {
    // Check how many records actually exist in the database first
    const existingRecords = await db.businessHours.findMany({
      where: { id: { in: payload.ids } },
      select: { id: true },
    });

    const existingIds = existingRecords.map((record) => record.id);
    const missingIds = payload.ids.filter((id) => !existingIds.includes(id));

    if (existingIds.length === 0) {
      throw new AppError(
        status.NOT_FOUND,
        "None of the specified schedules were found in the database.",
      );
    }

    // Perform the deletion for the ones that exist
    const deleteResult = await db.businessHours.deleteMany({
      where: { id: { in: existingIds } },
    });

    return {
      deletedCount: deleteResult.count,
      missingIds: missingIds.length > 0 ? missingIds : undefined,
    };
  }

  // Handle single deletion (payload contains a single "id")
  else if ("id" in payload && payload.id) {
    const existingRecord = await db.businessHours.findUnique({
      where: { id: payload.id },
    });

    if (!existingRecord) {
      throw new Error(
        `Schedule with ID ${payload.id} was not found in the database.`,
      );
    }

    const deletedRecord = await db.businessHours.delete({
      where: { id: payload.id },
    });

    return {
      deletedRecord,
    };
  } else {
    throw new Error("Invalid payload structure. Provide either 'id' or 'ids'.");
  }
};

const softDeleteScheduleInToDB = async (payload: deleteBusinessHoursInput) => {
  // Handle multiple soft deletions (payload contains "ids")
  if ("ids" in payload && Array.isArray(payload.ids)) {
    // Check how many active records actually exist in the database first
    const existingRecords = await db.businessHours.findMany({
      where: {
        id: { in: payload.ids },
        isDelete: false,
      },
      select: { id: true },
    });

    const existingIds = existingRecords.map((record) => record.id);
    const missingIds = payload.ids.filter((id) => !existingIds.includes(id));

    if (existingIds.length === 0) {
      throw new AppError(
        status.NOT_FOUND,
        "None of the specified active schedules were found in the database.",
      );
    }

    // Perform the soft delete (update isDeleted to true) for the ones that exist
    const updateResult = await db.businessHours.updateMany({
      where: { id: { in: existingIds } },
      data: { isDeleted: true },
    });

    return {
      updatedCount: updateResult.count,
      missingIds: missingIds.length > 0 ? missingIds : undefined,
    };
  }

  // Handle single soft deletion (payload contains a single "id")
  else if ("id" in payload && payload.id) {
    const existingRecord = await db.businessHours.findUnique({
      where: { id: payload.id },
    });

    if (!existingRecord || existingRecord.isDelete) {
      throw new AppError(
        status.NOT_FOUND,
        `Schedule with ID ${payload.id} was not found or is already deleted.`,
      );
    }

    const updatedRecord = await db.businessHours.update({
      where: { id: payload.id },
      data: { isDeleted: true },
    });

    return {
      updatedRecord,
    };
  } else {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid payload structure. Provide either 'id' or 'ids'.",
    );
  }
};

const getScheduleInToDB = async (query: getBusinessHoursInput) => {
  const { page, limit, date } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const where: Prisma.BusinessHoursWhereInput = {
    ...(date && {
      date,
    }),
  };

  const [data, total] = await db.$transaction([
    db.businessHours.findMany({
      where,
      skip,
      take: limitNumber,

      orderBy: {
        date: "asc",
      },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    }),

    db.businessHours.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  return {
    data,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  };
};

const getCurrentWeekScheduleInToDB = async () => {
  const currentDate = new Date();

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const currentWeek = await db.businessHours.findMany({
    where: {
      date: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      createdBy: {
        select: {
          email: true,
        },
      },
    },
  });

  return currentWeek;
};

export const scheduleServices = {
  createScheduleInToDB,
  updateScheduleInToDB,
  deleteScheduleInToDB,
  softDeleteScheduleInToDB,
  getScheduleInToDB,
  getCurrentWeekScheduleInToDB,
};
