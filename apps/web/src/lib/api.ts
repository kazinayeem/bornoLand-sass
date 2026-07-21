import axios from "axios";

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
    config.headers.Authorization = `Bearer ${token}`;
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
      // Unrelated 401s (or merchant session failures) must not log the shopper out.
      const customerToken = localStorage.getItem("customer_token");
      const authHeader = error.config?.headers?.Authorization;
      const authValue = typeof authHeader === "string" ? authHeader : undefined;
      if (customerToken && authValue === `Bearer ${customerToken}`) {
        localStorage.removeItem("customer_token");
        window.dispatchEvent(new Event("auth-change"));
      }
    }
    return Promise.reject(error);
  }
);