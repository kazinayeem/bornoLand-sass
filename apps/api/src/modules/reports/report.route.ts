import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import { checkFeature } from "../features/feature-access.service.js";
import {
  getDashboardKPIs,
  getRevenueReport,
  getOrderReport,
  getCustomerReport,
  getProductReport,
  getCategoryReport,
  getCouponReport,
  getMediaReport,
  getActivityReport,
  getSummaryReport,
  getAdminCrossStoreReport,
} from "./report.service.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export const reportRouter: Router = Router();

// ── Middleware: check reports feature access ─────────────────────────────────

async function requireReportsAccess(request: AuthRequest, response: Response, next: () => void) {
  const storeId = String(request.params.storeId || request.query.storeId || "");
  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await checkFeature(storeId, "reports");
  if (!result.allowed) {
    return sendFailure(response, result.message || "Reports not available on your plan", 403);
  }
  next();
}

// ── Store Owner Routes ──────────────────────────────────────────────────────

reportRouter.use(requireAuth);

// Dashboard KPIs
reportRouter.get("/stores/:storeId/dashboard", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const range = { preset: preset as any, start, end };
  const data = await getDashboardKPIs(String(request.params.storeId), range);
  return sendSuccess(response, data);
});

// Revenue Report
reportRouter.get("/stores/:storeId/revenue", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getRevenueReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Order Report
reportRouter.get("/stores/:storeId/orders", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getOrderReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Customer Report
reportRouter.get("/stores/:storeId/customers", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getCustomerReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Product Report
reportRouter.get("/stores/:storeId/products", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getProductReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Category Report
reportRouter.get("/stores/:storeId/categories", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getCategoryReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Coupon Report
reportRouter.get("/stores/:storeId/coupons", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getCouponReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Media Report
reportRouter.get("/stores/:storeId/media", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const data = await getMediaReport(String(request.params.storeId));
  return sendSuccess(response, data);
});

// Activity Report
reportRouter.get("/stores/:storeId/activity", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const { preset, start, end } = request.query as Record<string, string>;
  const data = await getActivityReport(String(request.params.storeId), { preset: preset as any, start, end });
  return sendSuccess(response, data);
});

// Summary Reports
reportRouter.get("/stores/:storeId/summary/:period", requireReportsAccess, async (request: AuthRequest, response: Response) => {
  const period = request.params.period as "daily" | "weekly" | "monthly" | "yearly";
  if (!["daily", "weekly", "monthly", "yearly"].includes(period)) {
    return sendFailure(response, "Invalid period", 400);
  }
  const data = await getSummaryReport(String(request.params.storeId), period);
  return sendSuccess(response, data);
});

// ── Admin Routes ────────────────────────────────────────────────────────────

reportRouter.get("/admin/cross-store", requireRole("super_admin"), async (_request: AuthRequest, response: Response) => {
  const data = await getAdminCrossStoreReport();
  return sendSuccess(response, data);
});
