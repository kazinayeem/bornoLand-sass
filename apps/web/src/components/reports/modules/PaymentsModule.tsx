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
import { CreditCard, Banknote } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function PaymentsModule({ kpis, money }: ModuleBaseProps) {
  const methods = (kpis?.paymentMethods ?? []).map((m) => ({
    id: String(m._id || "unknown"),
    method: String(m._id || "unknown"),
    count: m.count,
    total: m.total,
    totalLabel: money(m.total),
  }));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard
          label="COD collection"
          value={money(kpis?.codCollection ?? 0)}
          icon={Banknote}
          tone="warning"
          compact
        />
        <KpiCard
          label="Online collection"
          value={money(kpis?.onlineCollection ?? 0)}
          icon={CreditCard}
          tone="success"
          compact
        />
        <KpiCard
          label="Gross sales"
          value={money(kpis?.grossSales ?? kpis?.totalRevenue ?? 0)}
          icon={CreditCard}
          tone="info"
          compact
        />
      </div>

      <ChartCard title="Payment methods" empty={methods.length === 0} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={methods}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="method" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={48} />
            <Tooltip formatter={(v) => money(Number(v || 0))} />
            <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ReportPanel title="Payment method breakdown">
        <ReportDataTable
          columns={[
            { id: "method", label: "Method" },
            { id: "count", label: "Orders", align: "right" },
            { id: "totalLabel", label: "Total", align: "right" },
          ]}
          rows={methods}
          rowKey={(r) => String(r.id)}
        />
      </ReportPanel>
    </div>
  );
}
