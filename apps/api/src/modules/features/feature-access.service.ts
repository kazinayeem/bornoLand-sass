import type { Request } from "express";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { ProductModel } from "../../models/product.model.js";
import { OrderModel } from "../../models/order.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { PageModel } from "../../models/page.model.js";
import { FeatureModel } from "./feature.model.js";
import { FeatureTierModel } from "./feature-tier.model.js";
import { FeatureLimitModel } from "./feature-limit.model.js";
import { PlanFeatureModel } from "./plan-feature.model.js";
import { StoreUsageModel } from "./store-usage.model.js";
import { ensureDefaultFeatures, resolveAssignmentTier } from "./feature.service.js";
import { applyTrialExpiryToStore, applySubscriptionExpiryToStore } from "../stores/trial.service.js";
import {
  isTierDisabled,
  normalizeFeatureType,
  tierMeetsMinimum,
  type FeatureType,
  type TierLevel,
} from "./feature.constants.js";

export type FeatureAccessDenialReason =
  | "store_not_found"
  | "store_suspended"
  | "store_expired"
  | "subscription_inactive"
  | "feature_disabled"
  | "limit_reached"
  | "tier_insufficient"
  | "invalid_value";

export type FeatureAccessResult = {
  allowed: boolean;
  reason?: FeatureAccessDenialReason;
  message?: string;
  featureKey?: string;
  featureName?: string;
  current?: number;
  limit?: number;
  tierKey?: string;
  requiredTier?: string;
  requiredPlan?: { slug: string; name: string; priceBDT?: number };
  currentPlan?: { slug: string; name: string };
};

type StoreContext = {
  _id: unknown;
  tenantId: unknown;
  planId?: unknown;
  plan?: string;
  status?: string;
  billingStatus?: string;
  subscriptionStatus?: string;
  allowNewOrders?: boolean;
  published?: boolean;
};

type PlanFeatureAssignment = {
  enabled: boolean;
  limit: number;
  tierKey: string;
  value: string;
};

function toTierLevels(
  tiers: Array<{ tierKey: string; label: string; rank: number; description?: string }>
): TierLevel[] {
  return tiers.map((t) => ({ key: t.tierKey, label: t.label, rank: t.rank, description: t.description }));
}

function resolveUsageValue(usage: Record<string, number> | null, counterKey: string, unit?: string): number {
  const raw = usage?.[counterKey] ?? 0;
  if (unit === "GB" && (counterKey === "storageMB" || counterKey === "bandwidthMB")) {
    return raw / 1024;
  }
  return raw;
}

function resolveLimitValue(limit: number, unit?: string): number {
  return limit;
}

export function resolveStoreIdFromRequest(request: Request): string | null {
  const params = request.params as Record<string, string>;
  const body = request.body as Record<string, unknown>;
  const resolvedStoreId = (request as Request & { resolvedStoreId?: string }).resolvedStoreId;
  return (
    params.storeId ||
    resolvedStoreId ||
    params.id ||
    (typeof body.storeId === "string" ? body.storeId : null) ||
    null
  );
}

export async function getStoreContext(storeId: string): Promise<StoreContext | null> {
  await connectDatabase();
  let store = await StoreModel.findById(storeId);
  if (!store) return null;
  await applyTrialExpiryToStore(store);
  await applySubscriptionExpiryToStore(store);
  return store.toObject() as StoreContext;
}

