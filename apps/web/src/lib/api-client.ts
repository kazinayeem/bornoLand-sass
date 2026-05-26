import axios from "axios";
import { config } from "@/lib/config";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((request) => {
  request.headers = request.headers ?? {};
  request.headers["x-app-source"] = "bornoland-web";
  if (typeof window !== "undefined") {
    request.headers["x-forwarded-host"] = window.location.host;
    const token = localStorage.getItem("customer_token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
  }

  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("[API] Network error - CORS or backend unreachable");
    }
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("customer_token");
      window.dispatchEvent(new Event("auth-change"));
    }
    return Promise.reject(error);
  }
);
