import { connectDatabase } from "../database/connection.js";
import { StoreModel } from "../../modules/stores/store.model.js";
import { PlanModel } from "../../modules/plans/plan.model.js";
import { CANONICAL_MODULE_REGISTRY, validateModuleDependencies } from "../constants/modules.js";
import { applyTrialExpiryToStore, applySubscriptionExpiryToStore } from "../../modules/stores/trial.service.js";

export type ModuleEntitlementResult = {
  entitled: boolean;
  code?: string;
  message?: string;
  enabledModules?: string[];
  missingDependencies?: string[];
};

/**
 * Resolve all entitled module keys for a store.
 */
export async function getStoreEntitledModules(storeId: string): Promise<string[]> {
  await connectDatabase();
  const store = await StoreModel.findById(storeId);
  if (!store) return [];

  await applyTrialExpiryToStore(store);
  await applySubscriptionExpiryToStore(store);

  // If store is suspended or expired, return empty modules
  if (store.status === "suspended" || store.status === "expired") {
    return [];
  }

  // If no planId, default free commerce basics
  if (!store.planId) {
    return ["commerce", "team", "builder"];
  }

  const plan = await PlanModel.findById(store.planId).lean() as any;
  if (!plan) {
    return ["commerce", "team", "builder"];
  }

  const entitled = new Set<string>();

  // Base modules always present in active store plans
  entitled.add("commerce");
  entitled.add("team");
  entitled.add("builder");

  const toggles = plan.featureToggles || {};

  // POS
  if (toggles.pos || plan.features?.includes("pos")) {
    entitled.add("pos");
  }

  // Inventory
  if (
    toggles.inventory ||
    toggles.advancedInventory ||
    toggles.inventoryHistory ||
    plan.features?.includes("inventory")
  ) {
    entitled.add("inventory");
  }

  // Warehouse (requires inventory)
  if (toggles.warehousesEnabled || toggles.warehouses || plan.features?.includes("warehouse") || plan.features?.includes("warehouses")) {
    entitled.add("warehouse");
  }

  // Procurement (requires inventory)
  if (toggles.suppliers || toggles.purchaseOrders || plan.features?.includes("procurement") || plan.features?.includes("suppliers")) {
    entitled.add("procurement");
  }

  // Shipping
  if (toggles.shipping || toggles.courier || plan.courierAccess?.enabled || plan.features?.includes("shipping")) {
    entitled.add("shipping");
  }

  // Analytics
  if (toggles.advancedAnalytics || toggles.visitorAnalytics || toggles.reports || plan.features?.includes("analytics")) {
    entitled.add("analytics");
  }

  // Marketing
  if (
    toggles.metaPixel ||
    toggles.tiktokPixel ||
    toggles.googleAnalytics ||
    toggles.customTracking ||
    toggles.emailMarketing ||
    toggles.smsMarketing ||
    plan.features?.includes("marketing")
  ) {
    entitled.add("marketing");
  }

  // Finance
  if (toggles.sslcommerzPayment || toggles.invoiceGenerator || toggles.taxEngine || plan.features?.includes("finance")) {
    entitled.add("finance");
  }

  // Check if "Full Platform" (all active modules) is enabled
  if (plan.slug === "enterprise" || plan.slug === "full-platform" || plan.features?.includes("full_platform")) {
    for (const key of Object.keys(CANONICAL_MODULE_REGISTRY)) {
      if (CANONICAL_MODULE_REGISTRY[key].status === "active") {
        entitled.add(key);
      }
    }
  }

  return Array.from(entitled);
}

/**
 * Check if a specific module is entitled for a store.
 */
export async function checkStoreModuleEntitlement(
  storeId: string,
  moduleKey: string,
): Promise<ModuleEntitlementResult> {
  const modDef = CANONICAL_MODULE_REGISTRY[moduleKey];
  if (!modDef) {
    return {
      entitled: false,
      code: "UNKNOWN_MODULE",
      message: `Module "${moduleKey}" is not recognized in the canonical module registry.`,
    };
  }

  const enabledModules = await getStoreEntitledModules(storeId);
  const isEnabled = enabledModules.includes(moduleKey);

  if (!isEnabled) {
    return {
      entitled: false,
      code: "MODULE_NOT_ENTITLED",
      message: `The "${modDef.name}" module is not included in your current subscription plan. Upgrade your plan to access this module.`,
      enabledModules,
    };
  }

  // Check module dependencies
  const { valid, missingDependencies } = validateModuleDependencies(enabledModules);
  if (!valid && missingDependencies[moduleKey]?.length) {
    const missingNames = missingDependencies[moduleKey]
      .map((k) => CANONICAL_MODULE_REGISTRY[k]?.name || k)
      .join(", ");
    return {
      entitled: false,
      code: "MISSING_MODULE_DEPENDENCY",
      message: `"${modDef.name}" requires prerequisite module(s): ${missingNames}.`,
      missingDependencies: missingDependencies[moduleKey],
      enabledModules,
    };
  }

  return {
    entitled: true,
    enabledModules,
  };
}
