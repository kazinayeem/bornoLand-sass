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
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { SalesModuleProps } from "./module-types";

export function SalesModule({ kpis, revenue, summary, money }: SalesModuleProps) {
  const daily = revenue?.daily ?? [];
  const byCategory = revenue?.byCategory ?? [];
  const monthly = (summary?.data ?? []).map((row) => {
    const id = row._id as { month?: number; year?: number } | string | number;
    const label =
      typeof id === "object" && id ? `${id.month ?? "?"}/${id.year ?? ""}` : String(id ?? "");
    return {
      period: label,
      revenue: row.revenue,
      orders: row.orders,
      aov: row.avgOrderValue,
      revenueLabel: money(row.revenue),
      aovLabel: money(row.avgOrderValue),
    };
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard
          label="Gross sales"
          value={money(kpis?.grossSales ?? kpis?.totalRevenue ?? 0)}
          icon={DollarSign}
          tone="success"
          changePct={kpis?.comparison?.revenueChange}
          compact
        />
        <KpiCard
          label="Orders"
          value={kpis?.totalOrders ?? 0}
          icon={ShoppingCart}
          tone="warning"
          compact
        />
        <KpiCard
          label="Avg order value"
          value={money(kpis?.avgOrderValue ?? 0)}
          icon={TrendingUp}
          tone="info"
          compact
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Revenue over time" empty={daily.length === 0} height={220}>
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

        <ChartCard title="Revenue by category" empty={byCategory.length === 0} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={48} />
              <Tooltip formatter={(v) => money(Number(v || 0))} />
              <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ReportPanel title="Monthly sales summary" description="Revenue, orders, and AOV by period">
        <ReportDataTable
          columns={[
            { id: "period", label: "Period" },
            { id: "revenueLabel", label: "Revenue", align: "right" },
            { id: "orders", label: "Orders", align: "right" },
            { id: "aovLabel", label: "AOV", align: "right" },
          ]}
          rows={monthly}
          rowKey={(r) => String(r.period)}
        />
      </ReportPanel>
    </div>
  );
}
