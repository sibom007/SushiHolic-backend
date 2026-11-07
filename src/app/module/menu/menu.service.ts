import { Prisma } from "../../../generated/prisma/client";
import { db } from "../../../utils/prisma";
import AppError from "../../Error/AppError";
import status from "http-status";
import {
  bulkDeleteMenuCategoryInput,
  bulkDeleteMenuItemInput,
  createAddonInput,
  createMenuCategoryInput,
  createMenuItemInput,
  deleteAddonParams,
  deleteMenuCategoryInput,
  deleteMenuItemParams,
  getAddonsForSelectInput,
  getAddonsInput,
  getMenuCategoryInput,
  getMenuItemsQueryInput,
  updateAddonInput,
  updateMenuCategoryInput,
  updateMenuItemInput,
} from "./menu.types";
import { cloudinary } from "../../../helper/cloudinary";

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

const getMenuCategoriesForSelect = async () => {
  return db.menuCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

//////////// MenuItems  //////////////

const createMenuItemInToDB = async (payload: createMenuItemInput) => {
  const { categoryId, addons, ...menuItemData } = payload;

  // Check category
  const isCategoryExists = await db.menuCategory.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!isCategoryExists) {
    throw new AppError(
      status.NOT_FOUND,
      "The specified Category was not found!",
    );
  }

  // Check addons
  if (addons.length > 0) {
    const existingAddons = await db.addon.findMany({
      where: {
        id: { in: addons },
      },
      select: { id: true },
    });

    if (existingAddons.length !== new Set(addons).size) {
      throw new AppError(
        status.NOT_FOUND,
        "One or more specified addons were not found!",
      );
    }
  }

  // Create menu item
  const result = await db.menuItem.create({
    data: {
      ...menuItemData,
      category: {
        connect: { id: categoryId },
      },
      addons: {
        connect: addons.map((id) => ({ id })),
      },
    },
    include: {
      category: true,
      addons: true,
    },
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
    isAvailable,
    sortOrder = "desc",
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Build dynamic Prisma filter query
  const where: Prisma.MenuItemWhereInput = {
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
  };

  // Run data query and total count query in a single transaction
  const [data, total] = await db.$transaction([
    db.menuItem.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: sortOrder,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        addons: true,
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

//// addons ////
const createAddonInToDB = async (payload: createAddonInput) => {
  const category = await db.menuCategory.findUnique({
    where: { id: payload.categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Menu category not found");
  }

  const existingAddon = await db.addon.findFirst({
    where: {
      name: { equals: payload.name, mode: "insensitive" },
      categoryId: payload.categoryId,
    },
    select: { id: true },
  });

  if (existingAddon) {
    throw new AppError(
      status.CONFLICT,
      "Addon already exists in this category",
    );
  }

  return db.addon.create({
    data: {
      name: payload.name,
      price: new Prisma.Decimal(payload.price),
      isAvailable: payload.isAvailable,
      category: {
        connect: { id: payload.categoryId },
      },
    },
    include: {
      category: true,
    },
  });
};

const updateAddonInToDB = async (payload: updateAddonInput) => {
  const { id: addonId, ...input } = payload;

  const existingAddon = await db.addon.findUnique({
    where: { id: addonId },
  });

  if (!existingAddon) throw new AppError(status.NOT_FOUND, "Addon not found");

  const data: Prisma.AddonUpdateInput = {};

  const name = input.name;

  if (name !== undefined) {
    const duplicate = await db.addon.findFirst({
      where: {
        id: { not: addonId },
        name: { equals: name, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new AppError(
        status.CONFLICT,
        "Addon already exists for this menu item and category",
      );
    }

    data.name = name;
  }

  if (input.price !== undefined) {
    data.price = new Prisma.Decimal(input.price);
  }

  if (input.isAvailable !== undefined) {
    data.isAvailable = input.isAvailable;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("Provide at least one field to update");
  }

  return db.addon.update({
    where: { id: addonId },
    data,
    include: {
      menuItem: true,
      category: true,
    },
  });
};

const deleteAddonInToDB = async (payload: deleteAddonParams) => {
  const existingAddon = await db.addon.findUnique({
    where: { id: payload.id },
    select: { id: true },
  });

  if (!existingAddon) {
    throw new AppError(status.NOT_FOUND, "Addon not found");
  }

  const isUsedByMenuItem = await db.menuItem.findFirst({
    where: {
      addons: {
        some: {
          id: payload.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (isUsedByMenuItem) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete this addon because it is assigned to a menu item.",
    );
  }

  return db.addon.delete({
    where: { id: payload.id },
  });
};

const getAddonInToDB = async (payload: getAddonsInput) => {
  const page = Math.max(1, Number(payload.page) || 1);
  const limit = Math.min(20, Math.max(1, Number(payload.limit) || 6));
  const skip = (page - 1) * limit;

  const where: Prisma.AddonWhereInput = {};

  if (payload.name) {
    where.name = {
      contains: payload.name.trim(),
      mode: "insensitive",
    };
  }

  if (payload.price !== undefined) {
    where.price = new Prisma.Decimal(payload.price);
  }

  if (payload.isAvailable !== undefined) {
    where.isAvailable = payload.isAvailable;
  }

  const [addons, total] = await db.$transaction([
    db.addon.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      include: {
        menuItem: true,
        category: true,
      },
    }),
    db.addon.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: addons,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && total > 0,
    },
  };
};

const deleteMenuImage = async (payload: { publicId: string }) => {
  const { publicId } = payload;

  if (typeof publicId !== "string" || !publicId.startsWith("menu-items/")) {
    throw new AppError(status.BAD_REQUEST, "Invalid image public ID");
  }

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete image");
  }
};

const getMenuAddonsForSelect = async (query: getAddonsForSelectInput) => {
  const { categoryId, search } = query;

  return db.addon.findMany({
    where: {
      ...(categoryId && { categoryId }),

      ...(search && {
        name: {
          contains: search.trim(),
          mode: "insensitive",
        },
      }),
    },

    select: {
      id: true,
      name: true,
      price: true,
    },

    orderBy: {
      name: "asc",
    },
  });
};

export const menuService = {
  createMenuCategoryInToDB,
  updateMenuCategoryInToDB,
  deleteMenuCategoryInToDB,
  bulkDeleteMenuCategoryInToDB,
  getMenuCategoryInToDB,
  getMenuCategoriesForSelect,
  createMenuItemInToDB,
  updateMenuItemInToDB,
  deleteMenuItemInToDB,
  bulkDeleteMenuItemInToDB,
  getMenuItemsInToDB,
  createAddonInToDB,
  deleteAddonInToDB,
  updateAddonInToDB,
  getAddonInToDB,
  deleteMenuImage,
  getMenuAddonsForSelect,
};
