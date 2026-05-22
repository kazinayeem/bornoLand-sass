"use client";

import { motion } from "framer-motion";
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { subscriptions } from "@/lib/admin/data";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionsPage() {
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const mrr = subscriptions.reduce((s, sub) => s + (sub.billing === "annual" ? sub.amount / 12 : sub.amount), 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Subscriptions</h2>
        <p className="mt-1 text-sm text-zinc-500">Monitor and manage all tenant subscriptions.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Subscriptions" value={activeSubs.length} icon={CreditCard} variant="blue" />
        <StatCard title="Monthly Recurring Revenue" value={`$${Math.round(mrr).toLocaleString()}`} icon={DollarSign} variant="green" prefix="$" />
        <StatCard title="Past Due" value={subscriptions.filter((s) => s.status === "past_due").length} icon={AlertCircle} variant="amber" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Billing</th>
                  <th className="px-6 py-3">Next Billing</th>
                  <th className="px-6 py-3">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">{sub.tenant}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{sub.plan}</span>
                    </td>
                    <td className="px-6 py-3.5"><StatusBadge status={sub.status} /></td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-zinc-900">${sub.amount}/mo</td>
                    <td className="px-6 py-3.5 text-sm capitalize text-zinc-600">{sub.billing}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">{sub.nextBilling ?? "—"}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">{sub.started}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
