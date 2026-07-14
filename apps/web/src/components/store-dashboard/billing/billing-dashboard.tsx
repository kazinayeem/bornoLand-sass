"use client";

import { useState } from "react";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreDashboardStatsQuery, useGetStoreSubscriptionQuery } from "@/redux/api/subscription-api";
import { useGetPlansQuery } from "@/redux/api/store-api";
import { Loader2, AlertCircle, Clock, RefreshCcw, CreditCard, FileText, History, Sliders, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveStoreStatus, formatBDT } from "@/lib/store-status";

import { BillingOverviewCards } from "./billing-overview-cards";
import { PaymentHistoryTable } from "./payment-history-table";
import { InvoiceHistoryTable } from "./invoice-history-table";
import { BillingUsageSection } from "./billing-usage-section";
import { PaymentSubmissionFlow } from "./payment-submission-flow";
import { RenewalFlow } from "./renewal-flow";

const TABS = [
  { id: "overview", label: "Overview", icon: CreditCard },
  { id: "plans", label: "Plans & Pricing", icon: Wallet },
  { id: "payment", label: "Pay Now", icon: CreditCard },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "history", label: "Payment History", icon: History },
  { id: "usage", label: "Usage Limits", icon: Sliders },
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

  const { data: plansData } = useGetPlansQuery();

  if (isStoreLoading || isStatsLoading || isSubLoading || !store || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const sub = subscriptionData?.data?.store;
  const subPlan = subscriptionData?.data?.plan;
  const status = sub ? resolveStoreStatus(sub as any) : "active";
  const plans = plansData?.data?.plans ?? [];

  const isExpired = status === "expired" || status === "suspended";
  const isTrial = status === "trial";
  const isPending = status === "pending_payment" || status === "pending_approval";

  let trialDaysLeft = 0;
  if (isTrial && sub?.trialEndsAt) {
    trialDaysLeft = Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const latestPayment = statsData?.data?.usage?.find((u) => u.key === "orders");
  const pendingPayment = false;

  return (
    <div className="space-y-6">
      {/* Status Banners */}
      {isExpired && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-800">Subscription {status === "suspended" ? "Suspended" : "Expired"}</h3>
              <p className="text-sm text-red-700 mt-0.5">
                Your store is in read-only mode. You can view data and export, but cannot create products, upload media, or edit settings. Renew now to restore full access.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("payment")}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Renew Now
            </button>
          </div>
        </div>
      )}

      {isTrial && !isExpired && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-blue-800">Trial Active</h3>
              <p className="text-sm text-blue-700 mt-0.5">
                Your free trial ends in <strong>{trialDaysLeft} days</strong>. Upgrade to keep your store online without interruption.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("payment")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {isPending && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-amber-800">Pending Approval</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                Your payment is awaiting admin review. Estimated time: 2-24 hours. You will be notified once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Billing & Subscription</h1>
        <p className="text-sm text-zinc-500">Manage your subscription, payments, invoices, and usage limits.</p>
      </div>

      {/* Quick Stats Bar */}
      {sub && subPlan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Plan", value: subPlan.name || "Free", color: "text-zinc-900" },
            { label: "Status", value: status.replace("_", " "), color: isExpired ? "text-red-600" : isPending ? "text-amber-600" : "text-emerald-600" },
            { label: "Price", value: subPlan.priceBDT ? formatBDT(subPlan.priceBDT) : "Free", color: "text-zinc-900" },
            { label: "Renewal", value: sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", color: "text-zinc-900" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm">
              <p className="text-xs font-medium text-zinc-500">{item.label}</p>
              <p className={`text-base font-bold mt-0.5 capitalize ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors inline-flex items-center gap-2",
                  activeTab === tab.id
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="py-2">
        {activeTab === "overview" && (
          <BillingOverviewCards stats={statsData?.data} subscription={subscriptionData?.data} />
        )}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-900">Plans & Pricing</h2>
              <p className="text-sm text-zinc-500 mt-1">Choose a plan upgrade or switch billing cycle</p>
            </div>
            <RenewalFlow
              storeId={storeId}
              storeName={store?.name || ""}
              currentPlanId={sub?.plan || subPlan?._id}
              currentExpireDate={sub?.trialEndsAt || sub?.renewalDate}
              onClose={() => setActiveTab("overview")}
            />
          </div>
        )}
        {activeTab === "payment" && (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <PaymentSubmissionFlow
              storeId={storeId}
              plans={plans}
              onClose={() => setActiveTab("overview")}
            />
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
