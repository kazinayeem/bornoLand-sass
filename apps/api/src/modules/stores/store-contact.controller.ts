import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { getStoreContact, updateStoreContact, getPublicStoreContact } from "./store-contact.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function getStoreContactController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await getStoreContact(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateStoreContactController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await updateStoreContact(storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Contact information updated") : sendFailure(response, result.message, 404);
}

export async function getPublicStoreContactController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const result = await getPublicStoreContact(storeId);
  return sendSuccess(response, result.data);
}
