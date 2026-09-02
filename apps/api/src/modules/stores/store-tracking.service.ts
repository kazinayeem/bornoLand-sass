import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { StoreTrackingSettingsModel } from "./store-tracking.model.js";
import { resolveStoreFeature } from "./store-override.service.js";
import { checkFeature, checkSubscription } from "../features/feature-access.service.js";
import {
  updateMetaPixelSchema,
  updateTikTokPixelSchema,
  testPixelSchema,
  logTrackingEventSchema,
} from "./store-tracking.validator.js";

function maskPixelId(id: string): string {
  if (!id || id.length <= 4) return id ? "****" : "";
  if (id.length <= 8) {
    return `${id.slice(0, 2)}****${id.slice(-2)}`;
  }
  return `${id.slice(0, 4)}****${id.slice(-4)}`;
}

async function verifyStoreAccess(storeId: string, userId?: string) {
  if (!userId) {
    const store = await StoreModel.findById(storeId).lean();
    return store;
  }
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  return store;
}

/**
 * Check if a store has entitlement for a specific tracking feature.
 */
export async function isTrackingFeatureAllowed(storeId: string, featureKey: "metaPixel" | "tiktokPixel" | "customTracking" | "googleAnalytics" | "conversionTracking" | "advancedTracking"): Promise<{
  allowed: boolean;
  featureName: string;
  currentPlan?: { slug: string; name: string };
  requiredPlan?: { slug: string; name: string; priceBDT?: number };
}> {
  await connectDatabase();
  const catalogKey =
    featureKey === "metaPixel"
      ? "meta_pixel"
      : featureKey === "tiktokPixel"
      ? "tiktok_pixel"
      : featureKey === "customTracking"
      ? "custom_tracking"
      : featureKey === "googleAnalytics"
      ? "google_analytics"
      : featureKey === "conversionTracking"
      ? "conversion_tracking"
      : "advanced_tracking";

  const featureName =
    featureKey === "metaPixel"
      ? "Meta Pixel"
      : featureKey === "tiktokPixel"
      ? "TikTok Pixel"
      : featureKey === "customTracking"
      ? "Custom Tracking Script"
      : featureKey === "googleAnalytics"
      ? "Google Analytics"
      : featureKey === "conversionTracking"
      ? "Conversion Tracking"
      : "Advanced Tracking";

  // Check feature catalog assignment first
  const featureCheck = await checkFeature(storeId, catalogKey);
  if (!featureCheck.allowed) {
    return {
      allowed: false,
      featureName,
      currentPlan: featureCheck.currentPlan,
      requiredPlan: featureCheck.requiredPlan,
    };
  }

  // Also check store override / plan toggles directly
  const toggleAllowed = await resolveStoreFeature(storeId, featureKey);
  if (!toggleAllowed) {
    const store = (await StoreModel.findById(storeId).select("planId").lean()) as { planId?: unknown } | null;
    const plan = store?.planId
      ? ((await PlanModel.findById(store.planId).select("name slug").lean()) as { slug: string; name: string } | null)
      : null;

    // Find first active plan where this toggle is true
    const higherPlan = (await PlanModel.findOne({
      [`featureToggles.${featureKey}`]: true,
      isActive: true,
    })
      .sort({ priceBDT: 1 })
      .select("name slug priceBDT")
      .lean()) as { name: string; slug: string; priceBDT?: number } | null;

    return {
      allowed: false,
      featureName,
      currentPlan: plan ? { slug: plan.slug, name: plan.name } : undefined,
      requiredPlan: higherPlan ? { slug: higherPlan.slug, name: higherPlan.name, priceBDT: higherPlan.priceBDT } : undefined,
    };
  }

  return { allowed: true, featureName };
}

/**
 * Get tracking settings and entitlement matrix for a store owner.
 */
