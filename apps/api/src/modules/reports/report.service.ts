import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { ProductModel } from "../../models/product.model.js";
import { OrderModel } from "../../models/order.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { CouponModel } from "../../models/coupon.model.js";
import { MediaFileModel } from "../../models/media-file.model.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { StorageUsageModel } from "../media/storage-usage.model.js";
import mongoose from "mongoose";

type DateRange = {
  start?: string;
  end?: string;
  preset?: "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "thisYear" | "all";
};

function toOid(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function storeMatch(storeId: string, extra: Record<string, unknown> = {}) {
  return { storeId: toOid(storeId), ...extra };
}

const REVENUE_STATUS_MATCH = { status: { $nin: ["cancelled", "refunded"] } };

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d = new Date()) {
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = startOfDay(d);
  start.setDate(start.getDate() - diff);
  return start;
}

async function sumRevenue(storeId: string, from?: Date, to?: Date) {
  const match: Record<string, unknown> = {
    ...storeMatch(storeId),
    ...REVENUE_STATUS_MATCH,
  };
  if (from || to) {
    match.createdAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }
  const rows = await OrderModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        revenue: {
          $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
        },
        orders: { $sum: 1 },
      },
    },
  ]);
  return { revenue: rows[0]?.revenue ?? 0, orders: rows[0]?.orders ?? 0 };
}

function getDateFilter(range: DateRange): { $gte?: Date; $lte?: Date } {
  const now = new Date();
  let start: Date | undefined;
  let end: Date | undefined;

  if (range.start && range.end) {
    start = new Date(range.start);
    end = new Date(range.end);
    end.setHours(23, 59, 59, 999);
  } else if (range.preset) {
    switch (range.preset) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case "last7":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last30":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
        break;
    }
  }

  const filter: { $gte?: Date; $lte?: Date } = {};
  if (start) filter.$gte = start;
  if (end) filter.$lte = end;
  return filter;
}

function buildDateMatch(dateField: string, range: DateRange) {
  const dateFilter = getDateFilter(range);
  if (!dateFilter.$gte && !dateFilter.$lte) return {};
  return { [dateField]: dateFilter };
}

// ── KPI Dashboard ───────────────────────────────────────────────────────────

