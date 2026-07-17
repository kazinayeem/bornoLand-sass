import { connectDatabase } from "../../common/database/connection.js";
import { StoreOverrideModel } from "./store-override.model.js";
import { StoreModel } from "./store.model.js";
import { PlanModel } from "../plans/plan.model.js";

// ── Fetch ─────────────────────────────────────────────────────

export async function getStoreOverride(
  storeId: string
): Promise<Record<string, unknown> | null> {
  await connectDatabase();
  const doc = await StoreOverrideModel.findOne({ storeId }).lean();
  return doc as Record<string, unknown> | null;
}

// ── Upsert ────────────────────────────────────────────────────

export async function upsertStoreOverride(
  storeId: string,
  data: Record<string, unknown>,
  updatedBy: string
) {
  await connectDatabase();
  const doc = await StoreOverrideModel.findOneAndUpdate(
    { storeId },
    { $set: { ...data, updatedBy } },
    { upsert: true, new: true }
  ).lean();
  return doc as Record<string, unknown> | null;
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteStoreOverride(storeId: string): Promise<{ deletedCount?: number }> {
  await connectDatabase();
  return StoreOverrideModel.deleteOne({ storeId });
}

// ── Resolve an effective limit (override ?: plan default) ─────

export async function resolveStoreLimit(
  storeId: string,
  limitKey: string
): Promise<number> {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).select("planId").lean() as { planId?: unknown; _id?: unknown } | null;
  if (!store) return 0;

  const override = await StoreOverrideModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  const overrides = override?.limits as Record<string, unknown> | undefined;

  // If override exists for this key, use it
  if (overrides != null && limitKey in overrides) {
    const val = overrides[limitKey];
    if (val != null) return Number(val);
  }

  // Fall back to plan
  const planId = override?.planId
    ? String(override.planId)
    : store.planId
      ? String(store.planId)
      : null;
  if (!planId) return 0;

  const plan = await PlanModel.findById(planId).select("limits").lean() as { limits?: Record<string, unknown> } | null;
  const planLimits = plan?.limits as Record<string, unknown> | undefined;
  if (planLimits && limitKey in planLimits) {
    const val = planLimits[limitKey];
    if (val != null) return Number(val);
  }
  return 0;
}

// ── Resolve an effective feature toggle ───────────────────────

export async function resolveStoreFeature(
  storeId: string,
  featureKey: string
): Promise<boolean> {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).select("planId").lean() as { planId?: unknown } | null;
  if (!store) return false;

  const override = await StoreOverrideModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  const featureOverrides = override?.featureOverrides as Record<string, unknown> | undefined;

  if (featureOverrides != null && featureKey in featureOverrides) {
    const val = featureOverrides[featureKey];
    if (val != null) return Boolean(val);
  }

  const planId = override?.planId
    ? String(override.planId)
    : store.planId
      ? String(store.planId)
      : null;
  if (!planId) return false;

  const plan = await PlanModel.findById(planId).select("featureToggles").lean() as { featureToggles?: Record<string, unknown> } | null;
  const toggles = plan?.featureToggles as Record<string, unknown> | undefined;
  if (toggles && featureKey in toggles) {
    return Boolean(toggles[featureKey]);
  }
  // Key absent from plan's featureToggles → treat as enabled (default-open).
  // Only an explicit `false` should block access.
  return true;
}

// ── Resolve effective storage limit (MB) ──────────────────────

export async function resolveStorageLimitMB(
  storeId: string
): Promise<{ limitMB: number; unlimited: boolean }> {
  await connectDatabase();
  const override = await StoreOverrideModel.findOne({ storeId }).lean() as Record<string, unknown> | null;

  // Check override first
  if (override?.storageUnlimited) {
    return { limitMB: Infinity, unlimited: true };
  }
  if (override?.storageOverrideMB != null) {
    return { limitMB: Number(override.storageOverrideMB), unlimited: false };
  }

  // Fall back to plan
  const store = await StoreModel.findById(storeId).select("planId").lean() as { planId?: unknown } | null;
  const planId = store?.planId ? String(store.planId) : null;
  if (planId) {
    const plan = await PlanModel.findById(planId).select("limits.storage").lean() as { limits?: { storage?: number } } | null;
    if (plan?.limits?.storage != null) {
      return { limitMB: plan.limits.storage, unlimited: false };
    }
  }

  return { limitMB: 0, unlimited: false };
}

// ── Build full override-aware limits map for a store ──────────

export async function buildEffectiveLimits(storeId: string): Promise<Record<string, number>> {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).select("planId").lean() as { planId?: unknown } | null;
  if (!store) return {};

  // Determine effective plan
  const override = await StoreOverrideModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  const planId = override?.planId
    ? String(override.planId)
    : store.planId
      ? String(store.planId)
      : null;
  if (!planId) return {};

  const plan = await PlanModel.findById(planId).select("limits").lean() as { limits?: Record<string, unknown> } | null;
  const planLimits = (plan?.limits ?? {}) as Record<string, unknown>;
  const overrideLimits = (override?.limits ?? {}) as Record<string, unknown>;

  const result: Record<string, number> = {};
  for (const key of Object.keys(planLimits)) {
    const overrideVal = overrideLimits[key];
    result[key] = overrideVal != null ? Number(overrideVal) : Number(planLimits[key] ?? 0);
  }
  return result;
}

// ── Build full override-aware features map ────────────────────

export async function buildEffectiveFeatures(storeId: string): Promise<Record<string, boolean>> {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).select("planId").lean() as { planId?: unknown } | null;
  if (!store) return {};

  const override = await StoreOverrideModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  const planId = override?.planId
    ? String(override.planId)
    : store.planId
      ? String(store.planId)
      : null;
  if (!planId) return {};

  const plan = await PlanModel.findById(planId).select("featureToggles").lean() as { featureToggles?: Record<string, unknown> } | null;
  const planFeatures = (plan?.featureToggles ?? {}) as Record<string, unknown>;
  const overrideFeatures = (override?.featureOverrides ?? {}) as Record<string, unknown>;

  const result: Record<string, boolean> = {};
  for (const key of Object.keys(planFeatures)) {
    const overrideVal = overrideFeatures[key];
    result[key] = overrideVal != null ? Boolean(overrideVal) : Boolean(planFeatures[key] ?? false);
  }
  return result;
}
