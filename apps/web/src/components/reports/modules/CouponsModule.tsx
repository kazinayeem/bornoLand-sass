"use client";

import { Ticket, Percent } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { CouponsModuleProps } from "./module-types";

export function CouponsModule({ kpis, couponReport, money }: CouponsModuleProps) {
  const rows = (couponReport?.usedCoupons ?? []).map((c) => ({
    id: String(c._id),
    code: String(c._id),
    count: c.count,
    discountLabel: money(c.totalDiscount),
  }));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard
          label="Total coupons"
          value={couponReport?.totalCoupons ?? 0}
          icon={Ticket}
          tone="info"
          compact
        />
        <KpiCard
          label="Coupons used"
          value={kpis?.couponsUsed ?? rows.reduce((s, r) => s + Number(r.count), 0)}
          icon={Ticket}
          tone="success"
          compact
        />
        <KpiCard
          label="Discount total"
          value={money(
            kpis?.discountTotal ??
              (couponReport?.usedCoupons ?? []).reduce((s, r) => s + (r.totalDiscount || 0), 0),
          )}
          icon={Percent}
          tone="warning"
          compact
        />
      </div>

      <ReportPanel title="Coupon usage" description="Discount codes redeemed in range">
        <ReportDataTable
          columns={[
            { id: "code", label: "Code" },
            { id: "count", label: "Uses", align: "right" },
            { id: "discountLabel", label: "Discount", align: "right" },
          ]}
          rows={rows}
          rowKey={(r) => String(r.id)}
          emptyTitle="No coupon usage"
          emptyDescription="Redeemed coupons will appear here."
        />
      </ReportPanel>
    </div>
  );
}
