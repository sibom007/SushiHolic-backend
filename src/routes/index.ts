import { Router } from "express";
import { UserRoutes } from "../app/module/user/user.routes";
import { ScheduleRoutes } from "../app/module/schedule/schedule.route";
import { menuRoutes } from "../app/module/menu/menu.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/",
    route: UserRoutes,
  },
  {
    path: "/schedule",
    route: ScheduleRoutes,
  },
  {
    path: "/menu",
    route: menuRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
