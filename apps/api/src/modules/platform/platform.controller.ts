import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import {
  getPlatformOverview,
  getRevenueAnalytics,
  getSubscriptionRevenue,
  getPaymentDashboard,
  getFinanceDashboard,
  getRevenueReport,
  getStoreReport,
  getSubscriptionReport,
  getPaymentReport,
  getOrderReport,
} from "./platform.service.js";

export async function getPlatformOverviewController(_request: AuthRequest, response: Response) {
  try {
    const data = await getPlatformOverview();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getPlatformOverview error:", error);
    return sendFailure(response, "Failed to fetch platform overview", 500);
  }
}

export async function getRevenueAnalyticsController(_request: AuthRequest, response: Response) {
  try {
    const data = await getRevenueAnalytics();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getRevenueAnalytics error:", error);
    return sendFailure(response, "Failed to fetch revenue analytics", 500);
  }
}

export async function getSubscriptionRevenueController(_request: AuthRequest, response: Response) {
  try {
    const data = await getSubscriptionRevenue();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getSubscriptionRevenue error:", error);
    return sendFailure(response, "Failed to fetch subscription revenue", 500);
  }
}

export async function getPaymentDashboardController(_request: AuthRequest, response: Response) {
  try {
    const data = await getPaymentDashboard();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getPaymentDashboard error:", error);
    return sendFailure(response, "Failed to fetch payment dashboard", 500);
  }
}

export async function getFinanceDashboardController(_request: AuthRequest, response: Response) {
  try {
    const data = await getFinanceDashboard();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getFinanceDashboard error:", error);
    return sendFailure(response, "Failed to fetch finance dashboard", 500);
  }
}

export async function getRevenueReportController(request: AuthRequest, response: Response) {
  try {
    const { from, to } = request.query as { from?: string; to?: string };
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const data = await getRevenueReport(fromDate, toDate);
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getRevenueReport error:", error);
    return sendFailure(response, "Failed to generate revenue report", 500);
  }
}

export async function getStoreReportController(_request: AuthRequest, response: Response) {
  try {
    const data = await getStoreReport();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getStoreReport error:", error);
    return sendFailure(response, "Failed to generate store report", 500);
  }
}

export async function getSubscriptionReportController(_request: AuthRequest, response: Response) {
  try {
    const data = await getSubscriptionReport();
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getSubscriptionReport error:", error);
    return sendFailure(response, "Failed to generate subscription report", 500);
  }
}

export async function getPaymentReportController(request: AuthRequest, response: Response) {
  try {
    const { from, to } = request.query as { from?: string; to?: string };
    const data = await getPaymentReport(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getPaymentReport error:", error);
    return sendFailure(response, "Failed to generate payment report", 500);
  }
}

export async function getOrderReportController(request: AuthRequest, response: Response) {
  try {
    const { from, to } = request.query as { from?: string; to?: string };
    const data = await getOrderReport(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    return sendSuccess(response, data);
  } catch (error) {
    console.error("getOrderReport error:", error);
    return sendFailure(response, "Failed to generate order report", 500);
  }
}
