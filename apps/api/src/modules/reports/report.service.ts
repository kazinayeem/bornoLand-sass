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
  preset?:
    | "today"
    | "yesterday"
    | "last7"
    | "last30"
    | "thisMonth"
    | "lastMonth"
    | "last3Months"
    | "last6Months"
    | "thisYear"
    | "lastYear"
    | "all";
};

type ReportFilters = DateRange & {
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  courier?: string;
  search?: string;
  minAmount?: string | number;
  maxAmount?: string | number;
};

function buildOrderExtraMatch(filters: ReportFilters = {}) {
  const extra: Record<string, unknown> = {};
  if (filters.orderStatus) extra.status = filters.orderStatus;
  if (filters.paymentStatus) extra.paymentStatus = filters.paymentStatus;
  if (filters.paymentMethod) {
    extra.paymentMethod = { $regex: `^${String(filters.paymentMethod).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
  }
  if (filters.courier) {
    const safe = String(filters.courier).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    extra.$or = [
      { courier: { $regex: safe, $options: "i" } },
      { "shipment.provider": { $regex: safe, $options: "i" } },
      { "shipment.providerName": { $regex: safe, $options: "i" } },
    ];
  }
  if (filters.search) {
    const safe = String(filters.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchOr = [
      { orderNumber: { $regex: safe, $options: "i" } },
      { invoiceNumber: { $regex: safe, $options: "i" } },
      { "shippingAddress.fullName": { $regex: safe, $options: "i" } },
      { "shippingAddress.phone": { $regex: safe, $options: "i" } },
    ];
    if (extra.$or) {
      extra.$and = [{ $or: extra.$or as unknown[] }, { $or: searchOr }];
      delete extra.$or;
    } else {
      extra.$or = searchOr;
    }
  }
  const min = filters.minAmount != null && filters.minAmount !== "" ? Number(filters.minAmount) : null;
  const max = filters.maxAmount != null && filters.maxAmount !== "" ? Number(filters.maxAmount) : null;
  if (min != null && Number.isFinite(min)) {
    extra.total = { ...(extra.total as object || {}), $gte: min };
  }
  if (max != null && Number.isFinite(max)) {
    extra.total = { ...(extra.total as object || {}), $lte: max };
  }
  return extra;
}

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
      case "last3Months":
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "last6Months":
        start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "lastYear":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
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

/** Previous period of equal length for % change comparisons. */
function getPreviousPeriodFilter(range: DateRange): { $gte?: Date; $lte?: Date } {
  const current = getDateFilter(range);
  if (!current.$gte) return {};
  const end = current.$lte ?? new Date();
  const start = current.$gte;
  const duration = Math.max(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { $gte: prevStart, $lte: prevEnd };
}

async function sumPeriodStats(storeId: string, dateFilter: { $gte?: Date; $lte?: Date }) {
  const oid = toOid(storeId);
  const match: Record<string, unknown> = { storeId: oid };
  if (dateFilter.$gte || dateFilter.$lte) match.createdAt = dateFilter;
  const rows = await OrderModel.aggregate([
    { $match: match },
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
        refundAmount: {
          $sum: {
            $cond: [
              { $gt: [{ $ifNull: ["$refundAmount", 0] }, 0] },
              "$refundAmount",
              { $cond: [{ $eq: ["$status", "refunded"] }, "$total", 0] },
            ],
          },
        },
        shippingCost: { $sum: { $ifNull: ["$deliveryCharge", { $ifNull: ["$shipping", 0] }] } },
        taxCollected: { $sum: { $ifNull: ["$tax", 0] } },
        discountTotal: { $sum: { $ifNull: ["$discount", 0] } },
        codCollection: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: [{ $toLower: { $ifNull: ["$paymentMethod", ""] } }, ["cod", "cash_on_delivery"]] },
                  { $eq: ["$paymentStatus", "paid"] },
                ],
              },
              "$total",
              0,
            ],
          },
        },
        onlineCollection: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $not: { $in: [{ $toLower: { $ifNull: ["$paymentMethod", ""] } }, ["cod", "cash_on_delivery", ""]] } },
                  { $eq: ["$paymentStatus", "paid"] },
                ],
              },
              "$total",
              0,
            ],
          },
        },
      },
    },
  ]);
  return (
    rows[0] ?? {
      totalRevenue: 0,
      totalOrders: 0,
      refundAmount: 0,
      shippingCost: 0,
      taxCollected: 0,
      discountTotal: 0,
      codCollection: 0,
      onlineCollection: 0,
    }
  );
}

function buildDateMatch(dateField: string, range: DateRange) {
  const dateFilter = getDateFilter(range);
  if (!dateFilter.$gte && !dateFilter.$lte) return {};
  return { [dateField]: dateFilter };
}

// ── KPI Dashboard ───────────────────────────────────────────────────────────

export async function getDashboardKPIs(storeId: string, range: ReportFilters) {
  await connectDatabase();
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new Error("Invalid store ID");
  }

  const dateMatch = buildDateMatch("createdAt", range);
  const extraMatch = buildOrderExtraMatch(range);
  const oid = toOid(storeId);
  const orderMatch = { storeId: oid, ...dateMatch, ...extraMatch };
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
      { $match: orderMatch },
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
      { $match: orderMatch },
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
      { $match: { ...orderMatch, ...REVENUE_STATUS_MATCH } },
      { $unwind: "$items" },
      { $group: { _id: null, units: { $sum: "$items.quantity" } } },
    ]),
    OrderModel.aggregate([
      {
        $match: {
          ...orderMatch,
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
    OrderModel.find(orderMatch)
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
      { $match: { ...orderMatch, ...REVENUE_STATUS_MATCH } },
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
      { $match: { ...orderMatch, ...REVENUE_STATUS_MATCH } },
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
      { $match: orderMatch },
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
      { $match: orderMatch },
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
      { $match: { ...orderMatch, ...REVENUE_STATUS_MATCH } },
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

  const prevFilter = getPreviousPeriodFilter(range);
  const [prevStats, financeStats, courierBreakdown, deliveredCount] = await Promise.all([
    Object.keys(prevFilter).length ? sumPeriodStats(storeId, prevFilter) : Promise.resolve(null),
    sumPeriodStats(storeId, getDateFilter(range)),
    OrderModel.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: {
            $ifNull: [
              "$shipment.providerName",
              { $ifNull: ["$shipment.provider", { $ifNull: ["$courier", "Unassigned"] }] },
            ],
          },
          count: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    OrderModel.countDocuments({ ...orderMatch, status: "delivered" }),
  ]);

  const pctChange = (current: number, previous: number) => {
    if (!previous) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  const shippingCost = financeStats.shippingCost || 0;
  const taxCollected = financeStats.taxCollected || 0;
  const discountTotal = financeStats.discountTotal || 0;
  const totalExpense = shippingCost + (stats.refundAmount || 0);
  const netIncome = (stats.totalRevenue || 0) - totalExpense;
  const returnRate =
    (stats.totalOrders || 0) > 0
      ? Math.round(((stats.cancelledOrders || 0) / stats.totalOrders) * 1000) / 10
      : 0;

  return {
    totalRevenue: stats.totalRevenue || 0,
    totalOrders: stats.totalOrders || 0,
    avgOrderValue: Math.round((stats.avgOrderValue || 0) * 100) / 100,
    pendingOrders: stats.pendingOrders || 0,
    cancelledOrders: stats.cancelledOrders || 0,
    completedOrders: stats.completedOrders || 0,
    deliveredOrders: deliveredCount,
    refundAmount: stats.refundAmount || 0,
    grossSales: stats.totalRevenue || 0,
    netProfit: (stats.totalRevenue || 0) - (stats.refundAmount || 0),
    netIncome,
    totalExpense,
    shippingCost,
    taxCollected,
    discountTotal,
    codCollection: financeStats.codCollection || 0,
    onlineCollection: financeStats.onlineCollection || 0,
    returnRate,
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
    courierBreakdown,
    comparison: prevStats
      ? {
          revenueChange: pctChange(stats.totalRevenue || 0, prevStats.totalRevenue || 0),
          ordersChange: pctChange(stats.totalOrders || 0, prevStats.totalOrders || 0),
          refundChange: pctChange(stats.refundAmount || 0, prevStats.refundAmount || 0),
          shippingChange: pctChange(shippingCost, prevStats.shippingCost || 0),
          previousRevenue: prevStats.totalRevenue || 0,
          previousOrders: prevStats.totalOrders || 0,
        }
      : null,
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
