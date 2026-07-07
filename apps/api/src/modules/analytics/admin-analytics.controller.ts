import type { Request, Response } from "express";
import { getPlatformAnalyticsOverview } from "./analytics-query.service.js";
import { getStoreAnalyticsStats, getStoreVisitorCharts, getStoreDevices } from "./analytics-query.service.js";

export async function getAdminPlatformAnalyticsController(_request: Request, response: Response) {
  try {
    const overview = await getPlatformAnalyticsOverview();
    response.json({ ok: true, data: overview });
  } catch (error) {
    console.error("[Admin Analytics] overview error:", error);
    response.status(500).json({ ok: false, message: "Failed to get platform analytics" });
  }
}

export async function getAdminStoreAnalyticsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const [stats, charts, devices] = await Promise.all([
      getStoreAnalyticsStats(storeId),
      getStoreVisitorCharts(storeId),
      getStoreDevices(storeId),
    ]);

    response.json({ ok: true, data: { stats, charts, devices } });
  } catch (error) {
    console.error("[Admin Analytics] store analytics error:", error);
    response.status(500).json({ ok: false, message: "Failed to get store analytics" });
  }
}

export async function getAdminStoreVisitorStatsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const stats = await getStoreAnalyticsStats(storeId);
    response.json({ ok: true, data: stats });
  } catch (error) {
    console.error("[Admin Analytics] store stats error:", error);
    response.status(500).json({ ok: false, message: "Failed to get store visitor stats" });
  }
}
