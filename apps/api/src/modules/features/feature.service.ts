import { connectDatabase } from "../../common/database/connection.js";
import { FeatureModel } from "./feature.model.js";
import { FeatureGroupModel } from "./feature-group.model.js";
import { FeatureTierModel } from "./feature-tier.model.js";
import { FeatureLimitModel } from "./feature-limit.model.js";
import { PlanFeatureModel } from "./plan-feature.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { StoreModel } from "../../models/store.model.js";
import { LEGACY_LIMIT_MAP, normalizeFeatureType, type FeatureType } from "./feature.constants.js";
import { SEED_FEATURES, SEED_GROUPS, SEED_LIMITS, SEED_TIERS } from "./feature.seed.js";
import { ensureDefaultFeaturesSafe } from "../../bootstrap/safe-migrate.js";
import { invalidateStoreFeatureCache } from "./feature-access.service.js";

let defaultFeaturesEnsured = false;

export async function ensureDefaultFeatures() {
  if (defaultFeaturesEnsured) return;
  try {
    await ensureDefaultFeaturesSafe();
    defaultFeaturesEnsured = true;
  } catch (err) {
    console.warn("ensureDefaultFeaturesSafe warning:", err);
    defaultFeaturesEnsured = true;
  }
}

export async function listFeatureGroups() {
  await ensureDefaultFeatures();
  const groups = await FeatureGroupModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  return { ok: true as const, data: { groups } };
}

export async function createFeatureGroup(payload: { key: string; name: string; description?: string; sortOrder?: number }) {
  await connectDatabase();
  const group = await FeatureGroupModel.create({ ...payload, key: payload.key.toLowerCase() });
  return { ok: true as const, data: { group: group.toObject() } };
}

export async function updateFeatureGroup(key: string, payload: Record<string, unknown>) {
  await connectDatabase();
  const group = await FeatureGroupModel.findOneAndUpdate({ key: key.toLowerCase() }, { $set: payload }, { new: true }).lean();
  if (!group) return { ok: false as const, message: "Group not found" };
  return { ok: true as const, data: { group } };
}

export async function listFeatures(groupKey?: string) {
  await ensureDefaultFeatures();
  const filter: Record<string, unknown> = { isActive: true };
  if (groupKey) filter.groupKey = groupKey;
  const features = await FeatureModel.find(filter).sort({ groupKey: 1, sortOrder: 1 }).lean();
  return { ok: true as const, data: { features } };
}

export async function getFeatureDetail(key: string) {
  await connectDatabase();
  const feature = await FeatureModel.findOne({ key: key.toLowerCase() }).lean();
  if (!feature) return { ok: false as const, message: "Feature not found" };
  const [tiers, limitMeta] = await Promise.all([
    FeatureTierModel.find({ featureKey: key.toLowerCase() }).sort({ rank: 1 }).lean(),
    FeatureLimitModel.findOne({ featureKey: key.toLowerCase() }).lean(),
  ]);
  return { ok: true as const, data: { feature, tiers, limitMeta } };
}

export async function createFeature(payload: {
  key: string;
  name: string;
  description?: string;
  type: FeatureType;
  groupKey?: string;
  sortOrder?: number;
  usageCounterKey?: string;
  unit?: string;
  defaultEnabled?: boolean;
  defaultLimit?: number;
  defaultTier?: string;
  comingSoon?: boolean;
  tiers?: Array<{ tierKey: string; label: string; rank: number; description?: string }>;
}) {
  await connectDatabase();
  const key = payload.key.toLowerCase();
  const existing = await FeatureModel.findOne({ key }).lean();
  if (existing) return { ok: false as const, message: "Feature key already exists" };

  const feature = await FeatureModel.create({
    key,
    name: payload.name,
    description: payload.description ?? "",
    type: payload.type,
    groupKey: payload.groupKey ?? "general",
    group: payload.groupKey ?? "general",
    sortOrder: payload.sortOrder ?? 0,
    usageCounterKey: payload.usageCounterKey ?? "",
    unit: payload.unit ?? "",
    defaultEnabled: payload.defaultEnabled ?? false,
    defaultLimit: payload.defaultLimit ?? 0,
    defaultTier: payload.defaultTier ?? "disabled",
    comingSoon: payload.comingSoon ?? false,
    isActive: true,
  });

  if (payload.type === "limit") {
    await FeatureLimitModel.findOneAndUpdate(
      { featureKey: key },
      { $set: { unit: payload.unit ?? "", defaultLimit: payload.defaultLimit ?? 0, unlimitedValue: 0 } },
      { upsert: true }
    );
  }

  if (payload.type === "tier" && payload.tiers?.length) {
    await FeatureTierModel.insertMany(payload.tiers.map((t) => ({ ...t, featureKey: key })));
  }

  return { ok: true as const, data: { feature: feature.toObject() } };
}

