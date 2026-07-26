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
import { Bike } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import { applyClientFilters, type ModuleBaseProps } from "./module-types";

export function CourierModule({ kpis, filters, money }: ModuleBaseProps) {
  const raw = (kpis?.courierBreakdown ?? []).map((m) => ({
    id: String(m._id || "unspecified"),
    courier: String(m._id || "Unspecified"),
    count: m.count,
    total: m.total,
    totalLabel: money(m.total),
  }));

  const rows = applyClientFilters(raw, filters, {
    courier: (r) => r.courier,
    searchText: (r) => r.courier,
    amount: (r) => r.total,
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <KpiCard label="Courier partners" value={rows.length} icon={Bike} tone="info" compact />
        <KpiCard
          label="Courier volume"
          value={rows.reduce((s, r) => s + Number(r.count), 0)}
          icon={Bike}
          tone="neutral"
          compact
        />
      </div>

      <ChartCard title="Courier breakdown" empty={rows.length === 0} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="courier" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={32} />
            <Tooltip />
            <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ReportPanel title="Courier shipments">
        <ReportDataTable
          columns={[
            { id: "courier", label: "Courier" },
            { id: "count", label: "Shipments", align: "right" },
            { id: "totalLabel", label: "COD / value", align: "right" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
          emptyTitle="No courier data"
          emptyDescription="Courier breakdown appears after shipments are created."
        />
      </ReportPanel>
    </div>
  );
}
