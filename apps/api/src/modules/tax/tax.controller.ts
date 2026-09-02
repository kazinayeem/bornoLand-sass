import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { verifyStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import { createTaxClass, deleteTaxClass, listTaxClasses, updateTaxClass } from "./tax.service.js";

async function checkStoreAccess(storeId: string, userId?: string) {
  const { ok, storeId: resolvedStoreId } = await verifyStoreAccess(storeId, userId);
  return { ok, storeId: resolvedStoreId || storeId };
}

export async function listTaxClassesController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await listTaxClasses(storeId);
  return sendSuccess(response, result.data);
}

export async function createTaxClassController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await createTaxClass(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Tax class created", 201) : sendFailure(response, result.message);
}

export async function updateTaxClassController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await updateTaxClass(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Tax class updated") : sendFailure(response, result.message, 404);
}

export async function deleteTaxClassController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await deleteTaxClass(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
