import { connectDatabase } from "../../common/database/connection.js";
import { CouponModel } from "./coupon.model.js";
import { OrderModel } from "../orders/order.model.js";
import { createCouponSchema, updateCouponSchema } from "./coupon.validator.js";

type CouponLean = {
  _id: unknown;
  code: string;
  type: string;
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

function isCouponActive(coupon: CouponLean) {
  if (coupon.status !== "active") return false;
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return false;
  if (coupon.expiresAt && coupon.expiresAt < now) return false;
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) return false;
  return true;
}

export function calculateCouponDiscount(
  coupon: CouponLean,
  subtotal: number,
  shipping: number,
  itemProductIds: string[] = []
) {
  if (coupon.productIds?.length) {
    const allowed = new Set(coupon.productIds.map(String));
    if (!itemProductIds.some((id) => allowed.has(id))) {
      return { discount: 0, freeShipping: false, message: "Coupon not valid for cart items" };
    }
  }

  if (subtotal < coupon.minimumOrderAmount) {
    return { discount: 0, freeShipping: false, message: `Minimum order amount is ${coupon.minimumOrderAmount}` };
  }

  if (coupon.type === "free_shipping") {
    return { discount: 0, freeShipping: true, message: "Free shipping applied" };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;
  } else if (coupon.type === "fixed") {
    discount = coupon.value;
  } else if (coupon.type === "buy_x_get_y") {
    discount = 0;
  }

  if (coupon.maximumDiscount > 0) {
    discount = Math.min(discount, coupon.maximumDiscount);
  }
  discount = Math.min(discount, subtotal);

  return { discount: Math.round(discount * 100) / 100, freeShipping: false };
}

export async function validateCouponForCart(
  storeId: string,
  code: string,
  subtotal: number,
  shipping: number,
  customerId?: string,
  itemProductIds: string[] = []
) {
  await connectDatabase();
  const coupon = (await CouponModel.findOne({ storeId, code: code.toUpperCase() }).lean()) as CouponLean | null;
  if (!coupon) return { ok: false as const, message: "Invalid coupon code" };
  if (!isCouponActive(coupon)) return { ok: false as const, message: "Coupon is not active or has expired" };

  if (coupon.firstOrderOnly && customerId) {
    const prior = await OrderModel.countDocuments({ storeId, customerId });
    if (prior > 0) return { ok: false as const, message: "Coupon valid for first order only" };
  }

  if (coupon.customerIds?.length && customerId) {
    const allowed = coupon.customerIds.map(String);
    if (!allowed.includes(String(customerId))) {
      return { ok: false as const, message: "Coupon not valid for this customer" };
    }
  }

  if (coupon.usagePerCustomer > 0 && customerId) {
    const used = await OrderModel.countDocuments({ storeId, customerId, couponCode: coupon.code });
    if (used >= coupon.usagePerCustomer) {
      return { ok: false as const, message: "Coupon usage limit reached for this customer" };
    }
  }

  const result = calculateCouponDiscount(coupon, subtotal, shipping, itemProductIds);
  if (result.message?.includes("not valid")) {
    return { ok: false as const, message: result.message };
  }

  return {
    ok: true as const,
    data: {
      coupon,
      discount: result.discount,
      freeShipping: result.freeShipping,
    },
  };
}

export async function listCoupons(storeId: string) {
  await connectDatabase();
  const coupons = await CouponModel.find({ storeId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { coupons } };
}

export async function getCoupon(storeId: string, couponId: string) {
  await connectDatabase();
  const coupon = await CouponModel.findOne({ _id: couponId, storeId }).lean();
  if (!coupon) return { ok: false as const, message: "Coupon not found" };
  return { ok: true as const, data: { coupon } };
}

export async function createCoupon(storeId: string, payload: unknown) {
  const parsed = createCouponSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid coupon data" };

  await connectDatabase();
  const existing = await CouponModel.findOne({ storeId, code: parsed.data.code.toUpperCase() });
  if (existing) return { ok: false as const, message: "Coupon code already exists" };

  const coupon = await CouponModel.create({
    storeId,
    ...parsed.data,
    code: parsed.data.code.toUpperCase(),
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
  });
  return { ok: true as const, data: { coupon: coupon.toObject() } };
}

export async function updateCoupon(storeId: string, couponId: string, payload: unknown) {
  const parsed = updateCouponSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid coupon data" };

  await connectDatabase();
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.code) update.code = parsed.data.code.toUpperCase();
  if (parsed.data.startsAt) update.startsAt = new Date(parsed.data.startsAt);
  if (parsed.data.expiresAt) update.expiresAt = new Date(parsed.data.expiresAt);

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
