"use client";

import { useMemo, useState } from "react";
import { getFeatureByKey, type FeatureAccessItem } from "@/redux/api/feature-api";
import { InventoryTab } from "@/components/workspace/inventory-tab";
import { InventoryNav, type InventoryNavSection } from "@/components/inventory/inventory-nav";
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

function featureEnabled(features: FeatureAccessItem[], key: string) {
  const f = getFeatureByKey(features, key);
  return Boolean(f && f.enabled && !f.locked);
}

export function InventoryHub({
  storeId,
  features = [],
}: {
  storeId: string;
  features: FeatureAccessItem[];
}) {
  const [section, setSection] = useState<InventoryNavSection>("stock");

  const lockedModules = useMemo(() => {
    return {
      history: !featureEnabled(features, "inventory_history"),
      price_history: !featureEnabled(features, "price_history"),
      cost_history: !featureEnabled(features, "cost_history"),
      suppliers: !featureEnabled(features, "suppliers"),
      purchase_orders: !featureEnabled(features, "purchase_orders"),
      batches: !featureEnabled(features, "batch_fifo"),
      warehouses: !featureEnabled(features, "warehouses"),
      transfers: !featureEnabled(features, "stock_transfer"),
      barcode: !featureEnabled(features, "barcode"),
      reports: !featureEnabled(features, "inventory_reports"),
      alerts: !featureEnabled(features, "low_stock_alerts"),
      audit: !featureEnabled(features, "inventory_audit_log"),
    };
  }, [features]);

  const hasHistory = featureEnabled(features, "inventory_history");
  const hasReports = featureEnabled(features, "inventory_reports");

  return (
    <div className="space-y-6">
      <InventoryNav
        activeSection={section}
        onSelectSection={setSection}
        lockedModules={lockedModules}
      />

      {section === "stock" && (
        <InventoryTab
          storeId={storeId}
          enableHistory={hasHistory}
          enableAnalytics={hasReports}
          stockOnly={!hasHistory && !hasReports}
        />
      )}
      {section === "history" && <InventoryTab storeId={storeId} enableHistory forceHistoryTab />}
      {section === "price_history" && <PriceHistoryModule storeId={storeId} />}
      {section === "cost_history" && <CostHistoryModule storeId={storeId} />}
      {section === "suppliers" && <SuppliersModule storeId={storeId} />}
      {section === "purchase_orders" && <PurchaseOrdersModule storeId={storeId} />}
      {section === "batches" && <BatchesModule storeId={storeId} />}
      {section === "warehouses" && <WarehousesModule storeId={storeId} />}
      {section === "transfers" && <TransfersModule storeId={storeId} />}
      {section === "barcode" && <BarcodeModule storeId={storeId} />}
      {section === "reports" && <ReportsModule storeId={storeId} />}
      {section === "analytics" && <ReportsModule storeId={storeId} />}
      {section === "alerts" && <AlertsModule storeId={storeId} />}
      {section === "audit" && <AuditModule storeId={storeId} />}
    </div>
  );
}
