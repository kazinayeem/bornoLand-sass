import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { verifyStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import { createShippingZone, deleteShippingZone, listShippingZones, updateShippingZone } from "./shipping.service.js";

async function checkStoreAccess(storeId: string, userId?: string) {
  const { ok, storeId: resolvedStoreId } = await verifyStoreAccess(storeId, userId);
  return { ok, storeId: resolvedStoreId || storeId };
}

export async function listShippingZonesController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await listShippingZones(storeId);
  return sendSuccess(response, result.data);
}

export async function createShippingZoneController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await createShippingZone(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Zone created", 201) : sendFailure(response, result.message);
}

export async function updateShippingZoneController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await updateShippingZone(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Zone updated") : sendFailure(response, result.message, 404);
}

export async function deleteShippingZoneController(request: AuthRequest, response: Response) {
  const rawId = String(request.params.storeId);
  const { ok, storeId } = await checkStoreAccess(rawId, request.user?.userId);
  const id = String(request.params.id);
  if (!ok) return sendFailure(response, "Store not found", 404);
  const result = await deleteShippingZone(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
