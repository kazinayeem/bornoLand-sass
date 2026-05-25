import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  createPaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../services/payment-method.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function createController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  if (!storeId) return sendFailure(response, "Store ID required");

  const { type, label, accountNumber, accountType, instructions, enabled, sortOrder } = request.body;
  if (!type || !label) return sendFailure(response, "Type and label required");

  const result = await createPaymentMethod(storeId, {
    type, label, accountNumber, accountType, instructions, enabled, sortOrder,
  });
  return sendSuccess(response, result.data, "Payment method created", 201);
}

export async function listController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  if (!storeId) return sendFailure(response, "Store ID required");

  const result = await listPaymentMethods(storeId);
  return sendSuccess(response, result.data);
}

export async function updateController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  if (!id || !storeId) return sendFailure(response, "ID and Store ID required");

  const result = await updatePaymentMethod(id, storeId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Payment method updated")
    : sendFailure(response, result.message, 404);
}

export async function deleteController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  if (!id || !storeId) return sendFailure(response, "ID and Store ID required");

  const result = await deletePaymentMethod(id, storeId);
  return result.ok
    ? sendSuccess(response, undefined, result.message)
    : sendFailure(response, result.message, 404);
}
