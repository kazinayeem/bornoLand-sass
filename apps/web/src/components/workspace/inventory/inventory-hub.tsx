"use client";

import { useMemo, useState } from "react";
import {
  Package,
  History,
  BarChart3,
  Truck,
  Warehouse,
  ClipboardList,
  Layers,
  ArrowLeftRight,
  ScanBarcode,
  Bell,
  ScrollText,
  DollarSign,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFeatureByKey, type FeatureAccessItem } from "@/redux/api/feature-api";
import { InventoryTab } from "@/components/workspace/inventory-tab";
import {
  SuppliersModule,
  WarehousesModule,
  PurchaseOrdersModule,
  BatchesModule,
  TransfersModule,
  PriceHistoryModule,
  CostHistoryModule,
  ReportsModule,
  BarcodeModule,
  AlertsModule,
  AuditModule,
} from "@/components/workspace/inventory/inventory-modules";

export type InventoryHubSection =
  | "stock"
  | "history"
  | "price_history"
  | "cost_history"
  | "suppliers"
  | "purchase_orders"
  | "batches"
  | "warehouses"
  | "transfers"
  | "barcode"
  | "reports"
  | "alerts"
  | "audit";

type NavItem = {
  id: InventoryHubSection;
  label: string;
  icon: typeof Package;
  featureKey: string;
  /** Always show when base inventory is unlocked */
  alwaysWithInventory?: boolean;
};

const NAV: NavItem[] = [
  { id: "stock", label: "Current Stock", icon: Package, featureKey: "inventory", alwaysWithInventory: true },
  { id: "history", label: "Inventory History", icon: History, featureKey: "inventory_history" },
  { id: "price_history", label: "Price History", icon: DollarSign, featureKey: "price_history" },
  { id: "cost_history", label: "Cost History", icon: Coins, featureKey: "cost_history" },
  { id: "suppliers", label: "Suppliers", icon: Truck, featureKey: "suppliers" },
  { id: "purchase_orders", label: "Purchase Orders", icon: ClipboardList, featureKey: "purchase_orders" },
  { id: "batches", label: "Batch / FIFO", icon: Layers, featureKey: "batch_fifo" },
  { id: "warehouses", label: "Warehouses", icon: Warehouse, featureKey: "warehouses" },
  { id: "transfers", label: "Stock Transfer", icon: ArrowLeftRight, featureKey: "stock_transfer" },
  { id: "barcode", label: "Barcode", icon: ScanBarcode, featureKey: "barcode" },
  { id: "reports", label: "Reports", icon: BarChart3, featureKey: "inventory_reports" },
  { id: "alerts", label: "Low Stock Alerts", icon: Bell, featureKey: "low_stock_alerts" },
  { id: "audit", label: "Audit Log", icon: ScrollText, featureKey: "inventory_audit_log" },
];

function featureEnabled(features: FeatureAccessItem[], key: string) {
  const f = getFeatureByKey(features, key);
  return Boolean(f && f.enabled && !f.locked);
}

export function InventoryHub({
  storeId,
  features,
}: {
  storeId: string;
  features: FeatureAccessItem[];
}) {
  const visibleNav = useMemo(
    () =>
      NAV.filter((item) => {
        if (item.alwaysWithInventory) return featureEnabled(features, "inventory");
        return featureEnabled(features, item.featureKey);
      }),
    [features]
  );

  const [section, setSection] = useState<InventoryHubSection>("stock");
  const active = visibleNav.some((n) => n.id === section) ? section : (visibleNav[0]?.id ?? "stock");

  const hasHistory = featureEnabled(features, "inventory_history");
  const hasReports = featureEnabled(features, "inventory_reports");

  return (
    <div className="space-y-5">
      {visibleNav.length > 1 && (
        <nav className="flex flex-wrap gap-1 rounded-2xl border border-apple-hairline bg-white/80 p-1.5 dark:border-zinc-800 dark:bg-zinc-950/60">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-apple-ink text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-apple-ink-muted-48 hover:bg-zinc-100 hover:text-apple-ink dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {active === "stock" && (
        <InventoryTab
          storeId={storeId}
          enableHistory={hasHistory}
          enableAnalytics={hasReports}
          stockOnly={!hasHistory && !hasReports}
        />
      )}
      {active === "history" && <InventoryTab storeId={storeId} enableHistory forceHistoryTab />}
      {active === "price_history" && <PriceHistoryModule storeId={storeId} />}
      {active === "cost_history" && <CostHistoryModule storeId={storeId} />}
      {active === "suppliers" && <SuppliersModule storeId={storeId} />}
      {active === "purchase_orders" && <PurchaseOrdersModule storeId={storeId} />}
      {active === "batches" && <BatchesModule storeId={storeId} />}
      {active === "warehouses" && <WarehousesModule storeId={storeId} />}
      {active === "transfers" && <TransfersModule storeId={storeId} />}
      {active === "barcode" && <BarcodeModule storeId={storeId} />}
      {active === "reports" && <ReportsModule storeId={storeId} />}
      {active === "alerts" && <AlertsModule storeId={storeId} />}
      {active === "audit" && <AuditModule storeId={storeId} />}
    </div>
  );
}
