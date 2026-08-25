import { connectDatabase } from "../../common/database/connection.js";
import { ProductModel } from "../products/product.model.js";
import { ProductVariantModel } from "../products/variants/product-variant.model.js";
import { VariantInventoryModel } from "../products/variants/variant-inventory.model.js";
import { VariantPriceModel } from "../products/variants/variant-price.model.js";
import { StockLogModel } from "./stock-log.model.js";
import mongoose from "mongoose";

const DEFAULT_THRESHOLD = 5;
const DEFAULT_PER_PAGE = 25;

interface InventoryFilter {
  search?: string;
  status?: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock" | "negative";
  productType?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  trackInventory?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
}

interface InventorySort {
  field: string;
  order: "asc" | "desc";
}

export async function resolveStoreObjectId(storeIdOrSlug: string): Promise<mongoose.Types.ObjectId | null> {
  if (!storeIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(storeIdOrSlug) && String(new mongoose.Types.ObjectId(storeIdOrSlug)) === storeIdOrSlug) {
    return new mongoose.Types.ObjectId(storeIdOrSlug);
  }
  try {
    const { StoreModel } = await import("../stores/store.model.js");
    const store = (await StoreModel.findOne({
      $or: [
        { slug: storeIdOrSlug },
        { slug: storeIdOrSlug.toLowerCase() },
        { subdomain: storeIdOrSlug },
        { subdomain: storeIdOrSlug.toLowerCase() },
      ],
    }).select("_id").lean()) as { _id?: unknown } | null;

    if (store?._id) return new mongoose.Types.ObjectId(String(store._id));
  } catch {
    // Non-critical
  }
  return null;
}

