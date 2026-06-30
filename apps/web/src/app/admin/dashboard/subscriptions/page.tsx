"use client";

import { useState } from "react";
import { CheckCircle, Clock, CreditCard, AlertTriangle, Loader2 } from "lucide-react";
import { useGetAdminPaymentsQuery } from "@/redux/api/admin-api";
import { useGetPlansQuery } from "@/redux/api/store-api";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { StatCard } from "@/components/admin/stat-card";

export default function SubscriptionsPage() {
  const { data, isLoading } = useGetAdminPaymentsQuery();
  const { data: plansData } = useGetPlansQuery({ all: true });
  const subscriptions = data?.data?.subscriptions ?? [];
  const plans = plansData?.data?.plans ?? [];
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = subscriptions.filter((s) =>
    statusFilter === "all" ? true : String(s.status) === statusFilter
  );

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const trialCount = subscriptions.filter((s) => s.status === "trialing").length;

  const getPlanName = (plan: unknown) => {
    if (typeof plan === "string") return plans.find((p) => p._id === plan)?.name ?? plan;
    if (plan && typeof plan === "object") {
      const p = plan as Record<string, unknown>;
      if (p.name) return String(p.name);
    }
    return "—";
  };

  const getTenantName = (sub: Record<string, unknown>) => {
    const tenantId = sub.tenantId;
    if (tenantId && typeof tenantId === "object") {
      const t = tenantId as Record<string, unknown>;
      return String(t.name ?? t.slug ?? "—");
    }
    return "—";
  };

  const formatDate = (date: unknown) => {
    if (!date) return "—";
    return new Date(String(date)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscriptions"
        description="Monitor active subscriptions, trials, and renewals across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={subscriptions.length} icon={CreditCard} variant="blue" />
        <StatCard title="Active" value={activeCount} icon={CheckCircle} variant="green" />
        <StatCard title="Trialing" value={trialCount} icon={Clock} variant="amber" />
        <StatCard
          title="Past due"
          value={subscriptions.filter((s) => s.status === "past_due").length}
          icon={AlertTriangle}
          variant="default"
        />
      </div>

      <AdminTabs
        tabs={[
          { id: "all", label: "All", count: subscriptions.length },
          { id: "active", label: "Active", count: activeCount },
          { id: "trialing", label: "Trial", count: trialCount },
          { id: "past_due", label: "Past due" },
          { id: "cancelled", label: "Cancelled" },
        ]}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Workspace</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Period end</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => (
              <tr key={String(sub._id ?? sub.id)} className="border-t border-zinc-100 hover:bg-zinc-50/50">
                <td className="px-4 py-3 font-medium text-zinc-900">{getTenantName(sub)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                    {getPlanName(sub.plan)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={String(sub.status ?? "")} />
                </td>
                <td className="px-4 py-3 capitalize text-zinc-600">{String(sub.provider ?? "—")}</td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(sub.currentPeriodEnd)}</td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(sub.createdAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  No subscriptions match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
