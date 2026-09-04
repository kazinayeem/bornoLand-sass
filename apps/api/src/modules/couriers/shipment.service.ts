import { connectDatabase } from "../../common/database/connection.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { recordAudit } from "../audit/audit.service.js";
import { createCustomerNotification } from "../customers/customer-notification.service.js";
import { COURIER_PROVIDER_META, type CourierProviderSlug, isCourierProviderSlug } from "./courier.constants.js";
import { decryptCourierCredentials } from "./courier.credentials.js";
import { getCourierProvider } from "./courier.factory.js";
import { assertCourierProviderAccess, resolveStoreCourierAccess } from "./courier.permission.js";
import { StoreCourierModel } from "./store-courier.model.js";
import type {
  CourierProviderContext,
  CourierShipmentSettings,
  CreateShipmentInput,
  CreateShipmentResult,
} from "./courier.types.js";

const DEFAULT_SHIPMENT_SETTINGS: CourierShipmentSettings = {
  autoCreateShipment: false,
  autoSyncTracking: false,
  autoRefreshTracking: "manual",
  codEnabled: true,
  defaultWeightKg: 0.5,
  defaultDeliveryType: "standard",
};

const ACTIVE_SHIPMENT_STATUSES = new Set([
  "pending",
  "created",
  "picked",
  "in_transit",
  "hub_received",
  "out_for_delivery",
]);

export type ShipmentPreviewOverrides = {
  weightKg?: number;
  specialInstruction?: string;
  packageType?: string;
  codAmount?: number;
};

type ShippingAddress = {
  fullName?: string;
  phone?: string;
  street?: string;
  apartment?: string;
  area?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  landmark?: string;
  orderNotes?: string;
};

function normalizeStatus(raw?: string): string {
  if (!raw) return "created";
  const s = raw.toLowerCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    pending: "pending",
    created: "created",
    booked: "created",
    picked: "picked",
    picked_up: "picked",
    pickup: "picked",
    in_transit: "in_transit",
    transit: "in_transit",
    hub: "hub_received",
    hub_received: "hub_received",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    returned: "returned",
    return: "returned",
    cancelled: "cancelled",
    canceled: "cancelled",
    failed: "failed",
  };
  return map[s] ?? "in_transit";
}

function mapShipmentStatusToOrderStatus(shipmentStatus: string): string | null {
  switch (shipmentStatus) {
    case "created":
    case "pending":
    case "picked":
      return "shipped";
    case "in_transit":
    case "hub_received":
      return "shipped";
    case "out_for_delivery":
      return "out_for_delivery";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "returned":
      return "refunded";
    default:
      return null;
  }
}

async function ensureStoreAccess(storeId: string, userId?: string, role?: string) {
  await connectDatabase();
  const query: Record<string, unknown> = { _id: storeId };
  const isPlatformAdmin = role === "super_admin";
  if (userId && !isPlatformAdmin) query.userId = userId;
  return (await StoreModel.findOne(query).lean()) as Record<string, unknown> | null;
}

async function loadProviderContext(
  storeId: string,
  provider: CourierProviderSlug,
): Promise<
  | { ok: true; ctx: CourierProviderContext; settings: CourierShipmentSettings; doc: Record<string, unknown> }
  | { ok: false; status: number; message: string }
> {
  const gate = await assertCourierProviderAccess(storeId, provider);
  if (!gate.ok) return { ok: false, status: gate.status, message: gate.message };

  const doc = (await StoreCourierModel.findOne({ storeId, provider }).lean()) as Record<
    string,
    unknown
  > | null;
  if (!doc) {
    return { ok: false, status: 400, message: "Courier provider is not configured" };
  }
  if (!doc.enabled) {
    return { ok: false, status: 400, message: "Courier provider is inactive" };
  }
  if (doc.connectionStatus !== "connected") {
    return {
      ok: false,
      status: 400,
      message: "Courier connection has not been successfully tested",
    };
  }

  const credentials = decryptCourierCredentials(String(doc.credentialsEncrypted ?? ""));
  if (!Object.keys(credentials).length) {
    return { ok: false, status: 400, message: "Missing courier credentials" };
  }

  const settings = {
    ...DEFAULT_SHIPMENT_SETTINGS,
    ...((doc.shipmentSettings as object) ?? {}),
  } as CourierShipmentSettings;

  return {
    ok: true,
    ctx: {
      storeId,
      provider,
      sandbox: doc.sandbox !== false,
      credentials,
    },
    settings,
    doc,
  };
}

