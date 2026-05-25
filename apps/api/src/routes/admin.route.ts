import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { UserModel } from "../models/user.model.js";
import { StoreModel } from "../models/store.model.js";
import { ProductModel } from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";
import { PlanModel } from "../models/plan.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { TemplateModel } from "../models/template.model.js";
import { PlatformSettingsModel } from "../models/platform-settings.model.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole("super_admin"));

// ── Analytics Dashboard ──────────────────────────────────────────
adminRouter.get("/analytics", async (_request, response) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const [
      totalUsers, totalStores, totalProducts, totalOrders, totalTemplates,
      storesByStatus, ordersByStatus, paidRevenue,
      monthlyRevenue, monthlyUsers, monthlyStores, suspendedStoreCount,
      activeSubscriptions, recentOrders
    ] = await Promise.all([
      UserModel.countDocuments(),
      StoreModel.countDocuments(),
      ProductModel.countDocuments(),
      OrderModel.countDocuments(),
      TemplateModel.countDocuments(),
      StoreModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      OrderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      OrderModel.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      UserModel.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      StoreModel.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      StoreModel.countDocuments({ status: "suspended" }),
      StoreModel.countDocuments({ billingStatus: { $in: ["active", "trial"] } }),
      OrderModel.find().sort({ createdAt: -1 }).limit(5).populate("storeId", "name slug").lean()
    ]);

    const storeStatusMap: Record<string, number> = {};
    storesByStatus.forEach((s) => { storeStatusMap[s._id] = s.count; });

    const orderStatusMap: Record<string, number> = {};
    ordersByStatus.forEach((s) => { orderStatusMap[s._id] = s.count; });

    const pendingPayments = orderStatusMap["pending"] ?? 0;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    response.json({
      data: {
        counts: {
          users: totalUsers,
          stores: totalStores,
          products: totalProducts,
          orders: totalOrders,
          templates: totalTemplates,
          suspendedStores: suspendedStoreCount,
          activeSubscriptions,
          pendingPayments
        },
        revenue: {
          total: paidRevenue[0]?.total ?? 0,
          monthly: monthlyRevenue.map((r) => ({
            month: monthNames[r._id.month - 1],
            revenue: r.revenue,
            orders: r.orders
          }))
        },
        growth: {
          users: monthlyUsers.map((r) => ({ month: monthNames[r._id.month - 1], count: r.count })),
          stores: monthlyStores.map((r) => ({ month: monthNames[r._id.month - 1], count: r.count }))
        },
        storesByStatus: storeStatusMap,
        ordersByStatus: orderStatusMap,
        recentOrders
      }
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    response.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// ── Store Management ─────────────────────────────────────────────
adminRouter.get("/stores", async (_request, response) => {
  try {
    const stores = await StoreModel.find()
      .populate("userId", "name email")
      .populate("selectedTemplateId", "name slug")
      .sort({ createdAt: -1 }).lean();

    const storeIds = stores.map((s) => s._id);
    const [productCounts, orderCounts, revenueByStore] = await Promise.all([
      ProductModel.aggregate([{ $match: { storeId: { $in: storeIds } } }, { $group: { _id: "$storeId", count: { $sum: 1 } } }]),
      OrderModel.aggregate([{ $match: { storeId: { $in: storeIds } } }, { $group: { _id: "$storeId", count: { $sum: 1 }, revenue: { $sum: "$total" } } }]),
      OrderModel.aggregate([{ $match: { storeId: { $in: storeIds }, paymentStatus: "paid" } }, { $group: { _id: "$storeId", revenue: { $sum: "$total" } } }])
    ]);

    const productCountMap: Record<string, number> = {};
    productCounts.forEach((p) => { productCountMap[String(p._id)] = p.count; });
    const orderCountMap: Record<string, number> = {};
    orderCounts.forEach((o) => { orderCountMap[String(o._id)] = o.count; });
    const revenueMap: Record<string, number> = {};
    revenueByStore.forEach((r) => { revenueMap[String(r._id)] = r.revenue; });

    const enriched = stores.map((store) => ({
      ...store,
      productCount: productCountMap[String(store._id)] ?? 0,
      orderCount: orderCountMap[String(store._id)] ?? 0,
      revenueBDT: revenueMap[String(store._id)] ?? 0
    }));

    response.json({ data: { stores: enriched } });
  } catch (error) {
    console.error("Admin stores error:", error);
    response.status(500).json({ message: "Failed to fetch stores" });
  }
});

adminRouter.put("/stores/:id/suspend", async (request, response) => {
  try {
    const store = await StoreModel.findByIdAndUpdate(request.params.id, { status: "suspended" }, { new: true });
    if (!store) return response.status(404).json({ message: "Store not found" });
    response.json({ data: { store } });
  } catch (error) {
    console.error("Admin suspend store error:", error);
    response.status(500).json({ message: "Failed to suspend store" });
  }
});

adminRouter.put("/stores/:id/activate", async (request, response) => {
  try {
    const store = await StoreModel.findByIdAndUpdate(request.params.id, { status: "active" }, { new: true });
    if (!store) return response.status(404).json({ message: "Store not found" });
    response.json({ data: { store } });
  } catch (error) {
    console.error("Admin activate store error:", error);
    response.status(500).json({ message: "Failed to activate store" });
  }
});

adminRouter.delete("/stores/:id", async (request, response) => {
  try {
    const store = await StoreModel.findByIdAndDelete(request.params.id);
    if (!store) return response.status(404).json({ message: "Store not found" });
    await Promise.all([
      ProductModel.deleteMany({ storeId: store._id }),
      OrderModel.deleteMany({ storeId: store._id })
    ]);
    response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Admin delete store error:", error);
    response.status(500).json({ message: "Failed to delete store" });
  }
});

adminRouter.put("/stores/:id/plan", async (request, response) => {
  try {
    const { planId, plan } = request.body;
    const update: Record<string, unknown> = {};
    if (planId) update.planId = planId;
    if (plan) update.plan = plan;
    const store = await StoreModel.findByIdAndUpdate(request.params.id, update, { new: true }).populate("planId", "name slug priceBDT");
    if (!store) return response.status(404).json({ message: "Store not found" });
    response.json({ data: { store } });
  } catch (error) {
    console.error("Admin change plan error:", error);
    response.status(500).json({ message: "Failed to change plan" });
  }
});

// ── User Management ──────────────────────────────────────────────
adminRouter.get("/users", async (_request, response) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    const userIds = users.map((u) => u._id);
    const storeCounts = await StoreModel.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);
    const storeCountMap: Record<string, number> = {};
    storeCounts.forEach((s) => { storeCountMap[String(s._id)] = s.count; });

    const enriched = users.map((user) => ({
      ...user,
      storeCount: storeCountMap[String(user._id)] ?? 0
    }));

    response.json({ data: { users: enriched } });
  } catch (error) {
    console.error("Admin users error:", error);
    response.status(500).json({ message: "Failed to fetch users" });
  }
});

