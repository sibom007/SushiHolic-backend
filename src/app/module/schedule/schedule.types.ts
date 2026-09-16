import z from "zod";
import { scheduleSchema } from "./schedule.schema";

export type createBusinessHoursInput = z.infer<
  typeof scheduleSchema.createBusinessHoursSchema
>;
export type createManyBusinessHoursInput = z.infer<
  typeof scheduleSchema.createManyBusinessHoursSchema
>;
export type updateBusinessHoursInput = z.infer<
  typeof scheduleSchema.updateBusinessHoursSchema
>;

export type deleteBusinessHoursInput = z.infer<
  typeof scheduleSchema.deleteBusinessHoursSchema
>;

export type getBusinessHoursInput = z.infer<
  typeof scheduleSchema.getBusinessHoursSchema
>;
