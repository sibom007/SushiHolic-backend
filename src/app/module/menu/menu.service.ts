import { Prisma } from "../../../generated/prisma/client";
import { db } from "../../../utils/prisma";
import AppError from "../../Error/AppError";
import status from "http-status";
import {
  bulkDeleteMenuCategoryInput,
  bulkDeleteMenuItemInput,
  createMenuCategoryInput,
  createMenuItemInput,
  deleteMenuCategoryInput,
  deleteMenuItemParams,
  getMenuCategoryInput,
  getMenuItemsQueryInput,
  updateMenuCategoryInput,
  updateMenuItemInput,
} from "./menu.types";

const createMenuCategoryInToDB = async (payload: createMenuCategoryInput) => {
  return db.menuCategory.create({
    data: payload,
  });
};

const updateMenuCategoryInToDB = async (payload: updateMenuCategoryInput) => {
  const { id, ...data } = payload;

  return db.menuCategory.update({
    where: { id },
    data,
  });
};

const deleteMenuCategoryInToDB = async (payload: deleteMenuCategoryInput) => {
  const exMenuCategory = await db.menuCategory.findUnique({
    where: {
      id: payload.id,
    },
    include: {
      items: true,
    },
  });

  if (!exMenuCategory) {
    throw new AppError(status.NOT_FOUND, "The MenuCategory is Not Found !");
  }
  if (exMenuCategory.items.length !== 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot delete these categories because they contain menu items.Please delete their items first.",
    );
  }

  return db.menuCategory.delete({
    where: { id: payload.id },
  });
};

const bulkDeleteMenuCategoryInToDB = async (
  payload: bulkDeleteMenuCategoryInput,
) => {
  // 1. Fetch all categories that match the IDs along with their items
  const categoriesToDelete = await db.menuCategory.findMany({
    where: {
      id: { in: payload.ids },
    },
    include: {
      items: true, // Include items so we can check if they are empty
    },
  });

  // 2. Check if any category was actually found
  if (categoriesToDelete.length === 0) {
    throw new AppError(
      status.NOT_FOUND,
      "No Menu Categories found for the provided IDs!",
    );
  }

  // 3. Find if any of the categories contain menu items
  const categoriesWithItems = categoriesToDelete.filter(
    (category) => category.items.length > 0,
  );

  // 4. If any category has items, block the bulk deletion and throw an error
  if (categoriesWithItems.length > 0) {
    const categoryNames = categoriesWithItems.map((c) => c.name).join(", ");
    throw new AppError(
      status.BAD_REQUEST,
      `You cannot delete these categories because they contain menu items: [${categoryNames}]. Please delete their items first.`,
    );
  }

  // 5. If all checks pass, proceed with the bulk delete
  return db.menuCategory.deleteMany({
    where: {
      id: { in: payload.ids },
    },
  });
};

const getMenuCategoryInToDB = async (query: getMenuCategoryInput) => {
  const { page, limit, name } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const where: Prisma.MenuCategoryWhereInput = {
    ...(name && {
      name: {
        contains: name,
        mode: "insensitive",
      },
    }),
  };

  const [data, total] = await db.$transaction([
    db.menuCategory.findMany({
      where,
      skip,
      take: limitNumber,

      orderBy: {
        createdAt: "asc",
      },
      include: {
        items: true,
      },
    }),

    db.menuCategory.count({
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

//////////// MenuItems  //////////////

const createMenuItemInToDB = async (payload: createMenuItemInput) => {
  // Check if the provided categoryId actually exists
  const isCategoryExists = await db.menuCategory.findUnique({
    where: { id: payload.categoryId },
  });

  if (!isCategoryExists) {
    throw new AppError(
      status.NOT_FOUND,
      "The specified Category was not found!",
    );
  }

  const result = await db.menuItem.create({
    data: payload,
  });

  return result;
};

const updateMenuItemInToDB = async (payload: updateMenuItemInput) => {
  // Check if the item exists before updating
  const existingItem = await db.menuItem.findUnique({
    where: { id: payload.id },
  });

  if (!existingItem) {
    throw new AppError(status.NOT_FOUND, "Menu Item not found!");
  }

  // If the update includes a new categoryId, verify the new category exists
  if (payload.categoryId) {
    const isCategoryExists = await db.menuCategory.findUnique({
      where: { id: payload.categoryId },
    });

    if (!isCategoryExists) {
      throw new AppError(
        status.NOT_FOUND,
        "The specified new Category was not found!",
      );
    }
  }

  const result = await db.menuItem.update({
    where: { id: payload.id },
    data: payload,
  });

  return result;
};

const deleteMenuItemInToDB = async (payload: deleteMenuItemParams) => {
  // Verify existence
  const existingItem = await db.menuItem.findUnique({
    where: { id: payload.id },
  });

  if (!existingItem) {
    throw new AppError(status.NOT_FOUND, "Menu Item not found!");
  }

  if (payload.type === "hard") {
    // Hard delete the item from the database
    const result = await db.menuItem.delete({
      where: { id: payload.id },
    });
    return result;
  } else {
    // Soft delete: update the isDelete flag and make it unavailable
    const result = await db.menuItem.update({
      where: { id: payload.id },
      data: { isDelete: true, isAvailable: false },
    });
    return result;
  }
};

const bulkDeleteMenuItemInToDB = async (payload: bulkDeleteMenuItemInput) => {
  // Verify that there are items matching these IDs
  const itemsToDelete = await db.menuItem.findMany({
    where: {
      id: { in: payload.ids },
    },
  });

  if (itemsToDelete.length === 0) {
    throw new AppError(
      status.NOT_FOUND,
      "No matching Menu Items found for the provided IDs!",
    );
  }

  if (payload.type === "hard") {
    // Hard delete all matching items
    const result = await db.menuItem.deleteMany({
      where: {
        id: { in: payload.ids },
      },
    });
    return result;
  } else {
    // Soft delete: update the isDelete flag and make them unavailable
    const result = await db.menuItem.updateMany({
      where: { id: { in: payload.ids } },
      data: { isDelete: true, isAvailable: false },
    });
    return result;
  }
};

const getMenuItemsInToDB = async (query: getMenuItemsQueryInput) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    categoryId,
    minPrice,
    maxPrice,
    isAvailable,
    isDelete = false,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Build dynamic Prisma filter query
  const where: Prisma.MenuItemWhereInput = {
    // 1. Soft-delete filter (defaults to fetching non-deleted items)
    isDelete: isDelete ?? false,

    // 2. Search term filter across name & description
    ...(searchTerm && {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    }),

    // 3. Category ID filter
    ...(categoryId && { categoryId }),

    // 4. Availability filter
    ...(typeof isAvailable === "boolean" && { isAvailable }),

    // 5. Price range filter
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  // Run data query and total count query in a single transaction
  const [data, total] = await db.$transaction([
    db.menuItem.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        addons: true, // Includes related addons
      },
    }),

    db.menuItem.count({ where }),
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

export const menuService = {
  createMenuCategoryInToDB,
  updateMenuCategoryInToDB,
  deleteMenuCategoryInToDB,
  bulkDeleteMenuCategoryInToDB,
  getMenuCategoryInToDB,
  createMenuItemInToDB,
  updateMenuItemInToDB,
  deleteMenuItemInToDB,
  bulkDeleteMenuItemInToDB,
  getMenuItemsInToDB,
};
