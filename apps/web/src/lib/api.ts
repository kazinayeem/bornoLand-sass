import axios from "axios";
import { isJwtExpired, authLog, maskToken } from "@/lib/auth-debug";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["x-app-source"] = "bornoland-web";
  if (typeof window !== "undefined") {
    config.headers["x-forwarded-host"] = window.location.host;
  }
  const token = localStorage.getItem("customer_token");
  if (token) {
    if (isJwtExpired(token, 0)) {
      authLog("warn", "axios: expired customer token removed before request", {
        customerToken: maskToken(token),
      });
      localStorage.removeItem("customer_token");
      window.dispatchEvent(new Event("auth-change"));
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("[API] Network error — CORS or backend unreachable");
    }
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Only clear storefront customer auth when this request used the customer JWT.
      const customerToken = localStorage.getItem("customer_token");
      const authHeader = error.config?.headers?.Authorization;
      const authValue = typeof authHeader === "string" ? authHeader : undefined;
      if (customerToken && authValue === `Bearer ${customerToken}`) {
        authLog("warn", "axios: customer 401 — clearing storefront session");
        localStorage.removeItem("customer_token");
        window.dispatchEvent(new Event("auth-change"));
      }
    }
    return Promise.reject(error);
  }
);