export async function syncStoreUsage(storeId: string) {
  await connectDatabase();
  const store = (await StoreModel.findById(storeId).lean()) as {
    _id: unknown;
    tenantId: unknown;
  } | null;
  if (!store) return null;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [products, orders, monthlyOrders, customers, categories, pages, staff] = await Promise.all([
    ProductModel.countDocuments({ storeId }),
    OrderModel.countDocuments({ storeId }),
    OrderModel.countDocuments({ storeId, createdAt: { $gte: startOfMonth } }),
    CustomerModel.countDocuments({ storeId }),
    CategoryModel.countDocuments({ storeId }),
    PageModel.countDocuments({ storeId: store._id }),
    TeamMemberModel.countDocuments({ tenantId: store.tenantId }),
  ]);

  const usage = await StoreUsageModel.findOneAndUpdate(
    { storeId },
    {
      $set: {
        tenantId: store.tenantId,
        products,
        orders,
        monthlyOrders,
        customers,
        categories,
        pages,
        staff,
        lastSyncedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  ).lean();

  return usage as Record<string, number> | null;
}

async function getPlanFeatureAssignment(planId: string, featureKey: string): Promise<PlanFeatureAssignment | null> {
  const assigned = (await PlanFeatureModel.findOne({ planId, featureKey: featureKey.toLowerCase() }).lean()) as {
    enabled?: boolean;
    limit?: number;
    tierKey?: string;
    value?: string;
  } | null;
  if (assigned) {
    const tierKey = resolveAssignmentTier(assigned);
    return {
      enabled: assigned.enabled ?? false,
      limit: assigned.limit ?? 0,
      tierKey,
      value: tierKey,
    };
  }
  return null;
}

async function getFeatureTiers(featureKey: string): Promise<TierLevel[]> {
  const tiers = (await FeatureTierModel.find({ featureKey: featureKey.toLowerCase() }).sort({ rank: 1 }).lean()) as unknown as Array<{
    tierKey: string;
    label: string;
    rank: number;
    description?: string;
  }>;
  return toTierLevels(tiers);
}

async function findMinimumPlanForFeature(featureKey: string, minimumTierKey?: string): Promise<{ slug: string; name: string; priceBDT?: number } | undefined> {
  const feature = (await FeatureModel.findOne({ key: featureKey.toLowerCase() }).lean()) as { type: string } | null;
  const type = normalizeFeatureType(feature?.type ?? "boolean");
  const tiers = type === "tier" ? await getFeatureTiers(featureKey) : [];

  const plans = (await PlanModel.find({ isActive: true }).sort({ priceBDT: 1 }).lean()) as unknown as Array<{
    _id: unknown;
    slug: string;
    name: string;
    priceBDT?: number;
  }>;

  for (const plan of plans) {
    const assignment = await getPlanFeatureAssignment(String(plan._id), featureKey);
    if (!assignment) continue;

    if (type === "boolean" && assignment.enabled) {
      return { slug: plan.slug, name: plan.name, priceBDT: plan.priceBDT };
    }

    if (type === "limit" && (assignment.limit === 0 || assignment.enabled)) {
      return { slug: plan.slug, name: plan.name, priceBDT: plan.priceBDT };
    }

    if (type === "tier") {
      const tierKey = assignment.tierKey;
      if (minimumTierKey) {
        if (tierMeetsMinimum(tiers, tierKey, minimumTierKey)) {
          return { slug: plan.slug, name: plan.name, priceBDT: plan.priceBDT };
        }
      } else if (!isTierDisabled(tierKey)) {
        return { slug: plan.slug, name: plan.name, priceBDT: plan.priceBDT };
      }
    }
  }
  return undefined;
}

export async function checkStoreStatus(storeId: string): Promise<FeatureAccessResult> {
  const store = await getStoreContext(storeId);
  if (!store) {
    return { allowed: false, reason: "store_not_found", message: "Store not found" };
  }

  if (store.status === "suspended" || store.status === "archived") {
    return { allowed: false, reason: "store_suspended", message: "Store is suspended or archived" };
  }

  if (store.status === "expired" || store.billingStatus === "past_due") {
    const plan = store.planId
      ? ((await PlanModel.findById(store.planId).lean()) as { slug: string; name: string } | null)
      : null;
    return {
      allowed: false,
      reason: "store_expired",
      message: "Store subscription has expired. Upgrade to continue.",
      currentPlan: plan ? { slug: plan.slug, name: plan.name } : undefined,
      requiredPlan: await findMinimumPlanForFeature("products"),
    };
  }

  return { allowed: true };
}

export async function checkSubscription(storeId: string): Promise<FeatureAccessResult> {
  const statusResult = await checkStoreStatus(storeId);
  if (!statusResult.allowed) return statusResult;

  const store = await getStoreContext(storeId);
  if (!store) return { allowed: false, reason: "store_not_found", message: "Store not found" };

  const activeBilling = ["trial", "active"].includes(store.billingStatus ?? "");
  const activeSub = ["trialing", "active"].includes(store.subscriptionStatus ?? "");

  if (!activeBilling && !activeSub && store.status !== "active") {
    return {
      allowed: false,
      reason: "subscription_inactive",
      message: "Active subscription required for this action",
    };
  }

  return { allowed: true };
}

export async function checkFeature(storeId: string, featureKey: string): Promise<FeatureAccessResult> {
  await ensureDefaultFeatures();

  const subResult = await checkSubscription(storeId);
  if (!subResult.allowed) return { ...subResult, featureKey };

  const store = (await StoreModel.findById(storeId).lean()) as { planId?: unknown } | null;
  if (!store?.planId) {
    return { allowed: true, featureKey };
  }

  const feature = (await FeatureModel.findOne({ key: featureKey.toLowerCase(), isActive: true }).lean()) as {
    name: string;
    type: string;
    usageCounterKey?: string;
    key: string;
    unit?: string;
  } | null;
  if (!feature) {
    return { allowed: true, featureKey };
  }

  const type = normalizeFeatureType(feature.type);
  const assignment = await getPlanFeatureAssignment(String(store.planId), featureKey);
  if (!assignment) {
    return { allowed: true, featureKey, featureName: feature.name };
  }

  const plan = (await PlanModel.findById(store.planId).lean()) as { slug: string; name: string } | null;
  const planInfo = plan ? { slug: plan.slug, name: plan.name } : undefined;

  if (type === "boolean") {
    if (!assignment.enabled) {
      return {
        allowed: false,
        reason: "feature_disabled",
        message: `${feature.name} is not available on your current plan`,
        featureKey,
        featureName: feature.name,
        currentPlan: planInfo,
        requiredPlan: await findMinimumPlanForFeature(featureKey),
      };
    }
    return { allowed: true, featureKey, featureName: feature.name };
  }

  if (type === "tier") {
    if (isTierDisabled(assignment.tierKey)) {
      return {
        allowed: false,
        reason: "feature_disabled",
        message: `${feature.name} is not available on your current plan`,
        featureKey,
        featureName: feature.name,
        tierKey: assignment.tierKey,
        currentPlan: planInfo,
        requiredPlan: await findMinimumPlanForFeature(featureKey),
      };
    }
    return { allowed: true, featureKey, featureName: feature.name, tierKey: assignment.tierKey };
  }

  // limit type — allowed when explicitly enabled, or limit > 0 (0 = unlimited quota)
  if (!assignment.enabled && (assignment.limit ?? 0) <= 0) {
    return {
      allowed: false,
      reason: "feature_disabled",
      message: `${feature.name} is not available on your current plan`,
      featureKey,
      featureName: feature.name,
      currentPlan: planInfo,
      requiredPlan: await findMinimumPlanForFeature(featureKey),
    };
  }

  return { allowed: true, featureKey, featureName: feature.name, limit: assignment.limit };
}

export async function checkTier(
  storeId: string,
  featureKey: string,
  minimumTierKey: string
): Promise<FeatureAccessResult> {
  const featureResult = await checkFeature(storeId, featureKey);
  if (!featureResult.allowed) return featureResult;

  const store = (await StoreModel.findById(storeId).lean()) as { planId?: unknown } | null;
  if (!store?.planId) return { allowed: true, featureKey };

  const feature = (await FeatureModel.findOne({ key: featureKey.toLowerCase() }).lean()) as { name: string; type: string } | null;
  if (!feature || normalizeFeatureType(feature.type) !== "tier") {
    return { allowed: true, featureKey };
  }

  const assignment = await getPlanFeatureAssignment(String(store.planId), featureKey);
  const tiers = await getFeatureTiers(featureKey);
  const assignedTier = assignment?.tierKey ?? "disabled";

  if (!tierMeetsMinimum(tiers, assignedTier, minimumTierKey)) {
    const plan = (await PlanModel.findById(store.planId).lean()) as { slug: string; name: string } | null;
    const requiredTier = tiers.find((t) => t.key === minimumTierKey);
    return {
      allowed: false,
      reason: "tier_insufficient",
      message: `${feature.name} requires ${requiredTier?.label ?? minimumTierKey} tier or higher`,
      featureKey,
      featureName: feature.name,
      tierKey: assignedTier,
      requiredTier: minimumTierKey,
      currentPlan: plan ? { slug: plan.slug, name: plan.name } : undefined,
      requiredPlan: await findMinimumPlanForFeature(featureKey, minimumTierKey),
    };
  }

  return { allowed: true, featureKey, featureName: feature.name, tierKey: assignedTier };
}

export async function checkLimit(storeId: string, featureKey: string): Promise<FeatureAccessResult> {
  const featureResult = await checkFeature(storeId, featureKey);
  if (!featureResult.allowed) return featureResult;

  const store = (await StoreModel.findById(storeId).lean()) as { planId?: unknown } | null;
  if (!store?.planId) return { allowed: true, featureKey };

  const feature = (await FeatureModel.findOne({ key: featureKey.toLowerCase() }).lean()) as {
    name: string;
    type: string;
    usageCounterKey?: string;
    unit?: string;
  } | null;
  if (!feature || normalizeFeatureType(feature.type) !== "limit") {
    return { allowed: true, featureKey };
  }

  const assignment = await getPlanFeatureAssignment(String(store.planId), featureKey);
  const limitMeta = (await FeatureLimitModel.findOne({ featureKey: featureKey.toLowerCase() }).lean()) as {
    unit?: string;
  } | null;
  const unit = feature.unit || limitMeta?.unit || "";
  const max = resolveLimitValue(assignment?.limit ?? 0, unit);
  if (max === 0) return { allowed: true, featureKey, featureName: feature.name, limit: 0 };

  const usage = await syncStoreUsage(storeId);
  const counterKey = feature.usageCounterKey || featureKey;
  const current = resolveUsageValue(usage, counterKey, unit);

  if (current >= max) {
    const plan = (await PlanModel.findById(store.planId).lean()) as { slug: string; name: string } | null;
    return {
      allowed: false,
      reason: "limit_reached",
      message: `${feature.name} limit reached (${Math.floor(current)}/${max}). Upgrade your subscription.`,
      featureKey,
      featureName: feature.name,
      current: Math.floor(current),
      limit: max,
      currentPlan: plan ? { slug: plan.slug, name: plan.name } : undefined,
      requiredPlan: await findMinimumPlanForFeature(featureKey),
    };
  }

  return { allowed: true, featureKey, featureName: feature.name, current: Math.floor(current), limit: max };
}

export async function canAddProduct(storeId: string, _planId?: string) {
  const result = await checkLimit(storeId, "products");
  return result.allowed ? { ok: true as const } : { ok: false as const, message: result.message ?? "Product limit reached" };
}

export async function canAddCategory(storeId: string, _planId?: string) {
  const result = await checkLimit(storeId, "categories");
  return result.allowed ? { ok: true as const } : { ok: false as const, message: result.message ?? "Category limit reached" };
}

export async function canAddOrder(storeId: string, _planId?: string) {
  const result = await checkLimit(storeId, "orders");
  return result.allowed ? { ok: true as const } : { ok: false as const, message: result.message ?? "Order limit reached" };
}

export async function canAddStaff(tenantId: string, _planId?: string) {
  const store = (await StoreModel.findOne({ tenantId }).lean()) as { _id: unknown } | null;
  if (!store) return { ok: true as const };
  const result = await checkLimit(String(store._id), "staff");
  return result.allowed ? { ok: true as const } : { ok: false as const, message: result.message ?? "Staff limit reached" };
}

export function hasPlanFeature(_limits: unknown, _feature: string) {
  return true;
}

export async function getStoreFeatureAccessMatrix(storeId: string) {
  await ensureDefaultFeatures();
  await connectDatabase();

  const store = await getStoreContext(storeId);
  if (!store) return { ok: false as const, message: "Store not found" };

  const plan = store.planId
    ? ((await PlanModel.findById(store.planId).lean()) as {
        slug: string;
        name: string;
        priceBDT: number;
        priceYearly?: number;
      } | null)
    : null;
  const usage = await syncStoreUsage(storeId);
  const features = await FeatureModel.find({ isActive: true }).sort({ groupKey: 1, sortOrder: 1 }).lean();

  const matrix = await Promise.all(
    features.map(async (feature) => {
      const type = normalizeFeatureType(feature.type) as FeatureType;
      const assignment = store.planId
        ? await getPlanFeatureAssignment(String(store.planId), feature.key)
        : null;

      const counterKey = feature.usageCounterKey || feature.key;
      const limitMeta =
        type === "limit"
          ? ((await FeatureLimitModel.findOne({ featureKey: feature.key }).lean()) as { unit?: string } | null)
          : null;
      const unit = feature.unit || limitMeta?.unit || "";
      const current = Math.floor(resolveUsageValue(usage, counterKey, unit));
      const limit = assignment?.limit ?? 0;
      const enabled = assignment?.enabled ?? false;
      const tierKey = assignment?.tierKey ?? "disabled";
      const tiers = type === "tier" ? await getFeatureTiers(feature.key) : [];
      const tierLabel = tiers.find((t) => t.key === tierKey)?.label ?? tierKey;

      let locked = false;
      let lockReason: FeatureAccessDenialReason | undefined;

      if (type === "boolean") {
        locked = !enabled;
        if (locked) lockReason = "feature_disabled";
      } else if (type === "tier") {
        locked = isTierDisabled(tierKey);
        if (locked) lockReason = "feature_disabled";
      } else if (type === "limit") {
        if (!enabled && (limit ?? 0) <= 0) {
          locked = true;
          lockReason = "feature_disabled";
        } else if (limit > 0 && current >= limit) {
          locked = true;
          lockReason = "limit_reached";
        }
      }

      const requiredPlan = locked ? await findMinimumPlanForFeature(feature.key) : undefined;

      return {
        key: feature.key,
        name: feature.name,
        description: feature.description,
        type,
        group: feature.groupKey || feature.group,
        groupKey: feature.groupKey || feature.group,
        comingSoon: feature.comingSoon ?? false,
        unit,
        enabled,
        limit,
        tierKey,
        tierLabel,
        tiers: tiers.map((t) => ({ key: t.key, label: t.label, rank: t.rank })),
        value: tierKey,
        current,
        locked,
        lockReason,
        requiredPlan,
      };
    })
  );

  return {
    ok: true as const,
    data: {
      storeId,
      storeStatus: store.status,
      billingStatus: store.billingStatus,
      subscriptionStatus: store.subscriptionStatus,
      allowNewOrders: store.allowNewOrders,
      published: store.published,
      currentPlan: plan
        ? {
            slug: plan.slug,
            name: plan.name,
            priceBDT: plan.priceBDT,
            priceYearly: plan.priceYearly,
          }
        : null,
      features: matrix,
      usage,
    },
  };
}
