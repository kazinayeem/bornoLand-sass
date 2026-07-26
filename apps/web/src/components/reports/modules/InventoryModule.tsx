"use client";

import { AlertTriangle, Package, Warehouse } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import { EmptyState } from "../shared/EmptyState";
import type { InventoryModuleProps } from "./module-types";

export function InventoryModule({ kpis, productReport, money }: InventoryModuleProps) {
  const lowStock = (kpis?.lowStockItems ?? []).map((p) => ({
    id: p._id,
    name: p.name,
    sku: p.sku || "—",
    stock: p.stock,
    priceLabel: money(p.price ?? 0),
  }));

  const topWithStock = (productReport?.topProducts ?? []).map((p, i) => ({
    id: String(i),
    name: p.name,
    stock: p.stock,
    sold: p.totalSold,
    revenueLabel: money(p.revenue),
  }));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <KpiCard
          label="Inventory value"
          value={money(kpis?.inventoryValue ?? 0)}
          icon={Warehouse}
          tone="info"
          compact
        />
        <KpiCard
          label="Low stock"
          value={productReport?.lowStock ?? kpis?.lowStockProducts ?? 0}
          icon={AlertTriangle}
          tone="warning"
          compact
        />
        <KpiCard
          label="Out of stock"
          value={productReport?.outOfStock ?? kpis?.outOfStockProducts ?? 0}
          icon={Package}
          tone="danger"
          compact
        />
        <KpiCard
          label="Catalog size"
          value={productReport?.total ?? 0}
          icon={Package}
          tone="neutral"
          compact
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ReportPanel title="Low stock items" description="From dashboard alerts">
          {lowStock.length === 0 ? (
            <EmptyState title="Stock looks healthy" description="No low-stock products in this range." className="py-8" />
          ) : (
            <ReportDataTable
              columns={[
                { id: "name", label: "Product" },
                { id: "sku", label: "SKU" },
                { id: "stock", label: "Stock", align: "right" },
                { id: "priceLabel", label: "Price", align: "right" },
              ]}
              rows={lowStock}
              rowKey={(r) => String(r.id)}
            />
          )}
        </ReportPanel>

        <ReportPanel title="Product stock snapshot" description="From product report">
          <ReportDataTable
            columns={[
              { id: "name", label: "Product" },
              { id: "stock", label: "Stock", align: "right" },
              { id: "sold", label: "Sold", align: "right" },
              { id: "revenueLabel", label: "Revenue", align: "right" },
            ]}
            rows={topWithStock}
            rowKey={(r) => String(r.id)}
            emptyTitle="No inventory rows"
          />
        </ReportPanel>
      </div>
    </div>
  );
}
