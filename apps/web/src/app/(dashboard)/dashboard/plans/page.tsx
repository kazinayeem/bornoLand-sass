"use client";

import { useState } from "react";
import { Loader2, Plus, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { PlanBuilder } from "@/components/admin/plans/plan-builder";
import { PlanFeatureMatrix } from "@/components/admin/plans/plan-feature-matrix";
import { useGetPlansQuery } from "@/redux/api/store-api";
import type { Plan } from "@/redux/api/store-api";

export default function PlansPage() {
  const { data: plansData, isLoading } = useGetPlansQuery();
  const plans = (plansData?.data?.plans ?? []) as Plan[];
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeView, setActiveView] = useState<"list" | "builder" | "matrix">("list");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  if (selectedPlan && activeView === "builder") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setSelectedPlan(null); setActiveView("list"); }}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
          >
            ← Back to Plans
          </button>
        </div>
        <PlanBuilder plan={selectedPlan} initialTab="features" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plans & Features"
        description="Manage subscription plans, feature toggles, and module entitlements for your platform."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView(activeView === "matrix" ? "list" : "matrix")}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <CreditCard className="h-4 w-4" />
              {activeView === "matrix" ? "Back to List" : "Compare Plans"}
            </button>
          </div>
        }
      />

      {activeView === "matrix" ? (
        <PlanFeatureMatrix plans={plans} />
      ) : (
        <>
          {/* Plan Cards */}
          {plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
              <CreditCard className="mx-auto h-10 w-10 text-zinc-300" />
              <h3 className="mt-3 text-lg font-semibold text-apple-ink">No plans yet</h3>
              <p className="mt-1 text-sm text-apple-ink-muted-48">Create your first subscription plan to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((plan) => (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => { setSelectedPlan(plan); setActiveView("builder"); }}
                    className={`group rounded-2xl border bg-white p-5 text-left transition-all hover:shadow-md ${
                      plan.isRecommended
                        ? "border-blue-200 ring-2 ring-blue-500/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-apple-ink">{plan.name}</h3>
                        <p className="mt-0.5 text-xs text-apple-ink-muted-48">/{plan.slug}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {plan.isRecommended && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            Popular
                          </span>
                        )}
                        {!plan.isActive && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-2xl font-bold text-apple-ink">
                        ৳{plan.priceBDT.toLocaleString()}
                      </span>
                      <span className="text-sm text-apple-ink-muted-48">/month</span>
                    </div>

                    {plan.description && (
                      <p className="mt-2 text-xs text-apple-ink-muted-48 line-clamp-2">{plan.description}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {plan.featureToggles?.hrm && (
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">HRM</span>
                      )}
                      {plan.featureToggles?.pos && (
                        <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">POS</span>
                      )}
                      {plan.featureToggles?.accounting && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Accounting</span>
                      )}
                      {plan.featureToggles?.crm && (
                        <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700">CRM</span>
                      )}
                      {plan.featureToggles?.inventory && (
                        <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">Inventory</span>
                      )}
                      {plan.featureToggles?.advancedAnalytics && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">Analytics</span>
                      )}
                      {plan.trialDays > 0 && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {plan.trialDays}d trial
                        </span>
                      )}
                    </div>

                    <div className="mt-4 text-xs font-medium text-apple-ink-muted-48 group-hover:text-blue-600 transition-colors">
                      Click to configure →
                    </div>
                  </button>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
