import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  requireFeatureAccess,
  requireAnyFeature,
} from "../../common/middleware/feature.middleware.js";
import {
  getInventoryController,
  getInventoryStatsController,
  adjustStockController,
  getStockHistoryController,
  getInventoryAnalyticsController,
  bulkUpdateController,
  bulkArchiveController,
  bulkDeleteController,
} from "./inventory.controller.js";
import {
  listSuppliersController,
  createSupplierController,
  updateSupplierController,
  deleteSupplierController,
  listWarehousesController,
  createWarehouseController,
  updateWarehouseController,
  deleteWarehouseController,
  listPurchaseOrdersController,
  createPurchaseOrderController,
  updatePurchaseOrderController,
  receivePurchaseOrderController,
  listTransfersController,
  createTransferController,
  approveTransferController,
  completeTransferController,
  listBatchesController,
  listBatchesByProductController,
  listPriceHistoryController,
  listCostHistoryController,
  listTimelineController,
  listAuditController,
  valuationReportController,
  agingReportController,
  barcodeSearchController,
  barcodeGenerateController,
  getAlertSettingsController,
  putAlertSettingsController,
} from "./inventory-erp.controller.js";

export const inventoryRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const featureGuard = requireFeatureAccess("inventory", { getStoreId: storeId });
const historyGuard = requireAnyFeature(["inventory_history", "inventory"], { getStoreId: storeId });
const suppliersGuard = requireFeatureAccess("suppliers", { getStoreId: storeId });
const warehousesGuard = requireFeatureAccess("warehouses", { getStoreId: storeId });
const purchaseOrdersGuard = requireFeatureAccess("purchase_orders", { getStoreId: storeId });
const stockTransferGuard = requireFeatureAccess("stock_transfer", { getStoreId: storeId });
const batchFifoGuard = requireFeatureAccess("batch_fifo", { getStoreId: storeId });
const priceHistoryGuard = requireFeatureAccess("price_history", { getStoreId: storeId });
const costHistoryGuard = requireFeatureAccess("cost_history", { getStoreId: storeId });
const timelineGuard = requireAnyFeature(["inventory_history", "inventory"], { getStoreId: storeId });
const auditGuard = requireFeatureAccess("inventory_audit_log", { getStoreId: storeId });
const reportsGuard = requireFeatureAccess("inventory_reports", { getStoreId: storeId });
const barcodeGuard = requireFeatureAccess("barcode", { getStoreId: storeId });
const alertsGuard = requireFeatureAccess("low_stock_alerts", { getStoreId: storeId });

inventoryRouter.use(requireAuth);

// Existing inventory routes (inventory feature)
inventoryRouter.get("/", featureGuard, getInventoryController);
inventoryRouter.get("/stats", featureGuard, getInventoryStatsController);
inventoryRouter.get("/analytics", featureGuard, getInventoryAnalyticsController);
inventoryRouter.get("/history", historyGuard, getStockHistoryController);

// Enterprise ERP routes — register before /:productId/adjust
inventoryRouter.get("/suppliers", suppliersGuard, listSuppliersController);
inventoryRouter.post("/suppliers", suppliersGuard, createSupplierController);
inventoryRouter.put("/suppliers/:id", suppliersGuard, updateSupplierController);
inventoryRouter.delete("/suppliers/:id", suppliersGuard, deleteSupplierController);

inventoryRouter.get("/warehouses", warehousesGuard, listWarehousesController);
inventoryRouter.post("/warehouses", warehousesGuard, createWarehouseController);
inventoryRouter.put("/warehouses/:id", warehousesGuard, updateWarehouseController);
inventoryRouter.delete("/warehouses/:id", warehousesGuard, deleteWarehouseController);

inventoryRouter.get("/purchase-orders", purchaseOrdersGuard, listPurchaseOrdersController);
inventoryRouter.post("/purchase-orders", purchaseOrdersGuard, createPurchaseOrderController);
inventoryRouter.put("/purchase-orders/:id", purchaseOrdersGuard, updatePurchaseOrderController);
inventoryRouter.post("/purchase-orders/:id/receive", purchaseOrdersGuard, receivePurchaseOrderController);

inventoryRouter.get("/transfers", stockTransferGuard, listTransfersController);
inventoryRouter.post("/transfers", stockTransferGuard, createTransferController);
inventoryRouter.post("/transfers/:id/approve", stockTransferGuard, approveTransferController);
inventoryRouter.post("/transfers/:id/complete", stockTransferGuard, completeTransferController);

inventoryRouter.get("/batches", batchFifoGuard, listBatchesController);
inventoryRouter.get("/batches/product/:productId", batchFifoGuard, listBatchesByProductController);

inventoryRouter.get("/price-history", priceHistoryGuard, listPriceHistoryController);
inventoryRouter.get("/cost-history", costHistoryGuard, listCostHistoryController);
inventoryRouter.get("/timeline/:productId", timelineGuard, listTimelineController);
inventoryRouter.get("/audit", auditGuard, listAuditController);

inventoryRouter.get("/reports/valuation", reportsGuard, valuationReportController);
inventoryRouter.get("/reports/aging", reportsGuard, agingReportController);

inventoryRouter.get("/barcode/search", barcodeGuard, barcodeSearchController);
inventoryRouter.post("/barcode/generate", barcodeGuard, barcodeGenerateController);

inventoryRouter.get("/alerts/settings", alertsGuard, getAlertSettingsController);
inventoryRouter.put("/alerts/settings", alertsGuard, putAlertSettingsController);

// Existing mutate routes
inventoryRouter.post("/:productId/adjust", featureGuard, adjustStockController);
inventoryRouter.post("/bulk/update", featureGuard, bulkUpdateController);
inventoryRouter.post("/bulk/archive", featureGuard, bulkArchiveController);
inventoryRouter.post("/bulk/delete", featureGuard, bulkDeleteController);
