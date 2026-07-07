import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  getAdminPlatformAnalyticsController,
  getAdminStoreAnalyticsController,
  getAdminStoreVisitorStatsController,
} from "./admin-analytics.controller.js";

export const adminAnalyticsRouter: Router = Router();

adminAnalyticsRouter.use(requireAuth);
adminAnalyticsRouter.use(requireRole("super_admin"));

adminAnalyticsRouter.get("/overview", getAdminPlatformAnalyticsController);
adminAnalyticsRouter.get("/stores/:storeId", getAdminStoreAnalyticsController);
adminAnalyticsRouter.get("/stores/:storeId/stats", getAdminStoreVisitorStatsController);

export default adminAnalyticsRouter;
