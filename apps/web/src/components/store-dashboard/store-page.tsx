"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStoreContext } from "@/providers/store-context";

export function StorePageCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-150",
        className
      )}
    >
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
