import bcrypt from "bcryptjs";
import { connectDatabase } from "../common/database/connection.js";
import { UserModel } from "../modules/users/user.model.js";
import { PlanModel } from "../modules/plans/plan.model.js";
import { PlanFeatureModel } from "../modules/features/plan-feature.model.js";
import { FeatureModel } from "../modules/features/feature.model.js";
import { FeatureGroupModel } from "../modules/features/feature-group.model.js";
import { FeatureTierModel } from "../modules/features/feature-tier.model.js";
import { FeatureLimitModel } from "../modules/features/feature-limit.model.js";
import { PlatformSettingsModel } from "../modules/settings/platform-settings.model.js";
import { PlatformPaymentMethodModel } from "../modules/payments/platform-payment-method.model.js";
import { StoragePlanModel } from "../modules/media/storage-plan.model.js";
import { SEED_FEATURES, SEED_GROUPS, SEED_LIMITS, SEED_TIERS } from "../modules/features/feature.seed.js";
import { DEFAULT_PLANS } from "./defaults/plan.defaults.js";
import { DEFAULT_PLAN_FEATURE_MATRIX } from "./defaults/plan-feature.defaults.js";
import { DEFAULT_STORAGE_BY_PLAN_SLUG } from "./defaults/storage-plan.defaults.js";
import { BOOTSTRAP_MIGRATION_VERSION, MigrationStateModel } from "./migration-state.model.js";

const PLATFORM_SETTINGS_DEFAULTS = {
  key: "global",
  platformName: "BornoLand",
  companyName: "BornoLand",
  trialEnabled: true,
  trialDays: 3,
  defaultPlanSlug: "free",
  currencyCode: "BDT",
  currencySymbol: "৳",
  currencyPosition: "before" as const,
  timezone: "Asia/Dhaka",
  maintenanceMode: false,
  vatPercent: 0,
  taxPercent: 0,
  invoicePrefix: "INV-",
  enabledDurations: {
    monthly: true,
    quarterly: true,
    halfYearly: true,
    yearly: true,
    lifetime: false,
  },
  enabledPaymentMethods: {
    bkash: true,
    nagad: true,
    cod: true,
  },
};

const DEFAULT_PLATFORM_PAYMENT_METHODS = [
  {
    type: "bkash",
    label: "bKash",
    accountNumber: "01XXXXXXXXX",
    enabled: false,
    sortOrder: 1,
  },
  {
    type: "nagad",
    label: "Nagad",
    accountNumber: "01XXXXXXXXX",
    enabled: false,
    sortOrder: 2,
  },
  {
    type: "rocket",
    label: "Rocket",
    accountNumber: "01XXXXXXXXX",
    enabled: false,
    sortOrder: 3,
  },
  {
    type: "bank",
    label: "Bank Transfer",
    accountNumber: "0000000000",
    accountName: "BornoLand Ltd",
    bankName: "Dutch Bangla Bank",
    branchName: "Gulshan",
    enabled: false,
    sortOrder: 4,
  },
] as const;

function collectMissingFields(
  existing: Record<string, unknown>,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (key === "_id" || key === "createdAt" || key === "updatedAt") continue;
    const current = existing[key];
    if (current === undefined || current === null) {
      patch[key] = value;
    }
  }
  return patch;
}

