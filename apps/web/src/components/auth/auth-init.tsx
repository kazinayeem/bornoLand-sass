"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCustomer, setCustomerFromToken, setRestored } from "@/redux/slices/customer-slice";

function isDecodableJwt(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    JSON.parse(atob(parts[1]));
    return true;
  } catch {
    return false;
  }
}

/**
 * Hydrate customer auth exactly once on mount.
 * Always marks `restored` so protected pages can decide without looping.
 */
export function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      dispatch(setRestored());
      return;
    }

    if (!isDecodableJwt(token)) {
      localStorage.removeItem("customer_token");
      dispatch(clearCustomer());
      return;
    }

    dispatch(setCustomerFromToken(token));
  }, [dispatch]);

  return null;
}