export async function updateFeature(key: string, payload: Record<string, unknown>) {
  await connectDatabase();
  const feature = await FeatureModel.findOneAndUpdate({ key: key.toLowerCase() }, { $set: payload }, { new: true }).lean();
  if (!feature) return { ok: false as const, message: "Feature not found" };
  return { ok: true as const, data: { feature } };
}

export async function deleteFeature(key: string) {
  await connectDatabase();
  const feature = await FeatureModel.findOneAndUpdate(
    { key: key.toLowerCase() },
    { $set: { isActive: false } },
    { new: true }
  ).lean();
  if (!feature) return { ok: false as const, message: "Feature not found" };
  await Promise.all([
    PlanFeatureModel.deleteMany({ featureKey: key.toLowerCase() }),
    FeatureTierModel.deleteMany({ featureKey: key.toLowerCase() }),
    FeatureLimitModel.deleteOne({ featureKey: key.toLowerCase() }),
  ]);
  return { ok: true as const, message: "Feature deactivated" };
}

export async function setFeatureTiers(
  featureKey: string,
  tiers: Array<{ tierKey: string; label: string; rank: number; description?: string }>
) {
  await connectDatabase();
  await FeatureTierModel.deleteMany({ featureKey: featureKey.toLowerCase() });
  if (tiers.length > 0) {
    await FeatureTierModel.insertMany(tiers.map((t) => ({ ...t, featureKey: featureKey.toLowerCase() })));
  }
  const saved = await FeatureTierModel.find({ featureKey: featureKey.toLowerCase() }).sort({ rank: 1 }).lean();
  return { ok: true as const, data: { tiers: saved } };
}

export async function getFeatureTiers(featureKey: string) {
  await connectDatabase();
  const tiers = await FeatureTierModel.find({ featureKey: featureKey.toLowerCase() }).sort({ rank: 1 }).lean();
  return { ok: true as const, data: { tiers } };
}

export function resolveAssignmentTier(assigned: { tierKey?: string; value?: string } | null | undefined) {
  return assigned?.tierKey || assigned?.value || "disabled";
}

export async function getPlanFeatures(planId: string) {
  await ensureDefaultFeatures();
  await connectDatabase();
  const [features, planFeatures, plan, groups] = await Promise.all([
    FeatureModel.find({ isActive: true }).sort({ groupKey: 1, sortOrder: 1 }).lean(),
    PlanFeatureModel.find({ planId }).lean(),
    PlanModel.findById(planId).lean(),
    FeatureGroupModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
  ]);

  if (!plan) return { ok: false as const, message: "Plan not found" };

  const assignmentMap = new Map(planFeatures.map((pf) => [pf.featureKey, pf]));
  const limits = (plan as { limits?: Record<string, unknown> }).limits ?? {};

  const matrix = await Promise.all(
    features.map(async (feature) => {
      const assigned = assignmentMap.get(feature.key);
      const type = normalizeFeatureType(feature.type);
      const tiers =
        type === "tier"
          ? await FeatureTierModel.find({ featureKey: feature.key }).sort({ rank: 1 }).lean()
          : [];
      const limitMeta =
        type === "limit" ? await FeatureLimitModel.findOne({ featureKey: feature.key }).lean() : null;

      if (assigned) {
        const tierKey = resolveAssignmentTier(assigned as { tierKey?: string; value?: string });
        return {
          featureKey: feature.key,
          name: feature.name,
          type,
          groupKey: feature.groupKey || feature.group,
          group: feature.groupKey || feature.group,
          comingSoon: feature.comingSoon,
          enabled: assigned.enabled,
          limit: assigned.limit,
          tierKey,
          value: tierKey,
          tiers,
          limitMeta,
        };
      }

      const legacy = resolveLegacyAssignment(feature.key, type, limits);
      return {
        featureKey: feature.key,
        name: feature.name,
        type,
        groupKey: feature.groupKey || feature.group,
        group: feature.groupKey || feature.group,
        comingSoon: feature.comingSoon,
        tiers,
        limitMeta,
        ...legacy,
      };
    })
  );

  return { ok: true as const, data: { planId, groups, features: matrix } };
}

