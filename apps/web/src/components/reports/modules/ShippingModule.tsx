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
import { Truck } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function ShippingModule({ kpis, money }: ModuleBaseProps) {
  const methods = (kpis?.shippingMethods ?? []).map((m) => ({
    id: String(m._id || "unspecified"),
    method: String(m._id || "Unspecified"),
    count: m.count,
    total: m.total,
    totalLabel: money(m.total),
  }));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <KpiCard
          label="Shipping cost"
          value={money(kpis?.shippingCost ?? 0)}
          icon={Truck}
          tone="warning"
          changePct={kpis?.comparison?.shippingChange}
          compact
        />
        <KpiCard label="Methods used" value={methods.length} icon={Truck} tone="neutral" compact />
      </div>

      <ChartCard title="Shipping methods" empty={methods.length === 0} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={methods}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="method" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={48} />
            <Tooltip formatter={(v) => money(Number(v || 0))} />
            <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ReportPanel title="Shipping breakdown">
        <ReportDataTable
          columns={[
            { id: "method", label: "Method" },
            { id: "count", label: "Shipments", align: "right" },
            { id: "totalLabel", label: "Amount", align: "right" },
          ]}
          rows={methods}
          rowKey={(r) => String(r.id)}
        />
      </ReportPanel>
    </div>
  );
}
