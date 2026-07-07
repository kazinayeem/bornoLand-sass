import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  getPlatformOverviewController,
  getRevenueAnalyticsController,
  getSubscriptionRevenueController,
  getPaymentDashboardController,
  getFinanceDashboardController,
  getRevenueReportController,
  getStoreReportController,
  getSubscriptionReportController,
  getPaymentReportController,
  getOrderReportController,
} from "./platform.controller.js";

export const platformRouter: Router = Router();

platformRouter.use(requireAuth);
platformRouter.use(requireRole("super_admin"));

// ── Dashboard Overview ───────────────────────────────────────
platformRouter.get("/overview", getPlatformOverviewController);

// ── Revenue Analytics ────────────────────────────────────────
platformRouter.get("/revenue-analytics", getRevenueAnalyticsController);

// ── Subscription Revenue ─────────────────────────────────────
platformRouter.get("/subscription-revenue", getSubscriptionRevenueController);

// ── Payment Dashboard ────────────────────────────────────────
platformRouter.get("/payment-dashboard", getPaymentDashboardController);

// ── Finance Dashboard ────────────────────────────────────────
platformRouter.get("/finance", getFinanceDashboardController);

// ── Reports ──────────────────────────────────────────────────
platformRouter.get("/reports/revenue", getRevenueReportController);
platformRouter.get("/reports/stores", getStoreReportController);
platformRouter.get("/reports/subscriptions", getSubscriptionReportController);
platformRouter.get("/reports/payments", getPaymentReportController);
platformRouter.get("/reports/orders", getOrderReportController);