export async function getInventoryList(
  storeId: string,
  options: {
    page?: number;
    perPage?: number;
    search?: string;
    filter?: InventoryFilter;
    sort?: InventorySort;
  } = {}
) {
  await connectDatabase();
  const resolvedStoreId = await resolveStoreObjectId(storeId);
  if (!resolvedStoreId) {
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: options.perPage ?? DEFAULT_PER_PAGE,
        total: 0,
        totalFiltered: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(500, Math.max(10, options.perPage ?? DEFAULT_PER_PAGE));
  const skip = (page - 1) * perPage;

  // Build product match stage
  const productMatch: Record<string, unknown> = { storeId: resolvedStoreId };

  const f = options.filter ?? {};
  if (f.search) {
    const s = f.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    productMatch.$or = [
      { name: { $regex: s, $options: "i" } },
      { sku: { $regex: s, $options: "i" } },
      { barcode: { $regex: s, $options: "i" } },
    ];
  }
  if (f.status) productMatch.status = f.status;
  if (f.productType) productMatch.productType = f.productType;
  if (f.category) productMatch.category = f.category;
  if (f.brand) productMatch.brand = { $regex: f.brand, $options: "i" };
  if (f.vendor) productMatch.vendor = { $regex: f.vendor, $options: "i" };
  if (f.trackInventory !== undefined) productMatch.trackInventory = f.trackInventory;
  if (f.createdAfter || f.createdBefore) {
    const range: Record<string, Date> = {};
    if (f.createdAfter) range.$gte = new Date(f.createdAfter);
    if (f.createdBefore) range.$lte = new Date(f.createdBefore);
    productMatch.createdAt = range;
  }
  if (f.updatedAfter || f.updatedBefore) {
    const range: Record<string, Date> = {};
    if (f.updatedAfter) range.$gte = new Date(f.updatedAfter);
    if (f.updatedBefore) range.$lte = new Date(f.updatedBefore);
    productMatch.updatedAt = range;
  }

  // Search also applies to variant SKU/barcode
  const searchTerm = options.search || f.search || "";
  const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const sortField = options.sort?.field || "updatedAt";
  const sortOrder = options.sort?.order === "asc" ? 1 : -1;
  const sortStage: Record<string, 1 | -1> = {};
  const allowedSortFields = ["name", "stock", "price", "createdAt", "updatedAt", "sku", "status", "category", "brand"];
  sortStage[allowedSortFields.includes(sortField) ? sortField : "updatedAt"] = sortOrder;

  // Determine stock status filter
  let stockStatusFilter: Record<string, unknown> | null = null;
  if (f.stockStatus === "out_of_stock") {
    stockStatusFilter = { quantity: { $lte: 0 } };
  } else if (f.stockStatus === "low_stock") {
    stockStatusFilter = { $expr: { $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", { $ifNull: ["$lowStockThreshold", DEFAULT_THRESHOLD] }] }] } };
  } else if (f.stockStatus === "in_stock") {
    stockStatusFilter = { quantity: { $gt: 0 } };
  } else if (f.stockStatus === "negative") {
    stockStatusFilter = { quantity: { $lt: 0 } };
  }

  // Aggregation pipeline
  const pipeline: Array<Record<string, unknown>> = [
    { $match: productMatch },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        sku: 1,
        barcode: 1,
        imageUrl: 1,
        thumbnailUrl: 1,
        price: 1,
        comparePrice: 1,
        stock: 1,
        trackInventory: 1,
        lowStockThreshold: 1,
        status: 1,
        productType: 1,
        category: 1,
        brand: 1,
        vendor: 1,
        tags: 1,
        featured: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  // For variable products, unwind via lookup to get variant-level rows
  // We break this into two parts: simple products (no variants) + variable products (with variants)
  // Using $facet for both

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      simple: [
        { $match: { productType: { $ne: "variable" } } },
        { $sort: sortStage },
        { $skip: 0 },
        { $limit: perPage },
        {
          $lookup: {
            from: "variantinventories",
            let: { pid: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$productId", "$$pid"] } } },
              { $limit: 1 },
            ],
            as: "variantInv",
          },
        },
      ],
      variable: [
        { $match: { productType: "variable" } },
        {
          $lookup: {
            from: "productvariants",
            let: { pid: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$productId", "$$pid"] }, status: { $ne: "archived" } } },
              ...(searchTerm ? [{ $match: { $or: [{ sku: { $regex: escapedSearch, $options: "i" } }, { barcode: { $regex: escapedSearch, $options: "i" } }] } }] : []),
              {
                $lookup: {
                  from: "variantinventories",
                  localField: "_id",
                  foreignField: "variantId",
                  as: "inventory",
                },
              },
              {
                $lookup: {
                  from: "variantprices",
                  localField: "_id",
                  foreignField: "variantId",
                  as: "prices",
                },
              },
              { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
              { $unwind: { path: "$prices", preserveNullAndEmptyArrays: true } },
              {
                $addFields: {
                  quantity: { $ifNull: ["$inventory.quantity", 0] },
                  invThreshold: { $ifNull: ["$inventory.lowStockThreshold", DEFAULT_THRESHOLD] },
                  costPrice: { $ifNull: ["$prices.costPrice", 0] },
                  sellingPrice: { $ifNull: ["$prices.sellingPrice", "$price"] },
                },
              },
              ...(stockStatusFilter ? [{ $match: stockStatusFilter }] : []),
            ],
            as: "variants",
          },
        },
        { $unwind: { path: "$variants", preserveNullAndEmptyArrays: true } },
        { $sort: sortStage },
      ],
    },
  });

  const results = await ProductModel.aggregate(pipeline as any);
  const facet = results[0] ?? { metadata: [], simple: [], variable: [] };
  const total = (facet.metadata as Array<{ total: number }>)[0]?.total ?? 0;
  const simpleItems = (facet.simple as Array<Record<string, unknown>>) ?? [];
  const variableItems = (facet.variable as Array<Record<string, unknown>>) ?? [];

  // Map simple products to inventory rows
  const simpleRows: Array<Record<string, unknown>> = [];
  for (const p of simpleItems) {
    if (!p.trackInventory && p.trackInventory !== undefined) continue;
    const inv = (p.variantInv as Array<Record<string, unknown>>)?.[0];
    const quantity = inv ? (inv.quantity as number) : ((p.stock as number) ?? 0);
    const threshold = (inv?.lowStockThreshold as number) ?? (p.lowStockThreshold as number) ?? DEFAULT_THRESHOLD;

    simpleRows.push({
      productId: p._id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || "",
      barcode: p.barcode || "",
      imageUrl: p.imageUrl || p.thumbnailUrl || "",
      stock: quantity,
      reservedStock: 0,
      availableStock: quantity,
      lowStockThreshold: threshold,
      lowStock: quantity > 0 && quantity <= threshold,
      outOfStock: quantity <= 0,
      costPrice: 0,
      sellingPrice: (p.price as number) ?? 0,
      profit: 0,
      status: p.status,
      productType: p.productType,
      category: p.category,
      brand: p.brand,
      vendor: p.vendor,
      tags: p.tags,
      featured: p.featured,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      hasVariants: false,
    });
  }

  // Map variable product variants to inventory rows
  const variableRows: Array<Record<string, unknown>> = [];
  for (const item of variableItems) {
    const variant = item.variants as Record<string, unknown> | undefined;
    if (!variant) {
      // Product has no enabled/visible variants — show product row
      variableRows.push({
        productId: item._id,
        name: item.name,
        slug: item.slug,
        sku: item.sku || "",
        barcode: item.barcode || "",
        imageUrl: item.imageUrl || item.thumbnailUrl || "",
        stock: 0,
        reservedStock: 0,
        availableStock: 0,
        lowStockThreshold: DEFAULT_THRESHOLD,
        lowStock: false,
        outOfStock: true,
        costPrice: 0,
        sellingPrice: (item.price as number) ?? 0,
        profit: 0,
        status: item.status,
        productType: item.productType,
        category: item.category,
        brand: item.brand,
        vendor: item.vendor,
        tags: item.tags,
        featured: item.featured,
        updatedAt: item.updatedAt,
        createdAt: item.createdAt,
        hasVariants: true,
        variantId: null,
        variantTitle: "No variants",
      });
      continue;
    }

    const quantity = (variant.quantity as number) ?? 0;
    const threshold = (variant.invThreshold as number) ?? DEFAULT_THRESHOLD;
    const costPrice = (variant.costPrice as number) ?? 0;
    const sellingPrice = (variant.sellingPrice as number) ?? (item.price as number) ?? 0;

    variableRows.push({
      productId: item._id,
      name: item.name,
      slug: item.slug,
      sku: (variant.sku as string) || (item.sku as string) || "",
      barcode: (variant.barcode as string) || (item.barcode as string) || "",
      imageUrl: (variant.imageUrl as string) || (item.imageUrl as string) || (item.thumbnailUrl as string) || "",
      stock: quantity,
      reservedStock: 0,
      availableStock: quantity,
      lowStockThreshold: threshold,
      lowStock: quantity > 0 && quantity <= threshold,
      outOfStock: quantity <= 0,
      costPrice,
      sellingPrice,
      profit: sellingPrice - costPrice,
      status: variant.status || item.status,
      productType: item.productType,
      category: item.category,
      brand: item.brand,
      vendor: item.vendor,
      tags: item.tags,
      featured: item.featured,
      updatedAt: variant.updatedAt || item.updatedAt,
      createdAt: variant.createdAt || item.createdAt,
      hasVariants: true,
      variantId: variant._id,
      variantTitle: variant.title || "",
    });
  }

  // Combine rows — account for variable items that were not skipped/limited
  let allRows = [...simpleRows, ...variableRows];

  // Apply search to combined results if searching by name (already done in productMatch)
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    allRows = allRows.filter(
      (r) =>
        String(r.name ?? "").toLowerCase().includes(searchLower) ||
        String(r.sku ?? "").toLowerCase().includes(searchLower) ||
        String(r.barcode ?? "").toLowerCase().includes(searchLower)
    );
  }

  // Apply stock status filter for non-variant items not caught by aggregation
  if (f.stockStatus === "out_of_stock") {
    allRows = allRows.filter((r) => (r.stock as number) <= 0);
  } else if (f.stockStatus === "low_stock") {
    allRows = allRows.filter((r) => (r.stock as number) > 0 && (r.stock as number) <= (r.lowStockThreshold as number));
  } else if (f.stockStatus === "in_stock") {
    allRows = allRows.filter((r) => (r.stock as number) > 0);
  }

  // Sort combined
  allRows.sort((a, b) => {
    let av = a[sortField] as string | number | undefined;
    let bv = b[sortField] as string | number | undefined;
    if (av == null) av = "";
    if (bv == null) bv = "";
    if (typeof av === "string" && typeof bv === "string") {
      return sortOrder * av.localeCompare(bv);
    }
    return sortOrder * ((av as number) - (bv as number));
  });

  // Re-paginate combined
  const totalFiltered = allRows.length;
  const pagedRows = allRows.slice(0, perPage);

  return {
    items: pagedRows,
    pagination: {
      page,
      perPage,
      total,
      totalFiltered,
      totalPages: Math.ceil(total / perPage),
      hasNextPage: page * perPage < total,
      hasPrevPage: page > 1,
    },
  };
}

export async function getInventoryStats(storeId: string) {
  await connectDatabase();
  const resolvedStoreId = await resolveStoreObjectId(storeId);
  if (!resolvedStoreId) {
    return {
      totalProducts: 0,
      totalVariants: 0,
      totalStock: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalInventoryValue: 0,
      potentialRevenue: 0,
      potentialProfit: 0,
      avgProductPrice: 0,
    };
  }

  const [productStats, variantStats, lowStockCount, outOfStockCount, valueAgg] = await Promise.all([
    ProductModel.aggregate([
      { $match: { storeId: resolvedStoreId, status: { $ne: "archived" } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: { $ifNull: ["$stock", 0] } },
          avgPrice: { $avg: "$price" },
          totalValue: { $sum: { $multiply: ["$price", { $ifNull: ["$stock", 0] }] } },
        },
      },
    ]),
    VariantInventoryModel.aggregate([
      { $match: { storeId: resolvedStoreId } },
      {
        $group: {
          _id: null,
          totalVariants: { $sum: 1 },
          totalStock: { $sum: { $ifNull: ["$quantity", 0] } },
        },
      },
    ]),
    ProductModel.countDocuments({
      storeId: resolvedStoreId,
      status: { $ne: "archived" },
      $expr: {
        $and: [
          { $gt: ["$stock", 0] },
          { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", DEFAULT_THRESHOLD] }] },
        ],
      },
    }),
    ProductModel.countDocuments({
      storeId: resolvedStoreId,
      status: { $ne: "archived" },
      stock: { $lte: 0 },
    }),
    VariantPriceModel.aggregate([
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
          totalValue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$costPrice", 0] },
                { $ifNull: ["$inv.quantity", 0] },
              ],
            },
          },
          potentialRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$sellingPrice", 0] },
                { $ifNull: ["$inv.quantity", 0] },
              ],
            },
          },
        },
      },
    ]),
  ]);

  const ps = productStats[0] ?? { totalProducts: 0, totalStock: 0, avgPrice: 0, totalValue: 0 };
  const vs = variantStats[0] ?? { totalVariants: 0, totalStock: 0 };
  const va = valueAgg[0] ?? { totalValue: 0, potentialRevenue: 0 };

  const totalItems = (ps.totalProducts as number) + (vs.totalVariants as number);

  return {
    totalProducts: ps.totalProducts ?? 0,
    totalVariants: vs.totalVariants ?? 0,
    totalItems,
    totalStock: (ps.totalStock ?? 0) + (vs.totalStock ?? 0),
    lowStockCount: lowStockCount ?? 0,
    outOfStockCount: outOfStockCount ?? 0,
    inventoryValue: va.totalValue ?? 0,
    potentialRevenue: va.potentialRevenue ?? 0,
    avgPrice: ps.avgPrice ?? 0,
  };
}

