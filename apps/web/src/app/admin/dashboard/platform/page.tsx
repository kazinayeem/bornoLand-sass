"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetPlatformFinanceQuery,
  useGetPlatformOverviewQuery,
  useGetPlatformReportsQuery,
} from "@/redux/api/admin-api";
import {
  Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard,
  FileText, Download, RefreshCw, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Banknote,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LoadingButton } from "@/components/ui/loading-button";
import { formatBDT } from "@/lib/format-bdt";
import {
  BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

const FINANCE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function PlatformPage() {
  const { data: finData, isLoading: finLoading } = useGetPlatformFinanceQuery();
  const { data: ovData } = useGetPlatformOverviewQuery();

  const fin = finData?.data as Record<string, unknown> | undefined;

  const [reportTab, setReportTab] = useState<"revenue" | "stores" | "subscriptions" | "payments" | "orders">("revenue");
  const { data: reportData, isFetching: reportLoading } = useGetPlatformReportsQuery(
    { type: reportTab },
    { skip: !reportTab }
  );

  if (finLoading || !fin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const finCards = [
    { label: "Total Revenue", value: (fin.totalRevenue as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Net Revenue", value: (fin.netRevenue as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Monthly Revenue", value: (fin.monthlyRevenue as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Yearly Revenue", value: (fin.yearlyRevenue as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Platform Fees", value: (fin.platformFees as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Subscription Income", value: (fin.subscriptionIncome as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: Banknote, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Refunds", value: (fin.totalRefunds as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: ArrowDownRight, color: "text-red-600", bg: "bg-red-50" },
    { label: "Est. Profit", value: (fin.estimatedProfit as Record<string, unknown>)?.formattedAmount ?? "৳ 0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const totals = [
    { name: "Total Revenue", value: Number((fin.totalRevenue as Record<string, unknown>)?.amount ?? 0), color: "#2563eb" },
    { name: "Platform Fees", value: Number((fin.platformFees as Record<string, unknown>)?.amount ?? 0), color: "#f59e0b" },
    { name: "Subscription Income", value: Number((fin.subscriptionIncome as Record<string, unknown>)?.amount ?? 0), color: "#10b981" },
    { name: "Refunds", value: Number((fin.totalRefunds as Record<string, unknown>)?.amount ?? 0), color: "#ef4444" },
  ];

  const report = reportData?.data as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Finance & Reports"
        description="All financial data in ৳ BDT."
      />

      {/* Finance Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {finCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className={`inline-flex rounded-xl ${card.bg} p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-2 text-lg font-bold text-zinc-900">{String(card.value)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Revenue Distribution</h3>
          <p className="mb-4 text-sm text-zinc-500">Breakdown of platform finances</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={totals.filter((t) => t.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value" nameKey="name">
                  {totals.filter((t) => t.value > 0).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number) => [formatBDT(value), "Amount"]) as any}
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Legend verticalAlign="bottom" height={36}
                  formatter={(value) => <span className="text-sm text-zinc-700">{value}</span>} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Financial Summary</h3>
          <p className="mb-4 text-sm text-zinc-500">Revenue, fees, and refunds</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Revenue", amount: Number((fin.totalRevenue as Record<string, unknown>)?.amount ?? 0) },
                { name: "Fees", amount: Number((fin.platformFees as Record<string, unknown>)?.amount ?? 0) },
                { name: "Sub Income", amount: Number((fin.subscriptionIncome as Record<string, unknown>)?.amount ?? 0) },
                { name: "Refunds", amount: Number((fin.totalRefunds as Record<string, unknown>)?.amount ?? 0) },
                { name: "Net", amount: Number((fin.netRevenue as Record<string, unknown>)?.amount ?? 0) },
              ]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#71717a" }}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  formatter={((value: number) => [formatBDT(value), "Amount"]) as any}
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[0, 4, 4, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Reports */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900">Reports</h3>
          <p className="text-sm text-zinc-500">Export reports in ৳ BDT</p>
        </div>

        {/* Report type tabs */}
        <div className="flex gap-1 border-b border-zinc-100 px-6">
          {(["revenue", "stores", "subscriptions", "payments", "orders"] as const).map((tab) => (
            <button key={tab} onClick={() => setReportTab(tab)}
              className={`relative px-3 py-3 text-sm font-medium capitalize transition-colors ${
                reportTab === tab ? "text-blue-600" : "text-zinc-500 hover:text-zinc-800"
              }`}>
              {tab}
              {reportTab === tab && <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600" />}
            </button>
          ))}
        </div>

        <div className="p-6">
          {reportLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                  {reportTab === "revenue" && "Revenue report with total and per-order breakdown"}
                  {reportTab === "stores" && "All stores with revenue, orders, and plan info"}
                  {reportTab === "subscriptions" && "Subscription plan breakdown"}
                  {reportTab === "payments" && "Payment transaction report"}
                  {reportTab === "orders" && "Order report with status breakdown"}
                </p>
                <div className="flex gap-2">
                  <LoadingButton size="sm" variant="secondary" icon={<Download className="h-4 w-4" />}>
                    CSV
                  </LoadingButton>
                  <LoadingButton size="sm" variant="secondary" icon={<FileText className="h-4 w-4" />}>
                    PDF
                  </LoadingButton>
                </div>
              </div>

              {/* Report totals */}
              {!!report?.total && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-400">Report Total</p>
                  <p className="text-xl font-bold text-zinc-900">
                    {(report.total as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}
                  </p>
                  <p className="text-xs text-zinc-400">{String(report.count ?? 0)} entries</p>
                </div>
              )}

              {/* Report tables */}
              {reportTab === "revenue" && !!report?.orders && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Store</th>
                        <th className="px-3 py-2">Total (৳)</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {(report.orders as Array<Record<string, unknown>>)?.slice(0, 10).map((o: Record<string, unknown>, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 font-medium text-zinc-900">#{String(o.orderNumber ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-700">{String(o.storeName ?? "")}</td>
                          <td className="px-3 py-2 font-semibold text-zinc-900">{(o.total as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</td>
                          <td className="px-3 py-2 capitalize text-zinc-600">{String(o.paymentMethod ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-400">{o.createdAt ? new Date(String(o.createdAt)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportTab === "stores" && !!report?.stores && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2">Store</th>
                        <th className="px-3 py-2">Owner</th>
                        <th className="px-3 py-2">Plan</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Orders</th>
                        <th className="px-3 py-2">Products</th>
                        <th className="px-3 py-2">Revenue (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {(report.stores as Array<Record<string, unknown>>)?.slice(0, 10).map((s: Record<string, unknown>, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 font-medium text-zinc-900">{String(s.name ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-600">{String(s.owner ?? "")}</td>
                          <td className="px-3 py-2">
                            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium">{String(s.plan ?? "")}</span>
                          </td>
                          <td className="px-3 py-2 text-zinc-600">{String(s.status ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-700">{String(s.orders ?? 0)}</td>
                          <td className="px-3 py-2 text-zinc-700">{String(s.products ?? 0)}</td>
                          <td className="px-3 py-2 font-semibold text-zinc-900">{(s.revenue as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportTab === "subscriptions" && !!report?.plans && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2">Plan</th>
                        <th className="px-3 py-2">Price (৳)</th>
                        <th className="px-3 py-2">Subscribers</th>
                        <th className="px-3 py-2">Active</th>
                        <th className="px-3 py-2">Trialing</th>
                        <th className="px-3 py-2">Expired</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {(report.plans as Array<Record<string, unknown>>)?.map((p: Record<string, unknown>, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 font-medium text-zinc-900">{String(p.name ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-700">{formatBDT(Number(p.priceBDT ?? 0))}</td>
                          <td className="px-3 py-2 font-semibold text-zinc-900">{String(p.subscribers ?? 0)}</td>
                          <td className="px-3 py-2 text-emerald-600">{String(p.active ?? 0)}</td>
                          <td className="px-3 py-2 text-amber-600">{String(p.trialing ?? 0)}</td>
                          <td className="px-3 py-2 text-red-500">{String(p.expired ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportTab === "payments" && !!report?.payments && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Store</th>
                        <th className="px-3 py-2">Method</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Amount (৳)</th>
                        <th className="px-3 py-2">Refunded (৳)</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {(report.payments as Array<Record<string, unknown>>)?.slice(0, 10).map((p: Record<string, unknown>, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 font-medium text-zinc-900">#{String(p.orderNumber ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-600">{String(p.storeName ?? "")}</td>
                          <td className="px-3 py-2 capitalize text-zinc-600">{String(p.method ?? "")}</td>
                          <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                          }`}>{String(p.status ?? "")}</span></td>
                          <td className="px-3 py-2 font-semibold text-zinc-900">{(p.amount as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</td>
                          <td className="px-3 py-2 text-red-500">{(p.refunded as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</td>
                          <td className="px-3 py-2 text-zinc-400">{p.createdAt ? new Date(String(p.createdAt)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportTab === "orders" && !!report?.orders && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <th className="px-3 py-2">Order</th>
                        <th className="px-3 py-2">Store</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Total (৳)</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {(report.orders as Array<Record<string, unknown>>)?.slice(0, 10).map((o: Record<string, unknown>, i: number) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 font-medium text-zinc-900">#{String(o.orderNumber ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-600">{String(o.storeName ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-600">{String(o.customerName ?? "")}</td>
                          <td className="px-3 py-2 font-semibold text-zinc-900">{(o.total as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}</td>
                          <td className="px-3 py-2"><span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium">{String(o.status ?? "")}</span></td>
                          <td className="px-3 py-2 capitalize text-zinc-600">{String(o.paymentMethod ?? "")}</td>
                          <td className="px-3 py-2 text-zinc-400">{o.createdAt ? new Date(String(o.createdAt)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(!report || !Object.keys(report).length) && (
                <p className="py-8 text-center text-sm text-zinc-400">No data available for this report</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
