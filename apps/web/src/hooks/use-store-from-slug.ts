"use client";

import { useStoreContext } from "@/providers/store-context";

export function useStoreFromSlug() {
  const context = useStoreContext();
  return {
    storeSlug: context.storeSlug,
    store: context.store,
    storeId: context.storeId,
    isLoading: context.isLoading,
    isError: context.isError,
    refetch: undefined,
  };
}
