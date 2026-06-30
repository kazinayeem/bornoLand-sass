"use client";

import { useCurrentStore } from "@/features/session/hooks";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";

type RequireFeatureProps = {
  children: React.ReactNode;
  featureKey: string;
  fallback?: React.ReactNode;
};

export function RequireFeature({ children, featureKey, fallback = null }: RequireFeatureProps) {
  const currentStore = useCurrentStore();
  const { data, isLoading } = useGetStoreFeatureAccessQuery(currentStore.storeId, {
    skip: !currentStore.storeId,
  });

  if (isLoading) return null;
  if (!currentStore.storeId) return <>{fallback}</>;

  const feature = getFeatureByKey(data?.data?.features ?? [], featureKey);
  if (feature?.locked) return <>{fallback}</>;
  return <>{children}</>;
}
