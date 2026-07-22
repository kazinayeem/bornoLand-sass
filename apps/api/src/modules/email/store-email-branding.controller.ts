import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { getEmailBranding, updateEmailBranding, ensureDefaultEmailBranding } from "./store-email-branding.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function getEmailBrandingController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  await ensureDefaultEmailBranding(storeId);
  const result = await getEmailBranding(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateEmailBrandingController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  await ensureDefaultEmailBranding(storeId);
  const result = await updateEmailBranding(storeId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Email branding updated")
    : sendFailure(response, result.message, 400);
}
