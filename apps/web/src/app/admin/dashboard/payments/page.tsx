"use client";

import { motion } from "framer-motion";
import {
  useGetPlatformPaymentDashboardQuery,
  useGetPlatformOverviewQuery,
} from "@/redux/api/admin-api";
import {
  Loader2, DollarSign, TrendingUp, AlertTriangle, Ban,
  CheckCircle, Clock, CreditCard, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatBDT } from "@/lib/format-bdt";

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

export default function PaymentsPage() {
  const { data: payData, isLoading } = useGetPlatformPaymentDashboardQuery();
  const { data: ovData } = useGetPlatformOverviewQuery();

  const pay = payData?.data as Record<string, unknown> | undefined;

  if (isLoading || !pay) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const byMethod = (pay.byMethod as Array<Record<string, unknown>>) ?? [];
  const pending = pay.pending as Record<string, unknown> ?? {};
  const refunds = pay.refunds as Record<string, unknown> ?? {};
  const failed = pay.failed as Record<string, unknown> ?? {};

  const statCards = [
    { label: "Today's Collection", value: (pay.todayCollection as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Monthly Collection", value: (pay.monthlyCollection as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Payments", value: (pending.formattedAmount as string) ?? "৳ 0", sub: `${String(pending.count ?? 0)} orders`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Refunds", value: (refunds.formattedAmount as string) ?? "৳ 0", sub: `${String(refunds.count ?? 0)} refunds`, icon: ArrowDownRight, color: "text-red-600", bg: "bg-red-50" },
    { label: "Failed Payments", value: (failed.formattedAmount as string) ?? "৳ 0", sub: `${String(failed.count ?? 0)} failed`, icon: Ban, color: "text-zinc-600", bg: "bg-zinc-50" },
    { label: "Today's Orders", value: String(pay.todayOrders ?? 0), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment Dashboard"
        description="All payment data in ৳ BDT."
      />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className={`inline-flex rounded-xl ${card.bg} p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-2 text-lg font-bold text-zinc-900">{String(card.value)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{card.label}</p>
            {card.sub && <p className="text-xs text-zinc-400">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Payment Methods Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-1 text-lg font-semibold text-zinc-900">Payment Methods</h3>
        <p className="mb-4 text-sm text-zinc-500">Revenue breakdown by payment method in ৳</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
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
                  <tr key={method} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: METHOD_COLORS[method] ?? "#a1a1aa" }} />
                        <span className="font-medium text-zinc-900">{label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {(rev as Record<string, unknown>).formattedAmount as string ?? "৳ 0"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{String(m.totalOrders ?? 0)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{String(m.paidOrders ?? 0)}</td>
                    <td className="px-4 py-3 text-amber-600">{String(m.pendingOrders ?? 0)}</td>
                    <td className="px-4 py-3 text-red-500">{String(m.failedOrders ?? 0)}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {(refundAmt as Record<string, unknown>).formattedAmount as string ?? "৳ 0"}
                    </td>
                  </tr>
                );
              })}
              {byMethod.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-400">No payment data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-zinc-700">Today</h4>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{(pay.todayCollection as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</p>
          <p className="text-xs text-zinc-500">{String(pay.todayOrders ?? 0)} orders</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-zinc-700">This Month</h4>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{(pay.monthlyCollection as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</p>
          <p className="text-xs text-zinc-500">{String(pay.monthlyOrders ?? 0)} orders</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
          <h4 className="text-sm font-semibold text-amber-700">Pending</h4>
          <p className="mt-1 text-2xl font-bold text-amber-600">{(pending.formattedAmount as string) ?? "৳ 0"}</p>
          <p className="text-xs text-amber-500">{String(pending.count ?? 0)} unpaid orders</p>
        </div>
      </motion.div>
    </div>
  );
}
