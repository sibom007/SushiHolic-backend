import { z } from "zod";

const id = z.uuid("Invalid ID format");
const page = z.string().min(1).default("1");
const limit = z.string().min(1).max(20).default("6");

const createMenuCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "To long"),
});

const updateMenuCategorySchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(255, "To long"),
});

const deleteMenuCategorySchema = z.object({
  id,
});

const bulkDeleteMenuCategorySchema = z.object({
  ids: z.array(id).min(1, "At least one ID is required"),
});

export const getMenuCategorySchema = z
  .object({
    page: z.string().min(1).default("1"),
    limit: z.string().min(1).max(20).default("6"),
    name: z.string().optional(),
  })
  .strict();

//////////// MenuItems  //////////////

const ManuItemName = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters");

const ManuItemDescription = z
  .string()
  .trim()
  .max(500, "Description must not exceed 500 characters")
  .nullable()
  .optional();

const ManuItemPrice = z
  .number({
    message: "Price must be a valid number",
  })
  .min(0, "Price cannot be negative");

const ManuItemImageUrl = z.string().url("Please provide a valid image URL");

const ManuItemisAvailable = z
  .boolean({
    message: "Availability must be true or false",
  })
  .default(true);

export const createMenuItemSchema = z.object({
  name: ManuItemName,
  description: ManuItemDescription,
  price: ManuItemPrice,
  imageUrl: ManuItemImageUrl,
  isAvailable: ManuItemisAvailable,
  categoryId: id,
  addons: z.array(id),
});

export const updateMenuItemSchema = z.object({
  id,
  name: ManuItemName,
  description: ManuItemDescription,
  price: ManuItemPrice,
  imageUrl: ManuItemImageUrl,
  isAvailable: ManuItemisAvailable,
});

const deleteMenuItemSchema = z.object({
  id,
  type: z.enum(["hard", "soft"]).default("soft"),
});

const bulkDeleteMenuItemSchema = z.object({
  ids: z.array(id).min(1, "At least one ID is required for bulk delete"),
  type: z.enum(["hard", "soft"]).default("soft"),
});

const booleanQuerySchema = z.preprocess((val) => {
  if (val === "true" || val === true) return true;
  if (val === "false" || val === false) return false;
  return undefined;
}, z.boolean().optional());

const getMenuItemsQuerySchema = z.object({
  page,
  limit,
  searchTerm: z.string().trim().optional(), // Searches both name & description
  categoryId: id.optional(),
  isAvailable: booleanQuerySchema,
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

////// addons /////

const AddonName = z
  .string()
  .trim()

  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters");
const AddonPrice = z
  .number({
    message: "Price must be a valid number",
  })
  .min(0, "Price cannot be negative");

const AddonsIsAvailable = z
  .boolean({
    message: "Availability must be true or false",
  })
  .default(true);

const createAddonSchema = z.object({
  name: AddonName,
  price: AddonPrice,
  isAvailable: AddonsIsAvailable,
  categoryId: id,
});

const updateAddonSchema = z.object({
  id: id,
  name: AddonName.optional(),
  price: AddonPrice.optional(),
  isAvailable: AddonsIsAvailable.optional(),
});

const deleteAddonSchema = z.object({
  id,
});

const getAddonsSchema = z.object({
  page,
  limit,

  name: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),

  price: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().nonnegative().optional(),
  ),

  isAvailable: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});

const getAddonsForSelectSchema = z.object({
  categoryId: id,
  search: z.string().optional(),
});
export const menuSchema = {
  createMenuCategorySchema,
  updateMenuCategorySchema,
  deleteMenuCategorySchema,
  bulkDeleteMenuCategorySchema,
  getMenuCategorySchema,

  //// menuItem ////
  createMenuItemSchema,
  updateMenuItemSchema,
  deleteMenuItemSchema,
  bulkDeleteMenuItemSchema,
  getMenuItemsQuerySchema,

  //// addons////
  createAddonSchema,
  updateAddonSchema,
  deleteAddonSchema,
  getAddonsSchema,
  getAddonsForSelectSchema,
};
