import status from "http-status";
import AppError from "../app/Error/AppError";
import { db } from "./prisma";

export const findUserOrThrow = async (userId: string) => {
  const user = await db.account.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "user not found");
  }

  return user;
};
