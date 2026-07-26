"use client";

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
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { EmptyState } from "../shared/EmptyState";
import { customerName, type OverviewModuleProps } from "./module-types";

export function OverviewModule({ kpis, revenue, summary, money, loading }: OverviewModuleProps) {
  const daily = revenue?.daily ?? [];
  const growth = (summary?.data ?? []).map((row) => {
    const id = row._id as { month?: number; year?: number } | string | number;
    const label =
      typeof id === "object" && id ? `${id.month ?? "?"}/${id.year ?? ""}` : String(id ?? "");
    return { label, revenue: row.revenue, orders: row.orders, aov: row.avgOrderValue };
  });

  const spark = daily.map((d) => d.revenue);

  const cards = kpis
    ? [
        {
          label: "Total revenue",
          value: money(kpis.totalRevenue),
          icon: DollarSign,
          tone: "success" as const,
          changePct: kpis.comparison?.revenueChange,
          sparkline: spark,
        },
        {
          label: "Total orders",
          value: kpis.totalOrders,
          icon: ShoppingCart,
          tone: "warning" as const,
          changePct: kpis.comparison?.ordersChange,
        },
        {
          label: "AOV",
          value: money(kpis.avgOrderValue),
          icon: TrendingUp,
          tone: "info" as const,
        },
        {
          label: "Conversion",
          value: `${kpis.conversionRate}%`,
          icon: TrendingUp,
          tone: "info" as const,
        },
        {
          label: "Pending",
          value: kpis.pendingOrders,
          icon: Clock,
          tone: "warning" as const,
        },
        {
          label: "Completed",
          value: kpis.completedOrders,
          icon: CheckCircle2,
          tone: "success" as const,
        },
        {
          label: "Cancelled",
          value: kpis.cancelledOrders,
          icon: XCircle,
          tone: "danger" as const,
        },
        {
          label: "Refunds",
          value: money(kpis.refundAmount),
          icon: XCircle,
          tone: "danger" as const,
          changePct: kpis.comparison?.refundChange,
        },
        {
          label: "New customers",
          value: kpis.newCustomers,
          icon: Users,
          tone: "info" as const,
        },
        {
          label: "Returning",
          value: kpis.returningCustomers,
          icon: RotateCcw,
          tone: "info" as const,
        },
        {
          label: "Units sold",
          value: kpis.productsSold,
          icon: Package,
          tone: "neutral" as const,
        },
        {
          label: "Low stock",
          value: kpis.lowStockProducts,
          icon: AlertTriangle,
          tone: "warning" as const,
        },
      ]
    : [];

  if (loading && !kpis) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-apple-canvas-parchment" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, i) => (
          <KpiCard key={card.label} {...card} delay={0.02 * i} compact />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Revenue trend" empty={daily.length === 0} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={48} />
              <Tooltip formatter={(v) => money(Number(v || 0))} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders trend" empty={daily.length === 0} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
              <Tooltip />
              <Bar dataKey="orders" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly summary" empty={growth.length === 0} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Sales by category"
          empty={(kpis?.topCategories ?? []).length === 0}
          height={220}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis?.topCategories ?? []} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="_id" width={80} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => money(Number(v || 0))} />
              <Bar dataKey="revenue" fill="#0f766e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ReportPanel title="Top products">
          {(kpis?.topProducts ?? []).length === 0 ? (
            <EmptyState title="No product sales yet" className="py-6" />
          ) : (
            <div className="space-y-1.5">
              {(kpis?.topProducts ?? []).map((p) => (
                <div
                  key={String(p._id)}
                  className="flex items-center justify-between rounded-lg bg-apple-canvas-parchment px-2.5 py-2"
                >
                  <div>
                    <p className="text-[11px] font-medium text-apple-ink">{p.name}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">{p.totalSold} sold</p>
                  </div>
                  <p className="text-[11px] font-semibold tabular-nums">{money(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </ReportPanel>

        <ReportPanel title="Top customers">
          {(kpis?.topCustomers ?? []).length === 0 ? (
            <EmptyState title="No customer spend yet" className="py-6" />
          ) : (
            <div className="space-y-1.5">
              {(kpis?.topCustomers ?? []).map((c) => (
                <div
                  key={String(c._id)}
                  className="flex items-center justify-between rounded-lg bg-apple-canvas-parchment px-2.5 py-2"
                >
                  <div>
                    <p className="text-[11px] font-medium text-apple-ink">{c.name || "Customer"}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">
                      {c.orderCount} orders · {c.email || "—"}
                    </p>
                  </div>
                  <p className="text-[11px] font-semibold tabular-nums">{money(c.totalSpent)}</p>
                </div>
              ))}
            </div>
          )}
        </ReportPanel>

        <ReportPanel title="Latest orders">
          {(kpis?.latestOrders ?? []).length === 0 ? (
            <EmptyState title="No orders yet" className="py-6" />
          ) : (
            <div className="space-y-1.5">
              {(kpis?.latestOrders ?? []).map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between rounded-lg border border-apple-hairline px-2.5 py-2"
                >
                  <div>
                    <p className="text-[11px] font-medium text-apple-ink">{o.orderNumber}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">
                      {customerName(o.customerId)} · {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                      {o.status}
                    </p>
                  </div>
                  <p className="text-[11px] font-semibold tabular-nums">{money(o.total)}</p>
                </div>
              ))}
            </div>
          )}
        </ReportPanel>

        <ReportPanel title="Low stock">
          {(kpis?.lowStockItems ?? []).length === 0 ? (
            <EmptyState title="No low-stock products" className="py-6" />
          ) : (
            <div className="space-y-1.5">
              {(kpis?.lowStockItems ?? []).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-lg border border-apple-hairline px-2.5 py-2"
                >
                  <div>
                    <p className="text-[11px] font-medium text-apple-ink">{p.name}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">{p.sku || "No SKU"}</p>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-600">{p.stock} left</p>
                </div>
              ))}
            </div>
          )}
        </ReportPanel>
      </div>
    </div>
  );
}
