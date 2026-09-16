import status from "http-status";
import { supabase } from "../../utils/supabase";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums";

export const requireAuth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(status.UNAUTHORIZED).json({
          error: "Unauthorized",
          message: "Access token missing or malformed",
        });
      }

      const token = authHeader.replace("Bearer ", "").trim();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.warn(
          `[Auth Warning] Failed token verification: ${error?.message || "User not found"}`,
        );

        return res.status(status.UNAUTHORIZED).json({
          error: "Unauthorized",
          message: "Invalid or expired session",
        });
      }

      // Check role if roles were provided to the middleware
      if (requiredRoles.length > 0) {
        const userRole = user.app_metadata?.role as UserRole;

        if (!userRole || !requiredRoles.includes(userRole)) {
          return res.status(status.FORBIDDEN).json({
            error: "Forbidden",
            message: "You do not have permission to access this resource",
          });
        }
      }

      req.user = user;
      next();
    } catch (err) {
      console.error(
        "[Auth Error] Unexpected exception during authentication:",
        err,
      );
      return res.status(status.INTERNAL_SERVER_ERROR).json({
        error: "Internal Server Error",
        message: "Authentication service unavailable",
      });
    }
  };
};
