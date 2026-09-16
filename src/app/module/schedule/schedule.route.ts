import z from "zod";
import express from "express";
import { scheduleSchema } from "./schedule.schema";
import { UserRole } from "../../../generated/prisma/enums";
import { scheduleControllers } from "./schedule.contorler";
import { requireAuth } from "../../middlewares/requireAuth";
import validateRequest from "../../middlewares/validateRequest";
import { createRateLimiter } from "../../middlewares/rateLimiter";

const router = express.Router();

router.post(
  "/create",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: z.union([
      scheduleSchema.createBusinessHoursSchema,
      scheduleSchema.createManyBusinessHoursSchema,
    ]),
  }),
  scheduleControllers.createSchedule,
);

router.get(
  "/",
  createRateLimiter({ limit: 100 }),
  requireAuth(UserRole.OWNER, UserRole.MANAGER),
  validateRequest({
    query: scheduleSchema.getBusinessHoursSchema,
  }),
  scheduleControllers.getSchedule,
);

router.get(
  "/current-week",
  createRateLimiter({ limit: 100 }),
  scheduleControllers.getCurrentWeekSchedule,
);

router.patch(
  "/update",
  requireAuth(UserRole.OWNER, UserRole.STAFF),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: scheduleSchema.updateBusinessHoursSchema,
  }),
  scheduleControllers.updateSchedule,
);

router.delete(
  "/delete",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: scheduleSchema.deleteBusinessHoursSchema,
  }),
  scheduleControllers.deleteSchedule,
);

router.delete(
  "/soft-delete",
  requireAuth(UserRole.OWNER, UserRole.STAFF),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: scheduleSchema.deleteBusinessHoursSchema,
  }),
  scheduleControllers.softDeleteSchedule,
);

export const ScheduleRoutes = router;
