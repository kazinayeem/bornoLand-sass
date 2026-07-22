"use client";

import { authLog, maskToken } from "@/lib/auth-debug";

const SESSION_KEY = "session_id";
const CART_STORAGE_KEY = "bornoland_cart";

export function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    const randomPart =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionId = `sess-${randomPart}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Always send both customer auth (when present) and the guest session id.
 * After login the guest Mongo cart is keyed by sessionId — omitting it causes
 * "Cart is empty" while localStorage still shows items.
 */
export function getCartAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const headers: Record<string, string> = {};
  const token = localStorage.getItem("customer_token");
  const sessionId = getOrCreateCartSessionId();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (sessionId) headers["x-session-id"] = sessionId;

  return headers;
}

export function logCartDebug(phase: string, detail: Record<string, unknown>) {
  authLog("debug", `[cart] ${phase}`, detail);
}

export function readLocalCartItems(): Array<{
  productId: string;
  variantId?: string;
  variantTitle?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function summarizeCartItems(
  items: Array<{ productId: string; variantId?: string; quantity: number; price: number; name?: string }>,
) {
  return {
    itemCount: items.length,
    quantities: items.reduce((sum, item) => sum + item.quantity, 0),
    lines: items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    })),
  };
}

export function cartIdentityDebug() {
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  return {
    sessionId: typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null,
    customerToken: maskToken(token),
    hasCustomerToken: Boolean(token),
  };
}
