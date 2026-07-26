"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tags } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { CategoriesModuleProps } from "./module-types";

export function CategoriesModule({ kpis, categoryReport, money }: CategoriesModuleProps) {
  const rows = (categoryReport?.byCategory ?? []).map((c, i) => ({
    id: String(i),
    name: c.name,
    revenue: c.revenue,
    revenueLabel: money(c.revenue),
    orders: c.orders,
    productCount: c.productCount,
  }));

  const chartData =
    rows.length > 0
      ? rows
      : (kpis?.topCategories ?? []).map((c) => ({
          name: String(c._id),
          revenue: c.revenue,
          orders: c.units,
        }));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <KpiCard label="Categories with sales" value={chartData.length} icon={Tags} tone="info" compact />
        <KpiCard
          label="Category revenue"
          value={money(chartData.reduce((s, r) => s + Number(r.revenue || 0), 0))}
          icon={Tags}
          tone="success"
          compact
        />
      </div>

      <ChartCard title="Category revenue" empty={chartData.length === 0} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => money(Number(v || 0))} />
            <Bar dataKey="revenue" fill="#0f766e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ReportPanel title="Category report">
        <ReportDataTable
          columns={[
            { id: "name", label: "Category" },
            { id: "orders", label: "Orders", align: "right" },
            { id: "productCount", label: "Products", align: "right" },
            { id: "revenueLabel", label: "Revenue", align: "right" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
          emptyTitle="No category sales"
        />
      </ReportPanel>
    </div>
  );
}
