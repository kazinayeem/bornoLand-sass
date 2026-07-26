import { connectDatabase } from "../../common/database/connection.js";
import { recordAudit } from "../audit/audit.service.js";
import { StoreModel } from "../../models/store.model.js";
import {
  COURIER_PROVIDER_META,
  COURIER_PROVIDER_SLUGS,
  type CourierProviderSlug,
} from "./courier.constants.js";
import { StoreCourierModel } from "./store-courier.model.js";
import { getCourierProvider } from "./courier.factory.js";
import { assertCourierProviderAccess, resolveStoreCourierAccess } from "./courier.permission.js";
import { updateStoreCourierSchema } from "./courier.validator.js";
import { decryptCourierCredentials, encryptCourierCredentials } from "./courier.credentials.js";
import type { CourierCredentials, CourierShipmentSettings } from "./courier.types.js";

const DEFAULT_SHIPMENT_SETTINGS: CourierShipmentSettings = {
  autoCreateShipment: false,
  autoSyncTracking: false,
  autoRefreshTracking: "manual",
  codEnabled: true,
  defaultWeightKg: 0.5,
  defaultDeliveryType: "standard",
};

function mergeCredentials(
  existing: CourierCredentials,
  incoming: Record<string, string> | undefined,
  _secretKeys: Set<string>,
): CourierCredentials {
  if (!incoming) return existing;
  const next = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    // Blank / masked values mean "keep existing" for every field.
    // Non-secret fields are never returned to the client, so empty inputs must not wipe them.
    if (!value || value.trim() === "" || value === "********") {
      continue;
    }
    next[key] = value.trim();
  }
  return next;
}

function serializeCourier(
  doc: Record<string, unknown> | null,
  provider: CourierProviderSlug,
  storeId: string,
) {
  const meta = COURIER_PROVIDER_META[provider];
  const keysSet = Array.isArray(doc?.credentialKeysSet)
    ? (doc.credentialKeysSet as string[])
    : [];
  const settings = {
    ...DEFAULT_SHIPMENT_SETTINGS,
    ...((doc?.shipmentSettings as object) ?? {}),
  };

  return {
    provider,
    name: meta.name,
    credentialFields: meta.credentialFields.map((f) => ({
      key: f.key,
      label: f.label,
      secret: Boolean(f.secret),
      set: keysSet.includes(f.key),
    })),
    enabled: Boolean(doc?.enabled),
    sandbox: doc?.sandbox !== undefined ? Boolean(doc.sandbox) : true,
    connectionStatus: (doc?.connectionStatus as string) ?? "not_connected",
    lastTestedAt: doc?.lastTestedAt
      ? new Date(doc.lastTestedAt as string | Date).toISOString()
      : null,
    lastError: String(doc?.lastError ?? ""),
    environment: doc?.sandbox === false ? "production" : "sandbox",
    shipmentSettings: settings,
    storeId,
    updatedAt: doc?.updatedAt
      ? new Date(doc.updatedAt as string | Date).toISOString()
      : undefined,
  };
}

async function ensureOwnedStore(storeId: string, userId?: string, role?: string) {
  await connectDatabase();
  const query: Record<string, unknown> = { _id: storeId };
  // Platform admins can manage any store's courier config
  const isPlatformAdmin = role === "super_admin" || role === "admin";
  if (userId && !isPlatformAdmin) query.userId = userId;
  const store = await StoreModel.findOne(query).lean();
  return store as Record<string, unknown> | null;
}

export async function listStoreCouriers(storeId: string, userId?: string, role?: string) {
  const access = await resolveStoreCourierAccess(storeId);
  if (!access.enabled) {
    return { ok: false as const, status: 403 as const, message: access.message ?? "Forbidden", access };
  }

  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const docs = (await StoreCourierModel.find({
    storeId,
    provider: { $in: access.providers },
  }).lean()) as Array<Record<string, unknown>>;

  const byProvider = new Map(docs.map((d) => [String(d.provider), d]));
  const couriers = access.providers.map((provider) =>
    serializeCourier(byProvider.get(provider) ?? null, provider, storeId),
  );

  return {
    ok: true as const,
    data: {
      access: {
        enabled: access.enabled,
        providers: access.providers,
        planProviders: access.planProviders,
        storeProviders: access.storeProviders,
        currentPlan: access.currentPlan,
      },
      couriers,
      catalog: COURIER_PROVIDER_SLUGS.map((slug) => ({
        slug,
        name: COURIER_PROVIDER_META[slug].name,
        available: access.providers.includes(slug),
      })),
    },
  };
}

export async function getStoreCourier(storeId: string, provider: CourierProviderSlug, userId?: string, role?: string) {
  const gate = await assertCourierProviderAccess(storeId, provider);
  if (!gate.ok) return { ok: false as const, status: gate.status, message: gate.message };

  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const doc = (await StoreCourierModel.findOne({ storeId, provider }).lean()) as Record<
    string,
    unknown
  > | null;
  return { ok: true as const, data: { courier: serializeCourier(doc, provider, storeId) } };
}

