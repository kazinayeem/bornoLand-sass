import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../modules/stores/store.model.js";
import { UserModel } from "../../modules/users/user.model.js";
import { ProductModel } from "../../models/product.model.js";
import { OrderModel } from "../../models/order.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { PlanModel } from "../../modules/plans/plan.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { MediaFileModel } from "../../models/media-file.model.js";
import { StorageUsageModel } from "../../modules/media/storage-usage.model.js";

// ── BDT formatter ────────────────────────────────────────────
export function bdtValue(amount: number) {
  return { currency: "BDT" as const, amount, symbol: "৳" as const };
}

export function formatBDT(amount: number) {
  const numStr = Math.round(amount).toLocaleString("en-IN");
  return {
    currency: "BDT" as const,
    amount,
    formattedAmount: `৳ ${numStr}`,
    symbol: "৳" as const,
  };
}

// ── Platform Overview ─────────────────────────────────────────
export async function getPlatformOverview() {
  await connectDatabase();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfDay.getTime() - 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalStores,
    totalUsers,
    totalProducts,
    totalOrders,
    totalCustomers,
    totalMedia,
    paidOrders,
    todayOrders,
    yesterdayOrders,
    monthOrders,
    yearOrders,
    storesByStatus,
    storesByBilling,
    activePlanStores,
    storageInfo,
    allSubscriptions,
  ] = await Promise.all([
    StoreModel.countDocuments(),
    UserModel.countDocuments(),
    ProductModel.countDocuments(),
    OrderModel.countDocuments(),
    CustomerModel.countDocuments(),
    MediaFileModel.countDocuments({ isDeleted: { $ne: true } }),
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfYesterday, $lt: startOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    StoreModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    StoreModel.aggregate([
      { $group: { _id: "$billingStatus", count: { $sum: 1 } } },
    ]),
    StoreModel.aggregate([
      { $match: { planId: { $ne: null } } },
      {
        $group: {
          _id: "$planId",
          count: { $sum: 1 },
        },
      },
    ]),
    StorageUsageModel.aggregate([
      {
        $group: {
          _id: null,
          totalUsed: { $sum: "$usedBytes" },
          totalLimit: { $sum: { $cond: ["$unlimited", 0, "$limitBytes"] } },
          totalFiles: { $sum: "$fileCount" },
        },
      },
    ]),
    OrderModel.distinct("planId"),
  ]);

  // MRR: sum of active plan prices
  let mrr = 0;
  let arr = 0;
  const activeStorePlans = await StoreModel.find({
    planId: { $ne: null },
    billingStatus: { $in: ["active", "trial"] },
  })
    .select("planId")
    .lean();

  const planPrices: Record<string, number> = {};
  const allPlans = await PlanModel.find({}).select("priceBDT").lean();
  for (const p of allPlans) {
    planPrices[String(p._id)] = (p as Record<string, unknown>).priceBDT as number ?? 0;
  }

  for (const s of activeStorePlans) {
    const pid = String((s as Record<string, unknown>).planId ?? "");
    mrr += planPrices[pid] ?? 0;
  }
  arr = mrr * 12;

  const totalPlatformRevenue = paidOrders[0]?.total ?? 0;
  const todayRevenue = todayOrders[0]?.total ?? 0;
  const yesterdayRevenue = yesterdayOrders[0]?.total ?? 0;
  const monthlyRevenue = monthOrders[0]?.total ?? 0;
  const yearlyRevenue = yearOrders[0]?.total ?? 0;

  const statusMap: Record<string, number> = {};
  storesByStatus.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  const billingMap: Record<string, number> = {};
  storesByBilling.forEach((s) => {
    billingMap[s._id] = s.count;
  });

  const storageUsedBytes = storageInfo[0]?.totalUsed ?? 0;
  const storageLimitBytes = storageInfo[0]?.totalLimit ?? 0;
  const totalMediaFiles = storageInfo[0]?.totalFiles ?? 0;

  // Owner count: users who own at least one store
  const storeOwnerIds = await StoreModel.distinct("userId");

  return {
    revenue: {
      total: formatBDT(totalPlatformRevenue),
      monthly: formatBDT(monthlyRevenue),
      today: formatBDT(todayRevenue),
      yesterday: formatBDT(yesterdayRevenue),
      yearly: formatBDT(yearlyRevenue),
      mrr: formatBDT(mrr),
      arr: formatBDT(arr),
    },
    stores: {
      total: totalStores,
      active: statusMap["active"] ?? 0,
      suspended: statusMap["suspended"] ?? 0,
      expired: statusMap["expired"] ?? 0,
      draft: statusMap["draft"] ?? 0,
      archived: statusMap["archived"] ?? 0,
      trialing: billingMap["trial"] ?? 0,
      pastDue: billingMap["past_due"] ?? 0,
    },
    users: {
      total: totalUsers,
      storeOwners: storeOwnerIds.length,
      customers: totalCustomers,
    },
    orders: {
      total: totalOrders,
    },
    products: {
      total: totalProducts,
    },
    storage: {
      usedBytes: storageUsedBytes,
      limitBytes: storageLimitBytes,
      usedFormatted: formatBytes(storageUsedBytes),
      limitFormatted: formatBytes(storageLimitBytes),
      totalFiles: totalMediaFiles,
    },
  };
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── Revenue Analytics ─────────────────────────────────────────
export async function getRevenueAnalytics() {
  await connectDatabase();

  const now = new Date();

  // Daily revenue last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const dailyRevenue = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  // Monthly revenue last 12 months
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const monthlyRevenue = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Revenue by plan
  const revenueByPlan = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid", planId: { $ne: null } } },
    {
      $group: {
        _id: "$planId",
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
  ]);

  // Enrich plan names
  const plans = await PlanModel.find({}).select("name slug").lean();
  const planMap: Record<string, { name: string; slug: string }> = {};
  for (const p of plans) {
    planMap[String(p._id)] = { name: p.name, slug: p.slug };
  }

  const enrichedByPlan = revenueByPlan.map((r) => {
    const pid = String(r._id);
    return {
      planId: pid,
      planName: planMap[pid]?.name ?? "Unknown",
      planSlug: planMap[pid]?.slug ?? "",
      orders: r.orders,
      revenue: bdtValue(r.revenue),
      formattedRevenue: formatBDT(r.revenue),
    };
  });

  // Revenue by payment method
  const revenueByPayment = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$paymentMethod",
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const enrichedByPayment = revenueByPayment.map((r) => ({
    method: r._id || "Unknown",
    orders: r.orders,
    revenue: bdtValue(r.revenue),
    formattedRevenue: formatBDT(r.revenue),
  }));

  // Revenue by store (top 20)
  const revenueByStore = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$storeId",
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 20 },
  ]);

  const storeIds = revenueByStore.map((r) => String(r._id));
  const stores = await StoreModel.find({ _id: { $in: storeIds } })
    .select("name slug")
    .lean();
  const storeNameMap: Record<string, { name: string; slug: string }> = {};
  for (const s of stores) {
    storeNameMap[String(s._id)] = { name: s.name, slug: s.slug };
  }

  const enrichedByStore = revenueByStore.map((r) => ({
    storeId: String(r._id),
    storeName: storeNameMap[String(r._id)]?.name ?? "Unknown",
    storeSlug: storeNameMap[String(r._id)]?.slug ?? "",
    orders: r.orders,
    revenue: bdtValue(r.revenue),
    formattedRevenue: formatBDT(r.revenue),
  }));

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return {
    daily: dailyRevenue.map((d) => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
      revenue: bdtValue(d.revenue),
      formattedRevenue: formatBDT(d.revenue),
      orders: d.orders,
    })),
    monthly: monthlyRevenue.map((m) => ({
      month: monthNames[m._id.month - 1],
      year: m._id.year,
      revenue: bdtValue(m.revenue),
      formattedRevenue: formatBDT(m.revenue),
      orders: m.orders,
    })),
    byPlan: enrichedByPlan,
    byPayment: enrichedByPayment,
    byStore: enrichedByStore,
  };
}

