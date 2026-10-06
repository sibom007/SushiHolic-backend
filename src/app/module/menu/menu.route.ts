import express from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { createRateLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { menuContorler } from "./menu.contorler";
import { menuSchema } from "./menu.schema";

const router = express.Router();

router.post(
  "/create",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: menuSchema.createMenuCategorySchema,
  }),
  menuContorler.createMenuCategory,
);

router.patch(
  "/update",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: menuSchema.updateMenuCategorySchema,
  }),
  menuContorler.updateMenuCategory,
);

router.delete(
  "/delete/:id",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    params: menuSchema.deleteMenuCategorySchema,
  }),
  menuContorler.deleteMenuCategory,
);

router.delete(
  "/bulk-delete",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    body: menuSchema.bulkDeleteMenuCategorySchema,
  }),
  menuContorler.bulkDeleteMenuCategory,
);

router.get(
  "/get-menu-categoris",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({
    query: menuSchema.getMenuCategorySchema,
  }),
  menuContorler.getMenuCategory,
);

router.post(
  "/items",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({ body: menuSchema.createMenuItemSchema }),
  menuContorler.createMenuItem,
);

router.patch(
  "/items-update",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({ body: menuSchema.updateMenuItemSchema }),
  menuContorler.updateMenuItem,
);

router.delete(
  "/items/bulk-delete",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({ body: menuSchema.bulkDeleteMenuItemSchema }),
  menuContorler.bulkDeleteMenuItem,
);

router.delete(
  "/items-delete",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({ body: menuSchema.deleteMenuItemSchema }),
  menuContorler.deleteMenuItem,
);

router.get(
  "/items",
  requireAuth(UserRole.OWNER),
  createRateLimiter({ limit: 100 }),
  validateRequest({ query: menuSchema.getMenuItemsQuerySchema }),
  menuContorler.getMenuItems,
);

export const menuRoutes = router;
