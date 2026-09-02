import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { verifyStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import {
  getCouponReport,
  getCustomerReport,
  getInventoryReport,
  getRefundReport,
  getReviewSummary,
  getSalesReport,
  getTaxReport,
} from "./reports.service.js";

async function checkStoreAccess(storeId: string, userId?: string) {
  const { ok, storeId: resolvedStoreId } = await verifyStoreAccess(storeId, userId);
  return { ok, storeId: resolvedStoreId || storeId };
}

export async function salesReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const { from, to } = request.query as Record<string, string>;
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getSalesReport(storeId, from, to);
  return sendSuccess(response, result.data);
}

export async function inventoryReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getInventoryReport(storeId);
  return sendSuccess(response, result.data);
}

export async function couponReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getCouponReport(storeId);
  return sendSuccess(response, result.data);
}

export async function customerReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getCustomerReport(storeId);
  return sendSuccess(response, result.data);
}

export async function taxReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const { from, to } = request.query as Record<string, string>;
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getTaxReport(storeId, from, to);
  return sendSuccess(response, result.data);
}

export async function refundReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getRefundReport(storeId);
  return sendSuccess(response, result.data);
}

export async function reviewReportController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getReviewSummary(storeId);
  return sendSuccess(response, result.data);
}
