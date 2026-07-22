import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  resetEmailTemplate,
  duplicateEmailTemplate,
  ensureDefaultEmailTemplates,
} from "./store-email-template.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function listEmailTemplatesController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  await ensureDefaultEmailTemplates(storeId);
  const result = await getEmailTemplates(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function getEmailTemplateController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const templateId = request.params.templateId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await getEmailTemplate(storeId, templateId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateEmailTemplateController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const templateId = request.params.templateId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await updateEmailTemplate(storeId, templateId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Email template updated")
    : sendFailure(response, result.message, 400);
}

export async function resetEmailTemplateController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const templateId = request.params.templateId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await resetEmailTemplate(storeId, templateId, userId);
  return result.ok
    ? sendSuccess(response, result.data, "Email template reset to default")
    : sendFailure(response, result.message, 400);
}

export async function duplicateEmailTemplateController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const templateId = request.params.templateId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await duplicateEmailTemplate(storeId, templateId, userId);
  return result.ok
    ? sendSuccess(response, result.data, "Email template duplicated")
    : sendFailure(response, result.message, 400);
}
