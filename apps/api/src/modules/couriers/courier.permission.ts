import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { checkFeature } from "../features/feature-access.service.js";
import {
  COURIER_FEATURE_KEY,
  COURIER_PROVIDER_SLUGS,
  type CourierProviderSlug,
  isCourierProviderSlug,
} from "./courier.constants.js";

export type CourierAccessResult = {
  allowed: boolean;
  message?: string;
  enabled: boolean;
  /** Providers the store may configure (intersection of plan ∩ store selection) */
  providers: CourierProviderSlug[];
  planProviders: CourierProviderSlug[];
  storeProviders: CourierProviderSlug[];
  currentPlan?: { slug: string; name: string };
};

function normalizeProviderList(raw: unknown): CourierProviderSlug[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => String(v).trim().toLowerCase())
    .filter(isCourierProviderSlug);
}

/**
 * Resolve which courier providers a store may use.
 * Priority: plan.courierAccess → featureToggles.courier → Feature catalog `courier`.
 */
export async function resolveStoreCourierAccess(storeId: string): Promise<CourierAccessResult> {
  await connectDatabase();
  const store = (await StoreModel.findById(storeId).lean()) as {
    planId?: unknown;
    plan?: string;
    courierAccess?: { providers?: string[] };
  } | null;

  if (!store) {
    return {
      allowed: false,
      message: "Store not found",
      enabled: false,
      providers: [],
      planProviders: [],
      storeProviders: [],
    };
  }

  const plan = store.planId
    ? ((await PlanModel.findById(store.planId).lean()) as {
        slug?: string;
        name?: string;
        featureToggles?: { courier?: boolean };
        courierAccess?: { enabled?: boolean; allProviders?: boolean; providers?: string[] };
      } | null)
    : null;

  const featureCheck = await checkFeature(storeId, COURIER_FEATURE_KEY);
  const toggleEnabled = Boolean(plan?.featureToggles?.courier);
  const courierBlock = plan?.courierAccess;
  const blockEnabled = Boolean(courierBlock?.enabled);
  const enabled = blockEnabled || toggleEnabled || featureCheck.allowed;

  let planProviders: CourierProviderSlug[] = [];
  if (enabled) {
    if (courierBlock?.allProviders) {
      planProviders = [...COURIER_PROVIDER_SLUGS];
    } else if (courierBlock?.providers?.length) {
      planProviders = normalizeProviderList(courierBlock.providers);
    } else if (toggleEnabled || featureCheck.allowed) {
      // Legacy: courier enabled without explicit list → all providers
      planProviders = [...COURIER_PROVIDER_SLUGS];
    }
  }

  const storeSelected = normalizeProviderList(store.courierAccess?.providers);
  // Empty store selection = inherit all plan providers
  const providers =
    storeSelected.length > 0
      ? planProviders.filter((p) => storeSelected.includes(p))
      : planProviders;

  return {
    allowed: enabled && providers.length > 0,
    message: enabled
      ? providers.length
        ? undefined
        : "No courier providers assigned to this store"
      : "Courier management is not included in your plan. Please upgrade.",
    enabled,
    providers,
    planProviders,
    storeProviders: storeSelected,
    currentPlan: plan ? { slug: plan.slug ?? "", name: plan.name ?? "" } : undefined,
  };
}

export async function assertCourierProviderAccess(
  storeId: string,
  provider: string,
): Promise<{ ok: true; access: CourierAccessResult } | { ok: false; status: number; message: string; access: CourierAccessResult }> {
  const access = await resolveStoreCourierAccess(storeId);
  if (!access.enabled) {
    return { ok: false, status: 403, message: access.message ?? "Courier access denied", access };
  }
  if (!isCourierProviderSlug(provider) || !access.providers.includes(provider)) {
    return {
      ok: false,
      status: 403,
      message: `Courier provider "${provider}" is not available for this store`,
      access,
    };
  }
  return { ok: true, access };
}