// ── Subscription Revenue ──────────────────────────────────────
export async function getSubscriptionRevenue() {
  await connectDatabase();

  const plans = await PlanModel.find({}).lean();
  const stores = await StoreModel.find({})
    .populate("planId", "name slug priceBDT")
    .lean() as Array<Record<string, unknown>>;

  const byPlan: Record<
    string,
    { subscribers: number; active: number; trialing: number; expired: number; revenue: number; monthlyRevenue: number }
  > = {};

  for (const plan of plans) {
    byPlan[String(plan._id)] = {
      subscribers: 0,
      active: 0,
      trialing: 0,
      expired: 0,
      revenue: 0,
      monthlyRevenue: 0,
    };
  }

  let totalSubscribers = 0;
  let totalMonthlyRevenue = 0;
  let totalRevenueFromPaid = 0;
  let trialToPaidCount = 0;
  let trialExpiredCount = 0;

  for (const store of stores) {
    const planId = store.planId
      ? String((store.planId as Record<string, unknown>)._id || store.planId)
      : null;
    if (!planId || !byPlan[planId]) continue;

    const planPrice = (store.planId as Record<string, unknown>)?.priceBDT as number ?? 0;
    const bs = store.billingStatus as string;
    const ss = store.subscriptionStatus as string;

    byPlan[planId].subscribers++;

    if (bs === "active" && ss === "active") {
      byPlan[planId].active++;
      byPlan[planId].monthlyRevenue += planPrice;
      totalMonthlyRevenue += planPrice;
    } else if (bs === "trial") {
      byPlan[planId].trialing++;
    } else if (bs === "past_due" || bs === "cancelled" || ss === "expired") {
      byPlan[planId].expired++;
    }

    totalSubscribers++;
  }

  // Actual paid revenue from orders
  const paidRevenue = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  totalRevenueFromPaid = paidRevenue[0]?.total ?? 0;

  // Trial conversion (stores that went from trial to active)
  const trialConverted = await StoreModel.countDocuments({
    billingStatus: "active",
    trialStartedAt: { $ne: null },
  });
  const trialTotal = await StoreModel.countDocuments({
    trialStartedAt: { $ne: null },
  });
  const trialConversionRate = trialTotal > 0 ? (trialConverted / trialTotal) * 100 : 0;

  const plansData = plans.map((plan) => {
    const data = byPlan[String(plan._id)] || {
      subscribers: 0,
      active: 0,
      trialing: 0,
      expired: 0,
      revenue: 0,
      monthlyRevenue: 0,
    };
    return {
      _id: plan._id,
      name: plan.name,
      slug: plan.slug,
      priceBDT: plan.priceBDT,
      ...data,
      revenue: formatBDT(data.revenue),
      monthlyRevenue: formatBDT(data.monthlyRevenue),
    };
  });

  return {
    totalSubscribers,
    totalMonthlyRevenue: formatBDT(totalMonthlyRevenue),
    totalRevenueFromPaid: formatBDT(totalRevenueFromPaid),
    trialConversionRate: Math.round(trialConversionRate * 100) / 100,
    trialConverted,
    trialTotal,
    plans: plansData,
  };
}