adminRouter.put("/users/:id/suspend", async (request, response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(request.params.id, { status: "suspended" }, { new: true });
    if (!user) return response.status(404).json({ message: "User not found" });
    response.json({ data: { user } });
  } catch (error) {
    console.error("Admin suspend user error:", error);
    response.status(500).json({ message: "Failed to suspend user" });
  }
});

adminRouter.put("/users/:id/activate", async (request, response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(request.params.id, { status: "active" }, { new: true });
    if (!user) return response.status(404).json({ message: "User not found" });
    response.json({ data: { user } });
  } catch (error) {
    console.error("Admin activate user error:", error);
    response.status(500).json({ message: "Failed to activate user" });
  }
});

adminRouter.delete("/users/:id", async (request, response) => {
  try {
    const user = await UserModel.findByIdAndDelete(request.params.id);
    if (!user) return response.status(404).json({ message: "User not found" });
    await StoreModel.deleteMany({ userId: user._id });
    response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Admin delete user error:", error);
    response.status(500).json({ message: "Failed to delete user" });
  }
});

// ── Product Management ───────────────────────────────────────────
adminRouter.get("/products", async (_request, response) => {
  try {
    const products = await ProductModel.find()
      .populate("storeId", "name slug subdomain")
      .sort({ createdAt: -1 }).lean();

    const storeIds = products.map((p) => p.storeId?._id ?? p.storeId).filter(Boolean);
    const salesCounts = await OrderModel.aggregate([
      { $unwind: "$items" },
      { $match: { "items.productId": { $in: storeIds.map(String) } } },
      { $group: { _id: "$items.productId", count: { $sum: "$items.quantity" } } }
    ]);

    const salesMap: Record<string, number> = {};
    salesCounts.forEach((s) => { salesMap[String(s._id)] = s.count; });

    const enriched = products.map((product) => ({
      ...product,
      storeName: (product.storeId as { name?: string })?.name ?? "Unknown Store",
      salesCount: salesMap[String(product._id)] ?? 0
    }));

    response.json({ data: { products: enriched } });
  } catch (error) {
    console.error("Admin products error:", error);
    response.status(500).json({ message: "Failed to fetch products" });
  }
});

