import { Router } from "express";
import { UserRoutes } from "../app/module/user/user.routes";
import { ScheduleRoutes } from "../app/module/schedule/schedule.route";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
