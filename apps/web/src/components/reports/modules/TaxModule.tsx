"use client";

import { Receipt, Info } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function TaxModule({ kpis, money }: ModuleBaseProps) {
  const tax = kpis?.taxCollected ?? 0;
  const rows = [
    {
      id: "tax",
      item: "Tax collected",
      amountLabel: money(tax),
      note: "From order finance fields in selected period",
    },
    {
      id: "gross",
      item: "Gross sales",
      amountLabel: money(kpis?.grossSales ?? kpis?.totalRevenue ?? 0),
      note: "Before refunds",
    },
    {
      id: "net",
      item: "Net revenue",
      amountLabel: money(kpis?.totalRevenue ?? 0),
      note: "After refunds where available",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <KpiCard label="Tax collected" value={money(tax)} icon={Receipt} tone="info" compact />
        <KpiCard
          label="Tax as % of revenue"
          value={
            (kpis?.totalRevenue ?? 0) > 0
              ? `${((tax / (kpis?.totalRevenue || 1)) * 100).toFixed(1)}%`
              : "0%"
          }
          icon={Receipt}
          tone="neutral"
          compact
        />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-apple-hairline bg-apple-canvas-parchment/50 px-3 py-2 text-[11px] text-apple-ink-muted-80">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Tax figures come from order finance fields. Configure tax rates in store settings for accurate
        collection reporting.
      </div>

      <ReportPanel title="Tax summary">
        <ReportDataTable
          columns={[
            { id: "item", label: "Item" },
            { id: "amountLabel", label: "Amount", align: "right" },
            { id: "note", label: "Note" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
        />
      </ReportPanel>
    </div>
  );
}
