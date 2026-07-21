import { connectDatabase } from "../../common/database/connection.js";
import { OrderModel } from "../../models/order.model.js";
import { CartModel } from "../../models/cart.model.js";
import { ProductModel } from "../../models/product.model.js";
import { DeliveryZoneModel } from "../../models/delivery-zone.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { StoreModel } from "../../models/store.model.js";
import { checkLimit } from "../features/feature-access.service.js";
import { incrementCouponUsage } from "../coupons/coupon.service.js";
import { createBillingNotification } from "../notifications/billing-notification.service.js";

function generateOrderNumber(prefix = "ORD"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

function calculateTax(subtotal: number, settings: { taxEnabled?: boolean; taxRate?: number; taxIncluded?: boolean }) {
  if (!settings.taxEnabled || !settings.taxRate) return { tax: 0, taxRate: 0 };
  if (settings.taxIncluded) return { tax: 0, taxRate: settings.taxRate };
  const tax = Math.round(((subtotal * settings.taxRate) / 100) * 100) / 100;
  return { tax, taxRate: settings.taxRate };
}

import { decrementVariantStock } from "../products/variants/variant.service.js";

async function decrementProductStock(
  storeId: string,
  item: { productId: unknown; variantId?: unknown; quantity: number }
) {
  const product = await ProductModel.findById(item.productId);
  if (!product || product.trackInventory === false) return;

  if (item.variantId) {
    const decremented = await decrementVariantStock(
      storeId,
      String(item.productId),
      String(item.variantId),
      item.quantity
    );
    if (decremented) return;
  }

  product.stock = Math.max(0, (product.stock ?? 0) - item.quantity);
  await product.save();
}

export async function createOrder(
  storeId: string,
  customerId: string,
  sessionId: string,
  payload: {
    shippingAddress: {
      fullName: string;
      phone: string;
      street: string;
      city: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    paymentMethod?: string;
    deliveryZoneId?: string;
    notes?: string;
  }
) {
  await connectDatabase();

  const store = (await StoreModel.findById(storeId).lean()) as { planId?: string; allowNewOrders?: boolean; userId?: unknown; slug?: string } | null;
  if (store && store.allowNewOrders === false) {
    return { ok: false as const, message: "This store is not accepting new orders. Please upgrade your subscription." };
  }

  const limitCheck = await checkLimit(storeId, "orders");
  if (!limitCheck.allowed) {
    return { ok: false as const, message: limitCheck.message ?? "Order limit reached" };
  }

  let cart = await CartModel.findOne({ storeId, customerId });
  if (!cart) {
    cart = await CartModel.findOne({ storeId, sessionId });
  }
  if (!cart || cart.items.length === 0) {
    return { ok: false as const, message: "Cart is empty" };
  }

  if (!cart.customerId) {
    cart.customerId = customerId as never;
    await cart.save();
  }

  const subtotal = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const discount = cart.discount ?? 0;

  let deliveryCharge = 0;
  let deliveryZoneName = "";
  if (payload.deliveryZoneId) {
    const zone = (await DeliveryZoneModel.findOne({
      _id: payload.deliveryZoneId,
      storeId,
      enabled: true,
    }).lean()) as { charge: number; name: string } | null;
    if (zone) {
      deliveryCharge = zone.charge;
      deliveryZoneName = zone.name;
    }
  }

  const storeSettings = (await StoreSettingsModel.findOne({ storeId }).lean()) as {
    currencyCode?: string;
    taxEnabled?: boolean;
    taxRate?: number;
    taxIncluded?: boolean;
    orderPrefix?: string;
    invoicePrefix?: string;
  } | null;
  const currencyCode = storeSettings?.currencyCode ?? "USD";
  const taxableAmount = Math.max(0, subtotal - discount);
  const { tax, taxRate } = calculateTax(taxableAmount, storeSettings ?? {});
  const total = Math.max(0, taxableAmount + deliveryCharge + tax);

  const orderNumber = generateOrderNumber(storeSettings?.orderPrefix ?? "ORD");
  const invoiceNumber = generateOrderNumber(storeSettings?.invoicePrefix ?? "INV");

  const order = await OrderModel.create({
    storeId,
    customerId,
    items: cart.items.map((item: {
      productId: unknown;
      variantId?: unknown;
      variantTitle?: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }) => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      variantTitle: item.variantTitle ?? "",
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image ?? "",
    })),
    subtotal,
    discount,
    couponCode: cart.couponCode ?? "",
    couponId: (cart as { couponId?: unknown }).couponId,
    tax,
    taxRate,
    deliveryCharge,
    deliveryZone: deliveryZoneName,
    shipping: deliveryCharge,
    total,
    orderNumber,
    invoiceNumber,
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod ?? "cod",
    notes: payload.notes ?? "",
    currencyCode,
    timeline: [{ status: "pending", note: "Order placed", createdBy: "system" }],
    orderNotes: payload.notes
      ? [{ body: payload.notes, type: "customer", createdBy: "customer" }]
      : [],
  });

  for (const item of cart.items) {
    await decrementProductStock(storeId, item);
  }

  if ((cart as { couponId?: unknown }).couponId) {
    await incrementCouponUsage(String((cart as { couponId?: unknown }).couponId));
  }

  await CartModel.deleteOne({ _id: cart._id });

  if (store?.userId) {
    try {
      await createBillingNotification({
        userId: String(store.userId),
        storeId,
        type: "new_order",
        title: `New order ${orderNumber}`,
        message: `${payload.shippingAddress.fullName} placed an order for ${currencyCode} ${total.toFixed(2)}.`,
        actionUrl: store.slug ? `/store/${store.slug}/orders` : "/dashboard/orders",
        metadata: { orderId: String(order._id), orderNumber, total, currencyCode },
      });
    } catch (error) {
      console.error("[notifications] Failed to create order notification", error);
    }
  }

  return { ok: true as const, data: { order: order.toObject() } };
}

export async function getCustomerOrders(storeId: string, customerId: string) {
  await connectDatabase();
  const orders = await OrderModel.find({ storeId, customerId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { orders } };
}

export async function getOrderById(orderId: string, customerId: string) {
  await connectDatabase();
  const order = await OrderModel.findOne({ _id: orderId, customerId }).lean();
  if (!order) return { ok: false as const, message: "Order not found" };
  return { ok: true as const, data: { order } };
}

export async function trackOrderByNumber(
  storeId: string,
  orderNumber: string,
  email: string,
) {
  await connectDatabase();
  const { CustomerModel } = await import("../../models/customer.model.js");
  const customer = await CustomerModel.findOne({
    storeId,
    email: email.toLowerCase().trim(),
  }).lean() as { _id: unknown } | null;
  if (!customer) return { ok: false as const, message: "Order not found" };

  const order = await OrderModel.findOne({
    storeId,
    customerId: customer._id,
    orderNumber: orderNumber.trim().toUpperCase(),
  })
    .select("orderNumber status paymentStatus total currencyCode items shippingAddress timeline createdAt updatedAt")
    .lean();

  if (!order) {
    // Try case-insensitive match
    const orderLoose = await OrderModel.findOne({
      storeId,
      customerId: customer._id,
      orderNumber: new RegExp(`^${orderNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    })
      .select("orderNumber status paymentStatus total currencyCode items shippingAddress timeline createdAt updatedAt")
      .lean();
    if (!orderLoose) return { ok: false as const, message: "Order not found" };
    return { ok: true as const, data: { order: orderLoose } };
  }

  return { ok: true as const, data: { order } };
}