export async function adjustStock(
  storeId: string,
  productId: string,
  payload: {
    quantity: number;
    variantId?: string;
    reason?: string;
    note?: string;
    updatedBy?: string;
    updatedById?: string;
  }
) {
  await connectDatabase();
  const product = await ProductModel.findOne({ _id: productId, storeId }).select("_id name sku stock trackInventory productType");
  if (!product) return { ok: false, message: "Product not found" };

  if (payload.variantId) {
    const inv = await VariantInventoryModel.findOne({ variantId: payload.variantId, storeId, productId });
    if (!inv) return { ok: false, message: "Variant not found" };

    const prevStock = inv.quantity;
    const change = payload.quantity;
    inv.quantity = Math.max(0, inv.quantity + change);
    await inv.save();

    await StockLogModel.create({
      storeId,
      productId,
      variantId: payload.variantId,
      previousStock: prevStock,
      newStock: inv.quantity,
      beforeQuantity: prevStock,
      afterQuantity: inv.quantity,
      quantityChange: change,
      reason: (payload.reason as any) || "manual_adjust",
      note: payload.note || "",
      updatedBy: payload.updatedBy || "system",
      updatedById: payload.updatedById ? new mongoose.Types.ObjectId(payload.updatedById) : null,
      source: "manual",
    });

    try {
      const { appendProductTimeline, recordInventoryAudit } = await import("./inventory-erp.service.js");
      await appendProductTimeline(storeId, {
        productId,
        variantId: payload.variantId,
        eventType: change >= 0 ? "stock_added" : "stock_removed",
        title: change >= 0 ? "Stock added" : "Stock removed",
        detail: `${prevStock} → ${inv.quantity}`,
        actorName: payload.updatedBy || "system",
        metadata: { change, reason: payload.reason },
      });
      await recordInventoryAudit(storeId, {
        action: "stock_adjust",
        entityType: "variant",
        entityId: payload.variantId,
        actorId: payload.updatedById,
        actorName: payload.updatedBy || "system",
        oldValue: { stock: prevStock },
        newValue: { stock: inv.quantity },
      });
    } catch {
      /* non-fatal */
    }

    return { ok: true, data: { stock: inv.quantity, previousStock: prevStock, change } };
  }

  const prevStock = product.stock ?? 0;
  const change = payload.quantity;
  const newStock = Math.max(0, prevStock + change);
  product.stock = newStock;
  await product.save();

  await StockLogModel.create({
    storeId,
    productId,
    previousStock: prevStock,
    newStock,
    beforeQuantity: prevStock,
    afterQuantity: newStock,
    quantityChange: change,
    reason: (payload.reason as any) || "manual_adjust",
    note: payload.note || "",
    updatedBy: payload.updatedBy || "system",
    updatedById: payload.updatedById ? new mongoose.Types.ObjectId(payload.updatedById) : null,
    source: "manual",
  });

  try {
    const { appendProductTimeline, recordInventoryAudit } = await import("./inventory-erp.service.js");
    await appendProductTimeline(storeId, {
      productId,
      eventType: change >= 0 ? "stock_added" : "stock_removed",
      title: change >= 0 ? "Stock added" : "Stock removed",
      detail: `${prevStock} → ${newStock}`,
      actorName: payload.updatedBy || "system",
      metadata: { change, reason: payload.reason },
    });
    await recordInventoryAudit(storeId, {
      action: "stock_adjust",
      entityType: "product",
      entityId: productId,
      actorId: payload.updatedById,
      actorName: payload.updatedBy || "system",
      oldValue: { stock: prevStock },
      newValue: { stock: newStock },
    });
  } catch {
    /* non-fatal */
  }

  return { ok: true, data: { stock: newStock, previousStock: prevStock, change } };
}

