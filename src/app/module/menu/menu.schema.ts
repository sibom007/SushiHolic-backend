import { z } from "zod";

const createMenuCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "To long"),
});

const updateMenuCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Name is required").max(255, "To long"),
});

const deleteMenuCategorySchema = z.object({
  id: z.uuid(),
});

const bulkDeleteMenuCategorySchema = z.object({
  ids: z.array(z.uuid()).min(1, "At least one ID is required"),
});

export const getMenuCategorySchema = z
  .object({
    page: z.string().min(1).default("1"),
    limit: z.string().min(1).max(20).default("6"),
    name: z.string().optional(),
  })
  .strict();

//////////// MenuItems  //////////////

const createMenuItemSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(255, "to long"),
  description: z.string().optional(),
  price: z
    .number({ error: "Price is required" })
    .positive("Price must be greater than zero"),
  imageUrl: z.url("Invalid image URL format"),
  isAvailable: z.boolean().optional(),
  categoryId: z.uuid("Invalid Category ID format"),
});

const updateMenuItemSchema = z.object({
  id: z.uuid("Invalid ID format"),
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(255, "To long")
    .optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than zero").optional(),
  imageUrl: z.url("Invalid image URL format").optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.uuid("Invalid Category ID format").optional(),
  isDelete: z.boolean().optional(),
});

const deleteMenuItemSchema = z.object({
  id: z.uuid("Invalid ID format"),
  type: z.enum(["hard", "soft"]).default("soft"),
});

const bulkDeleteMenuItemSchema = z.object({
  ids: z
    .array(z.uuid("Invalid ID format"))
    .min(1, "At least one ID is required for bulk delete"),
  type: z.enum(["hard", "soft"]).default("soft"),
});

const booleanQuerySchema = z.preprocess((val) => {
  if (val === "true" || val === true) return true;
  if (val === "false" || val === false) return false;
  return undefined;
}, z.boolean().optional());

const getMenuItemsQuerySchema = z.object({
  page: z.string().min(1).default("1"),
  limit: z.string().min(1).max(20).default("6"),
  searchTerm: z.string().trim().optional(), // Searches both name & description
  categoryId: z.uuid("Invalid category ID format").optional(),
  minPrice: z.coerce.number().nonnegative("Min price must be >= 0").optional(),
  maxPrice: z.coerce.number().positive("Max price must be > 0").optional(),
  isAvailable: booleanQuerySchema,
  isDelete: booleanQuerySchema.default(false), // Defaults to non-deleted items
  sortBy: z
    .enum(["createdAt", "price", "name", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const menuSchema = {
  createMenuCategorySchema,
  updateMenuCategorySchema,
  deleteMenuCategorySchema,
  bulkDeleteMenuCategorySchema,
  getMenuCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  deleteMenuItemSchema,
  bulkDeleteMenuItemSchema,
  getMenuItemsQuerySchema,
};