// ── Payment Dashboard ─────────────────────────────────────────
export async function getPaymentDashboard() {
  await connectDatabase();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Payment method breakdown (all-time)
  const byMethod = await OrderModel.aggregate([
    {
      $group: {
        _id: "$paymentMethod",
        totalRevenue: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] },
        },
        totalOrders: { $sum: 1 },
        paidOrders: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
        },
        failedOrders: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] },
        },
        refundedAmount: {
          $sum: "$refundAmount",
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // Today's collection
  const todayPayments = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startOfDay }, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
  ]);

  // Monthly collection
  const monthPayments = await OrderModel.aggregate([
    {
      $match: { createdAt: { $gte: startOfMonth }, paymentStatus: "paid" },
    },
    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
  ]);

  // Totals
  const pendingTotal = await OrderModel.aggregate([
    { $match: { paymentStatus: "pending" } },
    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
  ]);

  const refundTotal = await OrderModel.aggregate([
    { $match: { paymentStatus: "refunded" } },
    { $group: { _id: null, total: { $sum: "$refundAmount" }, count: { $sum: 1 } } },
  ]);

  const failedTotal = await OrderModel.aggregate([
    { $match: { paymentStatus: "failed" } },
    { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
  ]);

  return {
    byMethod: byMethod.map((m) => ({
      method: m._id || "Unknown",
      totalRevenue: formatBDT(m.totalRevenue),
      totalOrders: m.totalOrders,
      paidOrders: m.paidOrders,
      pendingOrders: m.pendingOrders,
      failedOrders: m.failedOrders,
      refundedAmount: formatBDT(m.refundedAmount),
    })),
    todayCollection: formatBDT(todayPayments[0]?.total ?? 0),
    todayOrders: todayPayments[0]?.count ?? 0,
    monthlyCollection: formatBDT(monthPayments[0]?.total ?? 0),
    monthlyOrders: monthPayments[0]?.count ?? 0,
    pending: {
      total: formatBDT(pendingTotal[0]?.total ?? 0),
      count: pendingTotal[0]?.count ?? 0,
    },
    refunds: {
      total: formatBDT(refundTotal[0]?.total ?? 0),
      count: refundTotal[0]?.count ?? 0,
    },
    failed: {
      total: formatBDT(failedTotal[0]?.total ?? 0),
      count: failedTotal[0]?.count ?? 0,
    },
  };
}