export async function getStockHistory(
  storeId: string,
  options: {
    productId?: string;
    variantId?: string;
    page?: number;
    perPage?: number;
  } = {}
) {
  await connectDatabase();
  const resolvedStoreId = await resolveStoreObjectId(storeId);
  if (!resolvedStoreId) {
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: options.perPage ?? 25,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
      },
    };
  }

  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(10, options.perPage ?? 25));
  const skip = (page - 1) * perPage;

  const match: Record<string, unknown> = { storeId: resolvedStoreId };
  if (options.productId && mongoose.Types.ObjectId.isValid(options.productId)) {
    match.productId = new mongoose.Types.ObjectId(options.productId);
  }
  if (options.variantId && mongoose.Types.ObjectId.isValid(options.variantId)) {
    match.variantId = new mongoose.Types.ObjectId(options.variantId);
  }

  const [logs, total] = await Promise.all([
    StockLogModel.find(match).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
    StockLogModel.countDocuments(match),
  ]);

  return {
    items: logs,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasNextPage: page * perPage < total,
    },
  };
}

export async function getInventoryAnalytics(storeId: string) {
  await connectDatabase();
  const resolvedStoreId = await resolveStoreObjectId(storeId);
  if (!resolvedStoreId) {
    return {
      mostSold: [],
      slowMoving: [],
      deadStock: [],
    };
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Most sold (by stock history — items with most deductions)
  const mostSold = await StockLogModel.aggregate([
    { $match: { storeId: resolvedStoreId, reason: "order_placed", createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: "$productId", totalSold: { $sum: { $abs: "$quantityChange" } }, changes: { $sum: 1 } } },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 1, name: "$product.name", totalSold: 1, changes: 1 } },
  ]);

  // Slow moving (products with low or no sales in 90 days)
  const productsWithSales = await StockLogModel.distinct("productId", {
    storeId: resolvedStoreId,
    reason: "order_placed",
    createdAt: { $gte: ninetyDaysAgo },
  });

  const slowMoving = await ProductModel.aggregate([
    {
      $match: {
        storeId: resolvedStoreId,
        status: { $ne: "archived" },
        _id: { $nin: productsWithSales },
        stock: { $gt: 0 },
      },
    },
    { $project: { name: 1, sku: 1, stock: 1, price: 1, imageUrl: 1, updatedAt: 1 } },
    { $sort: { stock: -1 } },
    { $limit: 10 },
  ]);

  // Dead stock (no sales, no stock changes, old)
  const deadStock = await ProductModel.aggregate([
    {
      $match: {
        storeId: resolvedStoreId,
        status: { $ne: "archived" },
        _id: { $nin: productsWithSales },
        updatedAt: { $lte: ninetyDaysAgo },
        stock: { $gt: 0 },
      },
    },
    { $project: { name: 1, sku: 1, stock: 1, price: 1, imageUrl: 1, updatedAt: 1 } },
    { $sort: { updatedAt: 1 } },
    { $limit: 10 },
  ]);

  return {
    mostSold: mostSold.map((m: Record<string, unknown>) => ({ productId: m._id, name: m.name || "Unknown", totalSold: m.totalSold || 0, changes: m.changes || 0 })),
    slowMoving: slowMoving.map((p: Record<string, unknown>) => ({ productId: p._id, name: p.name, sku: p.sku, stock: p.stock, price: p.price, imageUrl: p.imageUrl, lastUpdated: p.updatedAt })),
    deadStock: deadStock.map((p: Record<string, unknown>) => ({ productId: p._id, name: p.name, sku: p.sku, stock: p.stock, price: p.price, imageUrl: p.imageUrl, lastUpdated: p.updatedAt })),
  };
}

