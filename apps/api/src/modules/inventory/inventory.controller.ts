import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import { adjustStock, getInventoryOverview } from "./inventory.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function getInventoryController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await getInventoryOverview(storeId);
  return sendSuccess(response, result.data);
}

export async function adjustStockController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const productId = String(request.params.productId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await adjustStock(storeId, productId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Stock updated") : sendFailure(response, result.message, 404);
}
