import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { submitContact } from "../services/contact.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function contactController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { name, email, phone, message } = request.body;
  if (!name || !email || !message) return sendFailure(response, "Name, email, and message required");

  const result = await submitContact(storeId, { name, email, phone, message });
  return result.ok
    ? sendSuccess(response, undefined, result.message)
    : sendFailure(response, result.message);
}