function buildAddressLines(addr: ShippingAddress) {
  const parts = [addr.street, addr.apartment, addr.landmark].filter(Boolean);
  return parts.join(", ");
}

/**
 * List eligible/ineligible providers for an order's shipping address.
 */
export async function getShipmentOptionsForOrder(
  storeId: string,
  orderId: string,
  userId?: string,
  role?: string,
) {
  const store = await ensureStoreAccess(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const access = await resolveStoreCourierAccess(storeId);
  if (!access.enabled) {
    return {
      ok: false as const,
      status: 403 as const,
      message: access.message ?? "Courier management is not included in your plan",
    };
  }

  const order = (await OrderModel.findOne({ _id: orderId, storeId }).lean()) as Record<
    string,
    unknown
  > | null;
  if (!order) return { ok: false as const, status: 404 as const, message: "Order not found" };

  const existing = order.shipment as { trackingNumber?: string; status?: string } | undefined;
  if (existing?.trackingNumber && existing.status && ACTIVE_SHIPMENT_STATUSES.has(existing.status)) {
    return {
      ok: false as const,
      status: 409 as const,
      message: "Shipment already exists for this order",
      data: { shipment: existing },
    };
  }

  const addr = (order.shippingAddress ?? {}) as ShippingAddress;
  const docs = (await StoreCourierModel.find({
    storeId,
    provider: { $in: access.providers },
    enabled: true,
    connectionStatus: "connected",
  }).lean()) as Array<Record<string, unknown>>;

  const available: Array<Record<string, unknown>> = [];
  const unavailable: Array<Record<string, unknown>> = [];

  for (const provider of access.providers) {
    const meta = COURIER_PROVIDER_META[provider];
    const doc = docs.find((d) => String(d.provider) === provider);
    if (!doc) {
      unavailable.push({
        provider,
        name: meta.name,
        reason: "Provider not active or connection not tested",
      });
      continue;
    }

    const credentials = decryptCourierCredentials(String(doc.credentialsEncrypted ?? ""));
    const ctx: CourierProviderContext = {
      storeId,
      provider,
      sandbox: doc.sandbox !== false,
      credentials,
    };
    const settings = {
      ...DEFAULT_SHIPMENT_SETTINGS,
      ...((doc.shipmentSettings as object) ?? {}),
    } as CourierShipmentSettings;

    const impl = getCourierProvider(provider);
    let coverage;
    try {
      coverage = await impl.checkCoverage(ctx, {
        city: addr.city,
        district: addr.city,
        zone: addr.state,
        area: addr.area,
        address: buildAddressLines(addr),
      });
    } catch (error) {
      coverage = {
        supported: false,
        reason: error instanceof Error ? error.message : "Coverage check failed",
        estimatedCharge: null,
        estimatedDelivery: null,
      };
    }

    const entry = {
      provider,
      name: meta.name,
      environment: ctx.sandbox ? "sandbox" : "production",
      connectionStatus: doc.connectionStatus,
      enabled: true,
      coverage,
      estimatedCharge: coverage.estimatedCharge,
      estimatedDelivery: coverage.estimatedDelivery,
      defaultWeightKg: settings.defaultWeightKg,
      codEnabled: settings.codEnabled,
      recommended: false,
    };

    if (coverage.supported) available.push(entry);
    else {
      unavailable.push({
        provider,
        name: meta.name,
        reason: coverage.reason ?? "Area not supported",
        environment: entry.environment,
      });
    }
  }

  // Recommend first available (or Pathao if present)
  if (available.length > 0) {
    const pathaoIdx = available.findIndex((a) => a.provider === "pathao");
    const idx = pathaoIdx >= 0 ? pathaoIdx : 0;
    available[idx] = { ...available[idx], recommended: true };
  }

  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
  const isCod =
    String(order.paymentMethod ?? "").toLowerCase() === "cod" &&
    String(order.paymentStatus ?? "") !== "paid";

  return {
    ok: true as const,
    data: {
      order: {
        _id: String(order._id),
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        itemCount,
        shippingAddress: {
          fullName: addr.fullName ?? "",
          phone: addr.phone ?? "",
          street: addr.street ?? "",
          area: addr.area ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
          zip: addr.zip ?? "",
          country: addr.country ?? "",
          district: addr.city ?? "",
          zone: addr.state ?? "",
        },
        codAmount: isCod ? Number(order.total ?? 0) : 0,
        isCod,
      },
      available,
      unavailable,
      canCreate: available.length > 0,
    },
  };
}

export async function createOrderShipment(
  storeId: string,
  orderId: string,
  providerRaw: string,
  userId: string,
  overrides: ShipmentPreviewOverrides = {},
  options?: { autoCreated?: boolean; role?: string; request?: import("express").Request },
) {
  if (!isCourierProviderSlug(providerRaw)) {
    return { ok: false as const, status: 400 as const, message: "Invalid courier provider" };
  }
  const provider = providerRaw;

  const store = await ensureStoreAccess(storeId, userId, options?.role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const loaded = await loadProviderContext(storeId, provider);
  if (!loaded.ok) return loaded;

  const order = (await OrderModel.findOne({ _id: orderId, storeId })) as
    | (Record<string, unknown> & { save: () => Promise<unknown> })
    | null;
  if (!order) return { ok: false as const, status: 404 as const, message: "Order not found" };

  const existing = order.shipment as { trackingNumber?: string; status?: string } | undefined;
  if (existing?.trackingNumber && existing.status && ACTIVE_SHIPMENT_STATUSES.has(String(existing.status))) {
    return { ok: false as const, status: 409 as const, message: "Duplicate shipment: order already has an active shipment" };
  }

  const addr = (order.shippingAddress ?? {}) as ShippingAddress;
  if (!addr.fullName?.trim() || !addr.phone?.trim() || !addr.street?.trim()) {
    return { ok: false as const, status: 400 as const, message: "Invalid address on order" };
  }

  const isCod =
    String(order.paymentMethod ?? "").toLowerCase() === "cod" &&
    String(order.paymentStatus ?? "") !== "paid";
  const codAmount =
    overrides.codAmount !== undefined
      ? Number(overrides.codAmount)
      : isCod
        ? Number(order.total ?? 0)
        : 0;

  if (codAmount > 0 && !loaded.settings.codEnabled) {
    return { ok: false as const, status: 400 as const, message: "COD is disabled for this courier" };
  }

  const coverage = await getCourierProvider(provider).checkCoverage(loaded.ctx, {
    city: addr.city,
    district: addr.city,
    zone: addr.state,
    area: addr.area,
    address: buildAddressLines(addr),
  });
  if (!coverage.supported) {
    return {
      ok: false as const,
      status: 400 as const,
      message: coverage.reason ?? "Unsupported area for selected courier",
    };
  }

  const weightKg = overrides.weightKg ?? loaded.settings.defaultWeightKg ?? 0.5;
  const items = Array.isArray(order.items) ? (order.items as Array<{ name?: string; quantity?: number }>) : [];
  const itemDescription = items
    .map((i) => `${i.name ?? "Item"} × ${i.quantity ?? 1}`)
    .join(", ")
    .slice(0, 240);

  const input: CreateShipmentInput = {
    orderId: String(order._id),
    recipientName: String(addr.fullName),
    recipientPhone: String(addr.phone),
    recipientAddress: buildAddressLines(addr) || String(addr.street),
    recipientCity: addr.city,
    recipientZone: addr.state,
    recipientArea: addr.area,
    amount: codAmount > 0 ? codAmount : Number(order.total ?? 0),
    weightKg,
    itemDescription,
    specialInstruction: overrides.specialInstruction ?? addr.orderNotes ?? "",
    packageType: overrides.packageType ?? "parcel",
    cod: codAmount > 0,
  };

  const attempts = Number((order.shipment as { attempts?: number } | undefined)?.attempts ?? 0) + 1;
  let result: CreateShipmentResult;
  try {
    result = await getCourierProvider(provider).createShipment(loaded.ctx, input);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.includes("timeout")
          ? "Courier API timeout — please try again"
          : error.message
        : "Failed to create shipment";
    await OrderModel.updateOne(
      { _id: orderId, storeId },
      {
        $set: {
          "shipment.lastError": message,
          "shipment.attempts": attempts,
          "shipment.provider": provider,
          "shipment.status": "failed",
        },
      },
    );
    await recordAudit({
      action: "shipment.create_failed",
      module: "courier",
      entityType: "Order",
      entityId: orderId,
      storeId,
      actorId: userId,
      status: "failure",
      description: message,
      newValue: { provider, attempts, autoCreated: Boolean(options?.autoCreated) },
      requestContext: options?.request
        ? (await import("../audit/audit-request.helper.js")).buildAuditRequestContext(options.request)
        : undefined,
    });
    return { ok: false as const, status: 502 as const, message };
  }

  if (!result.ok) {
    const friendly =
      result.message?.toLowerCase().includes("credential")
        ? "Missing or invalid courier credentials"
        : result.message?.toLowerCase().includes("auth")
          ? "Courier authentication failed"
          : result.message ?? "Shipment creation failed";
    await OrderModel.updateOne(
      { _id: orderId, storeId },
      {
        $set: {
          "shipment.lastError": friendly,
          "shipment.attempts": attempts,
          "shipment.provider": provider,
          "shipment.status": "failed",
        },
      },
    );
    await recordAudit({
      action: "shipment.create_failed",
      module: "courier",
      entityType: "Order",
      entityId: orderId,
      storeId,
      actorId: userId,
      status: "failure",
      description: friendly,
      newValue: { provider, attempts },
    });
    return { ok: false as const, status: 400 as const, message: friendly };
  }

  const trackingNumber = result.trackingId ?? result.consignmentId ?? "";
  const consignmentId = result.consignmentId ?? result.trackingId ?? "";
  const now = new Date();
  const meta = COURIER_PROVIDER_META[provider];

  const updated = await OrderModel.findOneAndUpdate(
    { _id: orderId, storeId },
    {
      $set: {
        courier: meta.name,
        trackingNumber,
        estimatedDelivery: result.estimatedDelivery ?? coverage.estimatedDelivery ?? "",
        status: "shipped",
        shipment: {
          provider,
          providerName: meta.name,
          consignmentId,
          trackingNumber,
          status: "created",
          environment: loaded.ctx.sandbox ? "sandbox" : "production",
          weightKg,
          codAmount,
          packageType: overrides.packageType ?? "parcel",
          specialInstruction: overrides.specialInstruction ?? "",
          estimatedCharge: result.estimatedCharge ?? coverage.estimatedCharge ?? null,
          estimatedDelivery: result.estimatedDelivery ?? coverage.estimatedDelivery ?? "",
          createdAt: now,
          lastSyncedAt: now,
          rawResponse: result.raw ?? result,
          lastError: "",
          autoCreated: Boolean(options?.autoCreated),
          attempts,
        },
      },
      $push: {
        timeline: {
          status: "shipped",
          note: `Shipment created via ${meta.name} (${trackingNumber})`,
          createdBy: userId || "system",
          updatedBy: userId || "system",
        },
      },
    },
    { new: true },
  )
    .populate("customerId", "name email phone")
    .lean();

  await recordAudit({
    action: "shipment.created",
    module: "courier",
    entityType: "Order",
    entityId: orderId,
    entityName: String(order.orderNumber ?? ""),
    storeId,
    actorId: userId,
    description: `Created ${provider} shipment ${trackingNumber}`,
    newValue: {
      provider,
      trackingNumber,
      consignmentId,
      autoCreated: Boolean(options?.autoCreated),
    },
    requestContext: options?.request
      ? (await import("../audit/audit-request.helper.js")).buildAuditRequestContext(options.request)
      : undefined,
  });

  try {
    const customerRef = (updated as { customerId?: { _id?: unknown } | string })?.customerId;
    const customerId =
      customerRef && typeof customerRef === "object" && customerRef._id
        ? String(customerRef._id)
        : customerRef
          ? String(customerRef)
          : "";
    if (customerId) {
      await createCustomerNotification({
        customerId,
        storeId,
        type: "shipping",
        icon: "truck",
        priority: "medium",
        title: `Order shipped: ${String(order.orderNumber ?? "")}`,
        message: `Your order is on the way via ${meta.name}. Tracking: ${trackingNumber}`,
      });
    }
  } catch {
    // non-fatal
  }

  return { ok: true as const, data: { order: updated, shipment: (updated as { shipment?: unknown })?.shipment } };
}

export async function cancelOrderShipment(
  storeId: string,
  orderId: string,
  userId: string,
  role?: string,
  request?: import("express").Request,
) {
  const store = await ensureStoreAccess(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const order = (await OrderModel.findOne({ _id: orderId, storeId }).lean()) as Record<
    string,
    unknown
  > | null;
  if (!order) return { ok: false as const, status: 404 as const, message: "Order not found" };

  const shipment = order.shipment as {
    provider?: string;
    trackingNumber?: string;
    status?: string;
  } | null;
  if (!shipment?.trackingNumber || !shipment.provider) {
    return { ok: false as const, status: 400 as const, message: "No shipment to cancel" };
  }
  if (shipment.status === "cancelled" || shipment.status === "delivered") {
    return { ok: false as const, status: 400 as const, message: `Cannot cancel shipment in status: ${shipment.status}` };
  }
  if (!isCourierProviderSlug(shipment.provider)) {
    return { ok: false as const, status: 400 as const, message: "Invalid shipment provider" };
  }

  const loaded = await loadProviderContext(storeId, shipment.provider);
  if (!loaded.ok) return loaded;

  const result = await getCourierProvider(shipment.provider).cancelShipment(
    loaded.ctx,
    shipment.trackingNumber,
  );
  if (!result.ok) {
    return { ok: false as const, status: 400 as const, message: result.message ?? "Cancel failed" };
  }

  const updated = await OrderModel.findOneAndUpdate(
    { _id: orderId, storeId },
    {
      $set: {
        "shipment.status": "cancelled",
        "shipment.cancelledAt": new Date(),
        "shipment.lastSyncedAt": new Date(),
        "shipment.lastError": "",
      },
      $push: {
        timeline: {
          status: "shipped",
          note: `Shipment cancelled (${shipment.trackingNumber})`,
          createdBy: userId,
          updatedBy: userId,
        },
      },
    },
    { new: true },
  )
    .populate("customerId", "name email phone")
    .lean();

  await recordAudit({
    action: "shipment.cancelled",
    module: "courier",
    entityType: "Order",
    entityId: orderId,
    storeId,
    actorId: userId,
    description: `Cancelled shipment ${shipment.trackingNumber}`,
    requestContext: request
      ? (await import("../audit/audit-request.helper.js")).buildAuditRequestContext(request)
      : undefined,
  });

  return { ok: true as const, data: { order: updated } };
}

export async function trackOrderShipment(
  storeId: string,
  orderId: string,
  userId?: string,
  role?: string,
) {
  const store = await ensureStoreAccess(storeId, userId, role);
  if (!store) return { ok: false as const, status: 404 as const, message: "Store not found" };

  const order = (await OrderModel.findOne({ _id: orderId, storeId }).lean()) as Record<
    string,
    unknown
  > | null;
  if (!order) return { ok: false as const, status: 404 as const, message: "Order not found" };

  const shipment = order.shipment as {
    provider?: string;
    trackingNumber?: string;
    status?: string;
  } | null;
  if (!shipment?.trackingNumber || !isCourierProviderSlug(shipment.provider ?? "")) {
    return { ok: false as const, status: 400 as const, message: "No shipment to track" };
  }

  const loaded = await loadProviderContext(storeId, shipment.provider as CourierProviderSlug);
  if (!loaded.ok) return loaded;

  const result = await getCourierProvider(shipment.provider as CourierProviderSlug).trackShipment(
    loaded.ctx,
    shipment.trackingNumber,
  );
  if (!result.ok) {
    return { ok: false as const, status: 400 as const, message: result.message ?? "Tracking failed" };
  }

  const status = normalizeStatus(result.status);
  const orderStatus = mapShipmentStatusToOrderStatus(status);
  const $set: Record<string, unknown> = {
    "shipment.status": status,
    "shipment.lastSyncedAt": new Date(),
    "shipment.lastError": "",
  };
  if (orderStatus) $set.status = orderStatus;

  const updated = await OrderModel.findOneAndUpdate(
    { _id: orderId, storeId },
    {
      $set,
      ...(orderStatus && orderStatus !== order.status
        ? {
            $push: {
              timeline: {
                status: orderStatus,
                note: `Tracking sync: ${status}`,
                createdBy: "system",
                updatedBy: "system",
              },
            },
          }
        : {}),
    },
    { new: true },
  )
    .populate("customerId", "name email phone")
    .lean();

  return {
    ok: true as const,
    data: {
      order: updated,
      tracking: result,
      shipmentStatus: status,
    },
  };
}

/**
 * Auto-create shipment when order becomes confirmed (if any enabled provider has autoCreateShipment).
 */
export async function maybeAutoCreateShipmentOnConfirm(storeId: string, orderId: string) {
  const access = await resolveStoreCourierAccess(storeId);
  if (!access.enabled) return;

  const order = (await OrderModel.findOne({ _id: orderId, storeId }).lean()) as Record<
    string,
    unknown
  > | null;
  if (!order) return;
  const existing = order.shipment as { trackingNumber?: string; status?: string } | undefined;
  if (existing?.trackingNumber && existing.status && ACTIVE_SHIPMENT_STATUSES.has(String(existing.status))) {
    return;
  }

  const docs = (await StoreCourierModel.find({
    storeId,
    provider: { $in: access.providers },
    enabled: true,
    connectionStatus: "connected",
    "shipmentSettings.autoCreateShipment": true,
  }).lean()) as Array<Record<string, unknown>>;

  if (!docs.length) return;

  // Prefer recommended/first available via options endpoint
  const options = await getShipmentOptionsForOrder(storeId, orderId);
  if (!options.ok || !options.data?.available?.length) {
    await recordAudit({
      action: "shipment.auto_skipped",
      module: "courier",
      entityType: "Order",
      entityId: orderId,
      storeId,
      status: "failure",
      description: "Auto shipment skipped — no compatible providers",
    });
    return;
  }

  const preferred =
    (options.data.available.find((a) => a.recommended) as { provider: string } | undefined) ??
    (options.data.available[0] as { provider: string });

  // Only if preferred provider also has autoCreate on
  const autoDoc = docs.find((d) => String(d.provider) === preferred.provider) ?? docs[0];
  if (!autoDoc) return;

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await createOrderShipment(
      storeId,
      orderId,
      String(autoDoc.provider),
      "system",
      {},
      { autoCreated: true, role: "admin" },
    );
    if (result.ok) {
      await recordAudit({
        action: "shipment.auto_created",
        module: "courier",
        entityType: "Order",
        entityId: orderId,
        storeId,
        description: `Auto-created shipment via ${autoDoc.provider}`,
        newValue: { attempt },
      });
      return;
    }
    await recordAudit({
      action: "shipment.auto_retry",
      module: "courier",
      entityType: "Order",
      entityId: orderId,
      storeId,
      status: "failure",
      description: result.message,
      newValue: { attempt, provider: autoDoc.provider },
    });
    if (result.status === 409) return; // duplicate — stop
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
}

/** Sync tracking for all stores with autoSyncTracking enabled. */
export async function syncAllAutoTrackingShipments() {
  await connectDatabase();
  const configs = (await StoreCourierModel.find({
    enabled: true,
    connectionStatus: "connected",
    "shipmentSettings.autoSyncTracking": true,
  })
    .select("storeId provider shipmentSettings")
    .lean()) as Array<Record<string, unknown>>;

  for (const config of configs) {
    const storeId = String(config.storeId);
    const provider = String(config.provider);
    const settings = {
      ...DEFAULT_SHIPMENT_SETTINGS,
      ...((config.shipmentSettings as object) ?? {}),
    } as CourierShipmentSettings;
    if (settings.autoRefreshTracking === "manual") continue;

    const orders = (await OrderModel.find({
      storeId,
      "shipment.provider": provider,
      "shipment.trackingNumber": { $nin: ["", null] },
      "shipment.status": { $in: [...ACTIVE_SHIPMENT_STATUSES] },
    })
      .select("_id")
      .limit(50)
      .lean()) as Array<{ _id: unknown }>;

    for (const order of orders) {
      try {
        await trackOrderShipment(storeId, String(order._id), undefined, "admin");
      } catch (error) {
        console.error("[shipment-sync] failed", storeId, order._id, error);
      }
    }
  }
}
