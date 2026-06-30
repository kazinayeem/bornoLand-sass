import type { AdminStore } from "@/redux/api/admin-api";
import type { Plan } from "@/redux/api/store-api";

export type PlanStats = {
  subscribers: number;
  revenueBDT: number;
};

export function resolveStorePlanId(store: AdminStore): string | null {
  if (!store.planId) return null;
  if (typeof store.planId === "string") return store.planId;
  if (typeof store.planId === "object" && store.planId !== null && "_id" in store.planId) {
    return String((store.planId as { _id: string })._id);
  }
  return null;
}

export function getPlanStats(plan: Plan, stores: AdminStore[]): PlanStats {
  const matched = stores.filter((store) => {
    const planId = resolveStorePlanId(store);
    if (planId && planId === plan._id) return true;
    return store.plan === plan.slug || store.plan === plan.name;
  });

  return {
    subscribers: matched.length,
    revenueBDT: matched.reduce((sum, s) => sum + (s.revenueBDT ?? 0), 0),
  };
}

export function getAllPlanStats(plans: Plan[], stores: AdminStore[]) {
  return new Map(plans.map((plan) => [plan._id, getPlanStats(plan, stores)]));
}
