import z from "zod";
import { menuSchema } from "./menu.schema";

// Types
export type createMenuCategoryInput = z.infer<
  typeof menuSchema.createMenuCategorySchema
>;

export type updateMenuCategoryInput = z.infer<
  typeof menuSchema.updateMenuCategorySchema
>;

export type deleteMenuCategoryInput = z.infer<
  typeof menuSchema.deleteMenuCategorySchema
>;

export type bulkDeleteMenuCategoryInput = z.infer<
  typeof menuSchema.bulkDeleteMenuCategorySchema
>;
export type getMenuCategoryInput = z.infer<
  typeof menuSchema.getMenuCategorySchema
>;

export type createMenuItemInput = z.infer<
  typeof menuSchema.createMenuItemSchema
>;
export type updateMenuItemInput = z.infer<
  typeof menuSchema.updateMenuItemSchema
>;
export type deleteMenuItemParams = z.infer<
  typeof menuSchema.deleteMenuItemSchema
>;
export type bulkDeleteMenuItemInput = z.infer<
  typeof menuSchema.bulkDeleteMenuItemSchema
>;
export type getMenuItemsQueryInput = z.infer<
  typeof menuSchema.getMenuItemsQuerySchema
>;
