import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearAuthState } from "@/redux/slices/auth-slice";
import { getApiUrl } from "@/lib/urls";

const apiBaseUrl = getApiUrl();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: "include",
  timeout: 15000,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      headers.set("x-forwarded-host", window.location.host);
      const token = localStorage.getItem("customer_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

function emitApiError(detail: { status: number | string; message: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:api-error", { detail }));
}

const baseQueryWithGlobalErrorHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    let message = "Request failed.";

    if (status === 401) {
      message = "Session expired. Please sign in again.";
      api.dispatch(clearAuthState());
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

    emitApiError({ status, message });
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithGlobalErrorHandling,
  tagTypes: ["Auth", "User", "Tenant", "Dashboard", "Stores", "Templates", "Products", "Cart", "Orders", "BuilderPages", "BuilderPage", "Customer", "StoreSettings", "HomepageSliders", "PaymentMethods", "DeliveryZones", "CmsPages", "CmsPage", "Faqs", "Categories", "SubscriptionPayments", "Subscriptions", "Notifications", "Invoices", "Features", "Coupons", "Inventory", "Reviews", "Marketing", "Reports", "Media", "AuditLogs", "Analytics"],
  endpoints: () => ({})
});