export async function getStoreTrackingSettings(storeId: string, userId?: string) {
  await connectDatabase();
  const store = (await verifyStoreAccess(storeId, userId)) as any;
  if (!store) {
    return { ok: false as const, status: 404, message: "Store not found" };
  }

  let settings = await StoreTrackingSettingsModel.findOne({ storeId }).lean();
  if (!settings) {
    settings = await StoreTrackingSettingsModel.create({ storeId });
  }

  const [metaEntitlement, tiktokEntitlement, customEntitlement, gaEntitlement] = await Promise.all([
    isTrackingFeatureAllowed(storeId, "metaPixel"),
    isTrackingFeatureAllowed(storeId, "tiktokPixel"),
    isTrackingFeatureAllowed(storeId, "customTracking"),
    isTrackingFeatureAllowed(storeId, "googleAnalytics"),
  ]);

  const currentPlanDoc = store.planId
    ? ((await PlanModel.findById(store.planId).select("name slug priceBDT").lean()) as any)
    : null;

  return {
    ok: true as const,
    data: {
      settings: {
        _id: (settings as any)._id,
        storeId: (settings as any).storeId,
        metaPixel: (settings as any).metaPixel || {
          enabled: false,
          pixelId: "",
          advancedMatching: false,
          automaticEvents: true,
          status: "not_configured",
        },
        tiktokPixel: (settings as any).tiktokPixel || {
          enabled: false,
          pixelId: "",
          automaticEvents: true,
          status: "not_configured",
        },
        googleAnalytics: (settings as any).googleAnalytics || {
          enabled: false,
          measurementId: "",
        },
        customTracking: (settings as any).customTracking || {
          enabled: false,
          headerScript: "",
          bodyScript: "",
        },
        recentEvents: ((settings as any).recentEvents || []).slice(0, 20),
        updatedAt: (settings as any).updatedAt,
      },
      entitlements: {
        metaPixel: metaEntitlement.allowed,
        tiktokPixel: tiktokEntitlement.allowed,
        customTracking: customEntitlement.allowed,
        googleAnalytics: gaEntitlement.allowed,
      },
      plan: currentPlanDoc
        ? {
            name: currentPlanDoc.name,
            slug: currentPlanDoc.slug,
            priceBDT: currentPlanDoc.priceBDT,
          }
        : { name: store.plan || "Free", slug: store.plan || "free", priceBDT: 0 },
      lockDetails: {
        metaPixel: metaEntitlement.allowed ? null : metaEntitlement,
        tiktokPixel: tiktokEntitlement.allowed ? null : tiktokEntitlement,
        customTracking: customEntitlement.allowed ? null : customEntitlement,
        googleAnalytics: gaEntitlement.allowed ? null : gaEntitlement,
      },
    },
  };
}

/**
 * Update Meta Pixel configuration with entitlement & subscription enforcement.
 */
export async function updateMetaPixel(storeId: string, userId: string, payload: unknown) {
  const parsed = updateMetaPixelSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      message: parsed.error.issues[0]?.message || "Invalid Meta Pixel configuration",
    };
  }

  await connectDatabase();
  const store = await verifyStoreAccess(storeId, userId);
  if (!store) {
    return { ok: false as const, status: 404, message: "Store not found" };
  }

  // 1. Subscription check
  const subCheck = await checkSubscription(storeId);
  if (!subCheck.allowed) {
    return {
      ok: false as const,
      status: 403,
      message: subCheck.message || "Active subscription required",
    };
  }

  // 2. Feature entitlement check
  const entitlement = await isTrackingFeatureAllowed(storeId, "metaPixel");
  if (!entitlement.allowed) {
    const requiredName = entitlement.requiredPlan?.name || "a higher";
    return {
      ok: false as const,
      status: 403,
      message: `Meta Pixel is not available on your current plan. Upgrade to ${requiredName} plan to unlock Meta Pixel tracking.`,
      requiredPlan: entitlement.requiredPlan,
    };
  }

  const { enabled, pixelId, advancedMatching, automaticEvents, testEventCode } = parsed.data;

  // Compute status
  let status: "not_configured" | "connected" | "active" | "invalid" | "disabled" = "not_configured";
  if (!pixelId) {
    status = "not_configured";
  } else if (!enabled) {
    status = "disabled";
  } else {
    status = "active";
  }

  const updateDoc = {
    "metaPixel.enabled": enabled,
    "metaPixel.pixelId": pixelId,
    "metaPixel.advancedMatching": advancedMatching,
    "metaPixel.automaticEvents": automaticEvents,
    "metaPixel.testEventCode": testEventCode,
    "metaPixel.status": status,
  };

  const settings = await StoreTrackingSettingsModel.findOneAndUpdate(
    { storeId },
    { $set: updateDoc, $setOnInsert: { storeId } },
    { upsert: true, new: true }
  ).lean();

  return {
    ok: true as const,
    data: {
      metaPixel: (settings as any).metaPixel,
    },
  };
}

