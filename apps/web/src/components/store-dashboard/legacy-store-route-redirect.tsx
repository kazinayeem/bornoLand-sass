"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useGetStoreQuery, useGetMyStoresQuery } from "@/redux/api/store-api";
import { useCurrentStore } from "@/hooks/use-current-store";

type LegacyStoreRouteRedirectProps = {
  storeId?: string | null;
  fallbackPath?: string;
  resolveTargetPath: (storeSlug: string) => string;
};

export function LegacyStoreRouteRedirect({
  storeId,
  fallbackPath = "/dashboard/stores",
  resolveTargetPath,
}: LegacyStoreRouteRedirectProps) {
  const router = useRouter();
  const { currentStore, currentStoreId } = useCurrentStore();
  const { data: explicitStoreData, isLoading: explicitStoreLoading } = useGetStoreQuery(storeId ?? "", {
    skip: !storeId,
  });
  const { data: storesData, isLoading: storesLoading } = useGetMyStoresQuery(undefined, {
    skip: !!storeId || !!currentStoreId,
  });

  const fallbackStore =
    explicitStoreData?.data?.store ??
    currentStore ??
    storesData?.data?.stores?.[0] ??
    null;

  useEffect(() => {
    if (fallbackStore?.slug) {
      router.replace(resolveTargetPath(fallbackStore.slug));
      return;
    }
    if (!explicitStoreLoading && !storesLoading && !fallbackStore) {
      router.replace(fallbackPath);
    }
  }, [fallbackPath, fallbackStore, explicitStoreLoading, resolveTargetPath, router, storesLoading]);

  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
    </div>
  );
}
