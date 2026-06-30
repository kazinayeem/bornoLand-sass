"use client";

import { useCurrentSubscription } from "@/features/session/hooks";

type RequireSubscriptionProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RequireSubscription({ children, fallback = null }: RequireSubscriptionProps) {
  const subscription = useCurrentSubscription();
  if (!subscription.storeId) return <>{fallback}</>;
  return <>{children}</>;
}
