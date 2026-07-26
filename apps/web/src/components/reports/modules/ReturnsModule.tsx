"use client";

import { Undo2, XCircle } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function ReturnsModule({ kpis, money }: ModuleBaseProps) {
  const rate = kpis?.returnRate ?? 0;
  const rows = [
    { id: "rate", item: "Return rate", value: `${rate}%` },
    { id: "cancelled", item: "Cancelled orders", value: String(kpis?.cancelledOrders ?? 0) },
    { id: "refund", item: "Refund amount", value: money(kpis?.refundAmount ?? 0) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <KpiCard label="Return rate" value={`${rate}%`} icon={Undo2} tone="warning" compact />
        <KpiCard
          label="Cancelled"
          value={kpis?.cancelledOrders ?? 0}
          icon={XCircle}
          tone="danger"
          compact
        />
      </div>

      <ReportPanel title="Returns overview" description="Derived from cancellations and refund KPIs">
        <ReportDataTable
          columns={[
            { id: "item", label: "Metric" },
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