/**
 * Update TikTok Pixel configuration with entitlement & subscription enforcement.
 */
export async function updateTikTokPixel(storeId: string, userId: string, payload: unknown) {
  const parsed = updateTikTokPixelSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      message: parsed.error.issues[0]?.message || "Invalid TikTok Pixel configuration",
    };
  }

  await connectDatabase();
  const store = await verifyStoreAccess(storeId, userId);
  if (!store) {
    return { ok: false as const, status: 404, message: "Store not found" };
  }

  // 1. Subscription check
  const subCheck = await checkSubscription(storeId);
  if (!subCheck.allowed) {
    return {
      ok: false as const,
      status: 403,
      message: subCheck.message || "Active subscription required",
    };
  }

  // 2. Feature entitlement check
  const entitlement = await isTrackingFeatureAllowed(storeId, "tiktokPixel");
  if (!entitlement.allowed) {
    const requiredName = entitlement.requiredPlan?.name || "a higher";
    return {
      ok: false as const,
      status: 403,
      message: `TikTok Pixel is not available on your current plan. Upgrade to ${requiredName} plan to unlock TikTok Pixel tracking.`,
      requiredPlan: entitlement.requiredPlan,
    };
  }

  const { enabled, pixelId, automaticEvents, testEventCode } = parsed.data;

  // Compute status
  let status: "not_configured" | "connected" | "active" | "invalid" | "disabled" = "not_configured";
  if (!pixelId) {
    status = "not_configured";
  } else if (!enabled) {
    status = "disabled";
  } else {
    status = "active";
  }

  const updateDoc = {
    "tiktokPixel.enabled": enabled,
    "tiktokPixel.pixelId": pixelId,
    "tiktokPixel.automaticEvents": automaticEvents,
    "tiktokPixel.testEventCode": testEventCode,
    "tiktokPixel.status": status,
  };

  const settings = await StoreTrackingSettingsModel.findOneAndUpdate(
    { storeId },
    { $set: updateDoc, $setOnInsert: { storeId } },
    { upsert: true, new: true }
  ).lean();

  return {
    ok: true as const,
    data: {
      tiktokPixel: (settings as any).tiktokPixel,
    },
  };
}

/**
 * Test & verify Pixel connection.
 */
