import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearAuthState } from "@/redux/slices/auth-slice";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { getApiUrl } from "@/lib/urls";
import { getStorefrontTenantHeaders } from "@/lib/tenant-resolution";
import { getAccessToken, setAccessToken } from "@/lib/access-token";
import { broadcastAuthEvent } from "@/lib/auth-tab-sync";
import { refreshAccessTokenCoordinated } from "@/lib/auth-refresh-coordinator";
import {
  authLog,
  hasDocumentCookie,
  isJwtExpired,
  maskToken,
} from "@/lib/auth-debug";

const apiBaseUrl = getApiUrl();
const SESSION_COOKIE_NAME = "bornoland.session";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: "include",
  timeout: 15000,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const tenantHeaders = getStorefrontTenantHeaders();
      for (const [key, value] of Object.entries(tenantHeaders)) {
        headers.set(key, value);
      }

      // Merchant access token only. Customer endpoints set Authorization explicitly.
      // Never fall back to customer_token here — that masquerades as a merchant session
      // and blocks the refresh lifecycle.
      if (!headers.has("Authorization")) {
        const at = getAccessToken();
        if (at) {
          headers.set("Authorization", `Bearer ${at}`);
        }
      }
    }
    return headers;
  },
});

function emitApiError(detail: { status: number | string; message: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:api-error", { detail }));
}

function getAuthorizationHeader(args: string | FetchArgs): string | undefined {
  if (typeof args === "string") return undefined;
  const headers = args.headers;
  if (!headers) return undefined;
  if (headers instanceof Headers) return headers.get("Authorization") ?? undefined;
  if (Array.isArray(headers)) {
    const match = headers.find(([key]) => key.toLowerCase() === "authorization");
    return match?.[1];
  }
  const record = headers as Record<string, string>;
  return record.Authorization ?? record.authorization;
}

/** Storefront customer JWTs must not trigger merchant refresh / logout. */
function isCustomerAuthorization(authorization: string | undefined): boolean {
  if (!authorization?.startsWith("Bearer ") || typeof window === "undefined") return false;
  const customerToken = localStorage.getItem("customer_token");
  return Boolean(customerToken && authorization === `Bearer ${customerToken}`);
}

function clearMerchantSession(api: { dispatch: (action: unknown) => void }, reason: string) {
  authLog("warn", "logout trigger: clearing merchant session", { reason });
  setAccessToken(null);
  api.dispatch(clearAuthState());
  broadcastAuthEvent("expired");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("app:auth-expired"));
  }
}

function clearCustomerSession(api: { dispatch: (action: unknown) => void }, reason: string) {
  authLog("warn", "logout trigger: clearing customer session", { reason });
  if (typeof window !== "undefined") {
    localStorage.removeItem("customer_token");
    window.dispatchEvent(new Event("auth-change"));
  }
  api.dispatch(clearCustomer());
}

function logAuthContext(phase: string, authorization: string | undefined) {
  const accessToken = getAccessToken();
  const customerToken =
    typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  authLog("debug", phase, {
    accessTokenPresent: Boolean(accessToken),
    accessToken: maskToken(accessToken),
    accessTokenExpired: accessToken ? isJwtExpired(accessToken) : null,
    refreshCookieReadable: hasDocumentCookie(SESSION_COOKIE_NAME), // httpOnly → almost always false
    customerTokenPresent: Boolean(customerToken),
    customerToken: maskToken(customerToken),
    authorizationAttached: Boolean(authorization),
    authorization: authorization ? maskToken(authorization.replace(/^Bearer\s+/i, "")) : "(none)",
    note: "HttpOnly refresh cookie cannot be read from JS; refresh uses credentials:include",
  });
}

const baseQueryWithGlobalErrorHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const url = typeof args === "string" ? args : args.url;
  const explicitAuth = getAuthorizationHeader(args);
  const accessBefore = getAccessToken();
  const effectiveAuth =
    explicitAuth ?? (accessBefore ? `Bearer ${accessBefore}` : undefined);

  logAuthContext(`request ${url}`, effectiveAuth);

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const authorization = getAuthorizationHeader(args) ?? effectiveAuth;
    const backendMessage =
      result.error.data && typeof result.error.data === "object" && "message" in result.error.data
        ? String((result.error.data as { message?: string }).message ?? "")
        : "";

    if (isCustomerAuthorization(authorization)) {
      authLog("warn", "customer 401", { url, backendMessage });
      clearCustomerSession(api, `customer 401 on ${url}: ${backendMessage || "unauthorized"}`);
      return result;
    }

    // No merchant access token and no customer bearer — attempt refresh before logout.
    authLog("info", "merchant 401 — attempting refresh", {
      url,
      backendMessage,
      accessTokenPresent: Boolean(getAccessToken()),
      authorizationAttached: Boolean(authorization),
    });

    const newToken = await refreshAccessTokenCoordinated();

    if (newToken) {
      authLog("info", "refresh success — retrying request", {
        url,
        accessToken: maskToken(newToken),
      });
      result = await rawBaseQuery(args, api, extraOptions);

      if (!result.error) {
        authLog("info", "retry success", { url });
      } else if (result.error.status === 401) {
        clearMerchantSession(api, `retry still 401 after refresh on ${url}`);
        emitApiError({ status: 401, message: "Session expired. Please sign in again." });
      }
    } else {
      clearMerchantSession(api, `refresh failed for ${url}`);
      emitApiError({ status: 401, message: "Session expired. Please sign in again." });
    }
  }

  if (result.error) {
    const status = result.error.status;
    let message = "Request failed.";

    const backendMessage =
      result.error.data && typeof result.error.data === "object" && "message" in result.error.data
        ? (result.error.data as { message?: string }).message
        : undefined;

    if (backendMessage) {
      message = backendMessage;
    } else if (status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (status === 404) {
      message = "Requested resource was not found.";
    } else if (typeof status === "number" && status >= 500) {
      message = "Server error. Please try again.";
    } else if (status === "FETCH_ERROR") {
      message = "Network error. Check your connection and retry.";
    } else if (status === "TIMEOUT_ERROR") {
      message = "Request timed out. Please retry.";
    }

    if (status !== 401) {
      emitApiError({ status, message });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithGlobalErrorHandling,
  tagTypes: ["Auth", "User", "Tenant", "Dashboard", "Stores", "Templates", "Products", "Cart", "Orders", "BuilderPages", "BuilderPage", "Customer", "Customers", "StoreSettings", "StoreContact", "ContactMessages", "HomepageSliders", "PaymentMethods", "DeliveryZones", "CmsPages", "CmsPage", "Faqs", "Categories", "SubscriptionPayments", "Subscriptions", "Notifications", "Invoices", "Features", "Coupons", "Inventory", "Reviews", "Marketing", "Reports", "Media", "AuditLogs", "Analytics", "StorePages", "StorePage", "PageVersions", "Navigations", "Navigation", "GlobalSections", "GlobalSection", "BuilderTemplates", "BuilderTemplate", "EmailConfig", "EmailTemplates", "EmailTemplate", "EmailBranding", "EmailLogs", "EmailLog"],
  endpoints: () => ({})
});
