import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { ProductModel } from "../products/product.model.js";
import { ProductVariantModel } from "../products/variants/product-variant.model.js";
import { VariantInventoryModel } from "../products/variants/variant-inventory.model.js";
import { VariantPriceModel } from "../products/variants/variant-price.model.js";
import { StoreSettingsModel } from "../stores/store-settings.model.js";
import { checkFeature } from "../features/feature-access.service.js";
import { StockLogModel } from "./stock-log.model.js";
import { WarehouseModel } from "./warehouse.model.js";
import { SupplierModel } from "./supplier.model.js";
import { PurchaseOrderModel } from "./purchase-order.model.js";
import { StockBatchModel } from "./stock-batch.model.js";
import { StockTransferModel } from "./stock-transfer.model.js";
import { PriceHistoryModel } from "./price-history.model.js";
import { CostHistoryModel } from "./cost-history.model.js";
import { InventoryAuditModel } from "./inventory-audit.model.js";
import { ProductTimelineModel } from "./product-timeline.model.js";

function oid(id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

function storeOid(storeId: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (typeof storeId !== "string") return storeId as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(storeId) && String(new mongoose.Types.ObjectId(storeId)) === storeId) {
    return new mongoose.Types.ObjectId(storeId);
  }
  return new mongoose.Types.ObjectId("000000000000000000000000");
}

function genCode(prefix: string) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

async function writeStockLog(payload: {
  storeId: string | mongoose.Types.ObjectId;
  productId: string | mongoose.Types.ObjectId;
  variantId?: string | mongoose.Types.ObjectId | null;
  warehouseId?: string | mongoose.Types.ObjectId | null;
  batchId?: string | mongoose.Types.ObjectId | null;
  previousStock: number;
  newStock: number;
  quantityChange: number;
  reason: string;
  note?: string;
  updatedBy?: string;
  updatedById?: string | mongoose.Types.ObjectId | null;
  source?: "manual" | "order" | "import" | "bulk" | "api" | "system";
  reference?: string;
  referenceId?: string | mongoose.Types.ObjectId | null;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
}) {
  return StockLogModel.create({
    storeId: oid(payload.storeId),
    productId: oid(payload.productId),
    variantId: payload.variantId ? oid(payload.variantId) : null,
    warehouseId: payload.warehouseId ? oid(payload.warehouseId) : null,
    batchId: payload.batchId ? oid(payload.batchId) : null,
    previousStock: payload.previousStock,
    newStock: payload.newStock,
    beforeQuantity: payload.previousStock,
    afterQuantity: payload.newStock,
    quantityChange: payload.quantityChange,
    reason: payload.reason,
    note: payload.note ?? "",
    updatedBy: payload.updatedBy ?? "system",
    updatedById: payload.updatedById ? oid(payload.updatedById) : null,
    source: payload.source ?? "system",
    reference: payload.reference ?? "",
    referenceId: payload.referenceId ? oid(payload.referenceId) : null,
    ipAddress: payload.ipAddress ?? "",
    userAgent: payload.userAgent ?? "",
    device: payload.device ?? "",
  });
}

