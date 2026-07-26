"use client";

import { Gauge, RotateCcw, ShoppingCart, UserPlus } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function PerformanceModule({ kpis, money }: ModuleBaseProps) {
  const newC = kpis?.newCustomers ?? 0;
  const ret = kpis?.returningCustomers ?? 0;
  const total = newC + ret || 1;

  const rows = [
    { id: "conv", metric: "Conversion rate", value: `${kpis?.conversionRate ?? 0}%` },
    { id: "aov", metric: "Average order value", value: money(kpis?.avgOrderValue ?? 0) },
    { id: "new", metric: "New customers", value: String(newC) },
    { id: "ret", metric: "Returning customers", value: String(ret) },
    {
      id: "mix",
      metric: "Returning share",
      value: `${((ret / total) * 100).toFixed(1)}%`,
    },
    { id: "rating", metric: "Average rating", value: String(kpis?.averageRating ?? 0) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <KpiCard
          label="Conversion"
          value={`${kpis?.conversionRate ?? 0}%`}
          icon={Gauge}
          tone="info"
          compact
        />
        <KpiCard
          label="AOV"
          value={money(kpis?.avgOrderValue ?? 0)}
          icon={ShoppingCart}
          tone="success"
          compact
        />
        <KpiCard label="New" value={newC} icon={UserPlus} tone="success" compact />
        <KpiCard label="Returning" value={ret} icon={RotateCcw} tone="info" compact />
      </div>

      <ReportPanel title="Performance metrics">
        <ReportDataTable
          columns={[
            { id: "metric", label: "Metric" },
            { id: "value", label: "Value", align: "right" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
          searchable={false}
        />
      </ReportPanel>
    </div>
  );
}
