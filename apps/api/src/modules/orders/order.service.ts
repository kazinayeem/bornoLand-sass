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
import { autoSaveCustomerAddressFromOrder } from "../customers/customer-address.service.js";
import { createCustomerNotification } from "../customers/customer-notification.service.js";

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
  item: { productId: unknown; variantId?: unknown; quantity: number },
  orderMeta?: { orderId?: string; orderNumber?: string }
) {
  const product = await ProductModel.findById(item.productId);
  if (!product || product.trackInventory === false) return;

  let previousStock = 0;
  let newStock = 0;
  let usedVariant = false;

  if (item.variantId) {
    const { VariantInventoryModel } = await import("../products/variants/variant-inventory.model.js");
    const inv = await VariantInventoryModel.findOne({
      variantId: item.variantId,
      storeId,
      productId: item.productId,
    });
    if (inv) {
      previousStock = inv.quantity;
      const decremented = await decrementVariantStock(
        storeId,
        String(item.productId),
        String(item.variantId),
        item.quantity
      );
      if (decremented) {
        newStock = Math.max(0, previousStock - item.quantity);
        usedVariant = true;
      }
    }
  }

  if (!usedVariant) {
    previousStock = product.stock ?? 0;
    product.stock = Math.max(0, previousStock - item.quantity);
    newStock = product.stock;
    await product.save();
  }

  try {
    const { StockLogModel } = await import("../inventory/stock-log.model.js");
    const mongoose = (await import("mongoose")).default;
    await StockLogModel.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      productId: product._id,
      variantId: item.variantId ? new mongoose.Types.ObjectId(String(item.variantId)) : null,
      previousStock,
      newStock,
      beforeQuantity: previousStock,
      afterQuantity: newStock,
      quantityChange: -item.quantity,
      reason: "order_placed",
      note: orderMeta?.orderNumber ? `Order ${orderMeta.orderNumber}` : "Order placed",
      updatedBy: "system",
      source: "order",
      reference: orderMeta?.orderNumber ?? "",
      referenceId: orderMeta?.orderId ? new mongoose.Types.ObjectId(orderMeta.orderId) : null,
    });
  } catch (err) {
    console.error("[orders] Failed to write stock log", err);
  }

  try {
    const { appendProductTimeline } = await import("../inventory/inventory-erp.service.js");
    await appendProductTimeline(storeId, {
      productId: String(item.productId),
      variantId: item.variantId ? String(item.variantId) : undefined,
      eventType: "order_sold",
      title: `Sold ${item.quantity}`,
      detail: orderMeta?.orderNumber ? `Order ${orderMeta.orderNumber}` : "Order placed",
      reference: orderMeta?.orderNumber ?? "order",
      referenceId: orderMeta?.orderId,
      actorName: "system",
      metadata: { quantity: item.quantity },
    });
  } catch (err) {
    console.error("[orders] Failed to append product timeline", err);
  }
}

