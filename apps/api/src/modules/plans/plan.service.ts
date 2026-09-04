import { connectDatabase } from "../../common/database/connection.js";
import { PlanModel } from "../../models/plan.model.js";
import { planSchema, updatePlanSchema } from "./plan.validator.js";
import { getPlanPriceForDuration } from "./plan-pricing.util.js";
import { ensureDefaultPlansSafe } from "../../bootstrap/safe-migrate.js";
import type { SubscriptionDuration } from "../subscriptions/subscription.constants.js";

/** Plan Builder camelCase toggles → Feature catalog snake_case keys */
const TOGGLE_TO_FEATURE_KEY: Record<string, string> = {
  inventory: "inventory",
  inventoryHistory: "inventory_history",
  priceHistory: "price_history",
  costHistory: "cost_history",
  suppliers: "suppliers",
  purchaseOrders: "purchase_orders",
  batchFifo: "batch_fifo",
  warehousesEnabled: "warehouses",
  barcode: "barcode",
  inventoryReports: "inventory_reports",
  lowStockAlerts: "low_stock_alerts",
  stockTransfer: "stock_transfer",
  inventoryAuditLog: "inventory_audit_log",
  courier: "courier",
  metaPixel: "meta_pixel",
  tiktokPixel: "tiktok_pixel",
  customTracking: "custom_tracking",
  googleAnalytics: "google_analytics",
  conversionTracking: "conversion_tracking",
  advancedTracking: "advanced_tracking",
  abandonedCart: "abandoned_cart",
  incompleteOrders: "incomplete_orders",
  checkoutRecovery: "checkout_recovery",
  recoveryAnalytics: "recovery_analytics",
  recoveryLinks: "checkout_recovery",
  sslcommerzPayment: "sslcommerz_payment",
  // Content & Pages
  cms: "cms",
  pageBuilder: "page_builder",
  mediaLibrary: "media",
  dragDropBuilder: "builder",
  themeEditor: "theme_builder",
  // Platform & Limits
  advancedAnalytics: "analytics",
  reports: "reports",
  staffManagement: "staff",
  // HRM Module
  hrm: "hrm",
  hrmEmployees: "employees",
  hrmAttendance: "attendance",
  hrmPayroll: "payroll",
  hrmLeave: "leave_mgmt",
  hrmSelfService: "self_service",
  // POS Module
  pos: "pos",
  // Accounting Module
  accounting: "accounting",
  // CRM & Operations
  crm: "crm",
  operations: "operations",
  // ERP Suite
  erpCore: "erp_core",
  erpFinance: "erp_finance",
  erpInventory: "erp_inventory",
  erpProcurement: "erp_procurement",
  erpManufacturing: "erp_manufacturing",
  erpProjects: "erp_projects",
};

async function syncFeatureTogglesToPlanFeatures(
  planId: string,
  toggles: Record<string, unknown> | undefined | null
) {
  if (!toggles) return;
  try {
    const { PlanFeatureModel } = await import("../features/plan-feature.model.js");
    const ops = Object.entries(TOGGLE_TO_FEATURE_KEY)
      .filter(([toggleKey]) => toggles[toggleKey] !== undefined)
      .map(([toggleKey, featureKey]) => {
        const enabled = Boolean(toggles[toggleKey]);
        return {
          updateOne: {
            filter: { planId, featureKey },
            update: {
              $set: {
                planId,
                featureKey,
                enabled,
                limit: 0,
                tierKey: enabled ? "enabled" : "disabled",
                value: enabled ? "enabled" : "disabled",
              },
            },
            upsert: true,
          },
        };
      });
    if (ops.length > 0) await PlanFeatureModel.bulkWrite(ops, { ordered: false });
  } catch {
    // Non-fatal — API still uses PlanFeature rows from matrix / prior sync
  }
}

async function ensureDefaultPlans() {
  await ensureDefaultPlansSafe();
}

export async function listPlans(includeHidden = false) {
  await connectDatabase();
  await ensureDefaultPlans();
  const filter = includeHidden ? {} : { isActive: true, visible: { $ne: false } };
  const plans = await PlanModel.find(filter).sort({ sortOrder: 1, priceBDT: 1 }).lean();
  return { ok: true as const, data: { plans } };
}

