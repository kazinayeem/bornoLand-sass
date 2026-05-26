import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: "include",
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
  }),
  tagTypes: ["Auth", "User", "Tenant", "Dashboard", "Stores", "Templates", "Products", "Cart", "Orders", "BuilderPages", "BuilderPage", "Customer", "StoreSettings", "HomepageSliders", "PaymentMethods", "DeliveryZones", "CmsPages", "CmsPage", "Faqs", "Categories"],
  endpoints: () => ({})
});
