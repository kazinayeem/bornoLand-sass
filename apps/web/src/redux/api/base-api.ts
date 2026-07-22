import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearAuthState } from "@/redux/slices/auth-slice";
import { getApiUrl } from "@/lib/urls";
import { getAccessToken, setAccessToken } from "@/lib/access-token";
import { broadcastAuthEvent } from "@/lib/auth-tab-sync";
import { refreshAccessTokenCoordinated } from "@/lib/auth-refresh-coordinator";

const apiBaseUrl = getApiUrl();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: "include",
  timeout: 15000,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      headers.set("x-forwarded-host", window.location.host);

      // Prefer an Authorization header already set by the endpoint (e.g. customer APIs).
      // Otherwise attach platform access token, then storefront customer token.
      if (!headers.has("Authorization")) {
        const at = getAccessToken();
        if (at) {
          headers.set("Authorization", `Bearer ${at}`);
        } else {
          const customerToken = localStorage.getItem("customer_token");
          if (customerToken) {
            headers.set("Authorization", `Bearer ${customerToken}`);
          }
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

async function tryRefreshToken(): Promise<string | null> {
  return refreshAccessTokenCoordinated();
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

const baseQueryWithGlobalErrorHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // First attempt
  let result = await rawBaseQuery(args, api, extraOptions);

  // On 401, try to refresh the access token and retry once (merchant/platform sessions only)
  if (result.error && result.error.status === 401) {
    if (isCustomerAuthorization(getAuthorizationHeader(args))) {
      // Leave customer_token alone here — protected pages decide via Redux restore.
      return result;
    }

    const newToken = await tryRefreshToken();

    if (newToken) {
      // Retry original request with new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — clear auth state
      setAccessToken(null);
      api.dispatch(clearAuthState());
      emitApiError({ status: 401, message: "Session expired. Please sign in again." });
      broadcastAuthEvent("expired");
      if (typeof window !== "undefined") window.dispatchEvent(new Event("app:auth-expired"));
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

    // Only emit non-401 errors (401 is handled above)
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
