import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import {
  getCouponReport,
  getCustomerReport,
  getInventoryReport,
  getRefundReport,
  getReviewSummary,
  getSalesReport,
  getTaxReport,
} from "./reports.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function salesReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const { from, to } = request.query as Record<string, string>;
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getSalesReport(storeId, from, to);
  return sendSuccess(response, result.data);
}

export async function inventoryReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getInventoryReport(storeId);
  return sendSuccess(response, result.data);
}

export async function couponReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getCouponReport(storeId);
  return sendSuccess(response, result.data);
}

export async function customerReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getCustomerReport(storeId);
  return sendSuccess(response, result.data);
}

export async function taxReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const { from, to } = request.query as Record<string, string>;
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getTaxReport(storeId, from, to);
  return sendSuccess(response, result.data);
}

export async function refundReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getRefundReport(storeId);
  return sendSuccess(response, result.data);
}

export async function reviewReportController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getReviewSummary(storeId);
  return sendSuccess(response, result.data);
}
