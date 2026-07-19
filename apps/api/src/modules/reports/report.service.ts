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

type DateRange = {
  start?: string;
  end?: string;
  preset?: "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "thisYear" | "all";
};

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
  const dateMatch = buildDateMatch("createdAt", range);

  const storeFilter = { storeId, ...dateMatch };

  const [
    totalOrders,
    orderStats,
    totalProducts,
    totalCustomers,
    categories,
    storageUsage,
    pages,
    couponsUsed,
    reviews,
  ] = await Promise.all([
    OrderModel.countDocuments({ storeId }),
    OrderModel.aggregate([
      { $match: { storeId, ...dateMatch } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
          completedOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          pendingOrders: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          refundedAmount: { $sum: { $cond: [{ $eq: ["$status", "refunded"] }, "$total", 0] } },
          uniqueCustomers: { $addToSet: "$customerId" },
        },
      },
    ]),
    ProductModel.countDocuments({ storeId }),
    CustomerModel.countDocuments({ storeId }),
    CategoryModel.countDocuments({ storeId }),
    StorageUsageModel.findOne({ storeId }).lean(),
    StorePageModel.countDocuments({ storeId, deletedAt: null }),
    CouponModel.countDocuments({ storeId }),
    ReviewModel.countDocuments({ storeId }),
  ]);

  const stats = orderStats[0] || {
    totalRevenue: 0, totalOrders: 0, avgOrderValue: 0,
    completedOrders: 0, pendingOrders: 0, cancelledOrders: 0,
    refundedAmount: 0, uniqueCustomers: [],
  };

  const uniqueCustomerCount = Array.isArray(stats.uniqueCustomers) ? stats.uniqueCustomers.length : 0;
  const conversionRate = totalOrders > 0 ? ((stats.totalOrders / Math.max(totalProducts, 1)) * 100) : 0;

  return {
    totalRevenue: stats.totalRevenue || 0,
    totalOrders: stats.totalOrders || 0,
    totalCustomers,
    avgOrderValue: stats.avgOrderValue || 0,
    netProfit: (stats.totalRevenue || 0) - (stats.refundedAmount || 0),
    grossSales: stats.totalRevenue || 0,
    refundAmount: stats.refundedAmount || 0,
    pendingOrders: stats.pendingOrders || 0,
    cancelledOrders: stats.cancelledOrders || 0,
    completedOrders: stats.completedOrders || 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    returningCustomers: uniqueCustomerCount,
    newCustomers: totalCustomers,
    productsSold: totalProducts,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    inventoryValue: 0,
    couponsUsed,
    averageRating: 0,
    storageUsage: storageUsage ? {
      used: storageUsage.usedBytes || 0,
      limit: storageUsage.limitBytes || 0,
      percent: storageUsage.percentUsed || 0,
    } : { used: 0, limit: 0, percent: 0 },
    mediaUsage: storageUsage?.fileCount || 0,
    pages,
  };
}

// ── Revenue Report ──────────────────────────────────────────────────────────

export async function getRevenueReport(storeId: string, range: DateRange) {
  await connectDatabase();
  const dateMatch = buildDateMatch("createdAt", range);

  const daily = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch, paymentStatus: "paid" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byCategory = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch, paymentStatus: "paid" } },
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
        _id: "$category.name",
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

  const byStatus = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch } },
    { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$total" } } },
    { $sort: { count: -1 } },
  ]);

  const byPaymentMethod = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch } },
    { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$total" } } },
    { $sort: { count: -1 } },
  ]);

  const recent = await OrderModel.find({ storeId, ...dateMatch })
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

  const total = await CustomerModel.countDocuments({ storeId });
  const newCustomers = await CustomerModel.countDocuments({ storeId, ...dateMatch });

  const topCustomers = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch } },
    {
      $group: {
        _id: "$customerId",
        totalSpent: { $sum: "$total" },
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

  const total = await ProductModel.countDocuments({ storeId });
  const lowStock = await ProductModel.countDocuments({ storeId, stock: { $lte: 5, $gt: 0 } });
  const outOfStock = await ProductModel.countDocuments({ storeId, stock: 0 });

  const topProducts = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch } },
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
        name: "$product.name",
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

  const byCategory = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch } },
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

  const coupons = await CouponModel.find({ storeId }).lean();
  const totalCoupons = coupons.length;

  const usedCoupons = await OrderModel.aggregate([
    { $match: { storeId, ...dateMatch, couponCode: { $exists: true, $ne: "" } } },
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

  const storage = await StorageUsageModel.findOne({ storeId }).lean();
  const filesByType = await MediaFileModel.aggregate([
    { $match: { storeId, isDeleted: { $ne: true } } },
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

  const [products, orders, customers, pages] = await Promise.all([
    ProductModel.countDocuments({ storeId, ...dateMatch }),
    OrderModel.countDocuments({ storeId, ...dateMatch }),
    CustomerModel.countDocuments({ storeId, ...dateMatch }),
    StorePageModel.countDocuments({ storeId, ...dateMatch, deletedAt: null }),
  ]);

  return { products, orders, customers, pages };
}

// ── Summary Reports (Daily/Weekly/Monthly/Yearly) ───────────────────────────

export async function getSummaryReport(storeId: string, period: "daily" | "weekly" | "monthly" | "yearly") {
  await connectDatabase();

  let groupId: Record<string, unknown>;
  let sortKey: Record<string, 1 | -1>;

  switch (period) {
    case "daily":
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      sortKey = { _id: 1 };
      break;
    case "weekly":
      groupId = { $isoWeek: "$createdAt", year: { $year: "$createdAt" } };
      sortKey = { "year": 1, "_id": 1 };
      break;
    case "monthly":
      groupId = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      sortKey = { "year": 1, "month": 1 };
      break;
    case "yearly":
      groupId = { $year: "$createdAt" };
      sortKey = { _id: 1 };
      break;
  }

  const data = await OrderModel.aggregate([
    { $match: { storeId } },
    {
      $group: {
        _id: groupId,
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
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
  const storeIds = stores.map((s) => String(s._id));

  const [orderStats, storeRevenue] = await Promise.all([
    OrderModel.aggregate([
      { $match: { storeId: { $in: storeIds } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]),
    OrderModel.aggregate([
      { $match: { storeId: { $in: storeIds }, paymentStatus: "paid" } },
      {
        $group: {
          _id: "$storeId",
          revenue: { $sum: "$total" },
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
