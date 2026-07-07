import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureEnabled } from "../../common/middleware/plan-enforcement.middleware.js";
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

// Store owner analytics (requires auth + feature enabled)
analyticsRouter.get("/:storeId/stats", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreAnalyticsStatsController);

analyticsRouter.get("/:storeId/charts", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreVisitorChartsController);

analyticsRouter.get("/:storeId/traffic-sources", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreTrafficSourcesController);

analyticsRouter.get("/:storeId/devices", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreDevicesController);

analyticsRouter.get("/:storeId/top-content", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreTopContentController);

analyticsRouter.get("/:storeId/live", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "realtimeVisitors"), getLiveVisitorsController);

analyticsRouter.get("/:storeId/cities", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreCitiesController);

analyticsRouter.get("/:storeId/conversion", requireAuth, (req, res, next) =>
  requireFeatureEnabled(req, res, next, "visitorAnalytics"), getStoreConversionController);

analyticsRouter.post("/:storeId/aggregate", requireAuth, triggerAggregationController);

export default analyticsRouter;