async function incrementProductStock(
  storeId: string,
  productId: string,
  quantity: number,
  variantId?: string | null
) {
  if (variantId) {
    const inv = await VariantInventoryModel.findOne({
      storeId: storeOid(storeId),
      productId: oid(productId),
      variantId: oid(variantId),
    });
    if (inv) {
      const prev = inv.quantity;
      inv.quantity = Math.max(0, inv.quantity + quantity);
      await inv.save();
      return { previousStock: prev, newStock: inv.quantity };
    }
  }

  const product = await ProductModel.findOne({ _id: productId, storeId: storeOid(storeId) });
  if (!product) return null;
  const prev = product.stock ?? 0;
  product.stock = Math.max(0, prev + quantity);
  await product.save();
  return { previousStock: prev, newStock: product.stock };
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function listSuppliers(
  storeId: string,
  options: { page?: number; perPage?: number; search?: string; status?: string } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.status) match.status = options.status;
  if (options.search) {
    const s = options.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    match.$or = [
      { name: { $regex: s, $options: "i" } },
      { code: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
      { company: { $regex: s, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    SupplierModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    SupplierModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function createSupplier(
  storeId: string,
  payload: {
    name: string;
    code?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    status?: string;
    notes?: string;
  }
) {
  await connectDatabase();
  if (!payload.name?.trim()) return { ok: false as const, message: "name is required" };
  const doc = await SupplierModel.create({
    storeId: storeOid(storeId),
    name: payload.name.trim(),
    code: payload.code?.trim() || "",
    email: payload.email ?? "",
    phone: payload.phone ?? "",
    company: payload.company ?? "",
    address: payload.address ?? "",
    city: payload.city ?? "",
    country: payload.country ?? "",
    status: payload.status ?? "active",
    notes: payload.notes ?? "",
  });
  return { ok: true as const, data: doc.toObject() };
}

export async function updateSupplier(
  storeId: string,
  id: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const allowed = [
    "name",
    "code",
    "email",
    "phone",
    "company",
    "address",
    "city",
    "country",
    "status",
    "notes",
    "totalPurchases",
    "outstandingDue",
  ];
  const $set: Record<string, unknown> = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) $set[key] = payload[key];
  }
  const doc = await SupplierModel.findOneAndUpdate(
    { _id: id, storeId: storeOid(storeId) },
    { $set },
    { new: true }
  ).lean();
  if (!doc) return { ok: false as const, message: "Supplier not found" };
  return { ok: true as const, data: doc };
}

export async function deleteSupplier(storeId: string, id: string) {
  await connectDatabase();
  const doc = await SupplierModel.findOneAndDelete({ _id: id, storeId: storeOid(storeId) }).lean();
  if (!doc) return { ok: false as const, message: "Supplier not found" };
  return { ok: true as const, message: "Supplier deleted" };
}

// ─── Warehouses ──────────────────────────────────────────────────────────────

export async function listWarehouses(
  storeId: string,
  options: { page?: number; perPage?: number; search?: string; status?: string } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.status) match.status = options.status;
  if (options.search) {
    const s = options.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    match.$or = [
      { name: { $regex: s, $options: "i" } },
      { code: { $regex: s, $options: "i" } },
      { city: { $regex: s, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    WarehouseModel.find(match)
      .sort({ isDefault: -1, createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    WarehouseModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function createWarehouse(
  storeId: string,
  payload: {
    name: string;
    code?: string;
    address?: string;
    city?: string;
    phone?: string;
    managerName?: string;
    isDefault?: boolean;
    status?: string;
    notes?: string;
  }
) {
  await connectDatabase();
  if (!payload.name?.trim()) return { ok: false as const, message: "name is required" };

  const existingCount = await WarehouseModel.countDocuments({ storeId: storeOid(storeId) });
  const makeDefault = existingCount === 0 || payload.isDefault === true;

  if (makeDefault) {
    await WarehouseModel.updateMany(
      { storeId: storeOid(storeId), isDefault: true },
      { $set: { isDefault: false } }
    );
  }

  const doc = await WarehouseModel.create({
    storeId: storeOid(storeId),
    name: payload.name.trim(),
    code: payload.code?.trim() || genCode("WH"),
    address: payload.address ?? "",
    city: payload.city ?? "",
    phone: payload.phone ?? "",
    managerName: payload.managerName ?? "",
    isDefault: makeDefault,
    status: payload.status ?? "active",
    notes: payload.notes ?? "",
  });
  return { ok: true as const, data: doc.toObject() };
}

export async function updateWarehouse(
  storeId: string,
  id: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const allowed = [
    "name",
    "code",
    "address",
    "city",
    "phone",
    "managerName",
    "status",
    "notes",
  ];
  const $set: Record<string, unknown> = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) $set[key] = payload[key];
  }

  if (payload.isDefault === true) {
    await WarehouseModel.updateMany(
      { storeId: storeOid(storeId), isDefault: true },
      { $set: { isDefault: false } }
    );
    $set.isDefault = true;
  } else if (payload.isDefault === false) {
    $set.isDefault = false;
  }

  const doc = await WarehouseModel.findOneAndUpdate(
    { _id: id, storeId: storeOid(storeId) },
    { $set },
    { new: true }
  ).lean();
  if (!doc) return { ok: false as const, message: "Warehouse not found" };
  return { ok: true as const, data: doc };
}

export async function deleteWarehouse(storeId: string, id: string) {
  await connectDatabase();
  const doc = await WarehouseModel.findOne({ _id: id, storeId: storeOid(storeId) });
  if (!doc) return { ok: false as const, message: "Warehouse not found" };
  if (doc.isDefault) {
    return { ok: false as const, message: "Cannot delete the default warehouse" };
  }
  await doc.deleteOne();
  return { ok: true as const, message: "Warehouse deleted" };
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

function calcPoTotals(
  items: Array<{ quantity: number; unitCost: number }>,
  tax = 0,
  shipping = 0
) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}

export async function listPurchaseOrders(
  storeId: string,
  options: { page?: number; perPage?: number; status?: string; supplierId?: string } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.status) match.status = options.status;
  if (options.supplierId) match.supplierId = oid(options.supplierId);
  const [items, total] = await Promise.all([
    PurchaseOrderModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("supplierId", "name code")
      .populate("warehouseId", "name code")
      .lean(),
    PurchaseOrderModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function createPurchaseOrder(
  storeId: string,
  payload: {
    supplierId: string;
    warehouseId?: string;
    poNumber?: string;
    status?: string;
    items: Array<{
      productId: string;
      variantId?: string;
      sku?: string;
      name?: string;
      quantity: number;
      unitCost?: number;
    }>;
    tax?: number;
    shipping?: number;
    notes?: string;
    createdBy?: string;
  }
) {
  await connectDatabase();
  if (!payload.supplierId) return { ok: false as const, message: "supplierId is required" };
  if (!payload.items?.length) return { ok: false as const, message: "items are required" };

  const items = payload.items.map((i) => ({
    productId: oid(i.productId),
    variantId: i.variantId ? oid(i.variantId) : null,
    sku: i.sku ?? "",
    name: i.name ?? "",
    quantity: Number(i.quantity) || 0,
    receivedQty: 0,
    unitCost: Number(i.unitCost) || 0,
  }));
  const totals = calcPoTotals(items, payload.tax ?? 0, payload.shipping ?? 0);
  const status = payload.status ?? "draft";

  const doc = await PurchaseOrderModel.create({
    storeId: storeOid(storeId),
    supplierId: oid(payload.supplierId),
    warehouseId: payload.warehouseId ? oid(payload.warehouseId) : null,
    poNumber: payload.poNumber?.trim() || genCode("PO"),
    status,
    items,
    ...totals,
    notes: payload.notes ?? "",
    orderedAt: ["ordered", "partial", "received"].includes(status) ? new Date() : null,
    createdBy: payload.createdBy ? oid(payload.createdBy) : null,
  });
  return { ok: true as const, data: doc.toObject() };
}

export async function updatePurchaseOrderStatus(
  storeId: string,
  id: string,
  payload: { status?: string; notes?: string; warehouseId?: string; tax?: number; shipping?: number }
) {
  await connectDatabase();
  const po = await PurchaseOrderModel.findOne({ _id: id, storeId: storeOid(storeId) });
  if (!po) return { ok: false as const, message: "Purchase order not found" };
  if (po.status === "cancelled" || po.status === "received") {
    return { ok: false as const, message: `Cannot update a ${po.status} purchase order` };
  }

  if (payload.status) {
    po.status = payload.status as typeof po.status;
    if (payload.status === "ordered" && !po.orderedAt) po.orderedAt = new Date();
  }
  if (payload.notes !== undefined) po.notes = payload.notes;
  if (payload.warehouseId) po.warehouseId = oid(payload.warehouseId) as never;
  if (payload.tax !== undefined || payload.shipping !== undefined) {
    const totals = calcPoTotals(
      po.items.map((i: { quantity: number; unitCost: number }) => ({
        quantity: i.quantity,
        unitCost: i.unitCost,
      })),
      payload.tax ?? po.tax,
      payload.shipping ?? po.shipping
    );
    po.subtotal = totals.subtotal;
    po.tax = totals.tax;
    po.shipping = totals.shipping;
    po.total = totals.total;
  }
  await po.save();
  return { ok: true as const, data: po.toObject() };
}

export async function receivePurchaseOrder(
  storeId: string,
  id: string,
  payload: {
    items?: Array<{ productId: string; variantId?: string; quantity: number }>;
    actorName?: string;
    actorId?: string;
  } = {}
) {
  await connectDatabase();
  const po = await PurchaseOrderModel.findOne({ _id: id, storeId: storeOid(storeId) });
  if (!po) return { ok: false as const, message: "Purchase order not found" };
  if (po.status === "cancelled") return { ok: false as const, message: "PO is cancelled" };
  if (po.status === "received") return { ok: false as const, message: "PO already fully received" };

  const fifoCheck = await checkFeature(storeId, "batch_fifo");
  const createBatches = fifoCheck.allowed;

  const receiveMap = new Map<string, number>();
  if (payload.items?.length) {
    for (const item of payload.items) {
      const key = `${item.productId}:${item.variantId ?? ""}`;
      receiveMap.set(key, (receiveMap.get(key) ?? 0) + Number(item.quantity));
    }
  }

  let anyReceived = false;
  let fullyReceived = true;

  for (const line of po.items) {
    const key = `${String(line.productId)}:${line.variantId ? String(line.variantId) : ""}`;
    const remaining = Math.max(0, line.quantity - (line.receivedQty ?? 0));
    const qty = receiveMap.size
      ? Math.min(remaining, receiveMap.get(key) ?? 0)
      : remaining;
    if (qty <= 0) {
      if ((line.receivedQty ?? 0) < line.quantity) fullyReceived = false;
      continue;
    }

    anyReceived = true;
    line.receivedQty = (line.receivedQty ?? 0) + qty;
    if (line.receivedQty < line.quantity) fullyReceived = false;

    const stockResult = await incrementProductStock(
      storeId,
      String(line.productId),
      qty,
      line.variantId ? String(line.variantId) : null
    );
    if (!stockResult) continue;

    let batchId: mongoose.Types.ObjectId | null = null;
    if (createBatches) {
      const batch = await StockBatchModel.create({
        storeId: storeOid(storeId),
        productId: line.productId,
        variantId: line.variantId ?? null,
        warehouseId: po.warehouseId ?? null,
        supplierId: po.supplierId,
        batchNumber: genCode("BAT"),
        lotNumber: "",
        purchaseDate: new Date(),
        buyCost: line.unitCost ?? 0,
        quantity: qty,
        remainingQuantity: qty,
        purchaseOrderId: po._id,
        status: "active",
      });
      batchId = batch._id as mongoose.Types.ObjectId;
    }

    await writeStockLog({
      storeId,
      productId: String(line.productId),
      variantId: line.variantId ? String(line.variantId) : null,
      warehouseId: po.warehouseId ? String(po.warehouseId) : null,
      batchId,
      previousStock: stockResult.previousStock,
      newStock: stockResult.newStock,
      quantityChange: qty,
      reason: "purchase",
      note: `PO ${po.poNumber} received`,
      updatedBy: payload.actorName ?? "system",
      updatedById: payload.actorId ?? null,
      source: "system",
      reference: po.poNumber,
      referenceId: po._id,
    });

    await appendProductTimeline(storeId, {
      productId: String(line.productId),
      variantId: line.variantId ? String(line.variantId) : undefined,
      eventType: "purchase_received",
      title: `Received ${qty} from PO ${po.poNumber}`,
      detail: `Unit cost ${line.unitCost ?? 0}`,
      reference: po.poNumber,
      referenceId: String(po._id),
      actorName: payload.actorName ?? "system",
      metadata: { quantity: qty, unitCost: line.unitCost },
    });

    await recordCostChange(storeId, {
      productId: String(line.productId),
      variantId: line.variantId ? String(line.variantId) : undefined,
      previousCost: line.unitCost ?? 0,
      newCost: line.unitCost ?? 0,
      averageCost: line.unitCost ?? 0,
      supplierId: String(po.supplierId),
      batchId: batchId ? String(batchId) : undefined,
      reason: `PO ${po.poNumber} receive`,
      createdBy: payload.actorName ?? "system",
      createdById: payload.actorId,
    });
  }

  if (!anyReceived) {
    return { ok: false as const, message: "No quantities to receive" };
  }

  po.status = fullyReceived ? "received" : "partial";
  if (fullyReceived) po.receivedAt = new Date();
  await po.save();

  await SupplierModel.updateOne(
    { _id: po.supplierId, storeId: storeOid(storeId) },
    { $inc: { totalPurchases: po.total } }
  );

  return { ok: true as const, data: po.toObject() };
}

// ─── Stock Transfers ─────────────────────────────────────────────────────────

export async function listStockTransfers(
  storeId: string,
  options: { page?: number; perPage?: number; status?: string } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.status) match.status = options.status;
  const [items, total] = await Promise.all([
    StockTransferModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("fromWarehouseId", "name code")
      .populate("toWarehouseId", "name code")
      .lean(),
    StockTransferModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function createStockTransfer(
  storeId: string,
  payload: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    notes?: string;
    createdBy?: string;
    transferNumber?: string;
  }
) {
  await connectDatabase();
  if (!payload.fromWarehouseId || !payload.toWarehouseId) {
    return { ok: false as const, message: "fromWarehouseId and toWarehouseId are required" };
  }
  if (payload.fromWarehouseId === payload.toWarehouseId) {
    return { ok: false as const, message: "Warehouses must be different" };
  }
  if (!payload.items?.length) return { ok: false as const, message: "items are required" };

  const doc = await StockTransferModel.create({
    storeId: storeOid(storeId),
    fromWarehouseId: oid(payload.fromWarehouseId),
    toWarehouseId: oid(payload.toWarehouseId),
    transferNumber: payload.transferNumber?.trim() || genCode("TR"),
    status: "pending",
    items: payload.items.map((i) => ({
      productId: oid(i.productId),
      variantId: i.variantId ? oid(i.variantId) : null,
      quantity: Number(i.quantity) || 0,
    })),
    notes: payload.notes ?? "",
    createdBy: payload.createdBy ? oid(payload.createdBy) : null,
  });
  return { ok: true as const, data: doc.toObject() };
}

export async function approveStockTransfer(
  storeId: string,
  id: string,
  payload: { approvedBy?: string } = {}
) {
  await connectDatabase();
  const doc = await StockTransferModel.findOne({ _id: id, storeId: storeOid(storeId) });
  if (!doc) return { ok: false as const, message: "Transfer not found" };
  if (doc.status !== "pending") {
    return { ok: false as const, message: `Cannot approve a ${doc.status} transfer` };
  }
  doc.status = "approved";
  doc.approvedBy = payload.approvedBy ? (oid(payload.approvedBy) as never) : null;
  await doc.save();
  return { ok: true as const, data: doc.toObject() };
}

export async function completeStockTransfer(
  storeId: string,
  id: string,
  payload: { actorName?: string; actorId?: string } = {}
) {
  await connectDatabase();
  const doc = await StockTransferModel.findOne({ _id: id, storeId: storeOid(storeId) });
  if (!doc) return { ok: false as const, message: "Transfer not found" };
  if (doc.status !== "approved" && doc.status !== "pending") {
    return { ok: false as const, message: `Cannot complete a ${doc.status} transfer` };
  }

  for (const item of doc.items) {
    const productId = String(item.productId);
    const variantId = item.variantId ? String(item.variantId) : null;
    const qty = item.quantity;

    // v1 single-pool: attribute movement in logs without changing net stock,
    // but still write transfer_out / transfer_in for warehouse attribution.
    let previousStock = 0;
    let newStock = 0;
    if (variantId) {
      const inv = await VariantInventoryModel.findOne({
        storeId: storeOid(storeId),
        productId: oid(productId),
        variantId: oid(variantId),
      });
      previousStock = inv?.quantity ?? 0;
      newStock = previousStock;
    } else {
      const product = await ProductModel.findOne({
        _id: productId,
        storeId: storeOid(storeId),
      }).select("stock");
      previousStock = product?.stock ?? 0;
      newStock = previousStock;
    }

    await writeStockLog({
      storeId,
      productId,
      variantId,
      warehouseId: String(doc.fromWarehouseId),
      previousStock,
      newStock,
      quantityChange: -qty,
      reason: "transfer_out",
      note: `Transfer ${doc.transferNumber} out`,
      updatedBy: payload.actorName ?? "system",
      updatedById: payload.actorId ?? null,
      source: "system",
      reference: doc.transferNumber,
      referenceId: doc._id,
    });

    await writeStockLog({
      storeId,
      productId,
      variantId,
      warehouseId: String(doc.toWarehouseId),
      previousStock,
      newStock,
      quantityChange: qty,
      reason: "transfer_in",
      note: `Transfer ${doc.transferNumber} in`,
      updatedBy: payload.actorName ?? "system",
      updatedById: payload.actorId ?? null,
      source: "system",
      reference: doc.transferNumber,
      referenceId: doc._id,
    });

    await appendProductTimeline(storeId, {
      productId,
      variantId: variantId ?? undefined,
      eventType: "transferred",
      title: `Transferred ${qty} (${doc.transferNumber})`,
      detail: `From warehouse ${doc.fromWarehouseId} to ${doc.toWarehouseId}`,
      reference: doc.transferNumber,
      referenceId: String(doc._id),
      actorName: payload.actorName ?? "system",
      metadata: {
        quantity: qty,
        fromWarehouseId: String(doc.fromWarehouseId),
        toWarehouseId: String(doc.toWarehouseId),
      },
    });
  }

  doc.status = "completed";
  doc.completedAt = new Date();
  await doc.save();
  return { ok: true as const, data: doc.toObject() };
}

// ─── Batches / FIFO ──────────────────────────────────────────────────────────

export async function listBatches(
  storeId: string,
  options: {
    page?: number;
    perPage?: number;
    productId?: string;
    status?: string;
    warehouseId?: string;
  } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.productId) match.productId = oid(options.productId);
  if (options.status) match.status = options.status;
  if (options.warehouseId) match.warehouseId = oid(options.warehouseId);
  const [items, total] = await Promise.all([
    StockBatchModel.find(match)
      .sort({ purchaseDate: 1, createdAt: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    StockBatchModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function listBatchesByProduct(storeId: string, productId: string) {
  await connectDatabase();
  const items = await StockBatchModel.find({
    storeId: storeOid(storeId),
    productId: oid(productId),
  })
    .sort({ purchaseDate: 1, createdAt: 1 })
    .lean();
  return { items };
}

/** Allocate quantity from oldest active batches (FIFO). Returns allocations; mutates remainingQuantity. */
export async function fifoAllocate(
  storeId: string,
  productId: string,
  quantity: number,
  variantId?: string | null
) {
  await connectDatabase();
  if (quantity <= 0) return { ok: true as const, allocations: [] as Array<{ batchId: string; quantity: number; buyCost: number }> };

  const match: Record<string, unknown> = {
    storeId: storeOid(storeId),
    productId: oid(productId),
    status: "active",
    remainingQuantity: { $gt: 0 },
  };
  if (variantId) match.variantId = oid(variantId);
  else match.$or = [{ variantId: null }, { variantId: { $exists: false } }];

  const batches = await StockBatchModel.find(match).sort({ purchaseDate: 1, createdAt: 1 });
  let remaining = quantity;
  const allocations: Array<{ batchId: string; quantity: number; buyCost: number }> = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.remainingQuantity, remaining);
    batch.remainingQuantity -= take;
    if (batch.remainingQuantity <= 0) batch.status = "depleted";
    await batch.save();
    allocations.push({
      batchId: String(batch._id),
      quantity: take,
      buyCost: batch.buyCost ?? 0,
    });
    remaining -= take;

    await writeStockLog({
      storeId,
      productId,
      variantId: variantId ?? null,
      warehouseId: batch.warehouseId ? String(batch.warehouseId) : null,
      batchId: String(batch._id),
      previousStock: batch.remainingQuantity + take,
      newStock: batch.remainingQuantity,
      quantityChange: -take,
      reason: "fifo_allocate",
      source: "system",
      note: "FIFO allocation",
    });
  }

  return {
    ok: true as const,
    allocations,
    unallocated: remaining,
  };
}

// ─── Price / Cost History ────────────────────────────────────────────────────

export async function recordPriceChange(
  storeId: string,
  payload: {
    productId: string;
    variantId?: string;
    field: "sellingPrice" | "comparePrice" | "wholesalePrice" | "discount";
    previousPrice: number;
    newPrice: number;
    reason?: string;
    createdBy?: string;
    createdById?: string;
  }
) {
  await connectDatabase();
  if (payload.previousPrice === payload.newPrice) return null;
  const doc = await PriceHistoryModel.create({
    storeId: storeOid(storeId),
    productId: oid(payload.productId),
    variantId: payload.variantId ? oid(payload.variantId) : null,
    field: payload.field,
    previousPrice: payload.previousPrice,
    newPrice: payload.newPrice,
    reason: payload.reason ?? "",
    createdBy: payload.createdBy ?? "system",
    createdById: payload.createdById ? oid(payload.createdById) : null,
  });
  return doc.toObject();
}

export async function listPriceHistory(
  storeId: string,
  options: { page?: number; perPage?: number; productId?: string; variantId?: string } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.productId) match.productId = oid(options.productId);
  if (options.variantId) match.variantId = oid(options.variantId);
  const [items, total] = await Promise.all([
    PriceHistoryModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    PriceHistoryModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function recordCostChange(
  storeId: string,
  payload: {
    productId: string;
    variantId?: string;
    previousCost: number;
    newCost: number;
    averageCost?: number;
    supplierId?: string;
    batchId?: string;
    reason?: string;
    createdBy?: string;
    createdById?: string;
  }
) {
  await connectDatabase();
  const doc = await CostHistoryModel.create({
    storeId: storeOid(storeId),
    productId: oid(payload.productId),
    variantId: payload.variantId ? oid(payload.variantId) : null,
    previousCost: payload.previousCost,
    newCost: payload.newCost,
    averageCost: payload.averageCost ?? payload.newCost,
    supplierId: payload.supplierId ? oid(payload.supplierId) : null,
    batchId: payload.batchId ? oid(payload.batchId) : null,
    reason: payload.reason ?? "",
    createdBy: payload.createdBy ?? "system",
    createdById: payload.createdById ? oid(payload.createdById) : null,
  });
  return doc.toObject();
}

export async function listCostHistory(
  storeId: string,
  options: { page?: number; perPage?: number; productId?: string; variantId?: string } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.productId) match.productId = oid(options.productId);
  if (options.variantId) match.variantId = oid(options.variantId);
  const [items, total] = await Promise.all([
    CostHistoryModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    CostHistoryModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

// ─── Timeline / Audit ────────────────────────────────────────────────────────

export async function appendProductTimeline(
  storeId: string,
  payload: {
    productId: string;
    variantId?: string;
    eventType:
      | "created"
      | "price_changed"
      | "cost_changed"
      | "stock_added"
      | "stock_removed"
      | "purchase_received"
      | "variant_added"
      | "variant_removed"
      | "supplier_changed"
      | "order_sold"
      | "returned"
      | "transferred"
      | "archived"
      | "other";
    title: string;
    detail?: string;
    reference?: string;
    referenceId?: string;
    actorName?: string;
    metadata?: unknown;
  }
) {
  await connectDatabase();
  const doc = await ProductTimelineModel.create({
    storeId: storeOid(storeId),
    productId: oid(payload.productId),
    variantId: payload.variantId ? oid(payload.variantId) : null,
    eventType: payload.eventType,
    title: payload.title,
    detail: payload.detail ?? "",
    reference: payload.reference ?? "",
    referenceId: payload.referenceId ? oid(payload.referenceId) : null,
    actorName: payload.actorName ?? "system",
    metadata: payload.metadata ?? null,
  });
  return doc.toObject();
}

export async function listProductTimeline(
  storeId: string,
  productId: string,
  options: { page?: number; perPage?: number } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match = { storeId: storeOid(storeId), productId: oid(productId) };
  const [items, total] = await Promise.all([
    ProductTimelineModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    ProductTimelineModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

export async function recordInventoryAudit(
  storeId: string,
  payload: {
    actorId?: string;
    actorName?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
  }
) {
  await connectDatabase();
  const doc = await InventoryAuditModel.create({
    storeId: storeOid(storeId),
    actorId: payload.actorId ? oid(payload.actorId) : null,
    actorName: payload.actorName ?? "system",
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId ? oid(payload.entityId) : null,
    oldValue: payload.oldValue ?? null,
    newValue: payload.newValue ?? null,
    ipAddress: payload.ipAddress ?? "",
    userAgent: payload.userAgent ?? "",
    device: payload.device ?? "",
  });
  return doc.toObject();
}

export async function listInventoryAudit(
  storeId: string,
  options: {
    page?: number;
    perPage?: number;
    entityType?: string;
    entityId?: string;
    action?: string;
  } = {}
) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 25));
  const match: Record<string, unknown> = { storeId: storeOid(storeId) };
  if (options.entityType) match.entityType = options.entityType;
  if (options.entityId) match.entityId = oid(options.entityId);
  if (options.action) match.action = options.action;
  const [items, total] = await Promise.all([
    InventoryAuditModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    InventoryAuditModel.countDocuments(match),
  ]);
  return { items, total, page, perPage };
}

// ─── Low stock alerts ────────────────────────────────────────────────────────

export async function getLowStockAlertSettings(storeId: string) {
  await connectDatabase();
  const settings = (await StoreSettingsModel.findOne({ storeId: storeOid(storeId) }).lean()) as {
    lowStockAlertEnabled?: boolean;
    lowStockMinQuantity?: number | null;
    lowStockAlertEmail?: string;
    lowStockNotifyOwner?: boolean;
  } | null;
  return {
    lowStockAlertEnabled: settings?.lowStockAlertEnabled ?? true,
    lowStockMinQuantity: settings?.lowStockMinQuantity ?? null,
    lowStockAlertEmail: settings?.lowStockAlertEmail ?? "",
    lowStockNotifyOwner: settings?.lowStockNotifyOwner ?? true,
  };
}

export async function setLowStockAlertSettings(
  storeId: string,
  payload: {
    lowStockAlertEnabled?: boolean;
    lowStockMinQuantity?: number | null;
    lowStockAlertEmail?: string;
    lowStockNotifyOwner?: boolean;
  }
) {
  await connectDatabase();
  const $set: Record<string, unknown> = {};
  if (payload.lowStockAlertEnabled !== undefined) $set.lowStockAlertEnabled = payload.lowStockAlertEnabled;
  if (payload.lowStockMinQuantity !== undefined) $set.lowStockMinQuantity = payload.lowStockMinQuantity;
  if (payload.lowStockAlertEmail !== undefined) $set.lowStockAlertEmail = payload.lowStockAlertEmail;
  if (payload.lowStockNotifyOwner !== undefined) $set.lowStockNotifyOwner = payload.lowStockNotifyOwner;

  const settings = (await StoreSettingsModel.findOneAndUpdate(
    { storeId: storeOid(storeId) },
    { $set },
    { new: true, upsert: true }
  ).lean()) as {
    lowStockAlertEnabled?: boolean;
    lowStockMinQuantity?: number | null;
    lowStockAlertEmail?: string;
    lowStockNotifyOwner?: boolean;
  } | null;

  return {
    lowStockAlertEnabled: settings?.lowStockAlertEnabled ?? true,
    lowStockMinQuantity: settings?.lowStockMinQuantity ?? null,
    lowStockAlertEmail: settings?.lowStockAlertEmail ?? "",
    lowStockNotifyOwner: settings?.lowStockNotifyOwner ?? true,
  };
}

// ─── Barcode ─────────────────────────────────────────────────────────────────

export async function searchByBarcode(storeId: string, barcode: string) {
  await connectDatabase();
  const code = barcode?.trim();
  if (!code) return { ok: false as const, message: "barcode is required" };

  const product = (await ProductModel.findOne({
    storeId: storeOid(storeId),
    barcode: code,
  })
    .select("_id name sku barcode stock price status productType")
    .lean()) as { _id: unknown; name?: string; sku?: string; barcode?: string } | null;

  const variant = (await ProductVariantModel.findOne({
    storeId: storeOid(storeId),
    barcode: code,
  })
    .select("_id productId sku barcode title status")
    .lean()) as { _id: unknown; productId?: unknown; sku?: string; barcode?: string } | null;

  if (!product && !variant) {
    return { ok: false as const, message: "No product or variant found for barcode" };
  }

  let inventory = null;
  if (variant) {
    inventory = await VariantInventoryModel.findOne({
      variantId: variant._id,
      storeId: storeOid(storeId),
    }).lean();
  }

  return {
    ok: true as const,
    data: {
      product: product ?? null,
      variant: variant ?? null,
      inventory,
    },
  };
}

export async function generateBarcode(
  storeId: string,
  payload: { productId: string; variantId?: string; barcode?: string }
) {
  await connectDatabase();
  const barcode =
    payload.barcode?.trim() ||
    `BL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (payload.variantId) {
    const variant = await ProductVariantModel.findOneAndUpdate(
      {
        _id: payload.variantId,
        productId: payload.productId,
        storeId: storeOid(storeId),
      },
      { $set: { barcode } },
      { new: true }
    )
      .select("_id productId sku barcode")
      .lean();
    if (!variant) return { ok: false as const, message: "Variant not found" };
    return { ok: true as const, data: { barcode, variant } };
  }

  const product = await ProductModel.findOneAndUpdate(
    { _id: payload.productId, storeId: storeOid(storeId) },
    { $set: { barcode } },
    { new: true }
  )
    .select("_id name sku barcode")
    .lean();
  if (!product) return { ok: false as const, message: "Product not found" };
  return { ok: true as const, data: { barcode, product } };
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function stockValuationReport(storeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);

  const [simpleAgg, variantAgg] = await Promise.all([
    ProductModel.aggregate([
      {
        $match: {
          storeId: sid,
          status: { $ne: "archived" },
          productType: { $ne: "variable" },
          trackInventory: { $ne: false },
        },
      },
      {
        $group: {
          _id: null,
          units: { $sum: { $ifNull: ["$stock", 0] } },
          retailValue: {
            $sum: { $multiply: [{ $ifNull: ["$stock", 0] }, { $ifNull: ["$price", 0] }] },
          },
          productCount: { $sum: 1 },
        },
      },
    ]),
    VariantPriceModel.aggregate([
      { $match: { storeId: sid } },
      {
        $lookup: {
          from: "variantinventories",
          localField: "variantId",
          foreignField: "variantId",
          as: "inv",
        },
      },
      { $unwind: { path: "$inv", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          units: { $sum: { $ifNull: ["$inv.quantity", 0] } },
          costValue: {
            $sum: {
              $multiply: [{ $ifNull: ["$costPrice", 0] }, { $ifNull: ["$inv.quantity", 0] }],
            },
          },
          retailValue: {
            $sum: {
              $multiply: [{ $ifNull: ["$sellingPrice", 0] }, { $ifNull: ["$inv.quantity", 0] }],
            },
          },
          variantCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const simple = simpleAgg[0] ?? { units: 0, retailValue: 0, productCount: 0 };
  const variant = variantAgg[0] ?? { units: 0, costValue: 0, retailValue: 0, variantCount: 0 };

  return {
    units: (simple.units ?? 0) + (variant.units ?? 0),
    costValue: variant.costValue ?? 0,
    retailValue: (simple.retailValue ?? 0) + (variant.retailValue ?? 0),
    productCount: simple.productCount ?? 0,
    variantCount: variant.variantCount ?? 0,
  };
}

export async function lowStockReport(storeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const settings = await getLowStockAlertSettings(storeId);
  const globalMin = settings.lowStockMinQuantity;

  const products = await ProductModel.find({
    storeId: sid,
    status: { $ne: "archived" },
    trackInventory: { $ne: false },
    productType: { $ne: "variable" },
  })
    .select("_id name sku stock lowStockThreshold price")
    .lean();

  const lowProducts = products.filter((p) => {
    const threshold = globalMin ?? p.lowStockThreshold ?? 5;
    const stock = p.stock ?? 0;
    return stock > 0 && stock <= threshold;
  });

  const variantInv = await VariantInventoryModel.find({
    storeId: sid,
    trackInventory: { $ne: false },
  }).lean();

  const lowVariants = variantInv.filter((v) => {
    const threshold = globalMin ?? v.lowStockThreshold ?? 5;
    return v.quantity > 0 && v.quantity <= threshold;
  });

  return {
    products: lowProducts,
    variants: lowVariants,
    count: lowProducts.length + lowVariants.length,
  };
}

export async function outOfStockReport(storeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);

  const [products, variants] = await Promise.all([
    ProductModel.find({
      storeId: sid,
      status: { $ne: "archived" },
      trackInventory: { $ne: false },
      productType: { $ne: "variable" },
      stock: { $lte: 0 },
    })
      .select("_id name sku stock price")
      .lean(),
    VariantInventoryModel.find({
      storeId: sid,
      trackInventory: { $ne: false },
      quantity: { $lte: 0 },
    }).lean(),
  ]);

  return {
    products,
    variants,
    count: products.length + variants.length,
  };
}

export async function deadStockReport(storeId: string, days = 90) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const movedProductIds = await StockLogModel.distinct("productId", {
    storeId: sid,
    reason: { $in: ["order_placed", "sale"] },
    createdAt: { $gte: since },
  });

  const products = await ProductModel.find({
    storeId: sid,
    status: { $ne: "archived" },
    trackInventory: { $ne: false },
    stock: { $gt: 0 },
    _id: { $nin: movedProductIds },
  })
    .select("_id name sku stock price updatedAt")
    .lean();

  return {
    days,
    products,
    count: products.length,
  };
}

export async function inventoryAgingReport(storeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const now = Date.now();
  const buckets = [
    { key: "0_30", min: 0, max: 30 },
    { key: "31_60", min: 31, max: 60 },
    { key: "61_90", min: 61, max: 90 },
    { key: "90_plus", min: 91, max: Infinity },
  ];

  const batches = await StockBatchModel.find({
    storeId: sid,
    status: "active",
    remainingQuantity: { $gt: 0 },
  })
    .select("productId remainingQuantity buyCost purchaseDate batchNumber")
    .lean();

  const summary: Record<string, { units: number; value: number; batches: number }> = {};
  for (const b of buckets) {
    summary[b.key] = { units: 0, value: 0, batches: 0 };
  }

  for (const batch of batches) {
    const ageDays = Math.floor(
      (now - new Date(batch.purchaseDate ?? now).getTime()) / (24 * 60 * 60 * 1000)
    );
    const bucket = buckets.find((b) => ageDays >= b.min && ageDays <= b.max) ?? buckets[buckets.length - 1];
    summary[bucket.key].units += batch.remainingQuantity ?? 0;
    summary[bucket.key].value += (batch.remainingQuantity ?? 0) * (batch.buyCost ?? 0);
    summary[bucket.key].batches += 1;
  }

  // Fallback aging by product updatedAt when no batches exist
  if (batches.length === 0) {
    const products = await ProductModel.find({
      storeId: sid,
      status: { $ne: "archived" },
      stock: { $gt: 0 },
    })
      .select("stock price updatedAt")
      .lean();

    for (const p of products) {
      const ageDays = Math.floor(
        (now - new Date((p as { updatedAt?: Date }).updatedAt ?? now).getTime()) /
          (24 * 60 * 60 * 1000)
      );
      const bucket =
        buckets.find((b) => ageDays >= b.min && ageDays <= b.max) ?? buckets[buckets.length - 1];
      summary[bucket.key].units += p.stock ?? 0;
      summary[bucket.key].value += (p.stock ?? 0) * (p.price ?? 0);
      summary[bucket.key].batches += 1;
    }
  }

  return { buckets: summary, batchCount: batches.length };
}
