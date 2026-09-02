import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { getStoreById } from "./store.service.js";
import { getEffectiveUserPermissions } from "../team/team.service.js";
import { getStoreFeatureAccessMatrix } from "../features/feature-access.service.js";
import { getStorageStats } from "../media/media-storage.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

/**
 * Consolidated store shell access context endpoint.
 * Returns store, permissions, entitlements, and storage stats in a single concurrent read.
 */
export async function getStoreContextController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const identifier = String(request.params.storeIdOrSlug || request.params.id || request.params.slug || "");
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  if (!identifier) return sendFailure(response, "Missing store identifier", 400);

  const storeRes = await getStoreById(identifier, userId);
  if (!storeRes.ok || !storeRes.data?.store) {
    return sendFailure(response, storeRes.message || "Store not found", 404);
  }

  const store = storeRes.data.store;
  const storeId = String(store._id);

  const [permissionsData, featureResult, statsData] = await Promise.all([
    getEffectiveUserPermissions(storeId, userId).catch(() => null),
    getStoreFeatureAccessMatrix(storeId).catch(() => null),
    getStorageStats(storeId).catch(() => null),
  ]);

  return sendSuccess(response, {
    store,
    permissions: permissionsData?.permissions || [],
    isOwner: Boolean(permissionsData?.isOwner),
    role: permissionsData?.role || "viewer",
    features: featureResult && "ok" in featureResult && featureResult.ok ? featureResult.data : null,
    storageStats: statsData || null,
  });
}