export async function updateStoreCourier(
  storeId: string,
  provider: CourierProviderSlug,
  userId: string,
  payload: unknown,
  request?: import("express").Request,
  role?: string,
) {
  const gate = await assertCourierProviderAccess(storeId, provider);
  if (!gate.ok) return { ok: false as const, status: gate.status, message: gate.message };

  const parsed = updateStoreCourierSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, status: 400 as const, message: "Invalid courier config" };

  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const existing = (await StoreCourierModel.findOne({ storeId, provider }).lean()) as Record<
    string,
    unknown
  > | null;
  const meta = COURIER_PROVIDER_META[provider];
  const secretKeys = new Set(meta.credentialFields.filter((f) => f.secret).map((f) => f.key));
  const existingCreds = decryptCourierCredentials(String(existing?.credentialsEncrypted ?? ""));
  const nextCreds = mergeCredentials(existingCreds, parsed.data.credentials, secretKeys);
  const credentialKeysSet = Object.entries(nextCreds)
    .filter(([, v]) => Boolean(v?.trim()))
    .map(([k]) => k);

  const update: Record<string, unknown> = {};
  if (parsed.data.enabled !== undefined) update.enabled = parsed.data.enabled;
  if (parsed.data.sandbox !== undefined) update.sandbox = parsed.data.sandbox;
  if (parsed.data.credentials) {
    try {
      update.credentialsEncrypted = encryptCourierCredentials(nextCreds);
      update.credentialKeysSet = credentialKeysSet;
      // Incomplete credentials invalidate a previous successful connection test
      const required = meta.credentialFields.map((f) => f.key);
      const complete = required.every((k) => Boolean(nextCreds[k]?.trim()));
      if (!complete) {
        update.connectionStatus = "not_connected";
        update.lastError = "Credentials incomplete — re-test connection after filling all fields";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to encrypt credentials";
      return { ok: false as const, status: 500 as const, message };
    }
  }
  if (parsed.data.shipmentSettings) {
    update.shipmentSettings = {
      ...DEFAULT_SHIPMENT_SETTINGS,
      ...((existing?.shipmentSettings as object) ?? {}),
      ...parsed.data.shipmentSettings,
    };
  }

  // Always touch updatedAt path so $set is never empty on upsert
  update.enabled = parsed.data.enabled ?? Boolean(existing?.enabled);
  update.sandbox =
    parsed.data.sandbox !== undefined ? parsed.data.sandbox : existing?.sandbox !== false;

  let doc: Record<string, unknown> | null;
  try {
    doc = (await StoreCourierModel.findOneAndUpdate(
      { storeId, provider },
      {
        $set: update,
        $setOnInsert: { storeId, provider, connectionStatus: "not_connected" },
      },
      { upsert: true, new: true, runValidators: true },
    ).lean()) as Record<string, unknown> | null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save courier config";
    console.error("[courier] upsert failed:", message);
    return { ok: false as const, status: 500 as const, message };
  }

  await recordAudit({
    action: "courier.config_updated",
    module: "courier",
    entityType: "StoreCourier",
    entityId: doc?._id ? String(doc._id) : undefined,
    entityName: provider,
    storeId,
    storeName: String(store.name ?? ""),
    actorId: userId,
    newValue: {
      provider,
      enabled: doc?.enabled,
      sandbox: doc?.sandbox,
      credentialKeysSet,
      // never log secret values
    },
    description: `Updated ${provider} courier settings`,
    requestContext: request
      ? (await import("../audit/audit-request.helper.js")).buildAuditRequestContext(request)
      : undefined,
  });

  return { ok: true as const, data: { courier: serializeCourier(doc, provider, storeId) } };
}

export async function testStoreCourierConnection(
  storeId: string,
  provider: CourierProviderSlug,
  userId: string,
  request?: import("express").Request,
  role?: string,
) {
  const gate = await assertCourierProviderAccess(storeId, provider);
  if (!gate.ok) return { ok: false as const, status: gate.status, message: gate.message };

  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const doc = (await StoreCourierModel.findOne({ storeId, provider }).lean()) as Record<
    string,
    unknown
  > | null;
  const credentials = decryptCourierCredentials(String(doc?.credentialsEncrypted ?? ""));
  const sandbox = doc?.sandbox !== false;
  const impl = getCourierProvider(provider);
  const result = await impl.testConnection({
    storeId,
    provider,
    sandbox,
    credentials,
  });

  const updated = (await StoreCourierModel.findOneAndUpdate(
    { storeId, provider },
    {
      $set: {
        connectionStatus: result.ok ? "connected" : "error",
        lastTestedAt: new Date(result.testedAt),
        lastError: result.ok ? "" : result.message,
      },
      $setOnInsert: { storeId, provider, sandbox: true, enabled: false },
    },
    { upsert: true, new: true, runValidators: true },
  ).lean()) as Record<string, unknown> | null;

  await recordAudit({
    action: "courier.connection_tested",
    module: "courier",
    entityType: "StoreCourier",
    entityId: updated?._id ? String(updated._id) : undefined,
    entityName: provider,
    storeId,
    actorId: userId,
    status: result.ok ? "success" : "failure",
    newValue: { ok: result.ok, environment: result.environment, message: result.message },
    description: `Tested ${provider} connection`,
    requestContext: request
      ? (await import("../audit/audit-request.helper.js")).buildAuditRequestContext(request)
      : undefined,
  });

  return {
    ok: true as const,
    data: {
      test: result,
      courier: serializeCourier(updated, provider, storeId),
    },
  };
}

export async function updateStoreCourierAccessProviders(
  storeId: string,
  providers: CourierProviderSlug[],
  actorId: string,
) {
  await connectDatabase();
  const store = await StoreModel.findByIdAndUpdate(
    storeId,
    { $set: { "courierAccess.providers": providers } },
    { new: true },
  ).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  await recordAudit({
    action: "courier.store_access_updated",
    module: "courier",
    entityType: "Store",
    entityId: storeId,
    actorId,
    newValue: { providers },
    description: "Updated store courier provider access",
  });

  return { ok: true as const, data: { providers } };
}
