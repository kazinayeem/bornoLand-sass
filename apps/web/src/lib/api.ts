import axios from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["x-app-source"] = "bornoland-web";
  if (typeof window !== "undefined") {
    config.headers["x-forwarded-host"] = window.location.host;
  }
  return config;
});