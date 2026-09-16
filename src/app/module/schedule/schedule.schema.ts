import { boolean, z } from "zod";

const dateField = z.coerce.date();
const timeField = z
  .string()
  .regex(
    /^(?:[01]?[0-9]|2[0-3]):([0-5][0-9])$/,
    "Time must be in valid 24-hour format (e.g., 8:00 or 08:00)",
  )
  .transform((val) => {
    const [hours, minutes] = val.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  });

const isClosedField = z.boolean();
const idField = z.uuidv4();

const BusinessHoursFieldsSchema = z
  .object({
    date: dateField,
    opensAt: timeField,
    closesAt: timeField,
  })
  .refine(({ opensAt, closesAt }) => opensAt < closesAt, {
    path: ["closesAt"],
    message: "Closing time must be later than opening time.",
  });

const createBusinessHoursSchema = BusinessHoursFieldsSchema;

const createManyBusinessHoursSchema = z.object({
  schedules: z
    .array(BusinessHoursFieldsSchema)
    .min(1)
    .max(14)
    .superRefine((schedules, ctx) => {
      const dates = schedules.map(
        (schedule) => schedule.date.toISOString().split("T")[0],
      );

      const uniqueDates = new Set(dates);

      if (uniqueDates.size !== dates.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate dates found in the schedules array.",
          path: ["schedules"],
        });
      }
    }),
});

const updateBusinessHoursSchema = z
  .object({
    id: idField,
    date: dateField.optional(),
    opensAt: timeField.optional(),
    closesAt: timeField.optional(),
    isClosed: isClosedField.optional(),
    isDelete: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If both opensAt and closesAt are provided, validate them
      if (data.opensAt && data.closesAt && !data.isClosed) {
        return data.opensAt < data.closesAt;
      }
      return true;
    },
    {
      path: ["closesAt"],
      message: "Closing time must be later than opening time.",
    },
  );

const deleteBusinessHoursSchema = z
  .object({
    id: z.uuid().optional(),
    ids: z.array(z.uuid()).optional(),
  })
  .refine((data) => data.id || (data.ids && data.ids.length > 0), {
    message: "Payload must contain either an 'id' or a non-empty 'ids' array.",
  });

export const getBusinessHoursSchema = z
  .object({
    page: z.string().min(1).default("1"),
    limit: z.string().min(1).max(20).default("6"),
    date: dateField.optional(),
  })
  .strict();

export const scheduleSchema = {
  createBusinessHoursSchema,
  createManyBusinessHoursSchema,
  updateBusinessHoursSchema,
  deleteBusinessHoursSchema,
  getBusinessHoursSchema,
};
