"use client";

import { useState, useMemo } from "react";
import { Loader2, Plus, CreditCard, Sparkles, CheckCircle2, Shield, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { PlanBuilder } from "@/components/admin/plans/plan-builder";
import { PlanFeatureMatrix } from "@/components/admin/plans/plan-feature-matrix";
import { useGetPlansQuery } from "@/redux/api/store-api";
import type { Plan } from "@/redux/api/store-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

export default function PlansPage() {
  const { data: plansData, isLoading, isError, refetch } = useGetPlansQuery();
  const rawPlans = (plansData?.data?.plans ?? []) as Plan[];
  const sortedPlans = useMemo(() => {
    return [...rawPlans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawPlans]);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeView, setActiveView] = useState<"list" | "builder" | "matrix">("list");

  const metrics = useMemo(() => {
    const active = sortedPlans.filter((p) => p.isActive).length;
    const recommended = sortedPlans.find((p) => p.isRecommended)?.name || "Standard";
    return { total: sortedPlans.length, active, recommended };
  }, [sortedPlans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#003399]" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load plans"
        message="Unable to fetch subscription plans. Please try again."
        onRetry={refetch}
      />
    );
  }

  if (selectedPlan && activeView === "builder") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPlan(null);
              setActiveView("list");
            }}
            className="gap-2 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Plans</span>
          </Button>
        </div>
        <PlanBuilder plan={selectedPlan} initialTab="features" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans & Features"
        description="Manage subscription tiers, feature toggles, and module entitlements across your workspaces and stores."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView(activeView === "matrix" ? "list" : "matrix")}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>{activeView === "matrix" ? "Back to Grid" : "Compare Plans"}</span>
            </Button>
          </div>
        }
      />

      {/* ── KPI Metric Cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Subscription Plans"
          value={metrics.total}
          subtitle="Available platform tiers"
          icon={CreditCard}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Active Plans"
          value={metrics.active}
          subtitle="Currently live for subscription"
          icon={CheckCircle2}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />

        <MetricCard
          title="Recommended Tier"
          value={metrics.recommended}
          subtitle="Featured plan for merchants"
          icon={Sparkles}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {activeView === "matrix" ? (
        <PlanFeatureMatrix plans={sortedPlans} />
      ) : (
        <>
          {sortedPlans.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No plans configured"
              description="Create your first subscription tier to enable merchant onboarding."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedPlans.map((plan) => (
                <div
                  key={plan._id}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setActiveView("builder");
                  }}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border bg-white p-5 text-left transition-all hover:shadow-md cursor-pointer dark:bg-zinc-900",
                    plan.isRecommended
                      ? "border-blue-300 ring-2 ring-blue-500/10 dark:border-blue-800"
                      : "border-zinc-200/90 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-400">/{plan.slug}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {plan.isRecommended && (
                          <Badge variant="primary">Popular</Badge>
                        )}
                        {!plan.isActive && (
                          <Badge variant="default">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                        ৳{plan.priceBDT.toLocaleString()}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400"> / month</span>
                    </div>

                    {plan.description && (
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {plan.featureToggles?.hrm && (
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                          HRM
                        </span>
                      )}
                      {plan.featureToggles?.pos && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          POS
                        </span>
                      )}
                      {plan.featureToggles?.accounting && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Accounting
                        </span>
                      )}
                      {plan.featureToggles?.crm && (
                        <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                          CRM
                        </span>
                      )}
                      {plan.featureToggles?.inventory && (
                        <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                          Inventory
                        </span>
                      )}
                      {plan.featureToggles?.advancedAnalytics && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          Analytics
                        </span>
                      )}
                      {plan.trialDays > 0 && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {plan.trialDays}d trial
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-zinc-100 pt-3 text-xs font-semibold text-[#003399] dark:border-zinc-800 dark:text-[#FFDA1A] group-hover:underline flex items-center justify-between">
                    <span>Configure Tier &amp; Limits</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
