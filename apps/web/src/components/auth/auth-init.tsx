"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCustomer, setCustomerFromToken } from "@/redux/slices/customer-slice";
import { authLog, isJwtExpired, maskToken } from "@/lib/auth-debug";

function canHydrateCustomerToken(token: string): boolean {
  if (isJwtExpired(token, 0)) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return Boolean(payload?.customerId || payload?.email);
  } catch {
    return false;
  }
}

function syncCustomerFromStorage(dispatch: ReturnType<typeof useDispatch>) {
  const token = localStorage.getItem("customer_token");
  if (!token) {
    dispatch(clearCustomer());
    return;
  }

  if (!canHydrateCustomerToken(token)) {
    authLog("warn", "customer token invalid or expired — clearing UI session", {
      customerToken: maskToken(token),
      expired: isJwtExpired(token, 0),
    });
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    return;
  }

  dispatch(setCustomerFromToken(token));
}

/**
 * Hydrate customer auth on mount and keep Redux in sync across tabs/pages.
 * Never shows a logged-in navbar for an expired / invalid JWT.
 */
export function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    syncCustomerFromStorage(dispatch);

    const onAuthChange = () => syncCustomerFromStorage(dispatch);
    window.addEventListener("auth-change", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("auth-change", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [dispatch]);

  return null;
}
