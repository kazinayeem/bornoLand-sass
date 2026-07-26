"use client";

import { RotateCcw, UserPlus, Users } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { CustomersModuleProps } from "./module-types";

export function CustomersModule({ kpis, customerReport, money }: CustomersModuleProps) {
  const top = (customerReport?.topCustomers ?? kpis?.topCustomers ?? []).map((c, i) => {
    const row = c as {
      _id?: string;
      name?: string;
      email?: string;
      totalSpent?: number;
      orderCount?: number;
    };
    return {
      id: row._id ?? String(i),
      name: row.name || "Customer",
      email: row.email || "—",
      orderCount: row.orderCount ?? 0,
      totalSpentLabel: money(row.totalSpent ?? 0),
    };
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <KpiCard
          label="Total customers"
          value={customerReport?.total ?? kpis?.totalCustomers ?? 0}
          icon={Users}
          tone="info"
          compact
        />
        <KpiCard
          label="New customers"
          value={customerReport?.newCustomers ?? kpis?.newCustomers ?? 0}
          icon={UserPlus}
          tone="success"
          compact
        />
        <KpiCard
          label="Returning"
          value={kpis?.returningCustomers ?? 0}
          icon={RotateCcw}
          tone="info"
          compact
        />
        <KpiCard
          label="Conversion"
          value={`${kpis?.conversionRate ?? 0}%`}
          icon={Users}
          tone="neutral"
          compact
        />
      </div>

      <ReportPanel title="Top customers" description="Highest lifetime spend in range">
        <ReportDataTable
          columns={[
            { id: "name", label: "Name" },
            { id: "email", label: "Email" },
            { id: "orderCount", label: "Orders", align: "right" },
            { id: "totalSpentLabel", label: "Spent", align: "right" },
          ]}
          rows={top}
          rowKey={(r) => String(r.id)}
          emptyTitle="No customers yet"
        />
      </ReportPanel>
    </div>
  );
}
