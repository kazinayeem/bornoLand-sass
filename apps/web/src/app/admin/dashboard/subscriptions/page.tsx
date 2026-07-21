"use client";

import { motion } from "framer-motion";
import {
  useGetPlatformSubscriptionRevenueQuery,
  useGetPlatformOverviewQuery,
  useGetAdminPaymentsQuery,
} from "@/redux/api/admin-api";
import {
  CheckCircle, Clock, CreditCard, AlertTriangle, Loader2,
  TrendingUp, TrendingDown, RefreshCw, DollarSign, Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatBDT } from "@/lib/format-bdt";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-zinc-100 text-apple-ink-muted-80",
  starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700",
  business: "bg-amber-50 text-amber-700",
  enterprise: "bg-rose-50 text-rose-700",
};

export default function SubscriptionsPage() {
  const { data: subData, isLoading: subLoading } = useGetPlatformSubscriptionRevenueQuery();
  const { data: ovData } = useGetPlatformOverviewQuery();
  const { data: paymentsData } = useGetAdminPaymentsQuery();

  const sub = subData?.data as Record<string, unknown> | undefined;
  const ov = ovData?.data as Record<string, unknown> | undefined;

  if (subLoading || !sub) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const plans = (sub.plans as Array<Record<string, unknown>>) ?? [];
  const revenue = ov?.revenue as Record<string, unknown> | undefined;
  const subscriptions = (paymentsData?.data as Record<string, unknown>)?.subscriptions as Array<Record<string, unknown>> ?? [];

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const trialCount = subscriptions.filter((s) => s.status === "trialing").length;
  const pastDueCount = subscriptions.filter((s) => s.status === "past_due").length;

  const statCards = [
    { label: "Total Subscribers", value: String(sub.totalSubscribers ?? 0), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Monthly Income", value: (sub.totalMonthlyRevenue as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Revenue", value: (sub.totalRevenueFromPaid as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Trial Conversion", value: `${String(sub.trialConversionRate ?? "0")}%`, icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Active", value: String(activeCount), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Trialing", value: String(trialCount), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Past Due", value: String(pastDueCount), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "MRR", value: (revenue?.mrr as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscription Revenue"
        description="All subscription financial data in ৳ BDT."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl ${card.bg} p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">{card.label}</p>
                <p className="mt-0.5 text-lg font-bold text-apple-ink">{String(card.value)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plan Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-1 text-lg font-semibold text-apple-ink">Plan Revenue Breakdown</h3>
        <p className="mb-4 text-sm text-apple-ink-muted-48">Revenue and subscriber counts by plan</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Price (৳)</th>
                <th className="px-4 py-3">Subscribers</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Trialing</th>
                <th className="px-4 py-3">Expired</th>
                <th className="px-4 py-3">Monthly Revenue (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {plans.map((plan) => {
                const monthlyRev = plan.monthlyRevenue as Record<string, unknown> ?? {};
                const monthlyAmt = typeof monthlyRev === "object" ? String((monthlyRev as Record<string, unknown>).formattedAmount ?? "৳ 0") : String(monthlyRev ?? "৳ 0");
                return (
                  <tr key={String(plan._id ?? "")} className="hover:bg-apple-canvas-parchment">
                    <td className="px-4 py-3 font-medium text-apple-ink">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${PLAN_COLORS[String(plan.slug ?? "")] ?? PLAN_COLORS.free}`}>
                        {String(plan.name ?? "")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-apple-ink-muted-80">{formatBDT(Number(plan.priceBDT ?? 0))}</td>
                    <td className="px-4 py-3 font-semibold text-apple-ink">{String(plan.subscribers ?? 0)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{String(plan.active ?? 0)}</td>
                    <td className="px-4 py-3 text-amber-600">{String(plan.trialing ?? 0)}</td>
                    <td className="px-4 py-3 text-red-500">{String(plan.expired ?? 0)}</td>
                    <td className="px-4 py-3 font-semibold text-apple-ink">{monthlyAmt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Trial & Conversion Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-apple-ink-muted-80">Trial Conversion</h4>
          <p className="mt-1 text-3xl font-bold text-apple-ink">{String(sub.trialConversionRate ?? "0")}%</p>
          <p className="text-xs text-apple-ink-muted-48">
            {String(sub.trialConverted ?? 0)} converted out of {String(sub.trialTotal ?? 0)} trials
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-apple-ink-muted-80">Renewal Rate</h4>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {Number(sub.totalSubscribers ?? 0) > 0 ? Math.round((activeCount / Math.max(Number(sub.totalSubscribers ?? 0), 1)) * 100) : 0}%
          </p>
          <p className="text-xs text-apple-ink-muted-48">Of total subscriptions</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-apple-ink-muted-80">Upgrade / Downgrade</h4>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-1 text-3xl font-bold text-blue-600">—</p>
          <p className="text-xs text-apple-ink-muted-48">Tracked via plan change events</p>
        </motion.div>
      </div>
    </div>
  );
}
