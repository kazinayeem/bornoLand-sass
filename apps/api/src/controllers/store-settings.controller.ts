import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getStoreSettings, updateStoreSettings } from "../services/store-settings.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function getStoreSettingsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await getStoreSettings(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateStoreSettingsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await updateStoreSettings(storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Settings updated") : sendFailure(response, result.message, 404);
}