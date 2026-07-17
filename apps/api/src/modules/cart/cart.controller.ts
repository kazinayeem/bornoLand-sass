import crypto from "crypto";
import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { getCart, addToCart, updateCartItem, removeFromCart, applyCouponToCart, removeCouponFromCart } from "./cart.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function getCustomerId(request: SubdomainRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  try {
    const decoded = jwt.verify(header.split(" ")[1], getJwtSecret()) as { customerId?: string };
    return decoded.customerId ?? undefined;
  } catch {
    return undefined;
  }
}

function getIds(request: SubdomainRequest) {
  const storeId = request.store?._id?.toString();
  const customerId = getCustomerId(request);
  const sessionId = (request.headers["x-session-id"] as string) ?? crypto.randomUUID();
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
  const { productId, variantId, quantity } = request.body;
  if (!productId && !variantId) return sendFailure(response, "Product ID or Variant ID required");
  const result = await addToCart(storeId, productId || variantId, quantity ?? 1, customerId, sessionId, variantId);
  return result.ok
    ? sendSuccess(response, result.data, "Added to cart")
    : sendFailure(response, result.message);
}

export async function updateCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const { productId, variantId, quantity } = request.body;
  if ((!productId && !variantId) || quantity == null) return sendFailure(response, "Product/Variant ID and quantity required");
  const result = await updateCartItem(storeId, productId || variantId, quantity, customerId, sessionId, variantId);
  return result.ok
    ? sendSuccess(response, result.data, "Cart updated")
    : sendFailure(response, result.message);
}

export async function removeFromCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const { productId, variantId } = request.body;
  if (!productId && !variantId) return sendFailure(response, "Product ID or Variant ID required");
  const result = await removeFromCart(storeId, productId || variantId, customerId, sessionId, variantId);
  return result.ok
    ? sendSuccess(response, result.data, "Removed from cart")
    : sendFailure(response, result.message);
}

export async function applyCouponController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const { code } = request.body;
  if (!code) return sendFailure(response, "Coupon code required");
  const result = await applyCouponToCart(storeId, code, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data, "Coupon applied")
    : sendFailure(response, result.message);
}

export async function removeCouponController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const result = await removeCouponFromCart(storeId, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data, "Coupon removed")
    : sendFailure(response, result.message);
}
