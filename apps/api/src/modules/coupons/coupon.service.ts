import { connectDatabase } from "../../common/database/connection.js";
import { CouponModel } from "./coupon.model.js";
import { OrderModel } from "../../models/order.model.js";
import { CustomerModel } from "../customers/customer.model.js";
import { createCouponSchema, updateCouponSchema, validateCouponCartSchema } from "./coupon.validator.js";
import { parseListQuery, paginatedResponse, buildTextSearchFilter } from "../../common/utils/pagination.js";
import mongoose from "mongoose";

type CouponLean = {
  _id: unknown;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
  value: number;
  buyQuantity: number;
  getQuantity: number;
  minimumOrderAmount: number;
  maximumDiscount: number;
  firstOrderOnly: boolean;
  customerIds?: unknown[];
  productIds?: unknown[];
  categoryIds?: unknown[];
  usageLimit: number;
  usagePerCustomer: number;
  usageCount: number;
  startsAt?: Date;
  expiresAt?: Date;
  autoApply: boolean;
  status: string;
};

export function isCouponActive(coupon: CouponLean) {
  if (coupon.status !== "active") return false;
  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return false;
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) return false;
  return true;
}

export async function validateCouponForCart(
  storeId: string,
  payload: unknown
) {
  const parsed = validateCouponCartSchema.safeParse({ storeId, ...((payload as object) || {}) });
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || "Invalid coupon validation payload" };
  }

  const { code, subtotal, shipping, customerId, customerEmail, items } = parsed.data;

  await connectDatabase();
  const coupon = (await CouponModel.findOne({ storeId, code: code.trim().toUpperCase() }).lean()) as CouponLean | null;

  if (!coupon) {
    return { ok: false as const, message: `Coupon code "${code.toUpperCase()}" does not exist` };
  }

  if (coupon.status !== "active") {
    return { ok: false as const, message: "This coupon is currently inactive or draft" };
  }

  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { ok: false as const, message: "This coupon promotion has not started yet" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { ok: false as const, message: "This coupon code has expired" };
  }

  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false as const, message: "This coupon code has reached its total usage limit" };
  }

  // First order check
  if (coupon.firstOrderOnly) {
    let orderCount = 0;
    if (customerId) {
      orderCount = await OrderModel.countDocuments({ storeId, customerId });
    } else if (customerEmail) {
      orderCount = await OrderModel.countDocuments({ storeId, "shippingAddress.email": customerEmail });
    }
    if (orderCount > 0) {
      return { ok: false as const, message: "This coupon is valid for first-time orders only" };
    }
  }

  // Customer targeting check
  if (coupon.customerIds && coupon.customerIds.length > 0) {
    const allowedCustomerIds = coupon.customerIds.map(String);
    let matched = false;

    if (customerId && allowedCustomerIds.includes(String(customerId))) {
      matched = true;
    } else if (customerEmail) {
      const customerDoc = await CustomerModel.findOne({ storeId, email: customerEmail.toLowerCase() }).lean();
      if (customerDoc && allowedCustomerIds.includes(String(customerDoc._id))) {
        matched = true;
      }
    }

    if (!matched) {
      return { ok: false as const, message: "This coupon is restricted to specific eligible customers" };
    }
  }

  // Per customer usage limit check
  if (coupon.usagePerCustomer > 0) {
    let userUses = 0;
    if (customerId) {
      userUses = await OrderModel.countDocuments({ storeId, customerId, couponCode: coupon.code });
    } else if (customerEmail) {
      userUses = await OrderModel.countDocuments({ storeId, "shippingAddress.email": customerEmail, couponCode: coupon.code });
    }
    if (userUses >= coupon.usagePerCustomer) {
      return { ok: false as const, message: `You have reached the maximum allowed usage limit (${coupon.usagePerCustomer}) for this coupon` };
    }
  }

  // Product / Category targeting checks
  const itemProductIds = items.map((i) => String(i.productId));
  const itemCategoryIds = items.map((i) => i.categoryId ? String(i.categoryId) : "").filter(Boolean);

  if (coupon.productIds && coupon.productIds.length > 0) {
    const allowedProductIds = new Set(coupon.productIds.map(String));
    const hasEligibleProduct = itemProductIds.some((id) => allowedProductIds.has(id));
    if (!hasEligibleProduct) {
      return { ok: false as const, message: "This coupon is only valid for specific products in your store" };
    }
  }

  if (coupon.categoryIds && coupon.categoryIds.length > 0) {
    const allowedCategoryIds = new Set(coupon.categoryIds.map(String));
    const hasEligibleCategory = itemCategoryIds.some((id) => allowedCategoryIds.has(id));
    if (!hasEligibleCategory) {
      return { ok: false as const, message: "This coupon is only valid for specific categories in your store" };
    }
  }

  // Minimum order subtotal check
  if (subtotal < coupon.minimumOrderAmount) {
    return { ok: false as const, message: `Minimum order amount for this coupon is ${coupon.minimumOrderAmount}` };
  }

  // Calculate discount & shipping discount
  let discount = 0;
  let shippingDiscount = 0;

  if (coupon.type === "free_shipping") {
    shippingDiscount = shipping;
  } else if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;
  } else if (coupon.type === "fixed") {
    discount = coupon.value;
  } else if (coupon.type === "buy_x_get_y") {
    const buyQty = coupon.buyQuantity || 1;
    const getQty = coupon.getQuantity || 1;
    const eligibleItem = items.find((i) => i.quantity >= buyQty);
    if (eligibleItem) {
      discount = eligibleItem.price * getQty;
    } else {
      return { ok: false as const, message: `Buy ${buyQty} items to qualify for this promotion` };
    }
  }

  // Apply maximum discount cap
  if (coupon.maximumDiscount > 0) {
    discount = Math.min(discount, coupon.maximumDiscount);
  }

  // Subtotal cap
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;
  shippingDiscount = Math.round(shippingDiscount * 100) / 100;

  const finalSubtotal = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const finalShipping = Math.max(0, Math.round((shipping - shippingDiscount) * 100) / 100);
  const finalTotal = Math.max(0, Math.round((finalSubtotal + finalShipping) * 100) / 100);

  return {
    ok: true as const,
    data: {
      valid: true,
      coupon: {
        id: String(coupon._id),
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount,
      },
      discount,
      shippingDiscount,
      finalSubtotal,
      finalTotal,
    },
  };
}

