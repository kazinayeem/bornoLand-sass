"use client";

import { Package, AlertTriangle, Ban } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import type { ProductsModuleProps } from "./module-types";

export function ProductsModule({ kpis, productReport, money }: ProductsModuleProps) {
  const top = (productReport?.topProducts ?? kpis?.topProducts ?? []).map((p, i) => {
    const row = p as {
      _id?: string;
      name?: string;
      totalSold?: number;
      revenue?: number;
      stock?: number;
    };
    return {
      id: row._id ?? String(i),
      name: row.name ?? "Product",
      totalSold: row.totalSold ?? 0,
      revenue: row.revenue ?? 0,
      revenueLabel: money(row.revenue ?? 0),
      stock: row.stock ?? "—",
    };
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard label="Products" value={productReport?.total ?? 0} icon={Package} tone="neutral" compact />
        <KpiCard
          label="Units sold"
          value={kpis?.productsSold ?? 0}
          icon={Package}
          tone="success"
          compact
        />
        <KpiCard
          label="Low / out of stock"
          value={`${productReport?.lowStock ?? kpis?.lowStockProducts ?? 0} / ${productReport?.outOfStock ?? kpis?.outOfStockProducts ?? 0}`}
          icon={AlertTriangle}
          tone="warning"
          compact
        />
      </div>

      <ReportPanel title="Top products" description="Sorted by revenue from product report">
        <ReportDataTable
          columns={[
            { id: "name", label: "Product" },
            { id: "totalSold", label: "Sold", align: "right" },
            { id: "revenueLabel", label: "Revenue", align: "right" },
            { id: "stock", label: "Stock", align: "right" },
          ]}
          rows={top}
          rowKey={(r) => String(r.id)}
          emptyTitle="No product sales"
          emptyDescription="Products will appear here once orders include line items."
        />
      </ReportPanel>

      {(productReport?.outOfStock ?? 0) > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {productReport?.outOfStock} product{productReport?.outOfStock === 1 ? "" : "s"} are out of
          stock. Review inventory to avoid lost sales.
        </div>
      ) : null}
    </div>
  );
}
