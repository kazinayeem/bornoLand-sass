import { connectDatabase } from "../../common/database/connection.js";
import { OrderModel } from "../../models/order.model.js";
import { CustomerModel } from "../customers/customer.model.js";
import { ProductModel } from "../products/product.model.js";
import { StoreModel } from "../stores/store.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { DeliveryZoneModel } from "../delivery/delivery-zone.model.js";
import { CartModel } from "../cart/cart.model.js";
import { incrementCouponUsage } from "../coupons/coupon.service.js";
import { calculateTax } from "../../common/utils/tax.js";
import { checkLimit } from "../features/feature-access.service.js";
import { createBillingNotification } from "../notifications/billing-notification.service.js";

import { NotificationModel } from "../notifications/notification.model.js";

function generateOrderNumber(prefix = "ORD"): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
}

type StockTarget = {
  productId: unknown;
  variantId?: unknown;
  quantity: number;
};

async function decrementProductStock(
  storeId: string,
  item: StockTarget,
  meta?: { orderId?: string; orderNumber?: string },
) {
  try {
    const pid = String(item.productId);
    const product = await ProductModel.findOne({ _id: pid, storeId });
    if (!product) return;

    if (item.variantId && product.variants?.length) {
      const vid = String(item.variantId);
      const vIndex = product.variants.findIndex((v: { _id?: unknown }) => String(v._id) === vid);
      if (vIndex > -1) {
        const variant = product.variants[vIndex];
        variant.stock = Math.max(0, variant.stock - item.quantity);
        product.stock = product.variants.reduce((sum: number, v: { stock: number }) => sum + (v.stock || 0), 0);
        product.markModified("variants");
        await product.save();
        return;
      }
    }

    product.stock = Math.max(0, product.stock - item.quantity);
    await product.save();
  } catch (err) {
    console.error("[orders] Failed to decrement product stock", err);
  }
}