export async function createOrder(
  storeId: string,
  customerId: string,
  sessionId: string,
  payload: {
    shippingAddress: {
      fullName: string;
      phone: string;
      email?: string;
      label?: string;
      area?: string;
      street: string;
      apartment?: string;
      city: string;
      state?: string;
      zip?: string;
      country?: string;
      landmark?: string;
      orderNotes?: string;
    };
    paymentMethod?: string;
    deliveryZoneId?: string;
    notes?: string;
    cartId?: string;
    items?: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price?: number;
      name?: string;
    }>;
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

  // Prefer customer cart; if empty/missing, claim guest session cart.
  let cart = await CartModel.findOne({ storeId, customerId });
  const sessionCart =
    sessionId && (!cart || cart.items.length === 0)
      ? await CartModel.findOne({ storeId, sessionId })
      : null;

  console.info("[orders] createOrder cart query", {
    storeId,
    customerId,
    sessionId: sessionId || null,
    payloadCartId: payload.cartId ?? null,
    customerCartId: cart?._id ? String(cart._id) : null,
    customerItemCount: cart?.items?.length ?? 0,
    sessionCartId: sessionCart?._id ? String(sessionCart._id) : null,
    sessionItemCount: sessionCart?.items?.length ?? 0,
    frontendItemCount: payload.items?.length ?? 0,
  });

  if ((!cart || cart.items.length === 0) && sessionCart && sessionCart.items.length > 0) {
    if (!cart) {
      sessionCart.customerId = customerId as never;
      await sessionCart.save();
      cart = sessionCart;
    } else {
      cart.items = sessionCart.items;
      cart.couponCode = sessionCart.couponCode || cart.couponCode;
      cart.discount = sessionCart.discount || cart.discount;
      await cart.save();
      if (String(sessionCart._id) !== String(cart._id)) {
        await CartModel.deleteOne({ _id: sessionCart._id });
      }
    }
  }

  // Frontend still has items but Mongo cart is empty — sync from payload lines.
  if ((!cart || cart.items.length === 0) && payload.items && payload.items.length > 0) {
    const { syncCartItems } = await import("../cart/cart.service.js");
    const synced = await syncCartItems(
      storeId,
      payload.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      customerId,
      sessionId,
    );
    if (!synced.ok) {
      return { ok: false as const, message: synced.message ?? "Cart is empty" };
    }
    cart = await CartModel.findOne({ storeId, customerId });
    if (!cart) cart = await CartModel.findOne({ storeId, sessionId });
  }

  if (!cart || cart.items.length === 0) {
    console.warn("[orders] createOrder rejected — empty cart", {
      storeId,
      customerId,
      sessionId,
      frontendItemCount: payload.items?.length ?? 0,
    });
    return { ok: false as const, message: "Cart is empty" };
  }

  if (!cart.customerId) {
    cart.customerId = customerId as never;
    await cart.save();
  }

  // Optional integrity check: frontend lines should match backend cart.
  if (payload.items && payload.items.length > 0) {
    const backendKeys = new Set(
      cart.items.map(
        (item: { productId: unknown; variantId?: unknown }) =>
          `${String(item.productId)}::${String(item.variantId ?? "")}`,
      ),
    );
    const frontendKeys = new Set(
      payload.items.map((item) => `${item.productId}::${item.variantId ?? ""}`),
    );
    const missingOnBackend = [...frontendKeys].filter((key) => !backendKeys.has(key));
    if (missingOnBackend.length > 0) {
      const { syncCartItems } = await import("../cart/cart.service.js");
      await syncCartItems(
        storeId,
        payload.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        customerId,
        sessionId,
      );
      cart = await CartModel.findOne({ storeId, customerId });
      if (!cart || cart.items.length === 0) {
        return { ok: false as const, message: "Cart is empty" };
      }
    }
  }

  const subtotal = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const discount = cart.discount ?? 0;

  let deliveryCharge = 0;
  let deliveryZoneName = "";
  let deliveryZoneEta = "";
  if (payload.deliveryZoneId) {
    const zone = (await DeliveryZoneModel.findOne({
      _id: payload.deliveryZoneId,
      storeId,
      enabled: true,
    }).lean()) as { charge: number; name: string; estimatedDays?: string } | null;
    if (zone) {
      deliveryCharge = zone.charge;
      deliveryZoneName = zone.name;
      deliveryZoneEta = zone.estimatedDays ?? "";
    }
  }

  const storeSettings = (await StoreSettingsModel.findOne({ storeId }).lean()) as {
    currencyCode?: string;
    taxEnabled?: boolean;
    taxRate?: number;
    taxIncluded?: boolean;
    orderPrefix?: string;
    invoicePrefix?: string;
    freeShippingEnabled?: boolean;
    freeShippingMin?: number;
    shippingEnabled?: boolean;
  } | null;

  if (storeSettings?.shippingEnabled === false) {
    deliveryCharge = 0;
  } else if (
    storeSettings?.freeShippingEnabled
    && (storeSettings.freeShippingMin ?? 0) > 0
    && subtotal - discount >= (storeSettings.freeShippingMin ?? 0)
  ) {
    deliveryCharge = 0;
  }

  const currencyCode = storeSettings?.currencyCode ?? "USD";
  const taxableAmount = Math.max(0, subtotal - discount);
  const { tax, taxRate } = calculateTax(taxableAmount, storeSettings ?? {});
  const total = Math.max(0, taxableAmount + deliveryCharge + tax);

  const normalizedShippingAddress = {
    fullName: payload.shippingAddress.fullName,
    phone: payload.shippingAddress.phone,
    email: payload.shippingAddress.email ?? "",
    label: payload.shippingAddress.label ?? "Home",
    area: payload.shippingAddress.area ?? "",
    street: payload.shippingAddress.street,
    apartment: payload.shippingAddress.apartment ?? "",
    city: payload.shippingAddress.city,
    state: payload.shippingAddress.state ?? "",
    zip: payload.shippingAddress.zip ?? "",
    country: payload.shippingAddress.country ?? "Bangladesh",
    landmark: payload.shippingAddress.landmark ?? "",
    orderNotes: payload.shippingAddress.orderNotes ?? payload.notes ?? "",
  };

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
    shippingAddress: normalizedShippingAddress,
    paymentMethod: payload.paymentMethod ?? "cod",
    notes: payload.notes ?? "",
    currencyCode,
    timeline: [
      { status: "pending", note: "Order placed", createdBy: "system", updatedBy: "system" },
      {
        status: (payload.paymentMethod ?? "cod") === "cod" ? "payment_pending" : "payment_pending",
        note: (payload.paymentMethod ?? "cod") === "cod" ? "Cash on delivery — pay when received" : "Awaiting payment confirmation",
        createdBy: "system",
        updatedBy: "system",
      },
    ],
    estimatedDelivery: deliveryZoneEta,
    courier: "",
    trackingNumber: "",
    orderNotes: payload.notes
      ? [{ body: payload.notes, type: "customer", createdBy: "customer" }]
      : [],
  });

  for (const item of cart.items) {
    await decrementProductStock(storeId, item, {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
    });
  }

  if ((cart as { couponId?: unknown }).couponId) {
    await incrementCouponUsage(String((cart as { couponId?: unknown }).couponId));
  }

  await CartModel.deleteOne({ _id: cart._id });

  try {
    const { syncCustomerOrderStats } = await import("../customers/customer.service.js");
    await syncCustomerOrderStats(storeId, customerId);
  } catch (err) {
    console.error("[orders] Failed to sync customer stats", err);
  }

  try {
    await autoSaveCustomerAddressFromOrder(storeId, customerId, normalizedShippingAddress);
  } catch (err) {
    console.error("[orders] Failed to auto-save customer address", err);
  }

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

  try {
    await createCustomerNotification({
      customerId,
      storeId,
      type: "order",
      icon: "package",
      priority: "medium",
      title: `Order placed: ${orderNumber}`,
      message: `Your order has been placed successfully. Total ${currencyCode} ${total.toFixed(2)}.`,
      link: `/orders/${String(order._id)}`,
      metadata: {
        orderId: String(order._id),
        orderNumber,
        status: "pending",
        paymentStatus: order.paymentStatus,
        total,
        currencyCode,
      },
    });
  } catch (error) {
    console.error("[customer-notifications] Failed to create order placed notification", error);
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
    .select("orderNumber status paymentStatus total currencyCode items shippingAddress deliveryCharge deliveryZone discount tax subtotal paymentMethod notes courier trackingNumber estimatedDelivery timeline createdAt updatedAt")
    .lean();

  if (!order) {
    // Try case-insensitive match
    const orderLoose = await OrderModel.findOne({
      storeId,
      customerId: customer._id,
      orderNumber: new RegExp(`^${orderNumber.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    })
      .select("orderNumber status paymentStatus total currencyCode items shippingAddress deliveryCharge deliveryZone discount tax subtotal paymentMethod notes courier trackingNumber estimatedDelivery timeline createdAt updatedAt")
      .lean();
    if (!orderLoose) return { ok: false as const, message: "Order not found" };
    return { ok: true as const, data: { order: orderLoose } };
  }

  return { ok: true as const, data: { order } };
}
