"use client";

import { motion } from "framer-motion";
import { useGetAdminPaymentsQuery } from "@/redux/api/admin-api";
import { useGetPlansQuery } from "@/redux/api/store-api";
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { StatusBadge } from "@/components/admin/status-badge";

export default function AdminPaymentsPage() {
  const { data, isLoading } = useGetAdminPaymentsQuery();
  const { data: plansData } = useGetPlansQuery();

  const subscriptions = data?.data?.subscriptions ?? [];
  const totals = data?.data?.totals;
  const plans = plansData?.data?.plans ?? [];

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const summaryCards = [
    {
      icon: DollarSign,
      label: "All-Time Revenue",
      value: totals ? formatCurrency(totals.allTimeRevenue) : "—",
      sub: null,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      icon: CheckCircle,
      label: "Paid Orders",
      value: totals ? formatCurrency(totals.paid.total) : "—",
      sub: totals ? `${totals.paid.count} orders` : null,
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: Clock,
      label: "Pending Payments",
      value: totals ? formatCurrency(totals.pending.total) : "—",
      sub: totals ? `${totals.pending.count} pending` : null,
      color: "text-amber-600 bg-amber-50"
    },
    {
      icon: CreditCard,
      label: "Active Subscriptions",
      value: activeSubscriptions,
      sub: `${subscriptions.length} total`,
      color: "text-purple-600 bg-purple-50"
    }
  ];

  const getPlanName = (plan: unknown) => {
    if (typeof plan === "string") return plan;
    if (plan && typeof plan === "object") {
      const p = plan as Record<string, unknown>;
      if (p.name) return String(p.name);
      if (p.planId) return String(p.planId);
    }
    return "—";
  };

  const formatDate = (date: unknown) => {
    if (!date) return "—";
    try {
      return new Date(String(date)).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  const formatPeriod = (start: unknown, end: unknown) => {
    if (!start || !end) return "—";
    return `${formatDate(start)} — ${formatDate(end)}`;
  };

  const getTenantName = (sub: Record<string, unknown>) => {
    const tenantId = sub.tenantId;
    if (tenantId && typeof tenantId === "object") {
      const t = tenantId as Record<string, unknown>;
      return String(t.name ?? t.slug ?? "—");
    }
    return "—";
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Payments</h2>
        <p className="mt-1 text-sm text-zinc-500">{subscriptions.length} subscriptions on the platform</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <div className={`rounded-xl p-2 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">{card.value}</p>
            {card.sub && <p className="mt-0.5 text-xs text-zinc-500">{card.sub}</p>}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">All Subscriptions</h3>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {subscriptions.map((sub) => (
                  <tr key={String(sub._id ?? sub.id)} className="group transition-colors hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-zinc-900">{getTenantName(sub)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        {getPlanName(sub.plan)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={String(sub.status ?? "")} />
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-zinc-700">{String(sub.provider ?? "—")}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {formatPeriod(sub.currentPeriodStart, sub.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{formatDate(sub.createdAt)}</td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
