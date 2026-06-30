"use client";

import { useState } from "react";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { FeatureLocked, LimitBanner } from "@/components/features/feature-gate";

export function FeatureGate({
  storeId,
  featureKey,
  billingHref,
  children,
}: {
  storeId: string;
  featureKey: string;
  billingHref: string;
  children: React.ReactNode;
}) {
  const { data, isLoading } = useGetStoreFeatureAccessQuery(storeId);
  const features = data?.data?.features ?? [];
  const feature = getFeatureByKey(features, featureKey);

  if (isLoading) {
    return <div className="animate-pulse rounded-2xl bg-zinc-100 h-48" />;
  }

  if (!feature) return <>{children}</>;

  if (feature.locked) {
    return (
      <FeatureLocked
        feature={feature}
        billingHref={billingHref}
        currentPlan={data?.data?.currentPlan?.name}
      />
    );
  }

  return (
    <>
      {feature.lockReason === "limit_reached" && (
        <LimitBanner feature={feature} billingHref={billingHref} />
      )}
      {children}
    </>
  );
}

export function useStoreFeature(storeId: string, featureKey: string) {
  const { data, isLoading } = useGetStoreFeatureAccessQuery(storeId);
  const features = data?.data?.features ?? [];
  const feature = getFeatureByKey(features, featureKey);
  const access = data?.data;

  return {
    isLoading,
    feature,
    access,
    locked: feature?.locked ?? false,
    limitReached: feature?.type === "limit" && feature.limit > 0 && feature.current >= feature.limit,
    currentPlan: access?.currentPlan,
  };
}

export function useFeatureUpgradeModal(storeId: string, billingHref: string) {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { data } = useGetStoreFeatureAccessQuery(storeId);
  const feature = activeKey ? getFeatureByKey(data?.data?.features ?? [], activeKey) : null;

  return {
    open,
    feature,
    currentPlan: data?.data?.currentPlan?.name,
    billingHref,
    show: (key: string) => {
      setActiveKey(key);
      setOpen(true);
    },
    close: () => setOpen(false),
  };
}