export async function ensureDefaultFeaturesSafe() {
  await connectDatabase();

  await FeatureGroupModel.bulkWrite(
    SEED_GROUPS.map((group) => ({
      updateOne: {
        filter: { key: group.key },
        update: { $setOnInsert: { ...group, isActive: true } },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  await FeatureModel.bulkWrite(
    SEED_FEATURES.map((feature) => ({
      updateOne: {
        filter: { key: feature.key },
        update: {
          $setOnInsert: {
            key: feature.key,
            name: feature.name,
            description: feature.description,
            type: feature.type,
            groupKey: feature.groupKey,
            group: feature.groupKey,
            sortOrder: feature.sortOrder,
            usageCounterKey: feature.usageCounterKey ?? "",
            unit: feature.unit ?? "",
            defaultEnabled: feature.defaultEnabled ?? false,
            defaultLimit: feature.defaultLimit ?? 0,
            defaultTier: feature.defaultTier ?? "disabled",
            isActive: true,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  await FeatureTierModel.bulkWrite(
    SEED_TIERS.map((tier) => ({
      updateOne: {
        filter: { featureKey: tier.featureKey, tierKey: tier.tierKey },
        update: { $setOnInsert: { ...tier } },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  await FeatureLimitModel.bulkWrite(
    SEED_LIMITS.map((limit) => ({
      updateOne: {
        filter: { featureKey: limit.featureKey },
        update: {
          $setOnInsert: {
            ...limit,
            unlimitedValue: 0,
            displayFormat: "{current} / {limit}",
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

export async function ensureDefaultPlansSafe() {
  await connectDatabase();

  for (const plan of DEFAULT_PLANS) {
    await PlanModel.findOneAndUpdate({ slug: plan.slug }, { $setOnInsert: { ...plan } }, { upsert: true });
  }
}

export async function ensureDefaultPlanFeaturesSafe() {
  await connectDatabase();
  const plans = await PlanModel.find().select("_id slug").lean();
  const { syncPlanFeaturesFromLegacy } = await import("../modules/features/feature.service.js");

  for (const plan of plans) {
    const slug = plan.slug as string;
    const matrix = DEFAULT_PLAN_FEATURE_MATRIX[slug];

    if (matrix) {
      const ops = Object.entries(matrix).map(([featureKey, assignment]) => {
        const tierKey = assignment.tierKey ?? (assignment.enabled ? "enabled" : "disabled");
        return {
          updateOne: {
            filter: { planId: plan._id, featureKey },
            update: {
              $setOnInsert: {
                planId: plan._id,
                featureKey,
                enabled: assignment.enabled ?? false,
                limit: assignment.limit ?? 0,
                tierKey,
                value: tierKey,
              },
            },
            upsert: true,
          },
        };
      });
      if (ops.length > 0) await PlanFeatureModel.bulkWrite(ops, { ordered: false });

      // Repair rows seeded before the canonical matrix (e.g. media disabled on free)
      const repairOps = Object.entries(matrix)
        .filter(([, assignment]) => assignment.enabled === true)
        .map(([featureKey, assignment]) => {
          const tierKey = assignment.tierKey ?? "enabled";
          return {
            updateOne: {
              filter: { planId: plan._id, featureKey, enabled: { $ne: true } },
              update: {
                $set: {
                  enabled: true,
                  limit: assignment.limit ?? 0,
                  tierKey,
                  value: tierKey,
                },
              },
            },
          };
        });
      if (repairOps.length > 0) await PlanFeatureModel.bulkWrite(repairOps, { ordered: false });

      continue;
    }

    await syncPlanFeaturesFromLegacy(String(plan._id), { ensureFeatures: false });
  }
}

export async function ensureDefaultStoragePlansSafe() {
  await connectDatabase();
  const plans = await PlanModel.find().select("_id slug").lean();

  for (const plan of plans) {
    const slug = plan.slug as string;
    const defaults = DEFAULT_STORAGE_BY_PLAN_SLUG[slug];
    if (!defaults) continue;

    await StoragePlanModel.findOneAndUpdate(
      { planId: plan._id },
      {
        $setOnInsert: {
          planId: plan._id,
          storageLimitMB: defaults.storageLimitMB,
          maxFileSizeMB: defaults.maxFileSizeMB,
          allowedMimeTypes: [],
          maxUploads: 0,
          maxImages: 0,
          maxDocuments: 0,
          unlimited: defaults.unlimited ?? false,
        },
      },
      { upsert: true }
    );

    // Raise quota to at least the canonical default (never lowers existing limits)
    await StoragePlanModel.updateOne(
      { planId: plan._id },
      {
        $max: {
          storageLimitMB: defaults.storageLimitMB,
          maxFileSizeMB: defaults.maxFileSizeMB,
        },
      }
    );
  }
}

export async function ensurePlatformSettingsSafe() {
  await connectDatabase();

  const settings = await PlatformSettingsModel.findOne({ key: "global" }).lean();
  if (!settings) {
    await PlatformSettingsModel.create(PLATFORM_SETTINGS_DEFAULTS);
    return;
  }

  const patch = collectMissingFields(settings as Record<string, unknown>, PLATFORM_SETTINGS_DEFAULTS);
  if (Object.keys(patch).length > 0) {
    await PlatformSettingsModel.updateOne({ key: "global" }, { $set: patch });
  }
}

export async function ensurePlatformPaymentMethodsSafe() {
  await connectDatabase();

  for (const method of DEFAULT_PLATFORM_PAYMENT_METHODS) {
    await PlatformPaymentMethodModel.findOneAndUpdate(
      { type: method.type },
      { $setOnInsert: { ...method } },
      { upsert: true }
    );
  }
}

export async function ensureSuperAdminIfMissing() {
  await connectDatabase();

  const existingCount = await UserModel.countDocuments({ role: "super_admin" });
  if (existingCount > 0) return;

  const email = process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? "admin@bornoland.com";
  const password = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? "Admin@123";
  const passwordHash = await bcrypt.hash(password, 12);

  const existingUser = (await UserModel.findOne({ email }).lean()) as { role?: string } | null;
  if (existingUser) {
    if (existingUser.role !== "super_admin") {
      console.warn(
        `[bootstrap] User ${email} exists but is not super_admin — skipping promotion to preserve data.`
      );
    }
    return;
  }

  await UserModel.create({
    name: "Super Admin",
    email,
    passwordHash,
    role: "super_admin",
    status: "active",
    rememberMe: true,
  });

  console.log(`[bootstrap] Created default Super Admin (${email}) — change password after first login.`);
}

export async function runSafeMigration() {
  await connectDatabase();

  const startedAt = Date.now();
  console.log("[bootstrap] Running safe migration…");

  const steps: Array<[string, () => Promise<void>]> = [
    ["features", ensureDefaultFeaturesSafe],
    ["plans", ensureDefaultPlansSafe],
    ["plan-features", ensureDefaultPlanFeaturesSafe],
    ["storage-plans", ensureDefaultStoragePlansSafe],
    ["platform-settings", ensurePlatformSettingsSafe],
    ["payment-methods", ensurePlatformPaymentMethodsSafe],
    ["super-admin", ensureSuperAdminIfMissing],
  ];

  for (const [name, fn] of steps) {
    const stepStart = Date.now();
    await fn();
    console.log(`[bootstrap]   ✓ ${name} (${Date.now() - stepStart}ms)`);
  }

  await MigrationStateModel.findOneAndUpdate(
    { key: "bootstrap" },
    {
      $set: {
        version: BOOTSTRAP_MIGRATION_VERSION,
        lastRunAt: new Date(),
        notes: "Safe upsert bootstrap completed",
      },
    },
    { upsert: true }
  );

  console.log(`[bootstrap] Safe migration complete (${Date.now() - startedAt}ms)`);
}
