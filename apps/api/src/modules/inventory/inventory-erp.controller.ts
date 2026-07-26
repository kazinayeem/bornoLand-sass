import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrder,
  listStockTransfers,
  createStockTransfer,
  approveStockTransfer,
  completeStockTransfer,
  listBatches,
  listBatchesByProduct,
  listPriceHistory,
  listCostHistory,
  listProductTimeline,
  listInventoryAudit,
  getLowStockAlertSettings,
  setLowStockAlertSettings,
  searchByBarcode,
  generateBarcode,
  stockValuationReport,
  inventoryAgingReport,
  lowStockReport,
  outOfStockReport,
  deadStockReport,
} from "./inventory-erp.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? "");
}

function actorOf(request: AuthRequest) {
  return {
    actorId: request.user?.userId,
    actorName: request.user?.userId ? "user" : "system",
  };
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function listSuppliersController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listSuppliers(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      search: String(request.query.search || ""),
      status: String(request.query.status || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] list suppliers:", error);
    response.status(500).json({ ok: false, message: "Failed to list suppliers" });
  }
}

export async function createSupplierController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const result = await createSupplier(storeId, request.body ?? {});
    if (!result.ok) return void response.status(400).json(result);
    response.status(201).json(result);
  } catch (error) {
    console.error("[Inventory ERP] create supplier:", error);
    response.status(500).json({ ok: false, message: "Failed to create supplier" });
  }
}

export async function updateSupplierController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const result = await updateSupplier(storeId, id, request.body ?? {});
    if (!result.ok) return void response.status(404).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] update supplier:", error);
    response.status(500).json({ ok: false, message: "Failed to update supplier" });
  }
}

export async function deleteSupplierController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const result = await deleteSupplier(storeId, id);
    if (!result.ok) return void response.status(404).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] delete supplier:", error);
    response.status(500).json({ ok: false, message: "Failed to delete supplier" });
  }
}

// ─── Warehouses ──────────────────────────────────────────────────────────────

export async function listWarehousesController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listWarehouses(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      search: String(request.query.search || ""),
      status: String(request.query.status || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] list warehouses:", error);
    response.status(500).json({ ok: false, message: "Failed to list warehouses" });
  }
}

export async function createWarehouseController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const result = await createWarehouse(storeId, request.body ?? {});
    if (!result.ok) return void response.status(400).json(result);
    response.status(201).json(result);
  } catch (error) {
    console.error("[Inventory ERP] create warehouse:", error);
    response.status(500).json({ ok: false, message: "Failed to create warehouse" });
  }
}

export async function updateWarehouseController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const result = await updateWarehouse(storeId, id, request.body ?? {});
    if (!result.ok) return void response.status(404).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] update warehouse:", error);
    response.status(500).json({ ok: false, message: "Failed to update warehouse" });
  }
}

export async function deleteWarehouseController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const result = await deleteWarehouse(storeId, id);
    if (!result.ok) return void response.status(400).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] delete warehouse:", error);
    response.status(500).json({ ok: false, message: "Failed to delete warehouse" });
  }
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export async function listPurchaseOrdersController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listPurchaseOrders(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      status: String(request.query.status || ""),
      supplierId: String(request.query.supplierId || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] list POs:", error);
    response.status(500).json({ ok: false, message: "Failed to list purchase orders" });
  }
}

export async function createPurchaseOrderController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const result = await createPurchaseOrder(storeId, {
      ...(request.body ?? {}),
      createdBy: request.user?.userId,
    });
    if (!result.ok) return void response.status(400).json(result);
    response.status(201).json(result);
  } catch (error) {
    console.error("[Inventory ERP] create PO:", error);
    response.status(500).json({ ok: false, message: "Failed to create purchase order" });
  }
}

export async function updatePurchaseOrderController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const result = await updatePurchaseOrderStatus(storeId, id, request.body ?? {});
    if (!result.ok) return void response.status(400).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] update PO:", error);
    response.status(500).json({ ok: false, message: "Failed to update purchase order" });
  }
}

export async function receivePurchaseOrderController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const actor = actorOf(request);
    const result = await receivePurchaseOrder(storeId, id, {
      items: request.body?.items,
      actorId: actor.actorId,
      actorName: actor.actorName,
    });
    if (!result.ok) return void response.status(400).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] receive PO:", error);
    response.status(500).json({ ok: false, message: "Failed to receive purchase order" });
  }
}

// ─── Transfers ───────────────────────────────────────────────────────────────

export async function listTransfersController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listStockTransfers(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      status: String(request.query.status || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] list transfers:", error);
    response.status(500).json({ ok: false, message: "Failed to list transfers" });
  }
}

export async function createTransferController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const result = await createStockTransfer(storeId, {
      ...(request.body ?? {}),
      createdBy: request.user?.userId,
    });
    if (!result.ok) return void response.status(400).json(result);
    response.status(201).json(result);
  } catch (error) {
    console.error("[Inventory ERP] create transfer:", error);
    response.status(500).json({ ok: false, message: "Failed to create transfer" });
  }
}

