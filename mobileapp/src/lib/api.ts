import { config } from "../config";
import type { ApiEnvelope, SessionPayload, SessionUser } from "../types/domain";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; query?: Record<string, string | number | undefined> };

let accessToken: string | null = null;
let accessTokenListener: ((token: string) => void | Promise<void>) | null = null;
let refreshPromise: Promise<boolean> | null = null;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessTokenListener(listener: ((token: string) => void | Promise<void>) | null) {
  accessTokenListener = listener;
}

export function clearApiCache() {
  responseCache.clear();
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = `${config.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const pairs = Object.entries(query ?? {}).filter(([, value]) => value !== undefined);
  if (!pairs.length) return url;
  const params = pairs.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join("&");
  return `${url}?${params}`;
}

export async function recoverAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/me`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-app-source": config.appSource,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const payload = await response.json().catch(() => ({})) as ApiEnvelope<{ session: SessionPayload | null; accessToken?: string }>;
      const token = payload.data?.accessToken;
      if (!response.ok || !payload.data?.session || !token) return false;
      setAccessToken(token);
      await accessTokenListener?.(token);
      return true;
    } catch {
      return false;
    }
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export function invalidateApiCache() {
  clearApiCache();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, retryAuth = true): Promise<T> {
  const { body, query, ...requestOptions } = options;
  const method = (requestOptions.method || "GET").toUpperCase();
  const url = buildUrl(path, query);
  const cacheKey = `${method}:${url}`;
  const cached = responseCache.get(cacheKey);
  if (method === "GET" && cached && cached.expiresAt > Date.now()) return cached.value as T;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      ...requestOptions,
      credentials: "include",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-app-source": config.appSource,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...requestOptions.headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 401 && retryAuth && !path.startsWith("/auth/")) {
      const recovered = await recoverAccessToken();
      if (recovered) return apiRequest<T>(path, options, false);
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status, payload);
    }
    if (method === "GET") responseCache.set(cacheKey, { value: payload, expiresAt: Date.now() + 30_000 });
    else responseCache.clear();
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new ApiError("The server took too long to respond.", 408);
    throw new ApiError("Cannot reach the Bornoland API. Check your connection and API URL.", 0, error);
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  login: (email: string, password: string, loginType: "user" | "admin" = "user", rememberMe = false) =>
    apiRequest<ApiEnvelope<{ accessToken: string; session: SessionPayload; user: SessionUser }>>("/auth/login", { method: "POST", body: { email, password, rememberMe, loginType } }),
  register: (body: { name: string; email: string; password: string; tenantName?: string }) =>
    apiRequest<ApiEnvelope<{ tenantId: string; userId: string }>>("/auth/register", { method: "POST", body }),
  forgotPassword: (email: string) => apiRequest<ApiEnvelope<never>>("/auth/forgot-password", { method: "POST", body: { email } }),
  me: () => apiRequest<ApiEnvelope<{ session: SessionPayload | null; accessToken?: string }>>("/auth/me"),
  profile: () => apiRequest<ApiEnvelope<{ profile: SessionUser & { avatarUrl?: string } }>>("/profile"),
  logout: () => apiRequest<ApiEnvelope<never>>("/auth/logout", { method: "POST" }),
  stores: () => apiRequest<ApiEnvelope<{ stores: import("../types/domain").Store[] }>>("/stores/my-stores"),
  products: (storeId: string) => apiRequest<ApiEnvelope<{ products: import("../types/domain").Product[] }>>(`/products/${storeId}`),
  orders: (storeId: string, query?: RequestOptions["query"]) => apiRequest<{ data: { orders: import("../types/domain").Order[]; analytics: import("../types/domain").OrderAnalytics; total: number } }>(`/stores/${storeId}/orders`, { query }),
  categories: (storeId: string) => apiRequest<ApiEnvelope<{ categories: import("../types/domain").Category[] }>>(`/categories/${storeId}`),
};
