"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetPlatformPaymentDashboardQuery,
  useGetPlatformOverviewQuery,
} from "@/redux/api/admin-api";
import {
  Loader2, DollarSign, TrendingUp, AlertTriangle, Ban,
  CheckCircle, Clock, CreditCard, ArrowUpRight, ArrowDownRight,
  Search, ShieldCheck, Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentReviewTable } from "@/components/admin/payment-review/payment-review-table";
import { formatBDT } from "@/lib/format-bdt";
import { cn } from "@/lib/utils";

const METHOD_LABELS: Record<string, string> = {
  sslcommerz: "SSLCommerz", bkash: "bKash", nagad: "Nagad",
  rocket: "Rocket", stripe: "Stripe", manual: "Manual",
  bank_transfer: "Bank Transfer", cash: "Cash", cod: "Cash on Delivery",
};

const METHOD_COLORS: Record<string, string> = {
  sslcommerz: "#e11d48", bkash: "#e2136e", nagad: "#e97306",
  rocket: "#1d4ed8", stripe: "#635bff", manual: "#52525b",
  bank_transfer: "#15803d", cash: "#65a30d", cod: "#65a30d",
};

const TABS = [
  { id: "overview", label: "Dashboard", icon: DollarSign },
  { id: "review", label: "Subscription Payments", icon: ShieldCheck },
  { id: "methods", label: "Payment Methods", icon: Wallet },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("review");
  const { data: payData, isLoading } = useGetPlatformPaymentDashboardQuery();
  const { data: ovData } = useGetPlatformOverviewQuery();

  const pay = payData?.data as Record<string, unknown> | undefined;

  const byMethod = (pay?.byMethod as Array<Record<string, unknown>>) ?? [];
  const pending = pay?.pending as Record<string, unknown> ?? {};
  const refunds = pay?.refunds as Record<string, unknown> ?? {};
  const failed = pay?.failed as Record<string, unknown> ?? {};

  const statCards = [
    { label: "Today's Collection", value: (pay?.todayCollection as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Monthly Collection", value: (pay?.monthlyCollection as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Payments", value: (pending.formattedAmount as string) ?? "৳ 0", sub: `${String(pending.count ?? 0)} orders`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Refunds", value: (refunds.formattedAmount as string) ?? "৳ 0", sub: `${String(refunds.count ?? 0)} refunds`, icon: ArrowDownRight, color: "text-red-600", bg: "bg-red-50" },
    { label: "Failed Payments", value: (failed.formattedAmount as string) ?? "৳ 0", sub: `${String(failed.count ?? 0)} failed`, icon: Ban, color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
    { label: "Today's Orders", value: String(pay?.todayOrders ?? 0), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Manage payment overview, review subscription payments, and configure payment methods."
      />

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors inline-flex items-center gap-2",
                  activeTab === tab.id
                    ? "border-zinc-900 text-apple-ink"
                    : "border-transparent text-apple-ink-muted-48 hover:border-zinc-300 hover:text-apple-ink-muted-80"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {statCards.map((card, i) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className={`inline-flex rounded-xl ${card.bg} p-2.5 ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-lg font-bold text-apple-ink">{String(card.value)}</p>
                    <p className="text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">{card.label}</p>
                    {card.sub && <p className="text-xs text-apple-ink-muted-48">{card.sub}</p>}
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h3 className="mb-1 text-lg font-semibold text-apple-ink">Payment Methods</h3>
                <p className="mb-4 text-sm text-apple-ink-muted-48">Revenue breakdown by payment method in ৳</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Total Revenue (৳)</th>
                        <th className="px-4 py-3">Orders</th>
                        <th className="px-4 py-3">Paid</th>
                        <th className="px-4 py-3">Pending</th>
                        <th className="px-4 py-3">Failed</th>
                        <th className="px-4 py-3">Refunded (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {byMethod.map((m) => {
                        const method = String(m.method ?? "").toLowerCase();
                        const label = METHOD_LABELS[method] ?? method;
                        const rev = m.totalRevenue as Record<string, unknown> ?? {};
                        const refundAmt = m.refundedAmount as Record<string, unknown> ?? {};
                        return (
                          <tr key={method} className="hover:bg-apple-canvas-parchment">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: METHOD_COLORS[method] ?? "#a1a1aa" }} />
                                <span className="font-medium text-apple-ink">{label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-apple-ink">{(rev as Record<string, unknown>).formattedAmount as string ?? "৳ 0"}</td>
                            <td className="px-4 py-3 text-apple-ink-muted-80">{String(m.totalOrders ?? 0)}</td>
                            <td className="px-4 py-3 text-emerald-600 font-medium">{String(m.paidOrders ?? 0)}</td>
                            <td className="px-4 py-3 text-amber-600">{String(m.pendingOrders ?? 0)}</td>
                            <td className="px-4 py-3 text-red-500">{String(m.failedOrders ?? 0)}</td>
                            <td className="px-4 py-3 text-apple-ink-muted-48">{(refundAmt as Record<string, unknown>).formattedAmount as string ?? "৳ 0"}</td>
                          </tr>
                        );
                      })}
                      {byMethod.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-12 text-center text-apple-ink-muted-48">No payment data yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}

      {activeTab === "review" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-apple-ink">Subscription Payment Approvals</h2>
              <p className="text-sm text-apple-ink-muted-48">Review, approve, or reject manual subscription payments.</p>
            </div>
          </div>
          <PaymentReviewTable />
        </div>
      )}

      {activeTab === "methods" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-apple-ink mb-1">Platform Payment Methods</h2>
          <p className="text-sm text-apple-ink-muted-48 mb-6">Configure payment gateway details that users see when submitting manual payments.</p>
          <PaymentMethodsPanel />
        </div>
      )}
    </div>
  );
}

function PaymentMethodsPanel() {
  const { data, isLoading } = useGetPlatformPaymentDashboardQuery();
  const methods = ((data?.data as Record<string, unknown>)?.methods as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {["bkash", "nagad", "rocket", "bank"].map((type) => (
        <div key={type} className="rounded-2xl border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-apple-ink capitalize mb-2">{type}</h3>
          <p className="text-sm text-apple-ink-muted-48">Account: {type === "bank" ? "Bank Name" : "Merchant Number"}</p>
          <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">Configure →</button>
        </div>
      ))}
    </div>
  );
}