/** Public marketing payload: never exposes hidden or inactive plan configurations. */
export async function listPublicPlans() {
  await connectDatabase();
  const plans = await PlanModel.find({ isActive: true, visible: { $ne: false } })
    .select("name slug description priceBDT priceYearly isCustomPrice trialDays features limits featureToggles courierAccess pricing customDomain prioritySupport sortOrder isRecommended isPopular")
    .sort({ sortOrder: 1, priceBDT: 1 })
    .lean();
  return { ok: true as const, data: { plans } };
}

export async function createPlan(payload: unknown) {
  const parsed = planSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid plan data" };

  await connectDatabase();
  const existing = await PlanModel.findOne({ slug: parsed.data.slug }).lean();
  if (existing) return { ok: false as const, message: "Plan slug already exists" };

  const plan = await PlanModel.create({
    ...parsed.data,
    pricing: {
      monthly: parsed.data.pricing?.monthly || parsed.data.priceBDT,
      quarterly: parsed.data.pricing?.quarterly || parsed.data.priceBDT * 3,
      halfYearly: parsed.data.pricing?.halfYearly || parsed.data.priceBDT * 6,
      yearly: parsed.data.pricing?.yearly || parsed.data.priceYearly || parsed.data.priceBDT * 12,
      lifetime: parsed.data.pricing?.lifetime || 0,
    },
  });
  await syncFeatureTogglesToPlanFeatures(
    String(plan._id),
    (plan.toObject() as { featureToggles?: Record<string, unknown> }).featureToggles
  );
  return { ok: true as const, data: { plan: plan.toObject() } };
}

export async function updatePlan(planId: string, payload: unknown) {
  const parsed = updatePlanSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid plan data" };

  await connectDatabase();

  // Keep courierAccess ↔ featureToggles.courier in sync when either is provided
  const data = { ...parsed.data } as Record<string, unknown>;
  if (parsed.data.courierAccess) {
    const ca = parsed.data.courierAccess;
    const enabled = Boolean(ca.enabled || ca.allProviders || (ca.providers?.length ?? 0) > 0);
    data.courierAccess = { ...ca, enabled };
    data.featureToggles = {
      ...(parsed.data.featureToggles ?? {}),
      courier: enabled,
    };
  } else if (parsed.data.featureToggles?.courier !== undefined) {
    const enabled = Boolean(parsed.data.featureToggles.courier);
    data.courierAccess = {
      enabled,
      allProviders: enabled,
      providers: enabled ? ["pathao", "redx", "steadfast", "paperfly", "sundarban"] : [],
    };
  }

  const plan = await PlanModel.findByIdAndUpdate(planId, { $set: data }, { new: true }).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const toggles = (plan as { featureToggles?: Record<string, unknown> }).featureToggles ?? {};
  // Ensure courier Access is reflected in toggles for PlanFeature sync
  const courierEnabled = Boolean(
    (plan as { courierAccess?: { enabled?: boolean } }).courierAccess?.enabled ?? toggles.courier
  );
  await syncFeatureTogglesToPlanFeatures(planId, { ...toggles, courier: courierEnabled });

  try {
    const { StoreModel } = await import("../../models/store.model.js");
    const { invalidateStoreFeatureCache } = await import("../features/feature-access.service.js");
    const stores = await StoreModel.find({ planId }).select("_id").lean();
    for (const store of stores) {
      invalidateStoreFeatureCache(String(store._id));
    }
  } catch {
    // Non-fatal
  }

  return { ok: true as const, data: { plan } };
}

export async function deletePlan(planId: string) {
  await connectDatabase();
  const plan = await PlanModel.findByIdAndDelete(planId).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };
  return { ok: true as const, message: "Plan deleted" };
}

export async function duplicatePlan(planId: string) {
  await connectDatabase();
  const plan = await PlanModel.findById(planId).lean() as { slug: string; name: string } | null;
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const baseSlug = `${plan.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;
  while (await PlanModel.findOne({ slug }).lean()) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const { _id, createdAt, updatedAt, ...rest } = plan as Record<string, unknown>;
  const duplicate = await PlanModel.create({
    ...rest,
    name: `${plan.name} (Copy)`,
    slug,
    isActive: false,
    visible: false,
  });

  return { ok: true as const, data: { plan: duplicate.toObject() } };
}

export async function getPlanPrice(planId: string, duration: SubscriptionDuration) {
  await connectDatabase();
  const plan = (await PlanModel.findById(planId).lean()) as Parameters<typeof getPlanPriceForDuration>[0] | null;
  if (!plan) return { ok: false as const, message: "Plan not found" };
  const amount = getPlanPriceForDuration(plan, duration);
  return { ok: true as const, data: { plan, duration, amount } };
}
