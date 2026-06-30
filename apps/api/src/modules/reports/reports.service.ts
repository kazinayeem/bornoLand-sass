import { connectDatabase } from "../../common/database/connection.js";
import { OrderModel } from "../orders/order.model.js";
import { ProductModel } from "../products/product.model.js";
import { CouponModel } from "../coupons/coupon.model.js";
import { ReviewModel } from "../reviews/review.model.js";

export async function getSalesReport(storeId: string, from?: string, to?: string) {
  await connectDatabase();
  const match: Record<string, unknown> = { storeId };
  if (from || to) {
    const createdAt: Record<string, Date> = {};
    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);
    match.createdAt = createdAt;
  }

  const [summary, daily, topProducts] = await Promise.all([
    OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
          subtotal: { $sum: "$subtotal" },
          tax: { $sum: "$tax" },
          discount: { $sum: "$discount" },
          refunds: { $sum: "$refundAmount" },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]),
    OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    OrderModel.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    ok: true as const,
    data: {
      summary: summary[0] ?? { orders: 0, revenue: 0, subtotal: 0, tax: 0, discount: 0, refunds: 0, avgOrderValue: 0 },
      daily,
      topProducts,
    },
  };
}

export async function getInventoryReport(storeId: string) {
  await connectDatabase();
  const products = await ProductModel.find({ storeId }).select("name stock status sku").lean();
  const lowStock = products.filter((p: any) => (p.stock ?? 0) <= 5);
  const outOfStock = products.filter((p: any) => (p.stock ?? 0) === 0);
  return {
    ok: true as const,
    data: { totalProducts: products.length, lowStock, outOfStock, products },
  };
}

export async function getCouponReport(storeId: string) {
  await connectDatabase();
  const coupons = await CouponModel.find({ storeId }).lean();
  const used = await OrderModel.aggregate([
    { $match: { storeId, couponCode: { $ne: "" } } },
    { $group: { _id: "$couponCode", uses: { $sum: 1 }, totalDiscount: { $sum: "$discount" } } },
  ]);
  return { ok: true as const, data: { coupons, usage: used } };
}

export async function getCustomerReport(storeId: string) {
  await connectDatabase();
  const topCustomers = await OrderModel.aggregate([
    { $match: { storeId } },
    {
      $group: {
        _id: "$customerId",
        orders: { $sum: 1 },
        spent: { $sum: "$total" },
      },
    },
    { $sort: { spent: -1 } },
    { $limit: 10 },
  ]);
  return { ok: true as const, data: { topCustomers } };
}

export async function getTaxReport(storeId: string, from?: string, to?: string) {
  await connectDatabase();
  const match: Record<string, unknown> = { storeId };
  if (from || to) {
    const createdAt: Record<string, Date> = {};
    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);
    match.createdAt = createdAt;
  }
  const tax = await OrderModel.aggregate([
    { $match: match },
    { $group: { _id: null, totalTax: { $sum: "$tax" }, orders: { $sum: 1 } } },
  ]);
  return { ok: true as const, data: tax[0] ?? { totalTax: 0, orders: 0 } };
}

export async function getRefundReport(storeId: string) {
  await connectDatabase();
  const refunds = await OrderModel.find({
    storeId,
    status: { $in: ["refunded", "partial_refund"] },
  })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  const total = refunds.reduce((sum: number, o: any) => sum + (o.refundAmount ?? 0), 0);
  return { ok: true as const, data: { refunds, totalRefunded: total } };
}

export async function getReviewSummary(storeId: string) {
  await connectDatabase();
  const summary = await ReviewModel.aggregate([
    { $match: { storeId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  return { ok: true as const, data: { summary } };
}