// ── Order Management ─────────────────────────────────────────────
adminRouter.get("/orders", async (request, response) => {
  try {
    const { storeId, status, paymentStatus, from, to, page = "1", limit = "20" } = request.query as Record<string, string>;
    const filter: Record<string, unknown> = {};

    if (storeId) filter.storeId = storeId;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      filter.createdAt = dateFilter;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("storeId", "name slug")
        .populate("customerId", "name email")
        .sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      OrderModel.countDocuments(filter)
    ]);

    response.json({
      data: { orders, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    response.status(500).json({ message: "Failed to fetch orders" });
  }
});

adminRouter.get("/orders/:id", async (request, response) => {
  try {
    const order = await OrderModel.findById(request.params.id)
      .populate("storeId", "name slug")
      .populate("customerId", "name email phone")
      .lean();
    if (!order) return response.status(404).json({ message: "Order not found" });
    response.json({ data: { order } });
  } catch (error) {
    console.error("Admin order detail error:", error);
    response.status(500).json({ message: "Failed to fetch order" });
  }
});

// ── Payment / Subscription Management ────────────────────────────
adminRouter.get("/payments", async (_request, response) => {
  try {
    const [subscriptions, totalOrderValue, pendingPayments, paidPayments] = await Promise.all([
      SubscriptionModel.find().sort({ createdAt: -1 }).populate("tenantId", "name slug").lean(),
      OrderModel.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      OrderModel.aggregate([{ $match: { paymentStatus: "pending" } }, { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }]),
      OrderModel.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }])
    ]);

    response.json({
      data: {
        subscriptions,
        totals: {
          allTimeRevenue: totalOrderValue[0]?.total ?? 0,
          pending: { total: pendingPayments[0]?.total ?? 0, count: pendingPayments[0]?.count ?? 0 },
          paid: { total: paidPayments[0]?.total ?? 0, count: paidPayments[0]?.count ?? 0 }
        }
      }
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    response.status(500).json({ message: "Failed to fetch payments" });
  }
});

// ── Platform Settings ──────────────────────────────────────────────
adminRouter.get("/settings", async (_request, response) => {
  try {
    let settings = await PlatformSettingsModel.findOne({ key: "global" });
    if (!settings) {
      settings = await PlatformSettingsModel.create({ key: "global" });
    }
    const obj = settings.toObject();
    const { smtpPass, ...safe } = obj as Record<string, unknown>;
    response.json({ data: { settings: safe } });
  } catch (error) {
    console.error("Admin settings error:", error);
    response.status(500).json({ message: "Failed to fetch settings" });
  }
});

adminRouter.put("/settings", async (request, response) => {
  try {
    const allowed = [
      "platformName", "platformLogo", "currencyCode", "currencySymbol",
      "currencyPosition", "platformFeePercent", "trialDays", "maintenanceMode",
      "enabledPaymentMethods", "smtpHost", "smtpPort", "smtpUser", "smtpPass",
      "smtpFromEmail", "smtpFromName"
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (request.body[key] !== undefined) update[key] = request.body[key];
    }
    const settings = await PlatformSettingsModel.findOneAndUpdate(
      { key: "global" }, { $set: update }, { new: true, upsert: true }
    ).lean();
    const { smtpPass, ...safe } = settings as Record<string, unknown>;
    response.json({ data: { settings: safe } });
  } catch (error) {
    console.error("Admin update settings error:", error);
    response.status(500).json({ message: "Failed to update settings" });
  }
});

// ── Overview (legacy - keep for backward compat) ──────────────────
adminRouter.get("/overview", async (_request, response) => {
  const [users, stores, products, templates] = await Promise.all([
    UserModel.countDocuments(),
    StoreModel.countDocuments(),
    ProductModel.countDocuments(),
    TemplateModel.countDocuments()
  ]);
  response.json({ data: { users, stores, products, templates } });
});