export async function testPixelConnection(storeId: string, userId: string, payload: unknown) {
  const parsed = testPixelSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, status: 400, message: "Invalid test request parameters" };
  }

  await connectDatabase();
  const store = await verifyStoreAccess(storeId, userId);
  if (!store) {
    return { ok: false as const, status: 404, message: "Store not found" };
  }

  const platform = parsed.data.platform;
  const featureKey = platform === "meta" ? "metaPixel" : "tiktokPixel";
  const entitlement = await isTrackingFeatureAllowed(storeId, featureKey);

  if (!entitlement.allowed) {
    return {
      ok: false as const,
      status: 403,
      message: `${platform === "meta" ? "Meta" : "TikTok"} Pixel is not included in your current plan.`,
    };
  }

  const settings = (await StoreTrackingSettingsModel.findOne({ storeId }).lean()) as any;
  const config = platform === "meta" ? settings?.metaPixel : settings?.tiktokPixel;

  if (!config || !config.pixelId) {
    return {
      ok: false as const,
      status: 400,
      message: `No ${platform === "meta" ? "Meta" : "TikTok"} Pixel ID is configured yet. Please enter a Pixel ID first.`,
    };
  }

  // Validate format
  if (platform === "meta" && !/^\d{8,25}$/.test(config.pixelId)) {
    await StoreTrackingSettingsModel.updateOne(
      { storeId },
      { $set: { "metaPixel.status": "invalid" } }
    );
    return {
      ok: false as const,
      status: 400,
      message: "We couldn't verify this Pixel. Please check that your Meta Pixel ID contains only digits.",
    };
  }

  if (platform === "tiktok" && !/^[a-zA-Z0-9_-]{8,35}$/.test(config.pixelId)) {
    await StoreTrackingSettingsModel.updateOne(
      { storeId },
      { $set: { "tiktokPixel.status": "invalid" } }
    );
    return {
      ok: false as const,
      status: 400,
      message: "We couldn't verify this Pixel. Please check your TikTok Pixel ID format and try again.",
    };
  }

  const now = new Date();
  const targetField = platform === "meta" ? "metaPixel" : "tiktokPixel";
  const newStatus = config.enabled ? "active" : "connected";

  await StoreTrackingSettingsModel.updateOne(
    { storeId },
    {
      $set: {
        [`${targetField}.lastVerifiedAt`]: now,
        [`${targetField}.status`]: newStatus,
      },
    }
  );

  return {
    ok: true as const,
    data: {
      platform,
      pixelId: config.pixelId,
      status: newStatus,
      enabled: config.enabled,
      verifiedAt: now,
      message: `${platform === "meta" ? "Meta" : "TikTok"} Pixel is configured successfully.`,
    },
  };
}

/**
 * Log lightweight debug tracking event (internal store log).
 */
export async function logStoreTrackingEvent(storeId: string, payload: unknown) {
  const parsed = logTrackingEventSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, status: 400, message: "Invalid event data" };
  }

  await connectDatabase();
  const eventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const newEvent = {
    eventId,
    eventName: parsed.data.eventName,
    platform: parsed.data.platform,
    status: parsed.data.status,
    payloadSummary: parsed.data.payloadSummary,
    timestamp: new Date(),
  };

  await StoreTrackingSettingsModel.updateOne(
    { storeId },
    {
      $push: {
        recentEvents: {
          $each: [newEvent],
          $slice: -50, // Keep last 50 events
        },
      },
      $setOnInsert: { storeId },
    },
    { upsert: true }
  );

  return { ok: true as const, data: { event: newEvent } };
}

/**
 * Get sanitized tracking config for storefront execution.
 * Only returns enabled providers that are allowed by the store's current subscription plan.
 */
