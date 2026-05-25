import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { getWishlist, toggleWishlistItem } from "../services/wishlist.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

function getIds(request: SubdomainRequest) {
  const storeId = request.store?._id?.toString();
  const customerId = (request as any).customerId as string | undefined;
  const sessionId = (request.headers["x-session-id"] as string) ?? `sess-${request.ip}`;
  return { storeId, customerId, sessionId };
}

export async function getWishlistController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const result = await getWishlist(storeId, customerId, sessionId);
  return sendSuccess(response, result.data);
}

export async function toggleWishlistController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { productId, name, price, image } = request.body;
  if (!productId) return sendFailure(response, "Product ID required");

  const result = await toggleWishlistItem(storeId, productId, { name, price, image }, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data, result.message)
    : sendFailure(response, result.message);
}