export async function bulkUpdateInventory(
  storeId: string,
  operations: Array<{
    productId: string;
    variantId?: string;
    stock?: number;
    adjustment?: number;
    reason?: string;
    note?: string;
  }>
) {
  await connectDatabase();
  const results: Array<Record<string, unknown>> = [];

  for (const op of operations) {
    if (op.adjustment !== undefined) {
      const product = await ProductModel.findOne({ _id: op.productId, storeId }).select("_id stock");
      if (!product) continue;
      const prevStock = product.stock ?? 0;
      const change = op.adjustment;
      const newStock = Math.max(0, prevStock + change);

      if (op.variantId) {
        const inv = await VariantInventoryModel.findOne({ variantId: op.variantId, storeId });
        if (!inv) continue;
        const prevInv = inv.quantity;
        inv.quantity = Math.max(0, prevInv + change);
        await inv.save();
        await StockLogModel.create({
          storeId, productId: op.productId, variantId: op.variantId,
          previousStock: prevInv, newStock: inv.quantity, quantityChange: change,
          reason: op.reason || "bulk_update", note: op.note || "", source: "bulk",
        });
        results.push({ productId: op.productId, variantId: op.variantId, ok: true, stock: inv.quantity });
      } else {
        product.stock = newStock;
        await product.save();
        await StockLogModel.create({
          storeId, productId: op.productId,
          previousStock: prevStock, newStock, quantityChange: change,
          reason: op.reason || "bulk_update", note: op.note || "", source: "bulk",
        });
        results.push({ productId: op.productId, ok: true, stock: newStock });
      }
    } else if (op.stock !== undefined) {
      const product = await ProductModel.findOne({ _id: op.productId, storeId }).select("_id stock");
      if (!product) continue;
      const prevStock = product.stock ?? 0;
      const change = op.stock - prevStock;

      if (op.variantId) {
        const inv = await VariantInventoryModel.findOne({ variantId: op.variantId, storeId });
        if (!inv) continue;
        const prevInv = inv.quantity;
        inv.quantity = op.stock;
        await inv.save();
        await StockLogModel.create({
          storeId, productId: op.productId, variantId: op.variantId,
          previousStock: prevInv, newStock: op.stock, quantityChange: op.stock - prevInv,
          reason: op.reason || "bulk_update", note: op.note || "", source: "bulk",
        });
        results.push({ productId: op.productId, variantId: op.variantId, ok: true, stock: op.stock });
      } else {
        product.stock = op.stock;
        await product.save();
        await StockLogModel.create({
          storeId, productId: op.productId,
          previousStock: prevStock, newStock: op.stock, quantityChange: change,
          reason: op.reason || "bulk_update", note: op.note || "", source: "bulk",
        });
        results.push({ productId: op.productId, ok: true, stock: op.stock });
      }
    }
  }

  return results;
}

export async function bulkArchiveProducts(storeId: string, productIds: string[]) {
  await connectDatabase();
  const ids = productIds.map((id) => new mongoose.Types.ObjectId(id));
  const result = await ProductModel.updateMany(
    { _id: { $in: ids }, storeId },
    { $set: { status: "archived" } }
  );
  return { modifiedCount: result.modifiedCount };
}

export async function bulkDeleteProducts(storeId: string, productIds: string[]) {
  await connectDatabase();
  const ids = productIds.map((id) => new mongoose.Types.ObjectId(id));
  const products = await ProductModel.find({ _id: { $in: ids }, storeId }).select("_id").lean();
  const validIds = products.map((p) => p._id);

  // Clean up variants, inventory, prices
  await Promise.all([
    ProductVariantModel.deleteMany({ productId: { $in: validIds } }),
    VariantInventoryModel.deleteMany({ productId: { $in: validIds } }),
    StockLogModel.deleteMany({ productId: { $in: validIds } }),
    ProductModel.deleteMany({ _id: { $in: validIds }, storeId }),
  ]);

  return { deletedCount: validIds.length };
}
