import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: "include"
  }),
  tagTypes: ["Auth", "User", "Tenant", "Dashboard"],
  endpoints: () => ({})
});
