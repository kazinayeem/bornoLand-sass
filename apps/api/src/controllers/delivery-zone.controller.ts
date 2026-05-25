import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createDeliveryZone,
  listDeliveryZones,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "../services/delivery-zone.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function createController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  if (!storeId) return sendFailure(response, "Store ID required");

  const { name, charge, estimatedDays, enabled, sortOrder } = request.body;
  if (!name || charge === undefined) return sendFailure(response, "Name and charge required");

  const result = await createDeliveryZone(storeId, { name, charge, estimatedDays, enabled, sortOrder });
  return result.ok
    ? sendSuccess(response, result.data, "Delivery zone created", 201)
    : sendFailure(response, result.message);
}

export async function listController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  if (!storeId) return sendFailure(response, "Store ID required");

  const result = await listDeliveryZones(storeId);
  return sendSuccess(response, result.data);
}

export async function updateController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  if (!id || !storeId) return sendFailure(response, "ID and Store ID required");

  const result = await updateDeliveryZone(id, storeId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Delivery zone updated")
    : sendFailure(response, result.message, 404);
}

export async function deleteController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  if (!id || !storeId) return sendFailure(response, "ID and Store ID required");

  const result = await deleteDeliveryZone(id, storeId);
  return result.ok
    ? sendSuccess(response, undefined, result.message)
    : sendFailure(response, result.message, 404);
}
