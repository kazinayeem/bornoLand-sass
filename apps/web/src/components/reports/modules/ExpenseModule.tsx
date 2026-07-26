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
import { Truck, RotateCcw, Wallet } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ChartCard } from "../shared/ChartCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ModuleBaseProps } from "./module-types";

export function ExpenseModule({ kpis, money }: ModuleBaseProps) {
  const shipping = kpis?.shippingCost ?? 0;
  const refunds = kpis?.refundAmount ?? 0;
  const discounts = kpis?.discountTotal ?? 0;
  const total = kpis?.totalExpense ?? shipping + refunds + discounts;

  const chart = [
    { name: "Shipping", amount: shipping },
    { name: "Refunds", amount: refunds },
    { name: "Discounts", amount: discounts },
  ].filter((r) => r.amount > 0);

  const rows = [
    { id: "shipping", category: "Shipping", amountLabel: money(shipping) },
    { id: "refunds", category: "Refunds", amountLabel: money(refunds) },
    { id: "discounts", category: "Discounts", amountLabel: money(discounts) },
    { id: "total", category: "Total expense", amountLabel: money(total) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard label="Total expense" value={money(total)} icon={Wallet} tone="danger" compact />
        <KpiCard label="Shipping" value={money(shipping)} icon={Truck} tone="warning" compact />
        <KpiCard label="Refunds" value={money(refunds)} icon={RotateCcw} tone="danger" compact />
      </div>

      <ChartCard title="Expense breakdown" empty={chart.length === 0} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={48} />
            <Tooltip formatter={(v) => money(Number(v || 0))} />
            <Bar dataKey="amount" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ReportPanel title="Expense ledger">
        <ReportDataTable
          columns={[
            { id: "category", label: "Category" },
            { id: "amountLabel", label: "Amount", align: "right" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
        />
      </ReportPanel>
    </div>
  );
}
