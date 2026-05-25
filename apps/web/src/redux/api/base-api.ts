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
      }
      return headers;
    }
  }),
  tagTypes: ["Auth", "User", "Tenant", "Dashboard", "Stores", "Templates", "Products", "Cart", "Orders", "BuilderPages", "BuilderPage", "Customer", "StoreSettings", "HomepageSliders", "PaymentMethods", "DeliveryZones"],
  endpoints: () => ({})
});
