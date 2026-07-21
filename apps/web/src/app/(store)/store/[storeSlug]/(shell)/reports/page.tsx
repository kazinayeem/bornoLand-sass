"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetReportDashboardQuery, type ReportDateRange } from "@/redux/api/reports-api";
import {
  DollarSign, ShoppingCart, Users, TrendingUp, Package, BarChart3,
  Loader2, ArrowUpRight, Clock, Tag, HardDrive, FileText, Star,
  AlertTriangle, CheckCircle2, XCircle, Filter, Download, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatBDT(v: number) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", minimumFractionDigits: 0 }).format(v); }
  catch { return `৳${v.toLocaleString()}`; }
}

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${sizes[i]}`;
}

const DATE_PRESETS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
] as const;

const REPORT_LINKS = [
  { href: "/reports/revenue", label: "Revenue Report", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { href: "/reports/orders", label: "Order Report", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
  { href: "/reports/customers", label: "Customer Report", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { href: "/reports/products", label: "Product Report", icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
  { href: "/reports/categories", label: "Category Report", icon: Tag, color: "text-rose-600", bg: "bg-rose-50" },
  { href: "/reports/coupons", label: "Coupon Report", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  { href: "/reports/media", label: "Media Report", icon: HardDrive, color: "text-cyan-600", bg: "bg-cyan-50" },
  { href: "/reports/summary/daily", label: "Daily Summary", icon: Clock, color: "text-apple-ink-muted-80", bg: "bg-zinc-100" },
];

function KPICard({ label, value, icon: Icon, color, bg, trend, delay }: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string }>;
  color: string; bg: string; trend?: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <TrendingUp className="h-2.5 w-2.5" />{trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-apple-ink">{value}</p>
      <p className="mt-0.5 text-[13px] font-medium text-apple-ink-muted-48">{label}</p>
    </motion.div>
  );
}

export default function ReportsPage() {
  const { storeId, store, isLoading: storeLoading } = useStorePage();
  const [dateRange, setDateRange] = useState<ReportDateRange>({ preset: "all" });

  const { data, isLoading } = useGetReportDashboardQuery(
    { storeId: storeId ?? "", range: dateRange },
    { skip: !storeId }
  );

  const kpis = data?.data;
  const storeBase = store ? `/store/${store.slug}` : "";

  if (storeLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-apple-ink">Reports</h1>
          <p className="text-sm text-apple-ink-muted-48">Sales, revenue, inventory, and business insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange.preset || "all"}
            onChange={(e) => setDateRange({ preset: e.target.value as ReportDateRange["preset"] })}
            className="h-10 rounded-xl border border-[#ececec] bg-white px-3 pr-8 text-sm font-medium text-apple-ink-muted-80 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
      ) : kpis ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Revenue" value={formatBDT(kpis.totalRevenue)} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" delay={0.05} />
          <KPICard label="Total Orders" value={kpis.totalOrders} icon={ShoppingCart} color="text-amber-600" bg="bg-amber-50" delay={0.1} />
          <KPICard label="Total Customers" value={kpis.totalCustomers} icon={Users} color="text-blue-600" bg="bg-blue-50" delay={0.15} />
          <KPICard label="Avg Order Value" value={formatBDT(kpis.avgOrderValue)} icon={TrendingUp} color="text-violet-600" bg="bg-violet-50" delay={0.2} />
          <KPICard label="Net Profit" value={formatBDT(kpis.netProfit)} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" delay={0.25} />
          <KPICard label="Gross Sales" value={formatBDT(kpis.grossSales)} icon={BarChart3} color="text-blue-600" bg="bg-blue-50" delay={0.3} />
          <KPICard label="Refund Amount" value={formatBDT(kpis.refundAmount)} icon={XCircle} color="text-red-600" bg="bg-red-50" delay={0.35} />
          <KPICard label="Pending Orders" value={kpis.pendingOrders} icon={Clock} color="text-amber-600" bg="bg-amber-50" delay={0.4} />
          <KPICard label="Cancelled Orders" value={kpis.cancelledOrders} icon={XCircle} color="text-red-600" bg="bg-red-50" delay={0.45} />
          <KPICard label="Completed Orders" value={kpis.completedOrders} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" delay={0.5} />
          <KPICard label="Conversion Rate" value={`${kpis.conversionRate}%`} icon={TrendingUp} color="text-violet-600" bg="bg-violet-50" delay={0.55} />
          <KPICard label="Coupons Used" value={kpis.couponsUsed} icon={Tag} color="text-indigo-600" bg="bg-indigo-50" delay={0.6} />
          <KPICard label="Products" value={kpis.productsSold} icon={Package} color="text-apple-ink-muted-80" bg="bg-zinc-100" delay={0.65} />
          <KPICard label="Low Stock" value={kpis.lowStockProducts} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" delay={0.7} />
          <KPICard label="Media Files" value={kpis.mediaUsage} icon={HardDrive} color="text-cyan-600" bg="bg-cyan-50" delay={0.75} />
          <KPICard label="Pages" value={kpis.pages} icon={FileText} color="text-apple-ink-muted-80" bg="bg-zinc-100" delay={0.8} />
        </div>
      ) : null}

      {/* Report Links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-apple-ink">Detailed Reports</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div key={link.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 + i * 0.03, duration: 0.3 }}>
                <Link href={`${storeBase}${link.href}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[#ececec] bg-white p-4 shadow-sm transition-all duration-200 hover:border-zinc-200 hover:shadow-md">
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105", link.bg)}>
                    <Icon className={cn("h-5 w-5", link.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-apple-ink">{link.label}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-apple-ink-muted-48" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
