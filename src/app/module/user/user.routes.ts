import express from "express";
import { UserControllers } from "./user.contorler";
import { requireAuth } from "../../middlewares/requireAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = express.Router();

router.get("/test", requireAuth(UserRole.MANAGER), UserControllers.createUser);

export const UserRoutes = router;
