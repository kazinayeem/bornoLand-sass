"use client";

import { motion } from "framer-motion";
import { DollarSign, Download, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const invoices = [
  { id: "INV-2024-0891", tenant: "Acme Corporation", amount: 5988, status: "paid", date: "2025-12-15", method: "Stripe" },
  { id: "INV-2024-0890", tenant: "TechStartup.io", amount: 199, status: "paid", date: "2025-12-14", method: "Stripe" },
  { id: "INV-2024-0889", tenant: "GreenEnergy Co", amount: 49, status: "paid", date: "2025-12-12", method: "PayPal" },
  { id: "INV-2024-0888", tenant: "CloudBase Systems", amount: 2388, status: "paid", date: "2025-12-10", method: "Stripe" },
  { id: "INV-2024-0887", tenant: "PixelPerfect Studio", amount: 49, status: "pending", date: "2025-12-08", method: "Stripe" },
  { id: "INV-2024-0886", tenant: "StreamLine Media", amount: 199, status: "overdue", date: "2025-12-05", method: "PayPal" }
];

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", overdue: "bg-red-50 text-red-700"
};

export default function BillingPage() {
  const totalRevenue = invoices.reduce((s, i) => s + (i.status === "paid" ? i.amount : 0), 0);
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Billing</h2>
        <p className="mt-1 text-sm text-zinc-500">Invoices and billing history across all tenants.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Total Collected</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-zinc-900">${totalRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Pending</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-600">${invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-zinc-500">Overdue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">${invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-zinc-900">Recent Invoices</CardTitle>
            <button className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">Invoice</th><th className="px-6 py-3">Tenant</th><th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">{inv.id}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-700">{inv.tenant}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-zinc-900">${inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[inv.status]].join(" ")}>{inv.status}</span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">{inv.date}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">{inv.method}</td>
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
