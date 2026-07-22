import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { getEmailConfig, updateEmailConfig, ensureDefaultEmailConfig } from "./store-email-config.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function getEmailConfigController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  await ensureDefaultEmailConfig(storeId);
  const result = await getEmailConfig(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateEmailConfigController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  await ensureDefaultEmailConfig(storeId);
  const result = await updateEmailConfig(storeId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Email configuration updated")
    : sendFailure(response, result.message, 400);
}
