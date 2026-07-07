import type { Request, Response } from "express";
import { trackPageView, trackSessionEnd, getLiveVisitors, getLiveVisitorsCount } from "./analytics-tracking.service.js";
import { getStoreAnalyticsStats, getStoreVisitorCharts, getStoreTrafficSources, getStoreDevices, getStoreTopContent } from "./analytics-query.service.js";
import { runHourlyAggregation } from "./analytics-aggregation.service.js";
import { trackPageViewSchema, trackSessionEndSchema } from "./analytics.validator.js";

export async function trackPageViewController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const parsed = trackPageViewSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ ok: false, message: "Invalid tracking data", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await trackPageView({
      storeId,
      ...parsed.data,
    });

    response.json({ ok: true, data: result });
  } catch (error) {
    console.error("[Analytics] track page view error:", error);
    response.status(500).json({ ok: false, message: "Failed to track page view" });
  }
}

export async function trackSessionEndController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const parsed = trackSessionEndSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ ok: false, message: "Invalid session end data", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    await trackSessionEnd({ storeId, ...parsed.data });
    response.json({ ok: true });
  } catch (error) {
    console.error("[Analytics] track session end error:", error);
    response.status(500).json({ ok: false, message: "Failed to track session end" });
  }
}

export async function getStoreAnalyticsStatsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const stats = await getStoreAnalyticsStats(storeId);
    response.json({ ok: true, data: stats });
  } catch (error) {
    console.error("[Analytics] get stats error:", error);
    response.status(500).json({ ok: false, message: "Failed to get analytics stats" });
  }
}

export async function getStoreVisitorChartsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const charts = await getStoreVisitorCharts(storeId);
    response.json({ ok: true, data: charts });
  } catch (error) {
    console.error("[Analytics] get charts error:", error);
    response.status(500).json({ ok: false, message: "Failed to get visitor charts" });
  }
}

export async function getStoreTrafficSourcesController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const sources = await getStoreTrafficSources(storeId);
    response.json({ ok: true, data: sources });
  } catch (error) {
    console.error("[Analytics] get traffic sources error:", error);
    response.status(500).json({ ok: false, message: "Failed to get traffic sources" });
  }
}

export async function getStoreDevicesController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const devices = await getStoreDevices(storeId);
    response.json({ ok: true, data: devices });
  } catch (error) {
    console.error("[Analytics] get devices error:", error);
    response.status(500).json({ ok: false, message: "Failed to get device analytics" });
  }
}

export async function getStoreTopContentController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const content = await getStoreTopContent(storeId);
    response.json({ ok: true, data: content });
  } catch (error) {
    console.error("[Analytics] get top content error:", error);
    response.status(500).json({ ok: false, message: "Failed to get top content" });
  }
}

export async function getLiveVisitorsController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    const [visitors, count] = await Promise.all([
      getLiveVisitors(storeId),
      getLiveVisitorsCount(storeId),
    ]);

    response.json({ ok: true, data: { visitors, count } });
  } catch (error) {
    console.error("[Analytics] get live visitors error:", error);
    response.status(500).json({ ok: false, message: "Failed to get live visitors" });
  }
}

export async function triggerAggregationController(request: Request, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    if (!storeId) {
      response.status(400).json({ ok: false, message: "storeId is required" });
      return;
    }

    await runHourlyAggregation(storeId);
    response.json({ ok: true, message: "Aggregation complete" });
  } catch (error) {
    console.error("[Analytics] aggregation error:", error);
    response.status(500).json({ ok: false, message: "Failed to run aggregation" });
  }
}
