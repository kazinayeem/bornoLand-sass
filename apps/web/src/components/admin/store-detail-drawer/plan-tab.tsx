"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import type { TabHelpers } from "./types";

const PLAN_OPTIONS = ["free", "starter", "growth", "business", "enterprise", "custom"] as const;

export function PlanTab({ helpers }: { helpers: TabHelpers }) {
  const { store, plans, changePlan, markDirty } = helpers;
  const [selectedPlanId, setSelectedPlanId] = useState(helpers.localPlanId ?? (store?._id ? "" : ""));
  const [changing, setChanging] = useState(false);

  const currentPlanName = store
    ? typeof store.planId === "object" && store.planId
      ? (store.planId as { name?: string }).name
      : store.plan ?? "—"
    : "—";

  const handleApply = async () => {
    if (!selectedPlanId || !store) return;
    setChanging(true);
    try {
      await changePlan(selectedPlanId);
      helpers.setLocalPlanId(selectedPlanId);
      toast.success("Plan changed successfully");
    } catch {
      toast.error("Failed to change plan");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold text-apple-ink-muted-80">Current Plan</h3>
        <p className="mt-1 text-2xl font-bold text-apple-ink">{currentPlanName}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Change Plan</h4>
        <p className="mt-1 text-xs text-apple-ink-muted-48">
          Select a new plan for this store. The change takes effect immediately.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const isActive = selectedPlanId === plan._id;
            return (
              <button
                key={plan._id}
                onClick={() => {
                  setSelectedPlanId(plan._id);
                  markDirty();
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-50/50 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <p className="font-semibold text-apple-ink">{plan.name}</p>
                <p className="mt-1 text-sm text-apple-ink-muted-48">
                  ${plan.priceBDT ?? 0}/mo
                </p>
                {isActive && (
                  <div className="mt-2">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Selected
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <LoadingButton
          className="mt-4"
          loading={changing}
          onClick={handleApply}
          disabled={!selectedPlanId || selectedPlanId === helpers.localPlanId}
        >
          Apply Plan
        </LoadingButton>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-apple-ink-muted-80">
        <strong className="text-zinc-800">Note:</strong> Changing the plan updates both the store record and the
        override. Overrides with specific limits/features will still take priority over plan defaults.
      </div>
    </div>
  );
}
