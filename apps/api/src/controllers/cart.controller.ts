import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../services/cart.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

function getCustomerId(request: SubdomainRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  try {
    const jwt = JSON.parse(atob(header.split(" ")[1].split(".")[1]));
    return jwt.customerId ?? undefined;
  } catch {
    return undefined;
  }
}

function getIds(request: SubdomainRequest) {
  const storeId = request.store?._id?.toString();
  const customerId = getCustomerId(request);
  const sessionId = (request.headers["x-session-id"] as string) ?? `sess-${request.ip}`;
  return { storeId, customerId, sessionId };
}

export async function getCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const result = await getCart(storeId, customerId, sessionId);
  return sendSuccess(response, result.data);
}

export async function addToCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { productId, quantity } = request.body;
  if (!productId) return sendFailure(response, "Product ID required");

  const result = await addToCart(storeId, productId, quantity ?? 1, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message);
}

export async function updateCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { productId, quantity } = request.body;
  if (!productId || quantity === undefined) return sendFailure(response, "Product ID and quantity required");

  const result = await updateCartItem(storeId, productId, quantity, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message);
}

export async function removeFromCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const productId = request.params.productId as string;
  if (!productId) return sendFailure(response, "Product ID required");

  const result = await removeFromCart(storeId, productId, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message);
}
