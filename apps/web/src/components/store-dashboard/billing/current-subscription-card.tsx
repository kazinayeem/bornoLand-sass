"use client";

import type { SubscriptionDashboardResponse } from "@/redux/api/subscription-api";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CalendarDays, Zap, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DURATION_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Semi-Annual",
  yearly: "Annual",
  lifetime: "Lifetime",
};

export function CurrentSubscriptionCard({
  subscription,
}: {
  subscription?: { store: SubscriptionDashboardResponse["store"]; plan: SubscriptionDashboardResponse["plan"] };
}) {
  const store = subscription?.store;
  const plan = subscription?.plan;
  const [autoRenew, setAutoRenew] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`auto_renew_${store?.slug}`);
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    if (store?.slug) {
      localStorage.setItem(`auto_renew_${store.slug}`, String(autoRenew));
    }
  }, [autoRenew, store?.slug]);

  if (!store || !plan) return null;

  const isTrial = store.subscriptionStatus === "trialing";
  const isExpired = store.billingStatus === "past_due" || store.billingStatus === "cancelled";
  const isActive = store.billingStatus === "active";

  const renewalDate = store.renewalDate || store.trialEndsAt;
  const daysRemaining = renewalDate
    ? Math.max(0, Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const billingCycle = store.subscriptionDuration || "monthly";

  return (
    <div className="rounded-2xl border border-apple-hairline bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-apple-ink">Current Subscription</h2>
          <p className="mt-1 text-sm text-apple-ink-muted-48">Manage your current plan and billing cycle.</p>
        </div>
        <div className="flex items-center gap-2">
          {isTrial ? (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Trial Active</Badge>
          ) : isExpired ? (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
          ) : isActive ? (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
          ) : (
            <Badge className="bg-zinc-100 text-zinc-800 hover:bg-apple-canvas-parchment">{store.billingStatus || "Unknown"}</Badge>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 rounded-xl bg-apple-canvas-parchment p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-apple-ink">{plan.name} Plan</h3>
            <p className="text-sm font-medium text-apple-ink-muted-80">
              {plan.priceBDT ? `${plan.priceBDT.toLocaleString()} ৳ / ${DURATION_LABELS[billingCycle]?.toLowerCase() || "month"}` : "Free"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:items-center sm:gap-8">
          <div>
            <p className="text-xs font-medium text-apple-ink-muted-48">Billing Cycle</p>
            <p className="mt-1 text-sm font-semibold text-apple-ink">{DURATION_LABELS[billingCycle] || "Monthly"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-apple-ink-muted-48">Next Renewal</p>
            <div className="mt-1 flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-apple-ink-muted-48" />
              <p className="text-sm font-semibold text-apple-ink">
                {renewalDate
                  ? new Date(renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>
          {daysRemaining !== null && (
            <div>
              <p className="text-xs font-medium text-apple-ink-muted-48">Days Remaining</p>
              <p className={cn(
                "mt-1 text-sm font-semibold",
                daysRemaining <= 7 ? "text-red-600" : daysRemaining <= 30 ? "text-amber-600" : "text-emerald-600"
              )}>
                {daysRemaining} days
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-6">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="text-sm font-medium text-apple-ink">Auto Renewal</h4>
            <p className="mt-1 text-sm text-apple-ink-muted-48">Automatically renew your subscription at the end of the billing cycle.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setAutoRenew(!autoRenew);
            toast.success(autoRenew ? "Auto-renewal disabled" : "Auto-renewal enabled");
          }}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
            autoRenew ? "bg-indigo-600" : "bg-zinc-200"
          )}
          role="switch"
          aria-checked={autoRenew}
          aria-label="Toggle auto-renewal"
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              autoRenew ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}