export async function getPublicStoreTracking(storeIdOrSlug: string, knownStore?: any) {
  await connectDatabase();
  if (!storeIdOrSlug) return null;

  let store: any = knownStore ?? null;
  if (!store) {
    if (/^[0-9a-fA-F]{24}$/.test(storeIdOrSlug)) {
      store = (await StoreModel.findById(storeIdOrSlug).select("status billingStatus subscriptionStatus planId plan").lean()) as any;
    }
    if (!store) {
      store = (await StoreModel.findOne({ slug: storeIdOrSlug.toLowerCase(), status: "active" }).select("status billingStatus subscriptionStatus planId plan").lean()) as any;
    }
  }
  if (!store || (store.status && store.status !== "active")) {
    return null;
  }

  const effectiveStoreId = String(store._id);
  const settings = (await StoreTrackingSettingsModel.findOne({ storeId: effectiveStoreId }).lean()) as any;
  if (!settings) {
    return {
      metaPixel: null,
      tiktokPixel: null,
      googleAnalytics: null,
      customTracking: null,
    };
  }

  // Check entitlements
  const [metaAllowed, tiktokAllowed, gaAllowed, customAllowed] = await Promise.all([
    isTrackingFeatureAllowed(effectiveStoreId, "metaPixel"),
    isTrackingFeatureAllowed(effectiveStoreId, "tiktokPixel"),
    isTrackingFeatureAllowed(effectiveStoreId, "googleAnalytics"),
    isTrackingFeatureAllowed(effectiveStoreId, "customTracking"),
  ]);

  const metaPixel =
    metaAllowed.allowed && settings.metaPixel?.enabled && settings.metaPixel.pixelId
      ? {
          enabled: true,
          pixelId: settings.metaPixel.pixelId,
          advancedMatching: Boolean(settings.metaPixel.advancedMatching),
          automaticEvents: Boolean(settings.metaPixel.automaticEvents !== false),
          testEventCode: settings.metaPixel.testEventCode || "",
        }
      : null;

  const tiktokPixel =
    tiktokAllowed.allowed && settings.tiktokPixel?.enabled && settings.tiktokPixel.pixelId
      ? {
          enabled: true,
          pixelId: settings.tiktokPixel.pixelId,
          automaticEvents: Boolean(settings.tiktokPixel.automaticEvents !== false),
          testEventCode: settings.tiktokPixel.testEventCode || "",
        }
      : null;

  const googleAnalytics =
    gaAllowed.allowed && settings.googleAnalytics?.enabled && settings.googleAnalytics.measurementId
      ? {
          enabled: true,
          measurementId: settings.googleAnalytics.measurementId,
        }
      : null;

  const customTracking =
    customAllowed.allowed && settings.customTracking?.enabled
      ? {
          enabled: true,
          headerScript: settings.customTracking.headerScript || "",
          bodyScript: settings.customTracking.bodyScript || "",
        }
      : null;

  return {
    metaPixel,
    tiktokPixel,
    googleAnalytics,
    customTracking,
  };
}

/**
 * Super Admin Tracking Overview — platform-wide adoption statistics & store list.
 */
