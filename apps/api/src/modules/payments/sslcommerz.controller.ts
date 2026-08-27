import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import {
  getStoreSSLCommerzConfig,
  updateStoreSSLCommerzConfig,
  testSSLCommerzConnection,
  toggleStoreSSLCommerz,
  initiateSSLCommerzPayment,
  verifyAndHandleSSLCommerzCallback,
  listAdminStorePaymentGateways,
} from "./sslcommerz.service.js";

function getStoreId(req: AuthRequest): string {
  return String(req.params.storeId || req.params.id || req.body?.storeId || req.query?.storeId || "");
}

function getUserId(req: AuthRequest): string {
  return String(req.user?.userId || "");
}

function getRole(req: AuthRequest): string {
  return String(req.user?.role || "");
}

export async function getStoreSSLCommerzController(req: AuthRequest, res: Response) {
  const storeId = getStoreId(req);
  if (!storeId) return sendFailure(res, "Store ID is required", 400);

  const result = await getStoreSSLCommerzConfig(storeId, getUserId(req), getRole(req));
  if (!result.ok) return sendFailure(res, result.message, result.status);
  return sendSuccess(res, result.data);
}

export async function updateStoreSSLCommerzController(req: AuthRequest, res: Response) {
  const storeId = getStoreId(req);
  if (!storeId) return sendFailure(res, "Store ID is required", 400);

  const result = await updateStoreSSLCommerzConfig(
    storeId,
    getUserId(req),
    getRole(req),
    req.body,
    { ip: req.ip, userAgent: req.get("user-agent") }
  );

  if (!result.ok) return sendFailure(res, result.message, result.status);
  return sendSuccess(res, result.data, "SSLCommerz configuration updated successfully.");
}

export async function testStoreSSLCommerzController(req: AuthRequest, res: Response) {
  const storeId = getStoreId(req);
  if (!storeId) return sendFailure(res, "Store ID is required", 400);

  const result = await testSSLCommerzConnection(storeId, getUserId(req), getRole(req), req.body);
  if (!result.ok) return sendFailure(res, result.message, 400);
  return sendSuccess(res, { verified: result.verified }, result.message);
}

export async function toggleStoreSSLCommerzController(req: AuthRequest, res: Response) {
  const storeId = getStoreId(req);
  if (!storeId) return sendFailure(res, "Store ID is required", 400);

  const enabled = Boolean(req.body?.enabled ?? req.body?.isEnabled);
  const result = await toggleStoreSSLCommerz(storeId, getUserId(req), getRole(req), enabled);
  if (!result.ok) return sendFailure(res, result.message, 400);
  return sendSuccess(res, { isEnabled: result.isEnabled }, result.message);
}

export async function initiateSSLCommerzPaymentController(req: Request, res: Response) {
  const storeId = String(req.body?.storeId || req.params?.storeId || req.query?.storeId || "");
  const orderId = String(req.body?.orderId || req.params?.orderId || "");

  if (!storeId || !orderId) {
    return sendFailure(res, "Store ID and Order ID are required to initiate payment.", 400);
  }

  const host = req.get("origin") || req.get("host") || "";
  const result = await initiateSSLCommerzPayment(storeId, orderId, host);
  if (!result.ok) return sendFailure(res, result.message, result.status);
  return sendSuccess(res, result.data, "SSLCommerz payment session initiated.");
}

export async function sslcommerzSuccessCallbackController(req: Request, res: Response) {
  const params = { ...(req.query as Record<string, unknown>), ...(req.body as Record<string, unknown>) };
  const result = await verifyAndHandleSSLCommerzCallback(params, "success");

  if (result.redirectUrl) {
    return res.redirect(result.redirectUrl);
  }
  return res.status(result.status).json(result);
}

export async function sslcommerzFailCallbackController(req: Request, res: Response) {
  const params = { ...(req.query as Record<string, unknown>), ...(req.body as Record<string, unknown>) };
  const result = await verifyAndHandleSSLCommerzCallback(params, "fail");

  if (result.redirectUrl) {
    return res.redirect(result.redirectUrl);
  }
  return res.status(result.status).json(result);
}

export async function sslcommerzCancelCallbackController(req: Request, res: Response) {
  const params = { ...(req.query as Record<string, unknown>), ...(req.body as Record<string, unknown>) };
  const result = await verifyAndHandleSSLCommerzCallback(params, "cancel");

  if (result.redirectUrl) {
    return res.redirect(result.redirectUrl);
  }
  return res.status(result.status).json(result);
}

export async function sslcommerzIpnController(req: Request, res: Response) {
  const params = { ...(req.query as Record<string, unknown>), ...(req.body as Record<string, unknown>) };
  const result = await verifyAndHandleSSLCommerzCallback(params, "ipn");
  return res.status(result.status).json({
    status: result.ok ? "SUCCESS" : "FAILED",
    message: result.message,
  });
}

export async function adminListStoreGatewaysController(req: AuthRequest, res: Response) {
  const result = await listAdminStorePaymentGateways(req.query as Record<string, unknown>);
  return sendSuccess(res, result.data);
}

export async function refundStoreSSLCommerzController(req: AuthRequest, res: Response) {
  const storeId = getStoreId(req);
  const orderId = String(req.body?.orderId || req.params?.orderId || "");
  const refundAmount = req.body?.refundAmount ? Number(req.body.refundAmount) : undefined;
  const remarks = typeof req.body?.remarks === "string" ? req.body.remarks : undefined;

  if (!storeId || !orderId) {
    return sendFailure(res, "Store ID and Order ID are required to process refund.", 400);
  }

  const { refundSSLCommerzPayment } = await import("./sslcommerz.service.js");
  const result = await refundSSLCommerzPayment(
    storeId,
    orderId,
    getUserId(req),
    getRole(req),
    refundAmount,
    remarks
  );

  if (!result.ok) return sendFailure(res, result.message, result.status);
  return sendSuccess(res, result.data, result.message);
}