export async function getDashboardKPIs(storeId: string, range: DateRange) {
  await connectDatabase();
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new Error("Invalid store ID");
  }

  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    periodStats,
    revenueToday,
    revenueWeek,
    revenueMonth,
    revenueYear,
    ordersToday,
    totalCustomers,
    newCustomersInRange,
    returningAgg,
    productStock,
    unitsSold,
    couponsUsedAgg,
    reviewsAgg,
    storageUsage,
    pages,
    latestOrders,
    lowStockList,
    topProducts,
    topCustomers,
    byPayment,
    byZone,
    byCategory,
  ] = await Promise.all([
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["cancelled", "refunded"]] },
                0,
                { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
              ],
            },
          },
          totalOrders: { $sum: 1 },
          avgOrderValue: {
            $avg: {
              $cond: [
                { $in: ["$status", ["cancelled", "refunded"]] },
                null,
                { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
              ],
            },
          },
          completedOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          pendingOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["pending", "confirmed", "processing", "packed"]] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $in: ["$status", ["cancelled", "refunded", "partial_refund"]] }, 1, 0] },
          },
          refundAmount: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$refundAmount", 0] }, 0] },
                "$refundAmount",
                { $cond: [{ $eq: ["$status", "refunded"] }, "$total", 0] },
              ],
            },
          },
          uniqueCustomers: { $addToSet: "$customerId" },
        },
      },
    ]),
    sumRevenue(storeId, todayStart),
    sumRevenue(storeId, weekStart),
    sumRevenue(storeId, monthStart),
    sumRevenue(storeId, yearStart),
    OrderModel.countDocuments({ storeId: oid, createdAt: { $gte: todayStart } }),
    CustomerModel.countDocuments({ storeId: oid }),
    CustomerModel.countDocuments({ storeId: oid, ...dateMatch }),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch } },
      { $group: { _id: "$customerId", orders: { $sum: 1 } } },
      { $match: { orders: { $gt: 1 } } },
      { $count: "count" },
    ]),
    ProductModel.aggregate([
      { $match: { storeId: oid } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [{ $and: [{ $lte: ["$stock", 5] }, { $gt: ["$stock", 0] }] }, 1, 0],
            },
          },
          outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
          inventoryValue: {
            $sum: { $multiply: [{ $ifNull: ["$stock", 0] }, { $ifNull: ["$price", 0] }] },
          },
        },
      },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
      { $unwind: "$items" },
      { $group: { _id: null, units: { $sum: "$items.quantity" } } },
    ]),
    OrderModel.aggregate([
      {
        $match: {
          storeId: oid,
          ...dateMatch,
          couponCode: { $exists: true, $nin: [null, ""] },
        },
      },
      { $count: "count" },
    ]),
    ReviewModel.aggregate([
      { $match: { storeId: oid } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    StorageUsageModel.findOne({ storeId: oid }).lean() as Promise<Record<string, unknown> | null>,
    StorePageModel.countDocuments({ storeId: oid, deletedAt: null }),
    OrderModel.find({ storeId: oid })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber invoiceNumber total status paymentStatus paymentMethod createdAt customerId")
      .lean(),
    ProductModel.find({ storeId: oid, stock: { $lte: 5, $gt: 0 } })
      .select("name stock price sku")
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
      {
        $group: {
          _id: "$customerId",
          totalSpent: {
            $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$customer.name",
          email: "$customer.email",
          totalSpent: 1,
          orderCount: 1,
        },
      },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch } },
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "unknown"] },
          count: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch } },
      {
        $group: {
          _id: { $ifNull: ["$deliveryZone", "Unspecified"] },
          count: { $sum: 1 },
          total: { $sum: { $ifNull: ["$deliveryCharge", "$shipping"] } },
        },
      },
      { $sort: { count: -1 } },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "product.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$category.name", "Uncategorized"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          units: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const stats = periodStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    refundAmount: 0,
    uniqueCustomers: [],
  };

  const uniqueInRange = Array.isArray(stats.uniqueCustomers) ? stats.uniqueCustomers.length : 0;
  const returningCustomers = returningAgg[0]?.count ?? 0;
  const stock = productStock[0] || { total: 0, lowStock: 0, outOfStock: 0, inventoryValue: 0 };
  const productsSold = unitsSold[0]?.units ?? 0;
  const couponsUsed = couponsUsedAgg[0]?.count ?? 0;
  const averageRating = reviewsAgg[0]?.avg ?? 0;
  const conversionRate =
    totalCustomers > 0 ? Math.round((uniqueInRange / totalCustomers) * 10000) / 100 : 0;

  return {
    totalRevenue: stats.totalRevenue || 0,
    totalOrders: stats.totalOrders || 0,
    avgOrderValue: Math.round((stats.avgOrderValue || 0) * 100) / 100,
    pendingOrders: stats.pendingOrders || 0,
    cancelledOrders: stats.cancelledOrders || 0,
    completedOrders: stats.completedOrders || 0,
    refundAmount: stats.refundAmount || 0,
    grossSales: stats.totalRevenue || 0,
    netProfit: (stats.totalRevenue || 0) - (stats.refundAmount || 0),
    revenueToday: revenueToday.revenue,
    revenueThisWeek: revenueWeek.revenue,
    revenueThisMonth: revenueMonth.revenue,
    revenueThisYear: revenueYear.revenue,
    ordersToday,
    totalCustomers,
    newCustomers: newCustomersInRange,
    returningCustomers,
    conversionRate,
    productsSold,
    lowStockProducts: stock.lowStock || 0,
    outOfStockProducts: stock.outOfStock || 0,
    inventoryValue: stock.inventoryValue || 0,
    couponsUsed,
    averageRating: Math.round((averageRating || 0) * 10) / 10,
    storageUsage: storageUsage
      ? {
          used: storageUsage.usedBytes || 0,
          limit: storageUsage.limitBytes || 0,
          percent: storageUsage.percentUsed || 0,
        }
      : { used: 0, limit: 0, percent: 0 },
    mediaUsage: storageUsage?.fileCount || 0,
    pages,
    latestOrders,
    lowStockItems: lowStockList,
    topProducts,
    topCustomers,
    topCategories: byCategory,
    paymentMethods: byPayment,
    shippingMethods: byZone,
  };
}

// ── Revenue Report ──────────────────────────────────────────────────────────

export async function getRevenueReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const daily = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byCategory = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$category.name", "Uncategorized"] },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  return { daily, byCategory };
}

// ── Order Report ────────────────────────────────────────────────────────────

export async function getOrderReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const byStatus = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch } },
    { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$total" } } },
    { $sort: { count: -1 } },
  ]);

  const byPaymentMethod = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch } },
    { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$total" } } },
    { $sort: { count: -1 } },
  ]);

  const recent = await OrderModel.find({ storeId: oid, ...dateMatch })
    .populate("customerId", "name email")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return { byStatus, byPaymentMethod, recent };
}

// ── Customer Report ─────────────────────────────────────────────────────────

export async function getCustomerReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const total = await CustomerModel.countDocuments({ storeId: oid });
  const newCustomers = await CustomerModel.countDocuments({ storeId: oid, ...dateMatch });

  const topCustomers = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
    {
      $group: {
        _id: "$customerId",
        totalSpent: { $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] } },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: "$customer.name",
        email: "$customer.email",
        totalSpent: 1,
        orderCount: 1,
      },
    },
  ]);

  return { total, newCustomers, topCustomers };
}

// ── Product Report ──────────────────────────────────────────────────────────

export async function getProductReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const total = await ProductModel.countDocuments({ storeId: oid });
  const lowStock = await ProductModel.countDocuments({ storeId: oid, stock: { $lte: 5, $gt: 0 } });
  const outOfStock = await ProductModel.countDocuments({ storeId: oid, stock: 0 });

  const topProducts = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ["$product.name", "Unknown"] },
        totalSold: 1,
        revenue: 1,
        stock: "$product.stock",
      },
    },
  ]);

  return { total, lowStock, outOfStock, topProducts };
}

