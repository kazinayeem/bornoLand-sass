"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { DashboardPageHeader } from "@/components/store-dashboard/dashboard-ui";
import {
  useGetReportDashboardQuery,
  useGetRevenueReportQuery,
  useGetSummaryReportQuery,
  type ReportDateRange,
} from "@/redux/api/reports-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function KPICard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="dashboard-kpi-card"
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-apple-lg", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <p className="mt-3 text-display-md text-apple-ink">{value}</p>
      <p className="mt-0.5 text-caption text-apple-ink-muted-48">{label}</p>
    </motion.div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-apple-hairline bg-white p-4 sm:p-5", className)}>
      <h3 className="mb-4 text-sm font-semibold text-apple-ink">{title}</h3>
      {children}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-apple-ink-muted-48">{text}</p>;
}

export default function ReportsPage() {
  const { storeId, isLoading: storeLoading } = useStorePage();
  const [dateRange, setDateRange] = useState<ReportDateRange>({ preset: "all" });

  const { data: settingsData } = useGetStoreSettingsQuery(storeId ?? "", { skip: !storeId });
  const settings = settingsData?.data?.settings;
  const money = (v: number) => formatCurrency(v || 0, settings);

  const { data, isLoading } = useGetReportDashboardQuery(
    { storeId: storeId ?? "", range: dateRange },
    { skip: !storeId },
  );
  const { data: revenueData } = useGetRevenueReportQuery(
    { storeId: storeId ?? "", range: dateRange },
    { skip: !storeId },
  );
  const { data: growthData } = useGetSummaryReportQuery(
    { storeId: storeId ?? "", period: "monthly" },
    { skip: !storeId },
  );

  const kpis = data?.data;
  const daily = revenueData?.data?.daily ?? [];
  const growth = (growthData?.data?.data ?? []).map((row) => {
    const id = row._id as { month?: number; year?: number } | string | number;
    const label =
      typeof id === "object" && id
        ? `${id.month ?? "?"}/${id.year ?? ""}`
        : String(id ?? "");
    return { label, revenue: row.revenue, orders: row.orders };
  });

  if (storeLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-primary" />
      </div>
    );
  }

  const cards = kpis
    ? [
        { label: "Revenue Today", value: money(kpis.revenueToday), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Revenue This Week", value: money(kpis.revenueThisWeek), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Revenue This Month", value: money(kpis.revenueThisMonth), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Revenue This Year", value: money(kpis.revenueThisYear), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Orders Today", value: kpis.ordersToday, icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Pending Orders", value: kpis.pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Completed Orders", value: kpis.completedOrders, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Cancelled Orders", value: kpis.cancelledOrders, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        { label: "Average Order Value", value: money(kpis.avgOrderValue), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "New Customers", value: kpis.newCustomers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Returning Customers", value: kpis.returningCustomers, icon: RotateCcw, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Conversion Rate", value: `${kpis.conversionRate}%`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Refund Amount", value: money(kpis.refundAmount), icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        { label: "Units Sold", value: kpis.productsSold, icon: Package, color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
        { label: "Low Stock", value: kpis.lowStockProducts, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Total Customers", value: kpis.totalCustomers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Reports"
        description="Live ecommerce analytics from your store database."
        actions={
          <select
            value={dateRange.preset || "all"}
            onChange={(e) => setDateRange({ preset: e.target.value as ReportDateRange["preset"] })}
            className="h-11 rounded-apple-pill border border-apple-hairline bg-apple-canvas px-4 pr-8 text-body text-apple-ink-muted-80 outline-none focus:ring-2 focus:ring-apple-primary-focus"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-apple-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
              <KPICard key={card.label} {...card} delay={0.03 * i} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Revenue">
              {daily.length === 0 ? (
                <EmptyHint text="No revenue data in this range." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => money(Number(v || 0))} />
                      <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel title="Orders">
              {daily.length === 0 ? (
                <EmptyHint text="No order data in this range." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#d97706" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel title="Customer Growth">
              {growth.length === 0 ? (
                <EmptyHint text="No growth data yet." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel title="Sales by Category">
              {(kpis?.topCategories ?? []).length === 0 ? (
                <EmptyHint text="No category sales yet." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpis?.topCategories ?? []} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="_id" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => money(Number(v || 0))} />
                      <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Top Selling Products">
              {(kpis?.topProducts ?? []).length === 0 ? (
                <EmptyHint text="No product sales yet." />
              ) : (
                <div className="space-y-2">
                  {(kpis?.topProducts ?? []).map((p) => (
                    <div key={String(p._id)} className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-apple-ink">{p.name}</p>
                        <p className="text-xs text-apple-ink-muted-48">{p.totalSold} sold</p>
                      </div>
                      <p className="text-sm font-semibold text-apple-ink">{money(p.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Top Customers">
              {(kpis?.topCustomers ?? []).length === 0 ? (
                <EmptyHint text="No customer spend yet." />
              ) : (
                <div className="space-y-2">
                  {(kpis?.topCustomers ?? []).map((c) => (
                    <div key={String(c._id)} className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-apple-ink">{c.name || "Customer"}</p>
                        <p className="text-xs text-apple-ink-muted-48">{c.orderCount} orders · {c.email || "—"}</p>
                      </div>
                      <p className="text-sm font-semibold text-apple-ink">{money(c.totalSpent)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Payment Methods">
              {(kpis?.paymentMethods ?? []).length === 0 ? (
                <EmptyHint text="No payment data yet." />
              ) : (
                <div className="space-y-2">
                  {(kpis?.paymentMethods ?? []).map((m) => (
                    <div key={String(m._id)} className="flex items-center justify-between rounded-xl border border-apple-hairline px-3 py-2.5">
                      <p className="text-sm capitalize text-apple-ink">{m._id || "unknown"}</p>
                      <p className="text-sm text-apple-ink-muted-80">
                        {m.count} · {money(m.total)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Shipping Methods">
              {(kpis?.shippingMethods ?? []).length === 0 ? (
                <EmptyHint text="No shipping data yet." />
              ) : (
                <div className="space-y-2">
                  {(kpis?.shippingMethods ?? []).map((m) => (
                    <div key={String(m._id)} className="flex items-center justify-between rounded-xl border border-apple-hairline px-3 py-2.5">
                      <p className="text-sm text-apple-ink">{m._id || "Unspecified"}</p>
                      <p className="text-sm text-apple-ink-muted-80">
                        {m.count} · {money(m.total)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Latest Orders">
              {(kpis?.latestOrders ?? []).length === 0 ? (
                <EmptyHint text="No orders yet." />
              ) : (
                <div className="space-y-2">
                  {(kpis?.latestOrders ?? []).map((o) => {
                    const customer =
                      typeof o.customerId === "object" && o.customerId
                        ? o.customerId.name || o.customerId.email
                        : "Customer";
                    return (
                      <div key={o._id} className="flex items-center justify-between rounded-xl border border-apple-hairline px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-apple-ink">{o.orderNumber}</p>
                          <p className="text-xs text-apple-ink-muted-48">
                            {customer} · {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">{money(o.total)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <Panel title="Low Stock">
              {(kpis?.lowStockItems ?? []).length === 0 ? (
                <EmptyHint text="No low-stock products." />
              ) : (
                <div className="space-y-2">
                  {(kpis?.lowStockItems ?? []).map((p) => (
                    <div key={p._id} className="flex items-center justify-between rounded-xl border border-apple-hairline px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-apple-ink">{p.name}</p>
                        <p className="text-xs text-apple-ink-muted-48">{p.sku || "No SKU"}</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-600">{p.stock} left</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
