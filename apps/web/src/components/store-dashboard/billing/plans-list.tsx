"use client";

import { useState } from "react";
import { useGetPlansQuery } from "@/redux/api/store-api";
import type { Plan } from "@/redux/api/store-api";
import { Loader2, CheckCircle2, Star, ArrowUp, ArrowDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RenewSubscriptionModal } from "./renew-subscription-modal";

// ─── Comparison row definitions ─────────────────────────────────────────────

type ComparisonRow = {
  label: string;
  category: "pricing" | "limits" | "features";
  getValue: (plan: Plan, isYearly: boolean) => string | number | boolean;
  format: "currency" | "number" | "boolean";
};

const COMPARISON_ROWS: ComparisonRow[] = [
  // Pricing
  {
    label: "Monthly Price",
    category: "pricing",
    getValue: (p) => p.pricing?.monthly || p.priceBDT || 0,
    format: "currency",
  },
  {
    label: "Yearly Price",
    category: "pricing",
    getValue: (p) => p.pricing?.yearly || p.priceYearly || (p.priceBDT || 0) * 12,
    format: "currency",
  },
  // Limits
  {
    label: "Storage",
    category: "limits",
    getValue: (p) => p.limits?.storage ?? 0,
    format: "number",
  },
  {
    label: "Products",
    category: "limits",
    getValue: (p) => p.limits?.products ?? 0,
    format: "number",
  },
  {
    label: "Product Variants",
    category: "limits",
    getValue: (p) => p.limits?.productVariants ?? 0,
    format: "number",
  },
  {
    label: "Orders",
    category: "limits",
    getValue: (p) => p.limits?.orders ?? 0,
    format: "number",
  },
  {
    label: "Customers",
    category: "limits",
    getValue: (p) => p.limits?.customers ?? 0,
    format: "number",
  },
  {
    label: "Staff",
    category: "limits",
    getValue: (p) => p.limits?.staff ?? 0,
    format: "number",
  },
  {
    label: "Media Uploads",
    category: "limits",
    getValue: (p) => p.limits?.mediaUploads ?? 0,
    format: "number",
  },
  {
    label: "Custom Domains",
    category: "limits",
    getValue: (p) => p.limits?.customDomains ?? 0,
    format: "number",
  },
  // Features
  {
    label: "Custom Domain",
    category: "features",
    getValue: (p) => p.featureToggles?.customDomain ?? false,
    format: "boolean",
  },
  {
    label: "API Access",
    category: "features",
    getValue: (p) => p.featureToggles?.apiAccess ?? false,
    format: "boolean",
  },
  {
    label: "Analytics",
    category: "features",
    getValue: (p) => p.featureToggles?.advancedAnalytics ?? false,
    format: "boolean",
  },
  {
    label: "Priority Support",
    category: "features",
    getValue: (p) => p.prioritySupport ?? false,
    format: "boolean",
  },
  {
    label: "SEO Tools",
    category: "features",
    getValue: (p) => p.featureToggles?.seo ?? false,
    format: "boolean",
  },
  {
    label: "Blog & CMS",
    category: "features",
    getValue: (p) => (p.featureToggles?.blog ?? false) || (p.featureToggles?.cms ?? false),
    format: "boolean",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLimitValue(value: number, label: string): string {
  if (value === -1) return "Unlimited";
  if (value === 0) return "—";
  if (label === "Storage") return `${value.toLocaleString()} MB`;
  return value.toLocaleString();
}

function getDiffClass(
  current: number | boolean,
  compare: number | boolean,
  format: "currency" | "number" | "boolean"
): string {
  if (format === "boolean") {
    if (compare === true && current === false) return "text-emerald-600 font-semibold";
    if (compare === false && current === true) return "text-zinc-400";
    return "";
  }
  const c = Number(current);
  const v = Number(compare);
  // For pricing, lower is better (but we highlight the *plan's* advantage, so skip pricing diff)
  if (c === v) return "";
  if (v > c) return "text-emerald-600 font-semibold";
  if (v < c && v >= 0) return "text-zinc-400";
  return "";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PlansList({ storeId, currentPlanId }: { storeId: string; currentPlanId?: string }) {
  const { data: plansData, isLoading } = useGetPlansQuery();
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
  const currentPlan = activePlans.find((p) => p._id === currentPlanId);
  const currentSortOrder = currentPlan?.sortOrder ?? -1;

  function getButtonState(plan: Plan): "current" | "upgrade" | "downgrade" {
    if (plan._id === currentPlanId) return "current";
    const planSort = plan.sortOrder ?? 0;
    if (currentSortOrder < 0) return "upgrade"; // No current plan → everything is upgrade
    return planSort > currentSortOrder ? "upgrade" : "downgrade";
  }

  return (
    <div className="space-y-8">
      {/* Header & Toggle */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold text-zinc-900">Choose the right plan for your store</h2>
        <p className="max-w-lg text-center text-sm text-zinc-500">
          Compare all plans side by side. Pick the one that matches your store&apos;s needs.
        </p>
        <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              !isYearly ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              isYearly ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Yearly <span className="ml-1 text-xs text-emerald-500">(Save up to 20%)</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activePlans.map((plan) => {
          const isCurrent = plan._id === currentPlanId;
          const buttonState = getButtonState(plan);
          const price = isYearly
            ? (plan.pricing?.yearly || plan.priceYearly || (plan.priceBDT || 0) * 12 * 0.8)
            : (plan.pricing?.monthly || plan.priceBDT || 0);

          return (
            <div
              key={plan._id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md",
                isCurrent
                  ? "border-emerald-500 bg-emerald-50/40 shadow-emerald-100 ring-1 ring-emerald-500/20"
                  : plan.isRecommended
                  ? "border-indigo-500 shadow-indigo-100 ring-1 ring-indigo-500/20"
                  : "border-zinc-200/80"
              )}
            >
              {/* Top Badges */}
              <div className="mb-4 flex items-center gap-2">
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Current Plan
                  </span>
                )}
                {plan.isRecommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                    <Star className="h-3 w-3 fill-current" />
                    Recommended
                  </span>
                )}
              </div>

              {/* Plan Name & Description */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                <p className="mt-1 min-h-[40px] text-sm text-zinc-500">{plan.description || "—"}</p>
              </div>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-zinc-900">
                  ৳{(price || 0).toLocaleString()}
                </span>
                <span className="text-sm font-medium text-zinc-500">/{isYearly ? "yr" : "mo"}</span>
              </div>

              {/* Action Button */}
              <button
                disabled={isCurrent}
                onClick={() => setSelectedPlanId(plan._id)}
                className={cn(
                  "mb-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                  buttonState === "current"
                    ? "cursor-default bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : buttonState === "upgrade"
                    ? plan.isRecommended
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                )}
              >
                {buttonState === "current" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    You are currently using this plan
                  </>
                ) : buttonState === "upgrade" ? (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    Upgrade
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4" />
                    Downgrade
                  </>
                )}
              </button>

              {/* Comparison Rows */}
              <div className="flex-1 space-y-0 divide-y divide-zinc-100">
                {/* Category headers + rows */}
                {(["pricing", "limits", "features"] as const).map((category) => {
                  const rows = COMPARISON_ROWS.filter((r) => r.category === category);
                  return (
                    <div key={category}>
                      <h4 className="py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {category === "pricing" ? "Pricing" : category === "limits" ? "Limits & Quotas" : "Features"}
                      </h4>
                      {rows.map((row) => {
                        const value = row.getValue(plan, isYearly);
                        const currentValue = currentPlan ? row.getValue(currentPlan, isYearly) : undefined;
                        const diffClass =
                          !isCurrent && currentValue !== undefined && row.category === "limits"
                            ? getDiffClass(currentValue, value, row.format)
                            : "";

                        return (
                          <div
                            key={row.label}
                            className={cn(
                              "flex items-center justify-between py-2 text-sm",
                              diffClass ? diffClass : ""
                            )}
                          >
                            <span className="text-zinc-600">{row.label}</span>
                            <span className={cn("font-medium", diffClass || "text-zinc-900")}>
                              {row.format === "boolean" ? (
                                value ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <X className="h-4 w-4 text-zinc-300" />
                                )
                              ) : row.format === "currency" ? (
                                `৳${(Number(value) || 0).toLocaleString()}`
                              ) : (
                                formatLimitValue(Number(value), row.label)
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Modal */}
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