// ── Finance Dashboard ─────────────────────────────────────────
export async function getFinanceDashboard() {
  await connectDatabase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // All-time revenue (paid)
  const totalRevenue = await OrderModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  // Total refunds
  const totalRefunds = await OrderModel.aggregate([
    { $match: { paymentStatus: "refunded" } },
    { $group: { _id: null, total: { $sum: "$refundAmount" } } },
  ]);

  // Monthly revenue
  const monthlyRevenue = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  // Yearly revenue
  const yearlyRevenue = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startOfYear }, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  // Platform fees (5% estimate of total revenue if platformFeePercent is not available)
  // In production, fetch from PlatformSettings
  const platformFeePercent = 5;
  const rev = totalRevenue[0]?.total ?? 0;
  const platformFees = (rev * platformFeePercent) / 100;

  // Subscription income
  const subIncome = await getSubscriptionIncome();

  // Expenses (placeholder — would come from expense tracking in production)
  const expenses = 0;

  const revenue = totalRevenue[0]?.total ?? 0;
  const refunds = totalRefunds[0]?.total ?? 0;

  return {
    totalRevenue: formatBDT(revenue),
    totalRefunds: formatBDT(refunds),
    netRevenue: formatBDT(revenue - refunds),
    monthlyRevenue: formatBDT(monthlyRevenue[0]?.total ?? 0),
    yearlyRevenue: formatBDT(yearlyRevenue[0]?.total ?? 0),
    platformFees: formatBDT(platformFees),
    estimatedProfit: formatBDT(revenue - refunds - expenses),
    subscriptionIncome: formatBDT(subIncome),
    expenses: formatBDT(expenses),
  };
}

async function getSubscriptionIncome(): Promise<number> {
  const activeStores = await StoreModel.find({
    billingStatus: "active",
    planId: { $ne: null },
  })
    .select("planId")
    .lean();

  const planIds = [...new Set(activeStores.map((s) => String((s as Record<string, unknown>).planId ?? "")))].filter(Boolean);
  if (planIds.length === 0) return 0;

  const plans = await PlanModel.find({ _id: { $in: planIds } })
    .select("priceBDT")
    .lean();

  const planPriceMap: Record<string, number> = {};
  for (const p of plans) {
    planPriceMap[String(p._id)] = (p as Record<string, unknown>).priceBDT as number ?? 0;
  }

  let income = 0;
  for (const store of activeStores) {
    income += planPriceMap[String((store as Record<string, unknown>).planId ?? "")] ?? 0;
  }
  return income;
}

// ── Reports ───────────────────────────────────────────────────
export async function getRevenueReport(from?: Date, to?: Date) {
  await connectDatabase();

  const match: Record<string, unknown> = { paymentStatus: "paid" };
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = from;
    if (to) dateFilter.$lte = to;
    match.createdAt = dateFilter;
  }

  const orders = await OrderModel.find(match)
    .populate("storeId", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const total = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    total: formatBDT(total),
    count: orders.length,
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      storeName: (o.storeId as { name?: string })?.name ?? "Unknown",
      total: formatBDT(o.total ?? 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    })),
  };
}

