import crypto from "crypto";
import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCouponToCart,
  removeCouponFromCart,
  mergeGuestCartIntoCustomer,
  syncCartItems,
} from "./cart.service.js";
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
  const headerSession = request.headers["x-session-id"];
  const sessionId =
    typeof headerSession === "string" && headerSession.trim().length > 0
      ? headerSession.trim()
      : undefined;
  return { storeId, customerId, sessionId };
}

export async function getCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  // Authenticated shoppers: claim any guest session cart before returning.
  if (customerId && sessionId) {
    await mergeGuestCartIntoCustomer(storeId, customerId, sessionId);
  }

  const result = await getCart(storeId, customerId, sessionId);
  console.info("[cart] getCart", {
    storeId,
    customerId: customerId ?? null,
    sessionId: sessionId ?? null,
    itemCount: (result.data?.cart as any)?.items?.length ?? 0,
    cartId: (result.data?.cart as { _id?: unknown } | undefined)?._id ?? null,
  });
  return sendSuccess(response, result.data);
}

export async function addToCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const effectiveSessionId = sessionId ?? crypto.randomUUID();
  const { productId, variantId, quantity } = request.body;
  if (!productId && !variantId) return sendFailure(response, "Product ID or Variant ID required");
  const result = await addToCart(
    storeId,
    (productId || variantId) as string,
    quantity ?? 1,
    customerId,
    effectiveSessionId,
    variantId,
  );
  return result.ok
    ? sendSuccess(response, result.data, "Added to cart")
    : sendFailure(response, result.message);
}

export async function updateCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const { productId, variantId, quantity } = request.body;
  if ((!productId && !variantId) || quantity == null) {
    return sendFailure(response, "Product/Variant ID and quantity required");
  }
  const result = await updateCartItem(
    storeId,
    (productId || variantId) as string,
    quantity,
    customerId,
    sessionId,
    variantId,
  );
  return result.ok
    ? sendSuccess(response, result.data, "Cart updated")
    : sendFailure(response, result.message);
}

export async function removeFromCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  const productId =
    (request.params.productId as string | undefined) ||
    (request.body?.productId as string | undefined);
  const variantId = request.body?.variantId as string | undefined;
  if (!productId && !variantId) return sendFailure(response, "Product ID or Variant ID required");
  const result = await removeFromCart(
    storeId,
    (productId || variantId) as string,
    customerId,
    sessionId,
    variantId,
  );

  return result.ok
    ? sendSuccess(response, result.data, "Removed from cart")
    : sendFailure(response, result.message);
}

export async function mergeCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);

  console.info("[cart] mergeGuestCart", { storeId, customerId, sessionId: sessionId ?? null });
  const result = await mergeGuestCartIntoCustomer(storeId, customerId, sessionId);
  return sendSuccess(response, result.data, result.data.merged ? "Cart merged" : "Cart ready");
}

export async function syncCartController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId, sessionId } = getIds(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const items = Array.isArray(request.body?.items) ? request.body.items : [];
  console.info("[cart] syncCart", {
    storeId,
    customerId: customerId ?? null,
    sessionId: sessionId ?? null,
    frontendItemCount: items.length,
  });

  const result = await syncCartItems(storeId, items, customerId, sessionId);
  return result.ok
    ? sendSuccess(response, result.data, "Cart synchronized")
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
