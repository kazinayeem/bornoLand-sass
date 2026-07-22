"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCustomer, setCustomerFromToken } from "@/redux/slices/customer-slice";

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

function syncCustomerFromStorage(dispatch: ReturnType<typeof useDispatch>) {
  const token = localStorage.getItem("customer_token");
  if (!token) {
    dispatch(clearCustomer());
    return;
  }

  if (!isDecodableJwt(token)) {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    return;
  }

  dispatch(setCustomerFromToken(token));
}

/**
 * Hydrate customer auth on mount and keep Redux in sync across tabs/pages.
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
