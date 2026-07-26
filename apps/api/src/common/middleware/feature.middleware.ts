import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import {
  checkFeature,
  checkLimit,
  checkStoreStatus,
  checkSubscription,
  checkTier,
  resolveStoreIdFromRequest,
  type FeatureAccessResult,
} from "../../modules/features/feature-access.service.js";

function sendAccessDenied(response: Response, result: FeatureAccessResult) {
  return response.status(403).json({
    success: false,
    message: result.message ?? "Access denied",
    code: result.reason,
    featureKey: result.featureKey,
    featureName: result.featureName,
    current: result.current,
    limit: result.limit,
    tierKey: result.tierKey,
    requiredTier: result.requiredTier,
    currentPlan: result.currentPlan,
    requiredPlan: result.requiredPlan,
  });
}

export function checkStoreStatusMiddleware(getStoreId?: (req: AuthRequest) => string | null) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const result = await checkStoreStatus(storeId);
    if (!result.allowed) return sendAccessDenied(response, result);
    return next();
  };
}

export function checkSubscriptionMiddleware(getStoreId?: (req: AuthRequest) => string | null) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const result = await checkSubscription(storeId);
    if (!result.allowed) return sendAccessDenied(response, result);
    return next();
  };
}

export function checkFeatureMiddleware(
  featureKey: string,
  getStoreId?: (req: AuthRequest) => string | null
) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const result = await checkFeature(storeId, featureKey);
    if (!result.allowed) return sendAccessDenied(response, result);
    return next();
  };
}

export function checkLimitMiddleware(
  featureKey: string,
  getStoreId?: (req: AuthRequest) => string | null
) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const result = await checkLimit(storeId, featureKey);
    if (!result.allowed) return sendAccessDenied(response, result);
    return next();
  };
}

export function checkTierMiddleware(
  featureKey: string,
  minimumTierKey: string,
  getStoreId?: (req: AuthRequest) => string | null
) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const result = await checkTier(storeId, featureKey, minimumTierKey);
    if (!result.allowed) return sendAccessDenied(response, result);
    return next();
  };
}

/** Combined: subscription + feature + limit/tier for protected actions */
export function requireFeatureAccess(
  featureKey: string,
  options?: { checkLimit?: boolean; minTier?: string; getStoreId?: (req: AuthRequest) => string | null }
) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = options?.getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const sub = await checkSubscription(storeId);
    if (!sub.allowed) return sendAccessDenied(response, sub);

    const store = await checkStoreStatus(storeId);
    if (!store.allowed) return sendAccessDenied(response, store);

    let feature: FeatureAccessResult;
    if (options?.checkLimit) {
      feature = await checkLimit(storeId, featureKey);
    } else if (options?.minTier) {
      feature = await checkTier(storeId, featureKey, options.minTier);
    } else {
      feature = await checkFeature(storeId, featureKey);
    }
    if (!feature.allowed) return sendAccessDenied(response, feature);

    return next();
  };
}

/** Allow access if ANY of the given feature keys is enabled (subscription + store status still required). */
export function requireAnyFeature(
  featureKeys: string[],
  options?: { getStoreId?: (req: AuthRequest) => string | null }
) {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const storeId = options?.getStoreId?.(request) ?? resolveStoreIdFromRequest(request);
    if (!storeId) return response.status(400).json({ message: "Store ID required" });

    const sub = await checkSubscription(storeId);
    if (!sub.allowed) return sendAccessDenied(response, sub);

    const store = await checkStoreStatus(storeId);
    if (!store.allowed) return sendAccessDenied(response, store);

    let lastResult: FeatureAccessResult | null = null;
    for (const key of featureKeys) {
      const result = await checkFeature(storeId, key);
      if (result.allowed) return next();
      lastResult = result;
    }

    return sendAccessDenied(
      response,
      lastResult ?? {
        allowed: false,
        message: "Feature not available",
        reason: "feature_disabled",
      }
    );
  };
}
