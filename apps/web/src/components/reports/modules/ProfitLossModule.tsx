"use client";

import { DollarSign, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function ProfitLossModule({ kpis, money }: ModuleBaseProps) {
  const revenue = kpis?.totalRevenue ?? 0;
  const expense =
    kpis?.totalExpense ??
    (kpis?.shippingCost ?? 0) + (kpis?.refundAmount ?? 0) + (kpis?.discountTotal ?? 0);
  const net = kpis?.netIncome ?? kpis?.netProfit ?? revenue - expense;

  const rows = [
    { id: "revenue", line: "Revenue", amountLabel: money(revenue) },
    { id: "cogs", line: "Less: Refunds", amountLabel: `(${money(kpis?.refundAmount ?? 0)})` },
    { id: "ship", line: "Less: Shipping", amountLabel: `(${money(kpis?.shippingCost ?? 0)})` },
    { id: "disc", line: "Less: Discounts", amountLabel: `(${money(kpis?.discountTotal ?? 0)})` },
    { id: "expense", line: "Total expense", amountLabel: money(expense) },
    { id: "net", line: "Net income", amountLabel: money(net) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard label="Revenue" value={money(revenue)} icon={DollarSign} tone="success" compact />
        <KpiCard label="Expense" value={money(expense)} icon={TrendingDown} tone="danger" compact />
        <KpiCard
          label="Net income"
          value={money(net)}
          icon={net >= 0 ? TrendingUp : Scale}
          tone={net >= 0 ? "success" : "danger"}
          compact
        />
      </div>

      <ReportPanel title="Profit & loss statement" description="Simplified P&L from store finance KPIs">
        <ReportDataTable
          columns={[
            { id: "line", label: "Line item" },
            { id: "amountLabel", label: "Amount", align: "right" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
          searchable={false}
        />
      </ReportPanel>
    </div>
  );
}
