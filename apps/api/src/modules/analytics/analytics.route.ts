import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { analyticsTrackRateLimit } from "../../common/middleware/rate-limit.middleware.js";
import {
  trackPageViewController,
  trackSessionEndController,
  getStoreAnalyticsStatsController,
  getStoreVisitorChartsController,
  getStoreTrafficSourcesController,
  getStoreDevicesController,
  getStoreTopContentController,
  getLiveVisitorsController,
  getStoreCitiesController,
  getStoreConversionController,
  triggerAggregationController,
} from "./analytics.controller.js";

export const analyticsRouter: Router = Router();

// Public tracking endpoint (no auth required - called from storefront)
analyticsRouter.post("/track/:storeId", analyticsTrackRateLimit, trackPageViewController);
analyticsRouter.post("/track/:storeId/session-end", analyticsTrackRateLimit, trackSessionEndController);

// Store owner analytics — available to all authenticated store owners on all plans
analyticsRouter.get("/:storeId/stats", requireAuth, getStoreAnalyticsStatsController);
analyticsRouter.get("/:storeId/charts", requireAuth, getStoreVisitorChartsController);
analyticsRouter.get("/:storeId/traffic-sources", requireAuth, getStoreTrafficSourcesController);
analyticsRouter.get("/:storeId/devices", requireAuth, getStoreDevicesController);
analyticsRouter.get("/:storeId/top-content", requireAuth, getStoreTopContentController);
analyticsRouter.get("/:storeId/live", requireAuth, getLiveVisitorsController);
analyticsRouter.get("/:storeId/cities", requireAuth, getStoreCitiesController);
analyticsRouter.get("/:storeId/conversion", requireAuth, getStoreConversionController);

analyticsRouter.post("/:storeId/aggregate", requireAuth, triggerAggregationController);

export default analyticsRouter;