// ── Category Report ─────────────────────────────────────────────────────────

export async function getCategoryReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const byCategory = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch, ...REVENUE_STATUS_MATCH } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$category.name", "Uncategorized"] },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orders: { $sum: 1 },
        products: { $addToSet: "$items.productId" },
      },
    },
    {
      $project: {
        name: "$_id",
        revenue: 1,
        orders: 1,
        productCount: { $size: "$products" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return { byCategory };
}

// ── Coupon Report ───────────────────────────────────────────────────────────

export async function getCouponReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const coupons = await CouponModel.find({ storeId: oid }).lean();
  const totalCoupons = coupons.length;

  const usedCoupons = await OrderModel.aggregate([
    { $match: { storeId: oid, ...dateMatch, couponCode: { $exists: true, $ne: "" } } },
    {
      $group: {
        _id: "$couponCode",
        count: { $sum: 1 },
        totalDiscount: { $sum: { $ifNull: ["$discount", 0] } },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  return { totalCoupons, usedCoupons };
}

// ── Media Report ────────────────────────────────────────────────────────────

export async function getMediaReport(storeId: string) {
  await connectDatabase();
  const oid = toOid(storeId);

  const storage = await StorageUsageModel.findOne({ storeId: oid }).lean() as Record<string, unknown> | null;
  const filesByType = await MediaFileModel.aggregate([
    { $match: { storeId: oid, isDeleted: { $ne: true } } },
    { $group: { _id: "$fileType", count: { $sum: 1 }, totalSize: { $sum: "$size" } } },
    { $sort: { totalSize: -1 } },
  ]);

  return {
    storage: storage ? {
      used: storage.usedBytes || 0,
      limit: storage.limitBytes || 0,
      percent: storage.percentUsed || 0,
      fileCount: storage.fileCount || 0,
    } : null,
    filesByType,
  };
}

// ── Activity Report ─────────────────────────────────────────────────────────

export async function getActivityReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);
  const oid = toOid(storeId);

  const [products, orders, customers, pages] = await Promise.all([
    ProductModel.countDocuments({ storeId: oid, ...dateMatch }),
    OrderModel.countDocuments({ storeId: oid, ...dateMatch }),
    CustomerModel.countDocuments({ storeId: oid, ...dateMatch }),
    StorePageModel.countDocuments({ storeId: oid, ...dateMatch, deletedAt: null }),
  ]);

  return { products, orders, customers, pages };
}

// ── Summary Reports (Daily/Weekly/Monthly/Yearly) ───────────────────────────

export async function getSummaryReport(storeId: string, period: "daily" | "weekly" | "monthly" | "yearly") {
  await connectDatabase();
  const oid = toOid(storeId);

  let groupId: Record<string, unknown>;
  let sortKey: Record<string, 1 | -1>;

  switch (period) {
    case "daily":
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      sortKey = { _id: 1 };
      break;
    case "weekly":
      groupId = { $isoWeek: "$createdAt", year: { $year: "$createdAt" } };
      sortKey = { year: 1, _id: 1 };
      break;
    case "monthly":
      groupId = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      sortKey = { year: 1, month: 1 };
      break;
    case "yearly":
      groupId = { $year: "$createdAt" };
      sortKey = { _id: 1 };
      break;
  }

  const data = await OrderModel.aggregate([
    { $match: { storeId: oid, ...REVENUE_STATUS_MATCH } },
    {
      $group: {
        _id: groupId,
        revenue: {
          $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
        },
        orders: { $sum: 1 },
        avgOrderValue: {
          $avg: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
        },
      },
    },
    { $sort: sortKey },
    { $limit: period === "daily" ? 30 : period === "weekly" ? 12 : period === "monthly" ? 12 : 5 },
  ]);

  return { period, data };
}

// ── Admin: Cross-Store Reports ──────────────────────────────────────────────

export async function getAdminCrossStoreReport() {
  await connectDatabase();

  const stores = await StoreModel.find({ status: { $ne: "archived" } }).lean();
  const storeIds = stores.map((s) => s._id);

  const [orderStats, storeRevenue] = await Promise.all([
    OrderModel.aggregate([
      { $match: { storeId: { $in: storeIds }, ...REVENUE_STATUS_MATCH } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
          },
          totalOrders: { $sum: 1 },
          avgOrderValue: {
            $avg: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
          },
        },
      },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: { $in: storeIds }, ...REVENUE_STATUS_MATCH } },
      {
        $group: {
          _id: "$storeId",
          revenue: {
            $sum: { $subtract: ["$total", { $ifNull: ["$refundAmount", 0] }] },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          storeName: "$store.name",
          storeSlug: "$store.slug",
          revenue: 1,
          orders: 1,
        },
      },
    ]),
  ]);

  return {
    totalStores: stores.length,
    totalRevenue: orderStats[0]?.totalRevenue || 0,
    totalOrders: orderStats[0]?.totalOrders || 0,
    avgOrderValue: orderStats[0]?.avgOrderValue || 0,
    topStores: storeRevenue,
  };
}
