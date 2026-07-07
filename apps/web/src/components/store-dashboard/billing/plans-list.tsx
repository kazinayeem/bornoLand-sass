"use client";

import { useState } from "react";
import { useGetPlansQuery } from "@/redux/api/store-api";
import { Loader2, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RenewSubscriptionModal } from "./renew-subscription-modal";

export function PlansList({ storeId, currentPlanId }: { storeId: string; currentPlanId?: string }) {
  const { data: plansData, isLoading } = useGetPlansQuery({ all: true });
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const plans = plansData?.data?.plans ?? [];
  const activePlans = plans.filter((p) => p.isActive);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold text-zinc-900">Choose the right plan for your store</h2>
        <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !isYearly ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isYearly ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Yearly <span className="ml-1 text-xs text-green-500">(Save up to 20%)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activePlans.map((plan) => {
          const isCurrent = plan._id === currentPlanId;
          const price = isYearly ? (plan.priceYearly ?? plan.priceBDT * 12 * 0.8) : plan.priceBDT;

          return (
            <div
              key={plan._id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md",
                plan.isRecommended ? "border-indigo-600 shadow-indigo-100" : "border-zinc-200/80"
              )}
            >
              {plan.isRecommended && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Recommended
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                <p className="mt-1 min-h-[40px] text-sm text-zinc-500">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-zinc-900">৳{price.toLocaleString()}</span>
                <span className="text-sm font-medium text-zinc-500">/{isYearly ? "yr" : "mo"}</span>
              </div>

              <button
                disabled={isCurrent}
                onClick={() => setSelectedPlanId(plan._id)}
                className={cn(
                  "mb-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                  isCurrent
                    ? "bg-zinc-100 text-zinc-500"
                    : plan.isRecommended
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                {isCurrent ? "Current Plan" : "Select Plan"}
              </button>

              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-medium text-zinc-900">Core Features</h4>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                    <span>{plan.limits.products === -1 ? "Unlimited" : plan.limits.products.toLocaleString()} Products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                    <span>{plan.limits.orders === -1 ? "Unlimited" : plan.limits.orders.toLocaleString()} Orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                    <span>{plan.limits.staff === -1 ? "Unlimited" : plan.limits.staff.toLocaleString()} Staff Accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                    <span>{plan.limits.storage === -1 ? "Unlimited" : plan.limits.storage.toLocaleString()} MB Storage</span>
                  </li>
                  {plan.featureToggles.customDomain && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                      <span>Custom Domain</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlanId && (
        <RenewSubscriptionModal
          storeId={storeId}
          planId={selectedPlanId}
          isYearly={isYearly}
          onClose={() => setSelectedPlanId(null)}
        />
      )}
    </div>
  );
}
