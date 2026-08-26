import SSLCommerzPayment from "sslcommerz-lts";
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

const SSLCOMMERZ_API_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`SSLCommerz API timeout after ${ms}ms (${label})`)), ms)
    ),
  ]);
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
    const sslcz = new SSLCommerzPayment(storeIdValue, storePassword, isLive);

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

    const responseData = await withTimeout(sslcz.init(testData), SSLCOMMERZ_API_TIMEOUT_MS, "test-connection");

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
      const errorMsg = responseData?.failedreason || "Authentication failed with SSLCommerz. Please check Store ID, Store Password, and Environment.";
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
  | { ok: true; data: { gatewayUrl: string; sessionKey: string; tranId: string } }
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

  const sslcz = new SSLCommerzPayment(gateway.storeIdValue, storePassword, isLive);

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
    console.info("[SSL] sslcz.init starting", { tranId, environment, orderId });

    const data = await withTimeout(sslcz.init(initData), SSLCOMMERZ_API_TIMEOUT_MS, "sslcz.init");

    console.info("[SSL] sslcz.init completed", { tranId, status: data?.status, hasGatewayUrl: Boolean(data?.GatewayPageURL) });

    if (data?.status === "SUCCESS" && data.GatewayPageURL) {
      order.paymentMethod = "sslcommerz";
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        transactionId: tranId,
        sessionKey: data.sessionkey || "",
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
          gatewayUrl: data.GatewayPageURL,
          sessionKey: data.sessionkey || "",
          tranId,
        },
      };
    } else {
      const errorMsg = data?.failedreason || "Failed to initiate SSLCommerz payment session.";
      console.error("[SSL] sslcz.init failed", { tranId, errorMsg, status: data?.status });
      return { ok: false, status: 502, message: errorMsg };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error contacting SSLCommerz gateway";
    console.error("[SSL] sslcz.init error", { tranId, errorMsg });
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

  const tranId = String(callbackData.tran_id || "").trim();
  const valId = String(callbackData.val_id || "").trim();
  const storeIdFromCallback = String(callbackData.value_a || "").trim();
  const orderIdFromCallback = String(callbackData.value_b || "").trim();
  const storeSlug = String(callbackData.value_d || "").trim();

  // Find order
  let orderQuery: Record<string, unknown> = {};
  if (orderIdFromCallback) {
    orderQuery._id = orderIdFromCallback;
  } else if (tranId) {
    orderQuery = {
      $or: [{ orderNumber: tranId }, { "paymentDetails.transactionId": tranId }],
    };
  }

  const order = await OrderModel.findOne(orderQuery);
  if (!order) {
    return {
      ok: false,
      status: 404,
      message: "Order matching transaction not found.",
    };
  }

  const storeId = String(order.storeId);
  if (storeIdFromCallback && storeIdFromCallback !== storeId) {
    return {
      ok: false,
      status: 400,
      message: "Store ID mismatch in payment verification.",
    };
  }

  const store = (await StoreModel.findById(storeId).lean()) as any;
  const storePublicUrl = getStorePublicUrl(store);

  // Handle Cancel
  if (actionType === "cancel" || callbackData.status === "CANCELLED") {
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
    return {
      ok: true,
      status: 200,
      message: "Payment cancelled by customer.",
      redirectUrl: `${storePublicUrl}/checkout/payment/cancel?orderNumber=${order.orderNumber}&tran_id=${tranId}`,
    };
  }

  // Handle Fail
  if (actionType === "fail" || callbackData.status === "FAILED") {
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
    return {
      ok: true,
      status: 200,
      message: "Payment failed.",
      redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=${encodeURIComponent(errorReason)}`,
    };
  }

  // Handle Success / IPN -> Verify with SSLCommerz Server
  if (order.paymentStatus === "paid") {
    // Idempotent: already paid
    return {
      ok: true,
      status: 200,
      message: "Payment already verified and paid.",
      order: order.toObject(),
      redirectUrl: `${storePublicUrl}/checkout/payment/success?orderNumber=${order.orderNumber}&tran_id=${tranId}&orderId=${order._id}`,
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
    };
  }

  const storePassword = decryptSSLCommerzSecret(gateway.encryptedStorePassword);
  const environment: "sandbox" | "live" = gateway.environment === "live" ? "live" : "sandbox";
  const isLive = environment === "live";

  if (!valId) {
    return {
      ok: false,
      status: 400,
      message: "Validation ID (val_id) missing from callback.",
    };
  }

  try {
    const sslcz = new SSLCommerzPayment(gateway.storeIdValue, storePassword, isLive);
    const valData = await withTimeout(sslcz.validate({ val_id: valId }), SSLCOMMERZ_API_TIMEOUT_MS, "validate-payment");

    if (!valData || (valData.status !== "VALID" && valData.status !== "VALIDATED")) {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "verification_failed",
        note: `SSLCommerz validation failed: ${valData?.error || "Status not valid"}`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();

      return {
        ok: false,
        status: 400,
        message: "SSLCommerz transaction validation failed.",
        redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=verification_failed`,
      };
    }

    // Verify Amount
    const paidAmount = parseFloat(String(valData.amount || "0"));
    if (Math.abs(paidAmount - order.total) > 0.1) {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "amount_mismatch",
        note: `SSLCommerz amount mismatch. Expected: ৳${order.total}, Received: ৳${paidAmount}`,
        createdBy: "sslcommerz_gateway",
        createdAt: new Date(),
      } as never);
      await order.save();

      return {
        ok: false,
        status: 400,
        message: `Payment amount mismatch. Expected ৳${order.total}, got ৳${paidAmount}.`,
        redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=amount_mismatch`,
      };
    }

    // Mark as PAID
    order.paymentStatus = "paid";
    if (order.status === "pending") {
      order.status = "confirmed";
    }

    order.paymentVerification = {
      transactionId: valData.bank_tran_id || tranId,
      senderNumber: valData.card_brand || "",
      receiverNumber: gateway.storeIdValue,
      status: "verified",
      reviewedBy: "sslcommerz_gateway",
      reviewedAt: new Date(),
      note: `Verified automatically via SSLCommerz (${environment})`,
    };

    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      transactionId: valData.bank_tran_id || tranId,
      valId: valData.val_id || valId,
      bankTranId: valData.bank_tran_id || "",
      cardType: valData.card_type || "",
      cardBrand: valData.card_brand || "",
      cardIssuer: valData.card_issuer || "",
      tranDate: valData.tran_date || "",
      gateway: "sslcommerz",
      environment,
      verifiedAt: new Date().toISOString(),
    };

    order.timeline.push({
      status: "paid",
      note: `SSLCommerz payment of ৳${paidAmount} verified successfully (TrxID: ${valData.bank_tran_id || tranId}, ValID: ${valId})`,
      createdBy: "sslcommerz_gateway",
      createdAt: new Date(),
    } as never);

    await order.save();

    return {
      ok: true,
      status: 200,
      message: "SSLCommerz payment verified and order updated.",
      order: order.toObject(),
      redirectUrl: `${storePublicUrl}/checkout/payment/success?orderNumber=${order.orderNumber}&tran_id=${tranId}&orderId=${order._id}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error validating SSLCommerz payment";
    return {
      ok: false,
      status: 500,
      message: errorMsg,
      redirectUrl: `${storePublicUrl}/checkout/payment/fail?orderNumber=${order.orderNumber}&tran_id=${tranId}&error=system_error`,
    };
  }
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
    const sslcz = new SSLCommerzPayment(gateway.storeIdValue, storePassword, isLive);
    const refundData = {
      bank_tran_id: String(bankTranId),
      refund_amount: amountToRefund,
      refund_remarks: remarks || `Refund for order ${order.orderNumber}`,
      refl_id: `REF_${order._id}_${Date.now()}`,
    };

    const refundRes = await withTimeout(sslcz.initiateRefund(refundData), SSLCOMMERZ_API_TIMEOUT_MS, "refund");

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
      const errorReason = refundRes?.errorReason || "Failed to initiate refund with SSLCommerz.";
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