export async function createOrder(
  storeId: string,
  customerIdInput: string | null | undefined,
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
    verificationToken?: string;
    senderNumber?: string;
    transactionId?: string;
    paymentDetails?: {
      senderNumber?: string;
      receiverNumber?: string;
      transactionId?: string;
    };
    items?: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price?: number;
      name?: string;
    }>;
  },
) {
  await connectDatabase();

  const store = (await StoreModel.findById(storeId).lean()) as {
    planId?: string;
    allowNewOrders?: boolean;
    userId?: unknown;
    slug?: string;
  } | null;

  if (store && store.allowNewOrders === false) {
    return { ok: false as const, message: "This store is not accepting new orders. Please upgrade your subscription." };
  }

  const limitCheck = await checkLimit(storeId, "orders");
  if (!limitCheck.allowed) {
    return { ok: false as const, message: limitCheck.message ?? "Order limit reached" };
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
    guestCheckoutEnabled?: boolean;
    requireLoginEnabled?: boolean;
    minimumOrderAmount?: number;
    paymentSettings?: {
      codEnabled?: boolean;
      bkash?: { enabled?: boolean; number?: string; type?: string; instructions?: string };
      nagad?: { enabled?: boolean; number?: string; type?: string; instructions?: string };
    };
    deliveryZones?: Array<{ id: string; name: string; charge: number; estimatedDays?: string; enabled?: boolean }>;
  } | null;

  let customerId = customerIdInput;

  // Guest vs Login Rules Check
  if (storeSettings?.requireLoginEnabled && !customerId) {
    return { ok: false as const, message: "Login is required to place an order in this store." };
  }

  if (!customerId && storeSettings?.guestCheckoutEnabled === false) {
    return { ok: false as const, message: "Guest checkout is disabled. Please login to place your order." };
  }

  // Provision Guest Customer entity if guest order
  if (!customerId) {
    const email = (payload.shippingAddress.email || "").toLowerCase().trim();
    const phone = payload.shippingAddress.phone.trim();
    let guestDoc = await CustomerModel.findOne({
      storeId,
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (!guestDoc) {
      guestDoc = await CustomerModel.create({
        storeId,
        name: payload.shippingAddress.fullName,
        email: email || `guest_${Date.now()}@store.com`,
        phone,
        isGuest: true,
        status: "active",
      });
    }
    customerId = String(guestDoc._id);
  }

  // Prefer customer cart; fallback to session cart or payload items
  let cart = await CartModel.findOne({ storeId, customerId });
  const sessionCart =
    sessionId && (!cart || cart.items.length === 0)
      ? await CartModel.findOne({ storeId, sessionId })
      : null;

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

  // Minimum Order Check
  if (storeSettings?.minimumOrderAmount && storeSettings.minimumOrderAmount > 0) {
    if (subtotal < storeSettings.minimumOrderAmount) {
      return {
        ok: false as const,
        message: `Minimum order amount for this store is ${storeSettings.minimumOrderAmount} BDT`,
      };
    }
  }

  let deliveryCharge = 0;
  let deliveryZoneName = "";
  let deliveryZoneEta = "";

  if (payload.deliveryZoneId) {
    // Check DB delivery zones
    const zone = (await DeliveryZoneModel.findOne({
      _id: payload.deliveryZoneId,
      storeId,
      enabled: true,
    }).lean()) as { charge: number; name: string; estimatedDays?: string } | null;

    if (zone) {
      deliveryCharge = zone.charge;
      deliveryZoneName = zone.name;
      deliveryZoneEta = zone.estimatedDays ?? "";
    } else if (storeSettings?.deliveryZones) {
      const configuredZone = storeSettings.deliveryZones.find((z) => z.id === payload.deliveryZoneId && z.enabled !== false);
      if (configuredZone) {
        deliveryCharge = configuredZone.charge;
        deliveryZoneName = configuredZone.name;
        deliveryZoneEta = configuredZone.estimatedDays ?? "";
      }
    }
  }

  if (storeSettings?.shippingEnabled === false) {
    deliveryCharge = 0;
  } else if (
    storeSettings?.freeShippingEnabled &&
    (storeSettings.freeShippingMin ?? 0) > 0 &&
    subtotal - discount >= (storeSettings.freeShippingMin ?? 0)
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

  const paymentMethod = (payload.paymentMethod ?? "cod").toLowerCase();
  let paymentStatus = "pending";
  let paymentVerification = {};
  let paymentDetails = {};

  if (paymentMethod === "bkash" || paymentMethod === "nagad") {
    paymentStatus = "pending_verification";
    const senderNumber = payload.paymentDetails?.senderNumber || payload.senderNumber || "";
    const transactionId = payload.paymentDetails?.transactionId || payload.transactionId || "";
    const receiverNumber =
      payload.paymentDetails?.receiverNumber ||
      storeSettings?.paymentSettings?.[paymentMethod as "bkash" | "nagad"]?.number ||
      "";

    if (!transactionId.trim()) {
      return { ok: false as const, message: `Transaction ID (TrxID) is required for ${paymentMethod.toUpperCase()} payments.` };
    }
    if (!senderNumber.trim()) {
      return { ok: false as const, message: `Sender phone number is required for ${paymentMethod.toUpperCase()} payments.` };
    }

    paymentVerification = {
      transactionId: transactionId.trim(),
      senderNumber: senderNumber.trim(),
      receiverNumber,
      status: "pending",
    };
    paymentDetails = {
      transactionId: transactionId.trim(),
      senderNumber: senderNumber.trim(),
      receiverNumber,
    };
  } else if (paymentMethod === "sslcommerz") {
    const { StorePaymentGatewayModel } = await import("../payments/store-payment-gateway.model.js");
    const { checkFeature } = await import("../features/feature-access.service.js");
    const entitlement = await checkFeature(storeId, "sslcommerz_payment");
    if (!entitlement.allowed) {
      return { ok: false as const, message: entitlement.message || "SSLCommerz payment is not available on this store's plan." };
    }
    const gateway = (await StorePaymentGatewayModel.findOne({ storeId, provider: "sslcommerz" }).lean()) as any;
    if (!gateway || !gateway.isEnabled || !gateway.storeIdValue || !gateway.encryptedStorePassword) {
      return { ok: false as const, message: "SSLCommerz is not configured or enabled for this store." };
    }
  }


  const orderNumber = generateOrderNumber(storeSettings?.orderPrefix ?? "ORD");
  const invoiceNumber = generateOrderNumber(storeSettings?.invoicePrefix ?? "INV");

  const order = await OrderModel.create({
    storeId,
    customerId,
    customerType: customerIdInput ? "registered" : "guest",
    customerSnapshot: {
      name: normalizedShippingAddress.fullName,
      email: normalizedShippingAddress.email,
      phone: normalizedShippingAddress.phone,
      address: [normalizedShippingAddress.street, normalizedShippingAddress.apartment, normalizedShippingAddress.area].filter(Boolean).join(", "),
      country: normalizedShippingAddress.country,
      state: normalizedShippingAddress.state,
      city: normalizedShippingAddress.city,
      area: normalizedShippingAddress.area,
      zip: normalizedShippingAddress.zip,
    },
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
    paymentMethod,
    paymentStatus,
    paymentVerification,
    paymentDetails,
    notes: payload.notes ?? "",
    currencyCode,
    timeline: [
      { status: "pending", note: "Order placed", createdBy: "system", updatedBy: "system" },
      {
        status: paymentStatus === "pending_verification" ? "pending_verification" : "payment_pending",
        note:
          paymentMethod === "cod"
            ? "Cash on delivery — pay when received"
            : `${paymentMethod.toUpperCase()} payment verification pending (TrxID: ${(paymentDetails as any).transactionId || ""})`,
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
    const { markCheckoutConverted } = await import("./incomplete-checkout.service.js");
    await markCheckoutConverted(storeId, sessionId, String(order._id));
  } catch (err) {
    console.error("[orders] Failed to mark incomplete checkout converted", err);
  }

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
    await NotificationModel.create({
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
    console.error("[notifications] Failed to create customer order notification", error);
  }

  if (paymentMethod === "sslcommerz") {
    const { initiateSSLCommerzPayment } = await import("../payments/sslcommerz.service.js");
    const sslResult = await initiateSSLCommerzPayment(storeId, String(order._id));
    if (sslResult.ok) {
      return {
        ok: true as const,
        data: {
          order: order.toObject(),
          gatewayUrl: sslResult.data.gatewayUrl,
          sessionKey: sslResult.data.sessionKey,
          tranId: sslResult.data.tranId,
        },
      };
    } else {
      return {
        ok: false as const,
        message: sslResult.message || "Failed to initialize SSLCommerz gateway session.",
      };
    }
  }

  return { ok: true as const, data: { order: order.toObject() } };
}


async function autoSaveCustomerAddressFromOrder(
  storeId: string,
  customerId: string,
  address: {
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
  },
) {
  const cust: any = await CustomerModel.findOne({ _id: customerId, storeId });
  if (!cust) return;

  const existingAddresses = cust.addresses ?? [];
  const exists = existingAddresses.some(
    (a: any) =>
      a.city?.toLowerCase() === address.city.toLowerCase() &&
      a.street?.toLowerCase() === address.street.toLowerCase() &&
      a.phone === address.phone,
  );


  if (!exists) {
    cust.addresses.push({
      label: address.label || "Home",
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || "",
      street: address.street,
      apartment: address.apartment || "",
      city: address.city,
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "Bangladesh",
      area: address.area || "",
      landmark: address.landmark || "",
      isDefault: existingAddresses.length === 0,
    });
    await cust.save();
  }
}

export async function listStoreOrders(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const filter: Record<string, unknown> = { storeId };
  if (query.status && query.status !== "all") filter.status = query.status;
  if (query.paymentStatus && query.paymentStatus !== "all") filter.paymentStatus = query.paymentStatus;

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 20);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    OrderModel.countDocuments(filter),
  ]);

  return {
    ok: true as const,
    data: {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStoreOrder(storeId: string, orderId: string) {
  await connectDatabase();
  const order = await OrderModel.findOne({ _id: orderId, storeId }).lean();
  if (!order) return { ok: false as const, message: "Order not found" };
  return { ok: true as const, data: { order } };
}

export async function updateOrderStatus(storeId: string, orderId: string, status: string) {
  await connectDatabase();
  const order = await OrderModel.findOneAndUpdate(
    { _id: orderId, storeId },
    {
      $set: { status },
      $push: { timeline: { status, note: `Status updated to ${status}`, createdBy: "merchant", updatedBy: "merchant" } },
    },
    { new: true },
  ).lean();

  if (!order) return { ok: false as const, message: "Order not found" };
  return { ok: true as const, data: { order } };
}

export async function getCustomerOrders(storeId: string, customerId: string) {
  await connectDatabase();
  const orders = await OrderModel.find({ storeId, customerId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { orders } };
}

export async function getOrderById(orderId: string, customerId?: string) {
  await connectDatabase();
  const filter: Record<string, unknown> = { _id: orderId };
  if (customerId) filter.customerId = customerId;
  const order = await OrderModel.findOne(filter).lean();
  if (!order) return { ok: false as const, message: "Order not found" };
  return { ok: true as const, data: { order } };
}

export async function trackOrderByNumber(storeId: string, orderNumber: string, email?: string) {
  await connectDatabase();
  const filter: Record<string, unknown> = { storeId, orderNumber };
  const order: any = await OrderModel.findOne(filter).lean();
  if (!order) return { ok: false as const, message: "Order not found" };
  if (email && order?.shippingAddress?.email && order.shippingAddress.email.toLowerCase() !== email.toLowerCase()) {
    return { ok: false as const, message: "Order not found for given email" };
  }
  return { ok: true as const, data: { order } };
}

