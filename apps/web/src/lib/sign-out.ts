import { apiClient } from "@/lib/api-client";

export async function signOutCustomer() {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // logout should still clear local state even if the network request fails
    console.warn("[auth] logout request failed", error);
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("session_id");
    window.dispatchEvent(new Event("auth-change"));
  }
}
