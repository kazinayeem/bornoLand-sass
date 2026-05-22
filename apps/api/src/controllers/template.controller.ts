import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getAllTemplates, getAdminTemplates, getTemplateById,
  createTemplate, updateTemplate, deleteTemplate, applyTemplateToStore
} from "../services/template.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function listTemplatesController(_request: AuthRequest, response: Response) {
  const result = await getAllTemplates();
  return sendSuccess(response, result.data);
}

export async function adminListTemplatesController(_request: AuthRequest, response: Response) {
  const result = await getAdminTemplates();
  return sendSuccess(response, result.data);
}

export async function getTemplateController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const result = await getTemplateById(id);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createTemplateController(request: AuthRequest, response: Response) {
  const result = await createTemplate({ ...request.body, createdBy: request.user?.userId });
  return sendSuccess(response, result.data, "Template created", 201);
}

export async function updateTemplateController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const result = await updateTemplate(id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Template updated") : sendFailure(response, result.message, 404);
}

export async function deleteTemplateController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const result = await deleteTemplate(id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function applyTemplateController(request: AuthRequest, response: Response) {
  const { storeId, templateId } = request.body;
  if (!storeId || !templateId) return sendFailure(response, "storeId and templateId required");
  const result = await applyTemplateToStore(storeId, templateId);
  return result.ok ? sendSuccess(response, result.data, "Template applied") : sendFailure(response, result.message);
}
