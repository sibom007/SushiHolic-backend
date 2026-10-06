import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { menuService } from "./menu.service";
import status from "http-status";

const createMenuCategory = catchAsync(async (req, res) => {
  const result = await menuService.createMenuCategoryInToDB(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "menu Category create successfully!",
    data: result,
  });
});

const updateMenuCategory = catchAsync(async (req, res) => {
  const result = await menuService.updateMenuCategoryInToDB(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "menu Category update successfully!",
    data: result,
  });
});

const deleteMenuCategory = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await menuService.deleteMenuCategoryInToDB({ id });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "menu Category delete successfully!",
    data: result,
  });
});

const bulkDeleteMenuCategory = catchAsync(async (req, res) => {
  const result = await menuService.bulkDeleteMenuCategoryInToDB(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "menu Category delete successfully!",
    data: result,
  });
});

const getMenuCategory = catchAsync(async (req, res) => {
  const result = await menuService.getMenuCategoryInToDB(res.locals.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "menu Category successfully!",
    data: result,
  });
});

const createMenuItem = catchAsync(async (req, res) => {
  const result = await menuService.createMenuItemInToDB(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Menu Item created successfully!",
    data: result,
  });
});

const updateMenuItem = catchAsync(async (req, res) => {
  const result = await menuService.updateMenuItemInToDB(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Menu Item updated successfully!",
    data: result,
  });
});

const deleteMenuItem = catchAsync(async (req, res) => {
  const result = await menuService.deleteMenuItemInToDB(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Menu Item deleted successfully!`,
    data: result,
  });
});

const bulkDeleteMenuItem = catchAsync(async (req, res) => {
  const { ids, type } = req.body;
  const deleteType = (type as "hard" | "soft") || "soft";

  const result = await menuService.bulkDeleteMenuItemInToDB({
    ids,
    type: deleteType,
  });

  sendResponse(res, {
    statusCode: status.OK, // 200
    success: true,
    message: `Menu Items ${deleteType} deleted successfully!`,
    data: result,
  });
});

const getMenuItems = catchAsync(async (req, res) => {
  const query = res.locals.query || req.query;
  const result = await menuService.getMenuItemsInToDB(query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Menu Items retrieved successfully!",
    data: result,
  });
});

export const menuContorler = {
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  bulkDeleteMenuCategory,
  getMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkDeleteMenuItem,
  getMenuItems,
};