function resolveLegacyAssignment(featureKey: string, type: FeatureType, limits: Record<string, unknown>) {
  for (const [legacyKey, mappedKey] of Object.entries(LEGACY_LIMIT_MAP)) {
    if (mappedKey !== featureKey) continue;
    const val = limits[legacyKey];
    if (type === "boolean") {
      return { enabled: Boolean(val), limit: 0, tierKey: val ? "enabled" : "disabled", value: val ? "enabled" : "disabled" };
    }
    if (type === "limit") {
      const num = typeof val === "number" ? val : 0;
      return { enabled: num !== 0, limit: num, tierKey: "", value: "" };
    }
    if (type === "tier") {
      const enabled = Boolean(val);
      return { enabled, limit: 0, tierKey: enabled ? "basic" : "disabled", value: enabled ? "basic" : "disabled" };
    }
  }
  return { enabled: false, limit: 0, tierKey: "disabled", value: "disabled" };
}

export async function setPlanFeatures(
  planId: string,
  assignments: Array<{ featureKey: string; enabled?: boolean; limit?: number; tierKey?: string; value?: string }>
) {
  await connectDatabase();
  const plan = await PlanModel.findById(planId).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };

  for (const item of assignments) {
    const tierKey = item.tierKey ?? item.value ?? "disabled";
    await PlanFeatureModel.findOneAndUpdate(
      { planId, featureKey: item.featureKey.toLowerCase() },
      {
        $set: {
          enabled: item.enabled ?? false,
          limit: item.limit ?? 0,
          tierKey,
          value: tierKey,
        },
      },
      { upsert: true, new: true }
    );
  }

  // Invalidate store feature cache for all stores on this plan
  const stores = await StoreModel.find({ planId }).select("_id").lean();
  for (const store of stores) {
    invalidateStoreFeatureCache(String(store._id));
  }

  return getPlanFeatures(planId);
}

export async function syncPlanFeaturesFromLegacy(
  planId: string,
  options?: { ensureFeatures?: boolean }
) {
  await connectDatabase();
  const plan = await PlanModel.findById(planId).lean() as { limits?: Record<string, unknown> } | null;
  if (!plan) return;

  if (options?.ensureFeatures !== false) {
    await ensureDefaultFeatures();
  }
  const features = await FeatureModel.find({ isActive: true }).lean();

  const ops = features.map((feature) => {
    const type = normalizeFeatureType(feature.type);
    const legacy = resolveLegacyAssignment(feature.key, type, plan.limits ?? {});
    return {
      updateOne: {
        filter: { planId, featureKey: feature.key },
        update: {
          $setOnInsert: {
            planId,
            featureKey: feature.key,
            enabled: legacy.enabled,
            limit: legacy.limit,
            tierKey: legacy.tierKey,
            value: legacy.value,
          },
        },
        upsert: true,
      },
    };
  });

  if (ops.length > 0) {
    await PlanFeatureModel.bulkWrite(ops, { ordered: false });
  }
}

export async function ensureAllPlanFeatures() {
  await connectDatabase();
  const plans = await PlanModel.find().lean();
  for (const plan of plans) {
    await syncPlanFeaturesFromLegacy(String(plan._id));
  }
}
