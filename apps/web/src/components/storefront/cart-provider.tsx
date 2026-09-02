"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { hydrateCart, syncFromStorage, getCartStorageKey } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { store } = useTenant();
  const tenantSlug = store?.slug || "";
  const currentSlugRef = useRef(tenantSlug);
  currentSlugRef.current = tenantSlug;

  // Hydrate once when component mounts on client or when tenant slug changes
  useEffect(() => {
    dispatch(hydrateCart({ tenantSlug }));
  }, [dispatch, tenantSlug]);

  // Multi-tab storage sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = getCartStorageKey(tenantSlug);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        try {
          const newItems = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(newItems)) {
            dispatch(syncFromStorage({ items: newItems, tenantSlug: currentSlugRef.current }));
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, tenantSlug]);

  return <>{children}</>;
}
