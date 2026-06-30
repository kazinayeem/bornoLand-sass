"use client";

import { useCurrentPlan } from "@/features/session/hooks";

type RequirePlanProps = {
  children: React.ReactNode;
  plans?: string[];
  fallback?: React.ReactNode;
};

export function RequirePlan({ children, plans = [], fallback = null }: RequirePlanProps) {
  const currentPlan = useCurrentPlan();
  if (!plans.length) return <>{children}</>;
  const currentPlanName = typeof currentPlan?.name === "string" ? currentPlan.name : "";
  if (!currentPlanName || !plans.includes(currentPlanName)) return <>{fallback}</>;
  return <>{children}</>;
}
