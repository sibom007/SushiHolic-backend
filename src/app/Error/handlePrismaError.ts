import { Prisma } from "../../generated/prisma/client";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database Error";
  let errorSources: TErrorSources = [];

  if (err.code === "P2002") {
    const target = (err.meta?.target as string[])?.join(", ") || "";
    errorSources = [
      {
        path: target,
        message: `A record with this ${target} already exists.`,
      },
    ];
    message = "Duplicate Entry";
  } else {
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
