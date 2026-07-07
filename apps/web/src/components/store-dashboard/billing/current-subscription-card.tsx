"use client";

import type { SubscriptionDashboardResponse } from "@/redux/api/subscription-api";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CreditCard, CalendarDays, Zap } from "lucide-react";

export function CurrentSubscriptionCard({
  subscription,
}: {
  subscription?: { store: SubscriptionDashboardResponse["store"]; plan: SubscriptionDashboardResponse["plan"] };
}) {
  const store = subscription?.store;
  const plan = subscription?.plan;

  if (!store || !plan) return null;

  const isTrial = store.subscriptionStatus === "trialing";
  const isExpired = store.billingStatus === "past_due" || store.billingStatus === "cancelled";

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Current Subscription</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your current plan and billing cycle.</p>
        </div>
        <div>
          {isTrial ? (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Trial Active</Badge>
          ) : isExpired ? (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 rounded-xl bg-zinc-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">{plan.name} Plan</h3>
            <p className="text-sm font-medium text-zinc-600">{plan.priceBDT} ৳ / month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:items-center sm:gap-8">
          <div>
            <p className="text-xs font-medium text-zinc-500">Billing Cycle</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">Monthly</p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Next Renewal</p>
            <div className="mt-1 flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-900">
                {store.trialEndsAt ? new Date(store.trialEndsAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-6">
        <div>
          <h4 className="text-sm font-medium text-zinc-900">Auto Renewal</h4>
          <p className="mt-1 text-sm text-zinc-500">Automatically renew your subscription at the end of the billing cycle.</p>
        </div>
        <Switch checked={true} onCheckedChange={() => {}} />
      </div>
    </div>
  );
}
