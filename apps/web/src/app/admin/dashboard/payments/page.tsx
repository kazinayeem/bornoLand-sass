"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGetAdminPaymentsQuery } from "@/redux/api/admin-api";
import { useGetPlansQuery } from "@/redux/api/store-api";
import {
  useGetAdminSubscriptionPaymentsQuery,
  useApproveSubscriptionPaymentMutation,
  useRejectSubscriptionPaymentMutation,
} from "@/redux/api/subscription-payment-api";
import { CreditCard, DollarSign, CheckCircle, Clock, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { StatusBadge } from "@/components/admin/status-badge";
import { toast } from "sonner";
import { AdminPlatformPaymentMethodsPanel } from "@/components/admin/platform-payment-methods-panel";
import { useRunBillingCronMutation } from "@/redux/api/billing-api";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState("overview");
  const { data, isLoading } = useGetAdminPaymentsQuery();
  const { data: plansData } = useGetPlansQuery();
  const { data: pendingData, isLoading: pendingLoading } = useGetAdminSubscriptionPaymentsQuery({ status: "pending" });
  const { data: allPaymentsData, isLoading: historyLoading } = useGetAdminSubscriptionPaymentsQuery({});
  const [approvePayment, { isLoading: approving }] = useApproveSubscriptionPaymentMutation();
  const [rejectPayment, { isLoading: rejecting }] = useRejectSubscriptionPaymentMutation();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [runCron, { isLoading: runningCron }] = useRunBillingCronMutation();

  const subscriptions = data?.data?.subscriptions ?? [];
  const pendingPayments = pendingData?.data?.payments ?? [];
  const allPayments = allPaymentsData?.data?.payments ?? [];
  const totals = data?.data?.totals;
  const plans = plansData?.data?.plans ?? [];
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;

  const getPlanName = (plan: unknown) => {
    if (typeof plan === "string") return plan;
    if (plan && typeof plan === "object") {
      const p = plan as Record<string, unknown>;
      if (p.name) return String(p.name);
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

  const handleApprove = async (id: string) => {
    try {
      await approvePayment(id).unwrap();
      toast.success("Payment approved");
    } catch {
      toast.error("Failed to approve payment");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    try {
      await rejectPayment({ id: rejectId, reason: rejectReason }).unwrap();
      toast.success("Payment rejected");
      setRejectId(null);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject payment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const summaryCards = [
    { icon: DollarSign, label: "All-time revenue", value: totals ? formatCurrency(totals.allTimeRevenue) : "—", sub: null },
    { icon: CheckCircle, label: "Paid orders", value: totals ? formatCurrency(totals.paid.total) : "—", sub: totals ? `${totals.paid.count} orders` : null },
    { icon: Clock, label: "Pending", value: totals ? formatCurrency(totals.pending.total) : "—", sub: `${pendingPayments.length} awaiting review` },
    { icon: CreditCard, label: "Active subs", value: activeSubscriptions, sub: `${subscriptions.length} total` },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Revenue, subscription payments, and platform payment methods."
        actions={
          <Link
            href="/admin/dashboard/subscriptions"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            View subscriptions
          </Link>
        }
      />

      <AdminTabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "pending", label: "Pending", count: pendingPayments.length },
          { id: "history", label: "History", count: allPayments.length },
          { id: "methods", label: "Payment methods" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {(tab === "overview" || tab === "pending") && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">{card.label}</p>
                <card.icon className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-zinc-900">{card.value}</p>
              {card.sub && <p className="mt-0.5 text-xs text-zinc-500">{card.sub}</p>}
            </motion.div>
          ))}
        </div>
      )}

      {(tab === "overview" || tab === "pending") && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h3 className="font-semibold text-zinc-900">Pending subscription payments</h3>
          </div>
          {pendingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment) => (
                  <tr key={payment._id} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium">
                      {typeof payment.storeId === "object" ? payment.storeId.name : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {typeof payment.userId === "object" ? payment.userId.email : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {typeof payment.planId === "object" ? payment.planId.name : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 capitalize">{payment.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={approving}
                          onClick={() => handleApprove(payment._id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectId(payment._id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      No pending payments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p) => (
                  <tr key={p._id} className="border-t border-zinc-100">
                    <td className="px-4 py-3">
                      {typeof p.storeId === "object" ? p.storeId.name : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 capitalize">{p.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "methods" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-zinc-900">Platform payment methods</h3>
            <button
              type="button"
              onClick={async () => {
                try {
                  const result = await runCron().unwrap();
                  toast.success(`Billing cron: ${JSON.stringify(result.data)}`);
                } catch {
                  toast.error("Failed to run billing cron");
                }
              }}
              disabled={runningCron}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm"
            >
              {runningCron ? "Running..." : "Run billing cron"}
            </button>
          </div>
          <AdminPlatformPaymentMethodsPanel />
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
            <h4 className="text-lg font-semibold text-zinc-900">Reject payment</h4>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason for rejection"
              className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRejectId(null)} className="rounded-xl border px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={rejecting}
                onClick={handleReject}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