export async function approveTransferController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const result = await approveStockTransfer(storeId, id, { approvedBy: request.user?.userId });
    if (!result.ok) return void response.status(400).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] approve transfer:", error);
    response.status(500).json({ ok: false, message: "Failed to approve transfer" });
  }
}

export async function completeTransferController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const id = String(request.params.id ?? "");
    if (!storeId || !id) return void response.status(400).json({ ok: false, message: "storeId and id are required" });
    const actor = actorOf(request);
    const result = await completeStockTransfer(storeId, id, {
      actorId: actor.actorId,
      actorName: actor.actorName,
    });
    if (!result.ok) return void response.status(400).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] complete transfer:", error);
    response.status(500).json({ ok: false, message: "Failed to complete transfer" });
  }
}

// ─── Batches ─────────────────────────────────────────────────────────────────

export async function listBatchesController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listBatches(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      productId: String(request.query.productId || ""),
      status: String(request.query.status || ""),
      warehouseId: String(request.query.warehouseId || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] list batches:", error);
    response.status(500).json({ ok: false, message: "Failed to list batches" });
  }
}

export async function listBatchesByProductController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const productId = String(request.params.productId ?? "");
    if (!storeId || !productId) {
      return void response.status(400).json({ ok: false, message: "storeId and productId are required" });
    }
    const data = await listBatchesByProduct(storeId, productId);
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] list product batches:", error);
    response.status(500).json({ ok: false, message: "Failed to list product batches" });
  }
}

// ─── History / Timeline / Audit ───────────────────────────────────────────────

export async function listPriceHistoryController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listPriceHistory(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      productId: String(request.query.productId || ""),
      variantId: String(request.query.variantId || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] price history:", error);
    response.status(500).json({ ok: false, message: "Failed to load price history" });
  }
}

export async function listCostHistoryController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listCostHistory(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      productId: String(request.query.productId || ""),
      variantId: String(request.query.variantId || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] cost history:", error);
    response.status(500).json({ ok: false, message: "Failed to load cost history" });
  }
}

export async function listTimelineController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const productId = String(request.params.productId ?? "");
    if (!storeId || !productId) {
      return void response.status(400).json({ ok: false, message: "storeId and productId are required" });
    }
    const data = await listProductTimeline(storeId, productId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] timeline:", error);
    response.status(500).json({ ok: false, message: "Failed to load timeline" });
  }
}

export async function listAuditController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await listInventoryAudit(storeId, {
      page: Number(request.query.page) || 1,
      perPage: Number(request.query.perPage) || 25,
      entityType: String(request.query.entityType || ""),
      entityId: String(request.query.entityId || ""),
      action: String(request.query.action || ""),
    });
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] audit:", error);
    response.status(500).json({ ok: false, message: "Failed to load audit log" });
  }
}

// ─── Reports / Barcode / Alerts ──────────────────────────────────────────────

export async function valuationReportController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await stockValuationReport(storeId);
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] valuation:", error);
    response.status(500).json({ ok: false, message: "Failed to load valuation report" });
  }
}

export async function agingReportController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const [aging, lowStock, outOfStock, deadStock] = await Promise.all([
      inventoryAgingReport(storeId),
      lowStockReport(storeId),
      outOfStockReport(storeId),
      deadStockReport(storeId, Number(request.query.days) || 90),
    ]);
    response.json({ ok: true, data: { aging, lowStock, outOfStock, deadStock } });
  } catch (error) {
    console.error("[Inventory ERP] aging:", error);
    response.status(500).json({ ok: false, message: "Failed to load aging report" });
  }
}

export async function barcodeSearchController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const barcode = String(request.query.barcode || request.query.q || "");
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const result = await searchByBarcode(storeId, barcode);
    if (!result.ok) return void response.status(404).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] barcode search:", error);
    response.status(500).json({ ok: false, message: "Failed to search barcode" });
  }
}

export async function barcodeGenerateController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const { productId, variantId, barcode } = request.body ?? {};
    if (!productId) return void response.status(400).json({ ok: false, message: "productId is required" });
    const result = await generateBarcode(storeId, { productId, variantId, barcode });
    if (!result.ok) return void response.status(404).json(result);
    response.json(result);
  } catch (error) {
    console.error("[Inventory ERP] barcode generate:", error);
    response.status(500).json({ ok: false, message: "Failed to generate barcode" });
  }
}

export async function getAlertSettingsController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await getLowStockAlertSettings(storeId);
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] get alerts:", error);
    response.status(500).json({ ok: false, message: "Failed to load alert settings" });
  }
}

export async function putAlertSettingsController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    if (!storeId) return void response.status(400).json({ ok: false, message: "storeId is required" });
    const data = await setLowStockAlertSettings(storeId, request.body ?? {});
    response.json({ ok: true, data });
  } catch (error) {
    console.error("[Inventory ERP] put alerts:", error);
    response.status(500).json({ ok: false, message: "Failed to update alert settings" });
  }
}
