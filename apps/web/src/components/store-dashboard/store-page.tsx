"use client";

import type { ReactNode } from "react";
import { useStoreContext } from "@/providers/store-context";

export function StorePageCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-apple-lg border border-apple-hairline bg-apple-canvas p-apple-lg sm:p-apple-xl">
      {children}
    </div>
  );
}

export function useStorePage() {
  const { store, storeId, isLoading } = useStoreContext();
  if (!storeId || !store) {
    return { store: null, storeId: null, isLoading };
  }
  return { store, storeId, isLoading };
}
