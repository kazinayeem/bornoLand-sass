import mongoose from "mongoose";
import https from "https";
import http from "http";
import querystring from "querystring";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { OrderModel } from "../../models/order.model.js";
import { StorePaymentGatewayModel, type StorePaymentGatewayDocument } from "./store-payment-gateway.model.js";
import { checkFeature } from "../features/feature-access.service.js";
import { recordAudit } from "../audit/audit.service.js";
import {
  getStorePublicUrl,
  getSSLCommerzCallbackUrls,
  getApiBaseUrl,
} from "../stores/store-url.service.js";
import {
  decryptSSLCommerzSecret,
  encryptSSLCommerzSecret,
  maskSecret,
} from "./sslcommerz.credentials.js";

const SSLCOMMERZ_API_TIMEOUT_MS = 8_000;

function sslczBaseUrl(isLive: boolean): string {
  return isLive ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";
}

async function sslczPost(url: string, body: Record<string, unknown>, timeoutMs = SSLCOMMERZ_API_TIMEOUT_MS): Promise<Record<string, unknown>> {
  const startTime = Date.now();
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (value != null) {
      formData.append(key, String(value));
    }
  }

  const endpointLog = url.replace(/store_passwd=[^&]*/gi, "store_passwd=***");
  console.info("[SSLCOMMERZ_REQUEST_START]", {
    url: endpointLog,
    tran_id: body.tran_id,
    store_id: body.store_id,
    timeoutMs,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      signal: controller.signal,
    });

    const durationMs = Date.now() - startTime;
    const text = await response.text();

    let jsonResult: Record<string, unknown>;
    try {
      jsonResult = JSON.parse(text);
    } catch {
      console.error("[SSLCOMMERZ_RESPONSE_INVALID_JSON]", {
        url: endpointLog,
        status: response.status,
        durationMs,
        rawSnippet: text.slice(0, 300),
      });
      throw new Error(`SSLCommerz returned non-JSON response (HTTP ${response.status}): ${text.slice(0, 150)}`);
    }

    console.info("[SSLCOMMERZ_RESPONSE]", {
      url: endpointLog,
      status: jsonResult.status,
      httpStatus: response.status,
      durationMs,
      hasGatewayPageURL: Boolean(jsonResult.GatewayPageURL),
      failedreason: jsonResult.failedreason,
    });

    return jsonResult;
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    if (err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"))) {
      console.error("[SSLCOMMERZ_TIMEOUT]", { url: endpointLog, durationMs, timeoutMs });
      throw new Error(`SSLCommerz API timeout after ${timeoutMs}ms`);
    }
    console.error("[SSLCOMMERZ_REQUEST_ERROR]", { url: endpointLog, durationMs, error: err instanceof Error ? err.message : String(err) });
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function sslczGet(url: string, timeoutMs = SSLCOMMERZ_API_TIMEOUT_MS): Promise<Record<string, unknown>> {
  const startTime = Date.now();
  const endpointLog = url.replace(/store_passwd=[^&]*/gi, "store_passwd=***");
  console.info("[SSLCOMMERZ_GET_REQUEST_START]", { url: endpointLog, timeoutMs });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    const durationMs = Date.now() - startTime;
    const text = await response.text();

    let jsonResult: Record<string, unknown>;
    try {
      jsonResult = JSON.parse(text);
    } catch {
      throw new Error(`SSLCommerz validation returned non-JSON (HTTP ${response.status}): ${text.slice(0, 150)}`);
    }

    console.info("[SSLCOMMERZ_GET_RESPONSE]", {
      url: endpointLog,
      status: jsonResult.status,
      httpStatus: response.status,
      durationMs,
    });

    return jsonResult;
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    if (err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"))) {
      throw new Error(`SSLCommerz API timeout after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function sslczInit(
  storeId: string,
  storePassword: string,
  isLive: boolean,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = `${sslczBaseUrl(isLive)}/gwprocess/v4/api.php`;
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    body[key] = value != null ? value : "";
  }
  body.store_id = storeId;
  body.store_passwd = storePassword;
  return sslczPost(url, body);
}

async function sslczValidate(
  storeId: string,
  storePassword: string,
  isLive: boolean,
  valId: string,
): Promise<Record<string, unknown>> {
  const url = `${sslczBaseUrl(isLive)}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(storePassword)}&v=1&format=json`;
  return sslczGet(url);
}

async function sslczRefund(
  storeId: string,
  storePassword: string,
  isLive: boolean,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    refund_amount: String(data.refund_amount ?? ""),
    refund_remarks: String(data.refund_remarks ?? ""),
    bank_tran_id: String(data.bank_tran_id ?? ""),
    refe_id: String(data.refl_id ?? data.refe_id ?? ""),
    store_id: storeId,
    store_passwd: storePassword,
    v: "1",
    format: "json",
  });
  const url = `${sslczBaseUrl(isLive)}/validator/api/merchantTransIDvalidationAPI.php?${params.toString()}`;
  return sslczGet(url);
}

export const SSLCOMMERZ_FEATURE_KEY = "sslcommerz_payment";

type LeanGateway = StorePaymentGatewayDocument & { _id: unknown; createdAt?: Date; updatedAt?: Date };

export type SSLCommerzConfigResponse = {
  provider: "sslcommerz";
  storeId: string;
  storeIdValue: string;
  hasPassword: boolean;
  maskedPassword: string;
  environment: "sandbox" | "live";
  isEnabled: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  lastTestedAt: string | null;
  lastError: string;
  updatedAt: string | null;
  featureAccess: {
    allowed: boolean;
    reason?: string;
    message?: string;
    currentPlan?: { slug: string; name: string };
  };
};

export type UpdateSSLCommerzPayload = {
  storeIdValue?: string;
  storePassword?: string;
  environment?: "sandbox" | "live";
  isEnabled?: boolean;
};

export async function ensureOwnedStore(storeId: string, userId?: string, role?: string) {
  await connectDatabase();
  const query: Record<string, unknown> = { _id: storeId };
  const isPlatformAdmin = role === "super_admin" || role === "admin";
  if (userId && !isPlatformAdmin) {
    query.userId = userId;
  }
  const store = await StoreModel.findOne(query).lean();
  return store as Record<string, unknown> | null;
}

export async function checkSSLCommerzEntitlement(storeId: string) {
  return await checkFeature(storeId, SSLCOMMERZ_FEATURE_KEY);
}

/**
 * Get masked SSLCommerz configuration for store dashboard
 */
export async function getStoreSSLCommerzConfig(
  storeId: string,
  userId?: string,
  role?: string
): Promise<{ ok: true; data: SSLCommerzConfigResponse } | { ok: false; status: number; message: string }> {
  await connectDatabase();
  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) {
    return { ok: false, status: 404, message: "Store not found" };
  }

  const entitlement = await checkSSLCommerzEntitlement(storeId);
  const gateway = (await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  }).lean()) as LeanGateway | null;

  const hasPassword = Boolean(gateway?.encryptedStorePassword);

  return {
    ok: true,
    data: {
      provider: "sslcommerz",
      storeId,
      storeIdValue: gateway?.storeIdValue || "",
      hasPassword,
      maskedPassword: maskSecret(hasPassword),
      environment: (gateway?.environment as "sandbox" | "live") || "sandbox",
      isEnabled: Boolean(gateway?.isEnabled),
      isVerified: Boolean(gateway?.isVerified),
      verifiedAt: gateway?.verifiedAt ? new Date(gateway.verifiedAt).toISOString() : null,
      lastTestedAt: gateway?.lastTestedAt ? new Date(gateway.lastTestedAt).toISOString() : null,
      lastError: String(gateway?.lastError || ""),
      updatedAt: gateway?.updatedAt ? new Date(gateway.updatedAt).toISOString() : null,
      featureAccess: {
        allowed: entitlement.allowed,
        reason: entitlement.reason,
        message: entitlement.message,
        currentPlan: entitlement.currentPlan,
      },
    },
  };
}

/**
 * Update SSLCommerz configuration
 */
export async function updateStoreSSLCommerzConfig(
  storeId: string,
  userId: string | undefined,
  role: string | undefined,
  payload: UpdateSSLCommerzPayload,
  requestContext?: { ip?: string; userAgent?: string }
): Promise<{ ok: true; data: SSLCommerzConfigResponse } | { ok: false; status: number; message: string }> {
  await connectDatabase();
  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) {
    return { ok: false, status: 404, message: "Store not found" };
  }

  const entitlement = await checkSSLCommerzEntitlement(storeId);
  if (!entitlement.allowed) {
    return {
      ok: false,
      status: 403,
      message: entitlement.message || "SSLCommerz payment gateway is not included in your current plan. Please upgrade.",
    };
  }

  let gateway = await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  });

  if (!gateway) {
    gateway = new StorePaymentGatewayModel({
      storeId,
      provider: "sslcommerz",
      environment: payload.environment || "sandbox",
      isEnabled: false,
      isVerified: false,
    });
  }

  let credentialsChanged = false;

  if (typeof payload.storeIdValue === "string") {
    const trimmedId = payload.storeIdValue.trim();
    if (trimmedId !== gateway.storeIdValue) {
      gateway.storeIdValue = trimmedId;
      credentialsChanged = true;
    }
  }

  if (typeof payload.storePassword === "string") {
    const trimmedPass = payload.storePassword.trim();
    // Ignore masked password indicators like •••••••••••• or ********
    if (trimmedPass && trimmedPass !== "••••••••••••" && trimmedPass !== "********") {
      gateway.encryptedStorePassword = encryptSSLCommerzSecret(trimmedPass);
      credentialsChanged = true;
    }
  }

  if (payload.environment && (payload.environment === "sandbox" || payload.environment === "live")) {
    if (payload.environment !== gateway.environment) {
      gateway.environment = payload.environment;
      credentialsChanged = true;
    }
  }

  if (credentialsChanged) {
    gateway.isVerified = false;
    gateway.verifiedAt = null as never;
    gateway.lastError = "";
  }

  if (typeof payload.isEnabled === "boolean") {
    if (payload.isEnabled && (!gateway.storeIdValue || !gateway.encryptedStorePassword)) {
      return {
        ok: false,
        status: 400,
        message: "Cannot enable SSLCommerz without Store ID and Store Password.",
      };
    }
    gateway.isEnabled = payload.isEnabled;
  }

  await gateway.save();

  if (userId) {
    await recordAudit({
      action: "update_payment_gateway",
      module: "payments",
      entityType: "payment_gateway",
      entityId: storeId,
      tenantId: String(store.tenantId || ""),
      storeId,
      actorId: userId,
      metadata: {
        provider: "sslcommerz",
        environment: gateway.environment,
        isEnabled: gateway.isEnabled,
        credentialsUpdated: credentialsChanged,
      },
      requestContext: requestContext as any,
    });
  }

  const hasPassword = Boolean(gateway.encryptedStorePassword);

  return {
    ok: true,
    data: {
      provider: "sslcommerz",
      storeId,
      storeIdValue: gateway.storeIdValue || "",
      hasPassword,
      maskedPassword: maskSecret(hasPassword),
      environment: (gateway.environment as "sandbox" | "live") || "sandbox",
      isEnabled: Boolean(gateway.isEnabled),
      isVerified: Boolean(gateway.isVerified),
      verifiedAt: gateway.verifiedAt ? new Date(gateway.verifiedAt).toISOString() : null,
      lastTestedAt: gateway.lastTestedAt ? new Date(gateway.lastTestedAt).toISOString() : null,
      lastError: gateway.lastError || "",
      updatedAt: gateway.updatedAt ? new Date(gateway.updatedAt).toISOString() : null,
      featureAccess: {
        allowed: entitlement.allowed,
        currentPlan: entitlement.currentPlan,
      },
    },
  };
}

/**
 * Test SSLCommerz connection safely using sslcommerz-lts
 */
export async function testSSLCommerzConnection(
  storeId: string,
  userId?: string,
  role?: string,
  credentials?: { storeIdValue?: string; storePassword?: string; environment?: "sandbox" | "live" }
): Promise<{ ok: boolean; message: string; verified?: boolean }> {
  await connectDatabase();
  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  const entitlement = await checkSSLCommerzEntitlement(storeId);
  if (!entitlement.allowed) {
    return {
      ok: false,
      message: entitlement.message || "SSLCommerz payment gateway is not included in your current plan. Please upgrade.",
    };
  }

  const gateway = await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  });

  const storeIdValue = credentials?.storeIdValue?.trim() || gateway?.storeIdValue || "";
  let storePassword = "";

  if (credentials?.storePassword && credentials.storePassword !== "••••••••••••" && credentials.storePassword !== "********") {
    storePassword = credentials.storePassword.trim();
  } else if (gateway?.encryptedStorePassword) {
    storePassword = decryptSSLCommerzSecret(gateway.encryptedStorePassword);
  }

  const environment: "sandbox" | "live" =
    credentials?.environment === "live" || gateway?.environment === "live" ? "live" : "sandbox";

  if (!storeIdValue || !storePassword) {
    return { ok: false, message: "Store ID and Store Password are required to test connection." };
  }

  try {
    const isLive = environment === "live";

    const testTranId = `TEST_PING_${Date.now()}`;
    const testUrls = getSSLCommerzCallbackUrls({
      store: (store as any) || { _id: storeId },
      transactionId: testTranId,
    });

    const testData = {
      total_amount: 10,
      currency: "BDT",
      tran_id: testTranId,
      success_url: testUrls.successUrl,
      fail_url: testUrls.failUrl,
      cancel_url: testUrls.cancelUrl,
      ipn_url: testUrls.ipnUrl,
      shipping_method: "NO",
      product_name: "Test Connection",
      product_category: "Test",
      product_profile: "general",
      cus_name: "Connection Test",
      cus_email: "test@bornoland.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
    };

    const responseData = await sslczInit(storeIdValue, storePassword, isLive, testData);

    if (responseData?.status === "SUCCESS") {
      if (gateway) {
        gateway.isVerified = true;
        gateway.verifiedAt = new Date();
        gateway.lastTestedAt = new Date();
        gateway.lastError = "";
        await gateway.save();
      }
      return { ok: true, verified: true, message: "SSLCommerz configuration verified successfully." };
    } else {
      const errorMsg = String(responseData?.failedreason || "Authentication failed with SSLCommerz. Please check Store ID, Store Password, and Environment.");
      if (gateway) {
        gateway.isVerified = false;
        gateway.lastTestedAt = new Date();
        gateway.lastError = errorMsg;
        await gateway.save();
      }
      return { ok: false, verified: false, message: errorMsg };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to connect to SSLCommerz server.";
    if (gateway) {
      gateway.isVerified = false;
      gateway.lastTestedAt = new Date();
      gateway.lastError = errorMsg;
      await gateway.save();
    }
    return { ok: false, verified: false, message: `Connection failed: ${errorMsg}` };
  }
}

/**
 * Toggle SSLCommerz status (enable/disable)
 */
export async function toggleStoreSSLCommerz(
  storeId: string,
  userId: string | undefined,
  role: string | undefined,
  enabled: boolean
): Promise<{ ok: boolean; message: string; isEnabled?: boolean }> {
  await connectDatabase();
  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  if (enabled) {
    const entitlement = await checkSSLCommerzEntitlement(storeId);
    if (!entitlement.allowed) {
      return {
        ok: false,
        message: entitlement.message || "SSLCommerz payment gateway is not included in your current plan. Please upgrade.",
      };
    }
  }

  const gateway = await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  });

  if (!gateway) {
    return { ok: false, message: "SSLCommerz has not been configured yet." };
  }

  if (enabled && (!gateway.storeIdValue || !gateway.encryptedStorePassword)) {
    return { ok: false, message: "Cannot enable SSLCommerz without Store ID and Store Password." };
  }

  gateway.isEnabled = enabled;
  await gateway.save();

  return {
    ok: true,
    isEnabled: gateway.isEnabled,
    message: enabled ? "SSLCommerz payment gateway enabled." : "SSLCommerz payment gateway disabled.",
  };
}

/**
 * Initiate SSLCommerz transaction using sslcommerz-lts
 */
export async function initiateSSLCommerzPayment(
  storeId: string,
  orderId: string,
  appBaseUrl?: string
): Promise<
  | { ok: true; data: { gatewayUrl: string; redirectUrl?: string; sessionKey: string; tranId: string } }
  | { ok: false; status: number; message: string }
> {
  await connectDatabase();

  const entitlement = await checkSSLCommerzEntitlement(storeId);
  if (!entitlement.allowed) {
    return {
      ok: false,
      status: 403,
      message: entitlement.message || "SSLCommerz is not available on this store's plan.",
    };
  }

  const gateway = (await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  }).lean()) as LeanGateway | null;

  if (!gateway || !gateway.isEnabled || !gateway.storeIdValue || !gateway.encryptedStorePassword) {
    return {
      ok: false,
      status: 400,
      message: "SSLCommerz is not configured or enabled for this store.",
    };
  }

  const order = await OrderModel.findOne({ _id: orderId, storeId });
  if (!order) {
    return { ok: false, status: 404, message: "Order not found." };
  }

  if (order.paymentStatus === "paid") {
    return { ok: false, status: 400, message: "This order is already paid." };
  }

  const store = await StoreModel.findById(storeId).lean();
  const storeSlug = (store as { slug?: string })?.slug || "store";

  const storePassword = decryptSSLCommerzSecret(gateway.encryptedStorePassword);
  if (!storePassword) {
    return { ok: false, status: 500, message: "Failed to decrypt gateway credentials." };
  }

  const environment: "sandbox" | "live" = gateway.environment === "live" ? "live" : "sandbox";
  const isLive = environment === "live";

  const tranId = order.orderNumber || `TXN_${order._id}_${Date.now()}`;

  const callbackUrls = getSSLCommerzCallbackUrls({
    store: (store as any) || { _id: storeId, slug: storeSlug },
    order: { _id: order._id, orderNumber: order.orderNumber },
    transactionId: tranId,
    apiBaseUrl: appBaseUrl,
  });

  const initData = {
    total_amount: Number(order.total).toFixed(2),
    currency: order.currencyCode || "BDT",
    tran_id: tranId,
    success_url: callbackUrls.successUrl,
    fail_url: callbackUrls.failUrl,
    cancel_url: callbackUrls.cancelUrl,
    ipn_url: callbackUrls.ipnUrl,
    cus_name: order.shippingAddress?.fullName || order.customerSnapshot?.name || "Customer",
    cus_email: order.shippingAddress?.email || order.customerSnapshot?.email || "customer@store.com",
    cus_add1: order.shippingAddress?.street || "Address",
    cus_city: order.shippingAddress?.city || "Dhaka",
    cus_postcode: order.shippingAddress?.zip || "1000",
    cus_country: order.shippingAddress?.country || "Bangladesh",
    cus_phone: order.shippingAddress?.phone || order.customerSnapshot?.phone || "01700000000",
    shipping_method: "YES",
    ship_name: order.shippingAddress?.fullName || order.customerSnapshot?.name || "Customer",
    ship_add1: order.shippingAddress?.street || "Address",
    ship_city: order.shippingAddress?.city || "Dhaka",
    ship_postcode: order.shippingAddress?.zip || "1000",
    ship_country: order.shippingAddress?.country || "Bangladesh",
    num_of_item: order.items?.length || 1,
    product_name: order.items?.map((i: { name?: string }) => i.name).filter(Boolean).slice(0, 3).join(", ") || `Order ${tranId}`,
    product_category: "General",
    product_profile: "general",
    value_a: String(storeId),
    value_b: String(order._id),
    value_c: String(order.orderNumber),
    value_d: String(storeSlug),
  };

  try {
    console.info("[PAYMENT_SESSION_START]", { tranId, environment, orderId: String(order._id), total: order.total });

    const data = await sslczInit(gateway.storeIdValue, storePassword, isLive, initData);

    if (data?.status === "SUCCESS" && data.GatewayPageURL) {
      console.info("[GATEWAY_URL_RECEIVED]", {
        tranId,
        gatewayUrl: String(data.GatewayPageURL),
        sessionKey: String(data.sessionkey || ""),
      });

      order.paymentMethod = "sslcommerz";
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        transactionId: tranId,
        sessionKey: String(data.sessionkey || ""),
        environment,
      };
      order.timeline.push({
        status: "payment_pending",
        note: `SSLCommerz payment session initiated (Environment: ${environment})`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);

      await order.save();

      return {
        ok: true,
        data: {
          gatewayUrl: String(data.GatewayPageURL),
          redirectUrl: String(data.GatewayPageURL),
          sessionKey: String(data.sessionkey || ""),
          tranId,
        },
      };
    } else {
      const errorMsg = String(data?.failedreason || "Failed to initiate SSLCommerz payment session.");
      console.error("[PAYMENT_SESSION_FAILED]", { tranId, errorMsg, status: data?.status });
      return { ok: false, status: 502, message: errorMsg };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error contacting SSLCommerz gateway";
    console.error("[PAYMENT_SESSION_ERROR]", { tranId, errorMsg });
    return { ok: false, status: 500, message: errorMsg };
  }
}

/**
 * Handle SSLCommerz Callbacks (Success, Fail, Cancel, IPN) using sslcommerz-lts validation
 */
export async function verifyAndHandleSSLCommerzCallback(
  callbackData: Record<string, unknown>,
  actionType: "success" | "fail" | "cancel" | "ipn"
): Promise<{
  ok: boolean;
  status: number;
  message: string;
  order?: Record<string, unknown>;
  redirectUrl?: string;
}> {
  await connectDatabase();

  const logPrefix = `[SSLCOMMERZ_${actionType.toUpperCase()}]`;

  const tranId = String(
    callbackData.tran_id ||
    callbackData.tranId ||
    callbackData.transaction_id ||
    callbackData.value_c ||
    ""
  ).trim();

  const valId = String(callbackData.val_id || callbackData.valId || "").trim();
  const storeIdFromCallback = String(callbackData.value_a || callbackData.store_id || "").trim();
  const orderIdFromCallback = String(callbackData.value_b || callbackData.order_id || callbackData.orderId || "").trim();
  const storeSlug = String(callbackData.value_d || "").trim();

  console.info(`${logPrefix} request received`, {
    actionType,
    tran_id: tranId,
    val_id: valId,
    status: callbackData.status,
    amount: callbackData.amount,
    currency: callbackData.currency || callbackData.currency_type,
    card_type: callbackData.card_type,
    bank_tran_id: callbackData.bank_tran_id,
  });

  console.info(`${logPrefix} transaction/order identifier`, {
    tran_id: tranId,
    orderId: orderIdFromCallback,
    orderNumber: callbackData.value_c,
  });

  // Find order safely without casting errors
  let order: any = null;
  if (orderIdFromCallback && mongoose.Types.ObjectId.isValid(orderIdFromCallback)) {
    order = await OrderModel.findById(orderIdFromCallback);
  }

  if (!order && tranId) {
    order = await OrderModel.findOne({
      $or: [
        { orderNumber: tranId },
        { "paymentDetails.transactionId": tranId },
        ...(mongoose.Types.ObjectId.isValid(tranId) ? [{ _id: tranId }] : []),
      ],
    });
  }

  if (!order && callbackData.value_c) {
    order = await OrderModel.findOne({ orderNumber: String(callbackData.value_c).trim() });
  }

  // Attempt fallback store lookup if order is missing
  let fallbackStore: any = null;
  if (storeIdFromCallback && mongoose.Types.ObjectId.isValid(storeIdFromCallback)) {
    fallbackStore = await StoreModel.findById(storeIdFromCallback).lean();
  } else if (storeSlug) {
    fallbackStore = await StoreModel.findOne({ slug: storeSlug }).lean();
  }
  const fallbackStorePublicUrl = getStorePublicUrl(fallbackStore);

  if (!order) {
    console.warn(`${logPrefix} [SSLCOMMERZ_ORDER_NOT_FOUND]`, { tranId, valId, orderIdFromCallback, storeIdFromCallback });
    return {
      ok: false,
      status: 404,
      message: `Order matching transaction "${tranId}" not found.`,
      redirectUrl: `${fallbackStorePublicUrl}/checkout/payment/fail?tran_id=${tranId}&error=order_not_found`,
    };
  }

  const storeId = String(order.storeId);
  console.info(`${logPrefix} store/tenant`, { storeId, storeSlug: storeSlug || order.storeId });

  if (storeIdFromCallback && mongoose.Types.ObjectId.isValid(storeIdFromCallback) && storeIdFromCallback !== storeId) {
    console.error(`${logPrefix} [SSLCOMMERZ_STORE_MISMATCH]`, { orderStoreId: storeId, callbackStoreId: storeIdFromCallback });
    return {
      ok: false,
      status: 400,
      message: "Store ID mismatch in payment verification.",
      redirectUrl: `${fallbackStorePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=store_mismatch`,
    };
  }

  const store = (await StoreModel.findById(storeId).lean()) as any;
  const storePublicUrl = getStorePublicUrl(store);

  console.info(`${logPrefix} database lookup`, {
    orderFound: Boolean(order),
    orderNumber: order.orderNumber,
    orderId: String(order._id),
    currentPaymentStatus: order.paymentStatus,
    total: order.total,
  });

  // Handle Cancel
  if (actionType === "cancel" || String(callbackData.status).toUpperCase() === "CANCELLED") {
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "payment_cancelled",
        note: "Customer cancelled SSLCommerz payment.",
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();
    }
    const cancelRedirect = `${storePublicUrl}/checkout/payment/cancel?orderNumber=${order.orderNumber}&order=${order.orderNumber}&tran_id=${tranId}&orderId=${order._id}`;
    console.info(`${logPrefix} [SSLCOMMERZ_PAYMENT_CANCELLED]`, { tranId, orderNumber: order.orderNumber, redirect: cancelRedirect });
    return {
      ok: true,
      status: 200,
      message: "Payment cancelled by customer.",
      redirectUrl: cancelRedirect,
    };
  }

  // Handle Fail
  if (actionType === "fail" || String(callbackData.status).toUpperCase() === "FAILED") {
    const errorReason = String(callbackData.failedreason || callbackData.error || "Payment failed");
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "payment_failed",
        note: `SSLCommerz payment failed: ${errorReason}`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();
    }
    const failRedirect = `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&order=${order.orderNumber}&tran_id=${tranId}&orderId=${order._id}&error=${encodeURIComponent(errorReason)}`;
    console.info(`${logPrefix} [SSLCOMMERZ_PAYMENT_FAILED]`, { tranId, errorReason, orderNumber: order.orderNumber, redirect: failRedirect });
    return {
      ok: true,
      status: 200,
      message: "Payment failed.",
      redirectUrl: failRedirect,
    };
  }

  // Handle Success / IPN -> Idempotency Check
  if (order.paymentStatus === "paid") {
    const successRedirect = `${storePublicUrl}/checkout/payment/success?orderNumber=${order.orderNumber}&order=${order.orderNumber}&tran_id=${tranId}&orderId=${order._id}`;
    console.info(`${logPrefix} [SSLCOMMERZ_IDEMPOTENT_PAID]`, { tranId, orderNumber: order.orderNumber, redirect: successRedirect });
    return {
      ok: true,
      status: 200,
      message: "Payment already verified and paid.",
      order: order.toObject(),
      redirectUrl: successRedirect,
    };
  }

  const gateway = (await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  }).lean()) as LeanGateway | null;

  if (!gateway || !gateway.storeIdValue || !gateway.encryptedStorePassword) {
    return {
      ok: false,
      status: 400,
      message: "SSLCommerz gateway configuration not found for store.",
      redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=gateway_not_configured`,
    };
  }

  const storePassword = decryptSSLCommerzSecret(gateway.encryptedStorePassword);
  const environment: "sandbox" | "live" = gateway.environment === "live" ? "live" : "sandbox";
  const isLive = environment === "live";

  // If val_id is provided, verify with SSLCommerz Server API
  let rawValData: Record<string, unknown> | null = null;
  if (valId) {
    try {
      rawValData = await sslczValidate(gateway.storeIdValue, storePassword, isLive, valId);
    } catch (err) {
      console.warn(`${logPrefix} [SSLCOMMERZ_VALIDATE_API_ERROR]`, { valId, error: err instanceof Error ? err.message : String(err) });
    }
  }

  // Normalize validation response structure
  let valData: Record<string, unknown> = {};
  if (Array.isArray(rawValData)) {
    valData = (rawValData[0] as Record<string, unknown>) || {};
  } else if (rawValData && typeof rawValData === "object") {
    if (Array.isArray((rawValData as any).element) && (rawValData as any).element.length > 0) {
      valData = (rawValData as any).element[0] || {};
    } else {
      valData = rawValData;
    }
  }

  const valStatus = String(valData.status || callbackData.status || "").toUpperCase();
  console.info(`${logPrefix} validation response`, {
    val_id: valId,
    valStatus,
    valDataStatus: valData.status,
    callbackStatus: callbackData.status,
    amount: valData.amount || callbackData.amount,
    currency: valData.currency || callbackData.currency,
  });

  const isValid = ["VALID", "VALIDATED", "SUCCESS", "COMPLETED"].includes(valStatus);

  if (!isValid) {
    console.error(`${logPrefix} [SSLCOMMERZ_VERIFICATION_FAILED]`, { tranId, valStatus, error: valData.error || callbackData.error });
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "verification_failed",
        note: `SSLCommerz validation status not valid (${valStatus}): ${valData.error || callbackData.error || "Unrecognized status"}`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();
    }

    return {
      ok: false,
      status: 400,
      message: "SSLCommerz transaction validation failed.",
      redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=verification_failed`,
    };
  }

  // Verify Currency if provided
  const paidCurrency = String(valData.currency_type || valData.currency || callbackData.currency || "").toUpperCase();
  const expectedCurrency = String(order.currencyCode || "BDT").toUpperCase();
  if (paidCurrency && expectedCurrency && paidCurrency !== expectedCurrency) {
    console.error(`${logPrefix} [SSLCOMMERZ_CURRENCY_MISMATCH]`, { tranId, expected: expectedCurrency, received: paidCurrency });
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "currency_mismatch",
        note: `SSLCommerz currency mismatch. Expected: ${expectedCurrency}, Received: ${paidCurrency}`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();
    }

    return {
      ok: false,
      status: 400,
      message: `Payment currency mismatch. Expected ${expectedCurrency}, got ${paidCurrency}.`,
      redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=currency_mismatch`,
    };
  }

  // Verify Amount
  const paidAmount = parseFloat(String(valData.amount || valData.currency_amount || callbackData.amount || "0"));
  const expectedAmount = Number(order.total || 0);

  if (expectedAmount > 0 && Math.abs(paidAmount - expectedAmount) > 1.0) {
    console.error(`${logPrefix} [SSLCOMMERZ_AMOUNT_MISMATCH]`, { tranId, expected: expectedAmount, received: paidAmount });
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "amount_mismatch",
        note: `SSLCommerz amount mismatch. Expected: ৳${expectedAmount}, Received: ৳${paidAmount}`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();
    }

    return {
      ok: false,
      status: 400,
      message: `Payment amount mismatch. Expected ৳${expectedAmount}, got ৳${paidAmount}.`,
      redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=amount_mismatch`,
    };
  }

  // Mark as PAID
  order.paymentStatus = "paid";
  if (order.status === "pending") {
    order.status = "confirmed";
  }

  order.paymentVerification = {
    transactionId: String(valData.bank_tran_id || callbackData.bank_tran_id || tranId),
    senderNumber: String(valData.card_brand || valData.card_issuer || callbackData.card_type || ""),
    receiverNumber: gateway.storeIdValue,
    status: "verified",
    reviewedBy: "sslcommerz_gateway",
    reviewedAt: new Date(),
    note: `Verified automatically via SSLCommerz (${environment})`,
  };

  order.paymentDetails = {
    ...(order.paymentDetails || {}),
    transactionId: String(valData.bank_tran_id || callbackData.bank_tran_id || tranId),
    valId: String(valData.val_id || valId),
    bankTranId: String(valData.bank_tran_id || callbackData.bank_tran_id || ""),
    cardType: String(valData.card_type || callbackData.card_type || ""),
    cardBrand: String(valData.card_brand || callbackData.card_brand || ""),
    cardIssuer: String(valData.card_issuer || callbackData.card_issuer || ""),
    tranDate: String(valData.tran_date || callbackData.tran_date || ""),
    gateway: "sslcommerz",
    environment,
    verifiedAt: new Date().toISOString(),
  };

  order.timeline.push({
    status: "paid",
    note: `SSLCommerz payment of ৳${paidAmount || expectedAmount} verified successfully (TrxID: ${valData.bank_tran_id || callbackData.bank_tran_id || tranId}, ValID: ${valId || valData.val_id || "N/A"})`,
    createdBy: "sslcommerz_gateway",
    createdAt: new Date(),
  } as never);

  await order.save();

  console.info(`${logPrefix} order update`, {
    tranId,
    orderNumber: order.orderNumber,
    orderId: String(order._id),
    amount: paidAmount || expectedAmount,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
  });

  // Post-payment notification to store owner (isolated)
  if (store?.userId) {
    try {
      const { createBillingNotification } = await import("../notifications/billing-notification.service.js");
      await createBillingNotification({
        userId: String(store.userId),
        storeId,
        type: "payment_received",
        title: `Payment received: ${order.orderNumber}`,
        message: `Payment of ৳${paidAmount || expectedAmount} received via SSLCommerz for order ${order.orderNumber}.`,
        actionUrl: store.slug ? `/store/${store.slug}/orders` : "/dashboard/orders",
        metadata: { orderId: String(order._id), orderNumber: order.orderNumber, total: paidAmount || expectedAmount },
      });
    } catch (err) {
      console.warn("[notifications] Failed to create store payment notification:", err);
    }
  }

  // Post-payment notification to customer (isolated)
  if (order.customerId && mongoose.Types.ObjectId.isValid(String(order.customerId))) {
    try {
      const { CustomerNotificationModel } = await import("../customers/customer-notification.model.js");
      await CustomerNotificationModel.create({
        customerId: order.customerId,
        storeId,
        type: "payment",
        icon: "credit-card",
        priority: "high",
        title: `Payment verified: ${order.orderNumber}`,
        message: `Your payment of ৳${paidAmount || expectedAmount} has been verified successfully.`,
        link: `/orders/${String(order._id)}`,
        metadata: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          paymentStatus: "paid",
          total: paidAmount || expectedAmount,
        },
      });
    } catch (err) {
      console.warn("[notifications] Failed to create customer payment notification:", err);
    }
  }

  const finalSuccessRedirect = `${storePublicUrl}/checkout/payment/success?orderNumber=${order.orderNumber}&order=${order.orderNumber}&tran_id=${tranId}&orderId=${order._id}`;
  console.info(`${logPrefix} redirect target`, { redirectUrl: finalSuccessRedirect });

  return {
    ok: true,
    status: 200,
    message: "SSLCommerz payment verified and order updated.",
    order: order.toObject(),
    redirectUrl: finalSuccessRedirect,
  };
}

/**
 * Process SSLCommerz Refund using sslcommerz-lts
 */
export async function refundSSLCommerzPayment(
  storeId: string,
  orderId: string,
  userId: string | undefined,
  role: string | undefined,
  refundAmount?: number,
  remarks?: string
): Promise<{ ok: boolean; status: number; message: string; data?: Record<string, unknown> }> {
  await connectDatabase();
  const store = await ensureOwnedStore(storeId, userId, role);
  if (!store) {
    return { ok: false, status: 404, message: "Store not found" };
  }

  const order = await OrderModel.findOne({ _id: orderId, storeId });
  if (!order) {
    return { ok: false, status: 404, message: "Order not found." };
  }

  if (order.paymentStatus !== "paid") {
    return { ok: false, status: 400, message: "Only paid orders can be refunded." };
  }

  const gateway = (await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  }).lean()) as LeanGateway | null;

  if (!gateway || !gateway.storeIdValue || !gateway.encryptedStorePassword) {
    return { ok: false, status: 400, message: "SSLCommerz gateway configuration not found for store." };
  }

  const storePassword = decryptSSLCommerzSecret(gateway.encryptedStorePassword);
  const isLive = gateway.environment === "live";

  const bankTranId = (order.paymentDetails as Record<string, unknown>)?.bankTranId || (order.paymentVerification as Record<string, unknown>)?.transactionId;
  if (!bankTranId) {
    return { ok: false, status: 400, message: "Missing Bank Transaction ID required for SSLCommerz refund." };
  }

  const amountToRefund = refundAmount && refundAmount > 0 ? refundAmount : order.total;

  try {
    const refundData = {
      bank_tran_id: String(bankTranId),
      refund_amount: amountToRefund,
      refund_remarks: remarks || `Refund for order ${order.orderNumber}`,
      refl_id: `REF_${order._id}_${Date.now()}`,
    };

    const refundRes = await sslczRefund(gateway.storeIdValue, storePassword, isLive, refundData);

    if (refundRes?.status === "success" || refundRes?.status === "SUCCESS") {
      order.paymentStatus = "refunded";
      order.refundAmount = amountToRefund;
      order.timeline.push({
        status: "refunded",
        note: `Refund of ৳${amountToRefund} initiated successfully via SSLCommerz (RefundRef: ${refundRes.refund_ref_id || ""})`,
        createdBy: userId || "merchant",
        createdAt: new Date(),
      } as never);
      await order.save();

      return {
        ok: true,
        status: 200,
        message: "SSLCommerz refund initiated successfully.",
        data: refundRes as Record<string, unknown>,
      };
    } else {
      const errorReason = String(refundRes?.errorReason || "Failed to initiate refund with SSLCommerz.");
      return { ok: false, status: 400, message: errorReason };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error initiating SSLCommerz refund";
    return { ok: false, status: 500, message: errorMsg };
  }
}

/**
 * Platform admin list of store payment gateways
 */
export async function listAdminStorePaymentGateways(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  await connectDatabase();

  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.max(1, Math.min(100, Number(params.limit || 20)));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (params.search?.trim()) {
    const term = params.search.trim();
    const stores = await StoreModel.find({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { slug: { $regex: term, $options: "i" } },
      ],
    }).select("_id").lean();

    const storeIds = stores.map((s) => s._id);
    query.$or = [
      { storeId: { $in: storeIds } },
      { storeIdValue: { $regex: term, $options: "i" } },
    ];
  }

  if (params.status === "enabled") query.isEnabled = true;
  if (params.status === "disabled") query.isEnabled = false;
  if (params.status === "verified") query.isVerified = true;

  const [total, gateways] = await Promise.all([
    StorePaymentGatewayModel.countDocuments(query),
    StorePaymentGatewayModel.find(query)
      .populate("storeId", "name slug subdomain plan planId")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const items = gateways.map((g) => {
    const store = g.storeId as Record<string, unknown> | null;
    return {
      _id: g._id,
      storeId: store?._id || g.storeId,
      storeName: store?.name || "Unknown",
      storeSlug: store?.slug || "unknown",
      provider: g.provider,
      storeIdValue: g.storeIdValue,
      environment: g.environment,
      isEnabled: g.isEnabled,
      isVerified: g.isVerified,
      verifiedAt: g.verifiedAt,
      lastTestedAt: g.lastTestedAt,
      lastError: g.lastError,
      hasPassword: Boolean(g.encryptedStorePassword),
      maskedPassword: maskSecret(Boolean(g.encryptedStorePassword)),
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  });

  return {
    ok: true as const,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  };
}
