import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import {
  getStoreTrackingSettings,
  updateMetaPixel,
  updateTikTokPixel,
  testPixelConnection,
  logStoreTrackingEvent,
  getAdminTrackingOverview,
  getPublicStoreTracking,
} from "./store-tracking.service.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export async function getPublicStoreTrackingController(request: SubdomainRequest, response: Response) {
  const storeId = String(
    request.params.storeId ||
    request.params.id ||
    request.store?._id ||
    request.subdomain ||
    ""
  );

  if (!storeId) return sendFailure(response, "Store identifier required", 400);

  const data = await getPublicStoreTracking(storeId);
  return sendSuccess(response, data || {
    metaPixel: null,
    tiktokPixel: null,
    googleAnalytics: null,
    customTracking: null,
  });
}

export async function publicLogStoreTrackingEventController(request: SubdomainRequest, response: Response) {
  const storeId = String(
    request.params.storeId ||
    request.params.id ||
    request.store?._id ||
    request.subdomain ||
    ""
  );

  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await logStoreTrackingEvent(storeId, request.body);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, result.status || 400);
}

export async function getStoreTrackingController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await getStoreTrackingSettings(storeId, userId);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, result.status || 400);
}

export async function updateMetaPixelController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await updateMetaPixel(storeId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Meta Pixel settings saved successfully")
    : sendFailure(response, result.message, result.status || 400);
}

export async function updateTikTokPixelController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await updateTikTokPixel(storeId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "TikTok Pixel settings saved successfully")
    : sendFailure(response, result.message, result.status || 400);
}

export async function testPixelConnectionController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await testPixelConnection(storeId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, result.data.message)
    : sendFailure(response, result.message, result.status || 400);
}

export async function logStoreTrackingEventController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!storeId) return sendFailure(response, "Store ID required", 400);

  const result = await logStoreTrackingEvent(storeId, request.body);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, result.status || 400);
}

export async function getAdminTrackingOverviewController(request: AuthRequest, response: Response) {
  const role = request.user?.role;
  if (role !== "super_admin" && role !== "admin") {
    return sendFailure(response, "Super Admin access required", 403);
  }

  const query = {
    search: typeof request.query.search === "string" ? request.query.search : undefined,
    plan: typeof request.query.plan === "string" ? request.query.plan : undefined,
    platform: typeof request.query.platform === "string" ? request.query.platform : undefined,
  };

  const result = await getAdminTrackingOverview(query);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, "Failed to load tracking overview", 500);
}
