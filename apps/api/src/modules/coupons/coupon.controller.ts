import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { verifyStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForCart,
} from "./coupon.service.js";

async function checkStoreAccess(storeId: string, userId?: string) {
  const { ok, storeId: resolvedStoreId } = await verifyStoreAccess(storeId, userId);
  return { ok, storeId: resolvedStoreId || storeId };
}

export async function listCouponsController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await listCoupons(storeId, request.query as Record<string, unknown>);
  return sendSuccess(response, result.data);
}

export async function getCouponController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getCoupon(storeId, id);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createCouponController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await createCoupon(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Coupon created", 201) : sendFailure(response, result.message);
}

export async function updateCouponController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await updateCoupon(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Coupon updated") : sendFailure(response, result.message, 404);
}

export async function deleteCouponController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await deleteCoupon(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

// ── Public Storefront Coupon Validation Controller ────────────────────

export async function validateCouponController(request: Request, response: Response) {
  const storeId = (request.params.storeId as string) || (request.body?.storeId as string) || (request as any).store?._id;
  if (!storeId) {
    return sendFailure(response, "Store ID is required", 400);
  }
  const result = await validateCouponForCart(String(storeId), request.body);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 400);
}
