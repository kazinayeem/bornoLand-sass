import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import { createTaxClass, deleteTaxClass, listTaxClasses, updateTaxClass } from "./tax.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function listTaxClassesController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await listTaxClasses(storeId);
  return sendSuccess(response, result.data);
}

export async function createTaxClassController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await createTaxClass(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Tax class created", 201) : sendFailure(response, result.message);
}

export async function updateTaxClassController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await updateTaxClass(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Tax class updated") : sendFailure(response, result.message, 404);
}

export async function deleteTaxClassController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await deleteTaxClass(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
