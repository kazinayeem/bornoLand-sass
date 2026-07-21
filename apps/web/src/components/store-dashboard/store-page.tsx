"use client";

import type { ReactNode } from "react";
import { useStoreContext } from "@/providers/store-context";

export function StorePageCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-apple-hairline bg-white p-4 shadow-sm sm:p-6">
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
