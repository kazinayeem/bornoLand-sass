import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { subscribe } from "./newsletter.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function subscribeController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { email } = request.body;
  if (!email) return sendFailure(response, "Email required");

  const result = await subscribe(storeId, email);
  return result.ok
    ? sendSuccess(response, undefined, result.message)
    : sendFailure(response, result.message);
}
