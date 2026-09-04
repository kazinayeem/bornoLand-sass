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
import mongoose from "mongoose";
import { CustomerNotificationModel } from "../customers/customer-notification.model.js";
import {
  validateLocationHierarchy,
  findDivision,
  findDistrict,
  findUpazila,
  matchStoreDeliveryZone,
} from "../locations/location.service.js";

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
    idempotencyKey?: string;
    couponCode?: string;
    couponId?: string;
    discount?: number;
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
      image?: string;
    }>;
  },
) {
  await connectDatabase();
  const startTime = Date.now();

  // ── 1. Idempotency Check (Instant Return for Retries / Double-Clicks) ──
  const idempotencyKey = payload.idempotencyKey?.trim() || "";
  if (idempotencyKey) {
    const existingOrder = (await OrderModel.findOne({ storeId, idempotencyKey }).lean()) as any;
    if (existingOrder) {
      console.info("[ORDER] Idempotent hit: returning existing order", {
        orderId: String(existingOrder._id),
        orderNumber: existingOrder.orderNumber,
        durationMs: Date.now() - startTime,
      });
      return { ok: true as const, data: { order: existingOrder } };
    }
  }

  // ── 2. Parallel Context Resolution (Store, Settings, Limit, Delivery Zone) ──
  const [store, storeSettings, limitCheck, preloadedZone] = await Promise.all([
    StoreModel.findById(storeId).select("planId allowNewOrders userId slug status").lean() as Promise<{
      planId?: string;
      allowNewOrders?: boolean;
      userId?: unknown;
      slug?: string;
    } | null>,
    StoreSettingsModel.findOne({ storeId }).lean() as Promise<{
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
    } | null>,
    checkLimit(storeId, "orders"),
    payload.deliveryZoneId && mongoose.Types.ObjectId.isValid(payload.deliveryZoneId)
      ? DeliveryZoneModel.findOne({
          _id: payload.deliveryZoneId,
          storeId,
          enabled: true,
        }).select("charge name estimatedDays").lean()
      : Promise.resolve(null),
  ]);

  if (store && store.allowNewOrders === false) {
    return { ok: false as const, message: "This store is not accepting new orders. Please upgrade your subscription." };
  }

  if (!limitCheck.allowed) {
    return { ok: false as const, message: limitCheck.message ?? "Order limit reached" };
  }

  let customerId = customerIdInput;

  // Guest vs Login Rules Check
  if (storeSettings?.requireLoginEnabled && !customerId) {
    return { ok: false as const, message: "Login is required to place an order in this store." };
  }

  if (!customerId && storeSettings?.guestCheckoutEnabled === false) {
    return { ok: false as const, message: "Guest checkout is disabled. Please login to place your order." };
  }

  // ── 3. Customer Resolution ──
  let normalizedShippingAddress: any = null;
  const rawItems = payload.items && payload.items.length > 0 ? payload.items : null;

  if (!customerId) {
    const email = (payload.shippingAddress.email || "").toLowerCase().trim();
    const phone = payload.shippingAddress.phone.trim();
    let guestDoc = await CustomerModel.findOne({
      storeId,
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    }).select("_id").lean();

    if (!guestDoc) {
      guestDoc = await CustomerModel.create({
        storeId,
        name: payload.shippingAddress.fullName,
        email: email || `guest_${Date.now()}@store.com`,
        phone,
        passwordHash: "",
        isGuest: true,
        status: "active",
      });
    }
    if (guestDoc) {
      customerId = String((guestDoc as any)._id);
    }
  }

  // ── 4. Item Resolution & Batch Product Verification ──
  let orderItems: Array<{
    productId: unknown;
    variantId?: unknown;
    variantTitle?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }> = [];
  let subtotal = 0;
  let couponCode = payload.couponCode ?? "";
  let couponId = payload.couponId ?? null;
  let discount = Number(payload.discount) || 0;
  let cartIdToClean: string | null = payload.cartId ?? null;

  if (rawItems && rawItems.length > 0) {
    const productIds = Array.from(new Set(rawItems.map((i) => i.productId).filter((id) => mongoose.Types.ObjectId.isValid(id))));
    const dbProducts = (await ProductModel.find({
      _id: { $in: productIds },
      storeId,
    }).select("_id name slug price comparePrice stock variants trackInventory status imageUrl").lean()) as any[];

    const productMap = new Map<string, any>();
    for (const p of dbProducts) {
      productMap.set(String(p._id), p);
    }

    for (const raw of rawItems) {
      const dbProduct = productMap.get(String(raw.productId));
      if (!dbProduct) {
        continue;
      }
      let unitPrice = dbProduct.price;
      let variantTitle = "";
      if (raw.variantId && dbProduct.variants?.length) {
        const v = dbProduct.variants.find((v: any) => String(v._id) === String(raw.variantId));
        if (v && v.price) {
          unitPrice = v.price;
          variantTitle = v.title || "";
        }
      }
      const qty = Math.max(1, Math.floor(Number(raw.quantity) || 1));

      // Stock safety check
      const trackInventory = (dbProduct as any).trackInventory !== false;
      if (trackInventory) {
        if (raw.variantId && dbProduct.variants?.length) {
          const v = dbProduct.variants.find((v: any) => String(v._id) === String(raw.variantId));
          if (v && typeof v.stock === "number" && v.stock < qty) {
            return {
              ok: false as const,
              message: `Insufficient stock for "${dbProduct.name}${variantTitle ? ` (${variantTitle})` : ""}". Available: ${Math.max(0, v.stock)}, Requested: ${qty}`,
            };
          }
        } else if (typeof dbProduct.stock === "number" && dbProduct.stock < qty) {
          return {
            ok: false as const,
            message: `Insufficient stock for "${dbProduct.name}". Available: ${Math.max(0, dbProduct.stock)}, Requested: ${qty}`,
          };
        }
      }

      orderItems.push({
        productId: dbProduct._id,
        variantId: raw.variantId ? raw.variantId : undefined,
        variantTitle,
        name: dbProduct.name,
        price: unitPrice,
        quantity: qty,
        image: raw.image || dbProduct.imageUrl || "",
      });
      subtotal += unitPrice * qty;
    }
  } else {
    // Fallback to database cart if payload items not directly provided
    const cart = (await CartModel.findOne({ storeId, customerId }).lean()) as any;
    if (cart && cart.items?.length) {
      cartIdToClean = String(cart._id);
      couponCode = cart.couponCode || couponCode;
      couponId = (cart as any).couponId || couponId;
      discount = cart.discount || discount;
      orderItems = cart.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId ?? undefined,
        variantTitle: item.variantTitle ?? "",
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? "",
      }));
      subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  }

  if (orderItems.length === 0) {
    return { ok: false as const, message: "Cart is empty" };
  }

  // Minimum Order Check
  if (storeSettings?.minimumOrderAmount && storeSettings.minimumOrderAmount > 0) {
    if (subtotal < storeSettings.minimumOrderAmount) {
      return {
        ok: false as const,
        message: `Minimum order amount for this store is ${storeSettings.minimumOrderAmount} BDT`,
      };
    }
  }

  // ── 5. Location Hierarchy & Delivery Zone Calculation (In-Memory) ──
  const divCandidate = (payload.shippingAddress as any)?.divisionId || (payload.shippingAddress as any)?.division || payload.shippingAddress.state;
  const distCandidate = (payload.shippingAddress as any)?.districtId || (payload.shippingAddress as any)?.district || payload.shippingAddress.city;
  const upzCandidate = (payload.shippingAddress as any)?.upazilaId || (payload.shippingAddress as any)?.upazila || payload.shippingAddress.area;
  const unionCandidate = (payload.shippingAddress as any)?.unionId || (payload.shippingAddress as any)?.union || "";
  const villageCandidate = (payload.shippingAddress as any)?.village || "";

  const divObj = divCandidate ? findDivision(divCandidate) : undefined;
  const distObj = distCandidate ? findDistrict(distCandidate) : undefined;
  const upzObj = upzCandidate ? findUpazila(upzCandidate) : undefined;

  let deliveryCharge = 0;
  let deliveryZoneName = "";
  let deliveryZoneEta = "";

  if (preloadedZone) {
    deliveryCharge = (preloadedZone as any).charge;
    deliveryZoneName = (preloadedZone as any).name;
    deliveryZoneEta = (preloadedZone as any).estimatedDays ?? "";
  } else if (payload.deliveryZoneId && storeSettings?.deliveryZones) {
    const configuredZone = storeSettings.deliveryZones.find((z) => z.id === payload.deliveryZoneId && z.enabled !== false);
    if (configuredZone) {
      deliveryCharge = configuredZone.charge;
      deliveryZoneName = configuredZone.name;
      deliveryZoneEta = configuredZone.estimatedDays ?? "";
    }
  } else if (distObj || divObj) {
    const matchedZone = await matchStoreDeliveryZone(storeId, {
      divisionId: divObj?.id,
      districtId: distObj?.id,
      upazilaId: upzObj?.id,
      divisionName: divObj?.name,
      districtName: distObj?.name,
    });
    deliveryCharge = matchedZone.charge;
    deliveryZoneName = matchedZone.deliveryZoneName || "";
    deliveryZoneEta = matchedZone.estimatedDays || "";
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

  normalizedShippingAddress = {
    fullName: payload.shippingAddress.fullName,
    phone: payload.shippingAddress.phone,
    email: payload.shippingAddress.email ?? "",
    label: payload.shippingAddress.label ?? "Home",
    area: upzObj?.name || payload.shippingAddress.area || "",
    street: payload.shippingAddress.street,
    apartment: payload.shippingAddress.apartment ?? "",
    city: distObj?.name || payload.shippingAddress.city,
    state: divObj?.name || payload.shippingAddress.state || "",
    zip: payload.shippingAddress.zip || distObj?.defaultPostalCode || "",
    country: payload.shippingAddress.country ?? "Bangladesh",
    countryCode: "BD",
    division: divObj?.name || payload.shippingAddress.state || "",
    divisionId: divObj?.id || "",
    divisionName: divObj?.name || payload.shippingAddress.state || "",
    divisionNameBn: divObj?.nameBn || "",
    district: distObj?.name || payload.shippingAddress.city,
    districtId: distObj?.id || "",
    districtName: distObj?.name || payload.shippingAddress.city,
    districtNameBn: distObj?.nameBn || "",
    upazila: upzObj?.name || payload.shippingAddress.area || "",
    upazilaId: upzObj?.id || "",
    upazilaName: upzObj?.name || payload.shippingAddress.area || "",
    upazilaNameBn: upzObj?.nameBn || "",
    union: unionCandidate || "",
    village: villageCandidate || "",
    landmark: payload.shippingAddress.landmark ?? "",
    orderNotes: payload.shippingAddress.orderNotes ?? payload.notes ?? "",
  };

  // ── 6. Payment Validation ──
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
    const [entitlement, gateway] = await Promise.all([
      checkFeature(storeId, "sslcommerz_payment"),
      StorePaymentGatewayModel.findOne({ storeId, provider: "sslcommerz" }).select("isEnabled storeIdValue encryptedStorePassword environment").lean() as any,
    ]);

    if (!entitlement.allowed) {
      return { ok: false as const, message: entitlement.message || "SSLCommerz payment is not available on this store's plan." };
    }
    if (!gateway || !gateway.isEnabled || !gateway.storeIdValue || !gateway.encryptedStorePassword) {
      return { ok: false as const, message: "SSLCommerz is not configured or enabled for this store." };
    }
  }

  const orderNumber = generateOrderNumber(storeSettings?.orderPrefix ?? "ORD");
  const invoiceNumber = generateOrderNumber(storeSettings?.invoicePrefix ?? "INV");

  // ── 7. Insert Order Record ──
  const order = await OrderModel.create({
    storeId,
    customerId,
    customerType: customerIdInput ? "registered" : "guest",
    customerSnapshot: {
      name: normalizedShippingAddress.fullName,
      email: normalizedShippingAddress.email,
      phone: normalizedShippingAddress.phone,
      address: [normalizedShippingAddress.street, normalizedShippingAddress.apartment, normalizedShippingAddress.area, normalizedShippingAddress.city].filter(Boolean).join(", "),
      country: normalizedShippingAddress.country,
      countryCode: "BD",
      division: normalizedShippingAddress.division,
      divisionId: normalizedShippingAddress.divisionId,
      district: normalizedShippingAddress.district,
      districtId: normalizedShippingAddress.districtId,
      upazila: normalizedShippingAddress.upazila,
      upazilaId: normalizedShippingAddress.upazilaId,
      union: normalizedShippingAddress.union,
      village: normalizedShippingAddress.village,
      state: normalizedShippingAddress.state,
      city: normalizedShippingAddress.city,
      area: normalizedShippingAddress.area,
      zip: normalizedShippingAddress.zip,
    },
    items: orderItems,
    subtotal,
    discount,
    couponCode,
    couponId: couponId ? (couponId as any) : undefined,
    tax,
    taxRate,
    deliveryCharge,
    deliveryZone: deliveryZoneName,
    shipping: deliveryCharge,
    total,
    orderNumber,
    invoiceNumber,
    idempotencyKey: idempotencyKey || undefined,
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

  // ── 8. Batch Stock Decrements (Atomic Mongo BulkWrite) ──
  const bulkOps = orderItems.map((item) => {
    if (item.variantId) {
      return {
        updateOne: {
          filter: { _id: item.productId, storeId, "variants._id": item.variantId },
          update: {
            $inc: {
              "variants.$.stock": -item.quantity,
              stock: -item.quantity,
            },
          },
        },
      };
    }
    return {
      updateOne: {
        filter: { _id: item.productId, storeId },
        update: {
          $inc: {
            stock: -item.quantity,
          },
        },
      },
    };
  });
  if (bulkOps.length > 0) {
    ProductModel.bulkWrite(bulkOps as any).catch((err) => {
      console.error("[orders] Product stock bulkWrite error:", err);
    });
  }

  // ── 9. Non-Blocking Background Tasks (Asynchronous Microtasks) ──
  queueMicrotask(async () => {
    try {
      const bgTasks: Promise<unknown>[] = [];

      // Coupon Usage Increment
      if (couponId) {
        bgTasks.push(incrementCouponUsage(String(couponId)).catch(() => {}));
      }

      // Cleanup Cart
      if (cartIdToClean) {
        bgTasks.push(CartModel.deleteOne({ _id: cartIdToClean }).catch(() => {}));
      } else if (customerId) {
        bgTasks.push(CartModel.deleteMany({ storeId, customerId }).catch(() => {}));
      }

      // Mark Incomplete Checkout Converted
      bgTasks.push(
        import("./incomplete-checkout.service.js")
          .then(({ markCheckoutConverted }) => markCheckoutConverted(storeId, sessionId, String(order._id)))
          .catch(() => {}),
      );

      // Customer Stats Sync & Address Auto-Save
      if (customerId) {
        const resolvedCustId = String(customerId);
        bgTasks.push(
          import("../customers/customer.service.js")
            .then(({ syncCustomerOrderStats }) => syncCustomerOrderStats(storeId, resolvedCustId))
            .catch(() => {}),
        );
        bgTasks.push(
          autoSaveCustomerAddressFromOrder(storeId, resolvedCustId, normalizedShippingAddress).catch(() => {}),
        );
      }

      // Merchant Billing Notification
      if (store?.userId) {
        bgTasks.push(
          createBillingNotification({
            userId: String(store.userId),
            storeId,
            type: "new_order",
            title: `New order ${orderNumber}`,
            message: `${payload.shippingAddress.fullName} placed an order for ${currencyCode} ${total.toFixed(2)}.`,
            actionUrl: store.slug ? `/store/${store.slug}/orders` : "/dashboard/orders",
            metadata: { orderId: String(order._id), orderNumber, total, currencyCode },
          }).catch(() => {}),
        );
      }

      // Customer Notification
      if (customerId && mongoose.Types.ObjectId.isValid(String(customerId))) {
        bgTasks.push(
          CustomerNotificationModel.create({
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
          }).catch(() => {}),
        );
      }

      await Promise.allSettled(bgTasks);
    } catch (bgErr) {
      console.error("[orders] Background post-order processing safe catch:", bgErr);
    }
  });

  const durationMs = Date.now() - startTime;
  console.info("[ORDER] order created successfully", {
    orderId: String(order._id),
    orderNumber,
    durationMs,
  });

  // ── 10. SSLCommerz Direct Gateway Session Init ──
  if (paymentMethod === "sslcommerz") {
    const { initiateSSLCommerzPayment } = await import("../payments/sslcommerz.service.js");
    const sslResult = await initiateSSLCommerzPayment(storeId, String(order._id));
    if (sslResult.ok) {
      return {
        ok: true as const,
        data: {
          order: order.toObject(),
          gatewayUrl: sslResult.data.gatewayUrl,
          redirectUrl: sslResult.data.gatewayUrl,
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
  if (!customerId || !mongoose.Types.ObjectId.isValid(String(customerId))) return;
  try {
    const cust: any = await CustomerModel.findOne({ _id: customerId, storeId });
    if (!cust) return;

    if (!Array.isArray(cust.addresses)) {
      cust.addresses = [];
    }

    const existingAddresses = cust.addresses;
    const exists = existingAddresses.some(
      (a: any) =>
        a.city?.toLowerCase() === address.city?.toLowerCase() &&
        a.street?.toLowerCase() === address.street?.toLowerCase() &&
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
  } catch (err) {
    console.warn("[customer-address] autoSaveCustomerAddressFromOrder safe catch:", err);
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

