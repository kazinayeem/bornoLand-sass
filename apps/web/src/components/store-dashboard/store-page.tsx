"use client";

import type { ReactNode } from "react";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";

export function StorePageCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-6">
      {children}
    </div>
  );
}

export function useStorePage() {
  const { store, storeId, isLoading } = useStoreFromSlug();
  if (!storeId || !store) {
    return { store: null, storeId: null, isLoading };
  }
  return { store, storeId, isLoading };
}