export async function getAdminTrackingOverview(query?: { search?: string; plan?: string; platform?: string }) {
  await connectDatabase();

  const [stores, plans, allTracking] = await Promise.all([
    StoreModel.find({ status: { $ne: "archived" } })
      .select("name slug subdomain plan planId status billingStatus subscriptionStatus createdAt")
      .populate("planId", "name slug priceBDT featureToggles")
      .lean(),
    PlanModel.find({ isActive: true }).select("name slug priceBDT featureToggles").lean(),
    StoreTrackingSettingsModel.find().lean(),
  ]);

  const trackingMap = new Map<string, any>(allTracking.map((t: any) => [String(t.storeId), t]));

  let totalMetaActive = 0;
  let totalTikTokActive = 0;
  let totalWithTracking = 0;

  const planStatsMap = new Map<string, { planName: string; planSlug: string; totalStores: number; metaActive: number; tiktokActive: number; totalTracking: number }>();

  for (const plan of plans as any[]) {
    planStatsMap.set(String(plan._id), {
      planName: plan.name,
      planSlug: plan.slug,
      totalStores: 0,
      metaActive: 0,
      tiktokActive: 0,
      totalTracking: 0,
    });
  }

  const storeRows: Array<{
    _id: string;
    storeName: string;
    slug: string;
    subdomain: string;
    planName: string;
    planSlug: string;
    subscriptionStatus: string;
    billingStatus: string;
    metaPixel: {
      enabled: boolean;
      pixelIdMasked: string;
      status: string;
      allowedOnPlan: boolean;
    };
    tiktokPixel: {
      enabled: boolean;
      pixelIdMasked: string;
      status: string;
      allowedOnPlan: boolean;
    };
    anyTrackingEnabled: boolean;
    createdAt: string;
  }> = [];

  for (const store of stores as any[]) {
    const storeIdStr = String(store._id);
    const tracking = trackingMap.get(storeIdStr);
    const planObj = store.planId as any;
    const planIdStr = planObj?._id ? String(planObj._id) : "";
    const planToggles = planObj?.featureToggles || {};

    const metaAllowed = Boolean(planToggles.metaPixel);
    const tiktokAllowed = Boolean(planToggles.tiktokPixel);

    const metaPixelConfig = tracking?.metaPixel || { enabled: false, pixelId: "", status: "not_configured" };
    const tiktokPixelConfig = tracking?.tiktokPixel || { enabled: false, pixelId: "", status: "not_configured" };

    const metaActive = Boolean(metaPixelConfig.enabled && metaPixelConfig.pixelId && metaAllowed);
    const tiktokActive = Boolean(tiktokPixelConfig.enabled && tiktokPixelConfig.pixelId && tiktokAllowed);
    const anyTracking = metaActive || tiktokActive;

    if (metaActive) totalMetaActive++;
    if (tiktokActive) totalTikTokActive++;
    if (anyTracking) totalWithTracking++;

    const pStat = planIdStr ? planStatsMap.get(planIdStr) : null;
    if (pStat) {
      pStat.totalStores++;
      if (metaActive) pStat.metaActive++;
      if (tiktokActive) pStat.tiktokActive++;
      if (anyTracking) pStat.totalTracking++;
    }

    const row = {
      _id: storeIdStr,
      storeName: store.name,
      slug: store.slug,
      subdomain: store.subdomain || store.slug,
      planName: planObj?.name || store.plan || "Free",
      planSlug: planObj?.slug || store.plan || "free",
      subscriptionStatus: store.subscriptionStatus || "active",
      billingStatus: store.billingStatus || "active",
      metaPixel: {
        enabled: Boolean(metaPixelConfig.enabled),
        pixelIdMasked: maskPixelId(metaPixelConfig.pixelId || ""),
        status: metaPixelConfig.status || "not_configured",
        allowedOnPlan: metaAllowed,
      },
      tiktokPixel: {
        enabled: Boolean(tiktokPixelConfig.enabled),
        pixelIdMasked: maskPixelId(tiktokPixelConfig.pixelId || ""),
        status: tiktokPixelConfig.status || "not_configured",
        allowedOnPlan: tiktokAllowed,
      },
      anyTrackingEnabled: anyTracking,
      createdAt: store.createdAt ? new Date(store.createdAt).toISOString() : new Date().toISOString(),
    };

    storeRows.push(row);
  }

  // Filter if query is provided
  let filteredRows = storeRows;
  if (query?.search) {
    const s = query.search.toLowerCase();
    filteredRows = filteredRows.filter(
      (r) =>
        r.storeName.toLowerCase().includes(s) ||
        r.slug.toLowerCase().includes(s) ||
        r.subdomain.toLowerCase().includes(s)
    );
  }
  if (query?.plan && query.plan !== "all") {
    filteredRows = filteredRows.filter((r) => r.planSlug === query.plan);
  }
  if (query?.platform && query.platform !== "all") {
    if (query.platform === "meta") {
      filteredRows = filteredRows.filter((r) => r.metaPixel.enabled);
    } else if (query.platform === "tiktok") {
      filteredRows = filteredRows.filter((r) => r.tiktokPixel.enabled);
    } else if (query.platform === "active") {
      filteredRows = filteredRows.filter((r) => r.anyTrackingEnabled);
    } else if (query.platform === "none") {
      filteredRows = filteredRows.filter((r) => !r.anyTrackingEnabled);
    }
  }

  const totalStores = stores.length;
  const adoptionRate = totalStores > 0 ? Math.round((totalWithTracking / totalStores) * 100) : 0;

  return {
    ok: true as const,
    data: {
      stats: {
        totalStores,
        totalWithTracking,
        totalMetaActive,
        totalTikTokActive,
        adoptionRate,
      },
      planStats: Array.from(planStatsMap.values()),
      stores: filteredRows,
    },
  };
}
