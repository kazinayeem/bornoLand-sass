"use client";

import { RotateCcw, XCircle } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function RefundsModule({ kpis, money }: ModuleBaseProps) {
  const rows = [
    {
      id: "refund",
      item: "Refund amount",
      value: money(kpis?.refundAmount ?? 0),
    },
    {
      id: "cancelled",
      item: "Cancelled orders",
      value: String(kpis?.cancelledOrders ?? 0),
    },
    {
      id: "change",
      item: "Refund change vs previous",
      value:
        kpis?.comparison?.refundChange != null
          ? `${kpis.comparison.refundChange > 0 ? "+" : ""}${kpis.comparison.refundChange.toFixed(1)}%`
          : "—",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <KpiCard
          label="Refund amount"
          value={money(kpis?.refundAmount ?? 0)}
          icon={RotateCcw}
          tone="danger"
          changePct={kpis?.comparison?.refundChange}
          compact
        />
        <KpiCard
          label="Cancelled orders"
          value={kpis?.cancelledOrders ?? 0}
          icon={XCircle}
          tone="danger"
          compact
        />
      </div>

      <ReportPanel title="Refunds snapshot">
        <ReportDataTable
          columns={[
            { id: "item", label: "Item" },
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
