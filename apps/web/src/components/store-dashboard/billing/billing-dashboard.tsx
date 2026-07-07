"use client";

import { useState } from "react";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreDashboardStatsQuery, useGetStoreSubscriptionQuery } from "@/redux/api/subscription-api";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import { BillingOverviewCards } from "./billing-overview-cards";
import { CurrentSubscriptionCard } from "./current-subscription-card";
import { PlansList } from "./plans-list";
import { BillingUsageSection } from "./billing-usage-section";
import { InvoiceHistoryTable } from "./invoice-history-table";
import { PaymentHistoryTable } from "./payment-history-table";
import { PaymentsTab } from "@/components/workspace/payments-tab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "plans", label: "Plans" },
  { id: "payment-methods", label: "Payment Methods" },
  { id: "invoices", label: "Invoices" },
  { id: "history", label: "Payment History" },
  { id: "usage", label: "Usage Limits" },
];

export function BillingDashboard() {
  const { store, storeId, isLoading: isStoreLoading } = useStorePage();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: statsData, isLoading: isStatsLoading } = useGetStoreDashboardStatsQuery(storeId ?? "", {
    skip: !storeId,
  });

  const { data: subscriptionData, isLoading: isSubLoading } = useGetStoreSubscriptionQuery(storeId ?? "", {
    skip: !storeId,
  });

  if (isStoreLoading || isStatsLoading || isSubLoading || !store || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const sub = subscriptionData?.data?.store;
  const isExpired = sub?.billingStatus === "past_due" || sub?.billingStatus === "cancelled" || sub?.subscriptionStatus === "cancelled" || sub?.status === "expired";
  const isTrial = sub?.billingStatus === "trial" || sub?.subscriptionStatus === "trialing";

  let trialDaysLeft = 0;
  if (isTrial && sub?.trialEndsAt) {
    const endsAt = new Date(sub.trialEndsAt).getTime();
    const now = Date.now();
    trialDaysLeft = Math.max(0, Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-6">
      {/* Banners */}
      {isExpired && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Subscription Expired</h3>
              <p className="mt-1 text-sm text-red-700">Your store is currently in Read-Only Mode. Please renew your subscription to restore full access and publishing.</p>
            </div>
            <button
              onClick={() => setActiveTab("plans")}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
            >
              Renew Now
            </button>
          </div>
        </div>
      )}

      {isTrial && !isExpired && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-800">Trial Active</h3>
              <p className="mt-1 text-sm text-blue-700">
                Your free trial ends in <span className="font-semibold">{trialDaysLeft}</span> days. Upgrade now to keep your store online without interruption.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("plans")}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Billing & Subscription</h1>
        <p className="text-sm text-zinc-500">Manage your subscription, view payment history, and monitor limits.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="py-2">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <BillingOverviewCards stats={statsData?.data} subscription={subscriptionData?.data} />
            <CurrentSubscriptionCard subscription={subscriptionData?.data} />
          </div>
        )}
        {activeTab === "plans" && (
          <PlansList storeId={storeId} currentPlanId={sub?.plan} />
        )}
        {activeTab === "payment-methods" && (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Payment Methods</h2>
            <p className="text-sm text-zinc-500 mb-6">Manage how you receive payments from your customers.</p>
            <PaymentsTab storeId={storeId} />
          </div>
        )}
        {activeTab === "invoices" && (
          <InvoiceHistoryTable storeId={storeId} />
        )}
        {activeTab === "history" && (
          <PaymentHistoryTable storeId={storeId} />
        )}
        {activeTab === "usage" && (
          <BillingUsageSection stats={statsData?.data} />
        )}
      </div>
    </div>
  );
}