export async function listCoupons(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const clauses: Record<string, unknown>[] = [{ storeId }];
  const textFilter = buildTextSearchFilter(params.search, ["code", "name", "description"]);
  if (textFilter?.$or) clauses.push({ $or: textFilter.$or });
  if (params.status && params.status !== "all") clauses.push({ status: params.status });
  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };

  const [coupons, total, activeCount, totalUsageAgg] = await Promise.all([
    CouponModel.find(filter)
      .populate("productIds", "name slug price imageUrl")
      .populate("categoryIds", "name slug")
      .populate("customerIds", "firstName lastName name email phone")
      .sort(params.sort ?? { createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean(),
    CouponModel.countDocuments(filter),
    CouponModel.countDocuments({ storeId, status: "active" }),
    CouponModel.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      { $group: { _id: null, totalUses: { $sum: "$usageCount" } } },
    ]),
  ]);

  const totalUsage = totalUsageAgg[0]?.totalUses ?? 0;
  const paginated = paginatedResponse(coupons, total, params);

  return {
    ok: true as const,
    data: {
      coupons: paginated.data,
      pagination: paginated.pagination,
      total,
      activeCount,
      totalUsage,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
}

export async function getCoupon(storeId: string, couponId: string) {
  await connectDatabase();
  const coupon = await CouponModel.findOne({ _id: couponId, storeId })
    .populate("productIds", "name slug price imageUrl")
    .populate("categoryIds", "name slug")
    .populate("customerIds", "firstName lastName name email phone")
    .lean();

  if (!coupon) return { ok: false as const, message: "Coupon not found" };
  return { ok: true as const, data: { coupon } };
}

export async function createCoupon(storeId: string, payload: unknown) {
  const parsed = createCouponSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || "Invalid coupon data" };
  }

  await connectDatabase();
  const codeFormatted = parsed.data.code.trim().toUpperCase();
  const existing = await CouponModel.findOne({ storeId, code: codeFormatted });
  if (existing) return { ok: false as const, message: `Coupon code "${codeFormatted}" already exists` };

  const coupon = await CouponModel.create({
    storeId,
    ...parsed.data,
    code: codeFormatted,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
  });

  return { ok: true as const, data: { coupon: coupon.toObject() } };
}

export async function updateCoupon(storeId: string, couponId: string, payload: unknown) {
  const parsed = updateCouponSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || "Invalid coupon data" };
  }

  await connectDatabase();
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.code) update.code = parsed.data.code.trim().toUpperCase();
  if (parsed.data.startsAt !== undefined) {
    update.startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : null;
  }
  if (parsed.data.expiresAt !== undefined) {
    update.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  }

  const coupon = await CouponModel.findOneAndUpdate({ _id: couponId, storeId }, { $set: update }, { new: true }).lean();
  if (!coupon) return { ok: false as const, message: "Coupon not found" };
  return { ok: true as const, data: { coupon } };
}

export async function deleteCoupon(storeId: string, couponId: string) {
  await connectDatabase();
  const coupon = await CouponModel.findOneAndDelete({ _id: couponId, storeId }).lean();
  if (!coupon) return { ok: false as const, message: "Coupon not found" };
  return { ok: true as const, message: "Coupon deleted" };
}

export async function incrementCouponUsage(couponId: string) {
  await connectDatabase();
  await CouponModel.updateOne({ _id: couponId }, { $inc: { usageCount: 1 } });
}
