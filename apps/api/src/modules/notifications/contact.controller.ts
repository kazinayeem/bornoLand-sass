import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { submitContact } from "./contact.service.js";
import {
  listContactMessages,
  getContactMessage,
  updateContactMessage,
  deleteContactMessage,
  exportContactMessages,
} from "./contact.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function contactController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { name, email, phone, subject, message } = request.body;
  if (!name || !email || !message) return sendFailure(response, "Name, email, and message required");

  const result = await submitContact(storeId, { name, email, phone, subject, message });
  return result.ok
    ? sendSuccess(response, undefined, result.message)
    : sendFailure(response, result.message);
}

export async function listContactMessagesController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await listContactMessages(storeId, userId, request.query);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function getContactMessageController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const messageId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await getContactMessage(storeId, userId, messageId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateContactMessageController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const messageId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await updateContactMessage(storeId, userId, messageId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Message updated") : sendFailure(response, result.message, 404);
}

export async function deleteContactMessageController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const messageId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await deleteContactMessage(storeId, userId, messageId);
  return result.ok ? sendSuccess(response, result.data, "Message deleted") : sendFailure(response, result.message, 404);
}

export async function exportContactMessagesController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await exportContactMessages(storeId, userId, request.query);
  if (!result.ok) return sendFailure(response, result.message, 404);

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", `attachment; filename="${result.data.filename}"`);
  return response.send(result.data.csv);
}
