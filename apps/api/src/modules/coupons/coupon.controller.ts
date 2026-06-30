import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  updateCoupon,
} from "./coupon.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  return store ? true : false;
}

export async function listCouponsController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await listCoupons(storeId);
  return sendSuccess(response, result.data);
}

export async function getCouponController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getCoupon(storeId, id);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createCouponController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await createCoupon(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Coupon created", 201) : sendFailure(response, result.message);
}

export async function updateCouponController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await updateCoupon(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Coupon updated") : sendFailure(response, result.message, 404);
}

export async function deleteCouponController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await deleteCoupon(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