export async function getStoreReport() {
  await connectDatabase();

  const stores = await StoreModel.find()
    .populate("userId", "name email")
    .select("name slug plan billingStatus subscriptionStatus status createdAt")
    .lean();

  const enriched = await Promise.all(
    stores.map(async (store) => {
      const [orderCount, productCount, revenue] = await Promise.all([
        OrderModel.countDocuments({ storeId: store._id }),
        ProductModel.countDocuments({ storeId: store._id }),
        OrderModel.aggregate([
          { $match: { storeId: store._id, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);
      return {
        _id: store._id,
        name: store.name,
        slug: store.slug,
        plan: store.plan,
        status: store.status,
        billingStatus: store.billingStatus,
        owner: (store.userId as { name?: string; email?: string })?.name ?? "—",
        ownerEmail: (store.userId as { name?: string; email?: string })?.email ?? "—",
        orders: orderCount,
        products: productCount,
        revenue: formatBDT(revenue[0]?.total ?? 0),
        createdAt: store.createdAt,
      };
    })
  );

  return { stores: enriched };
}

export async function getSubscriptionReport() {
  await connectDatabase();

  const plans = await PlanModel.find({}).lean();
  const stores = await StoreModel.find({})
    .populate("planId", "name slug priceBDT")
    .lean() as Array<Record<string, unknown>>;

  const planStats: Record<string, { subscribers: number; active: number; trialing: number; expired: number }> = {};
  for (const plan of plans) {
    planStats[String(plan._id)] = { subscribers: 0, active: 0, trialing: 0, expired: 0 };
  }

  for (const store of stores) {
    const planId = store.planId
      ? String((store.planId as Record<string, unknown>)._id || store.planId)
      : null;
    if (!planId || !planStats[planId]) continue;
    planStats[planId].subscribers++;
    const bs = store.billingStatus as string;
    if (bs === "active") planStats[planId].active++;
    else if (bs === "trial") planStats[planId].trialing++;
    else if (bs === "past_due" || bs === "cancelled") planStats[planId].expired++;
  }

  return {
    plans: plans.map((plan) => ({
      _id: plan._id,
      name: plan.name,
      slug: plan.slug,
      priceBDT: plan.priceBDT,
      ...planStats[String(plan._id)] || { subscribers: 0, active: 0, trialing: 0, expired: 0 },
    })),
  };
}

export async function getPaymentReport(from?: Date, to?: Date) {
  await connectDatabase();

  const match: Record<string, unknown> = {};
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = from;
    if (to) dateFilter.$lte = to;
    match.createdAt = dateFilter;
  }

  const payments = await OrderModel.find(match)
    .populate("storeId", "name slug")
    .select("orderNumber total paymentMethod paymentStatus refundAmount createdAt storeId")
    .sort({ createdAt: -1 })
    .lean();

  return {
    payments: payments.map((p) => ({
      orderNumber: p.orderNumber,
      storeName: (p.storeId as { name?: string })?.name ?? "Unknown",
      method: p.paymentMethod,
      status: p.paymentStatus,
      amount: formatBDT(p.total ?? 0),
      refunded: formatBDT(p.refundAmount ?? 0),
      createdAt: p.createdAt,
    })),
    total: formatBDT(payments.reduce((s, p) => s + (p.total ?? 0), 0)),
    count: payments.length,
  };
}

export async function getOrderReport(from?: Date, to?: Date) {
  await connectDatabase();

  const match: Record<string, unknown> = {};
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = from;
    if (to) dateFilter.$lte = to;
    match.createdAt = dateFilter;
  }

  const orders = await OrderModel.find(match)
    .populate("storeId", "name slug")
    .populate("customerId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const totalValue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgOrderValue = orders.length > 0 ? totalValue / orders.length : 0;

  return {
    totalOrders: orders.length,
    totalValue: formatBDT(totalValue),
    averageOrderValue: formatBDT(avgOrderValue),
    statusBreakdown: {
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      refunded: orders.filter((o) => o.status === "refunded").length,
    },
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      storeName: (o.storeId as { name?: string })?.name ?? "Unknown",
      customerName: (o.customerId as { name?: string })?.name ?? "—",
      total: formatBDT(o.total ?? 0),
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    })),
  };
}
