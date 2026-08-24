import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { IncompleteCheckoutModel } from "./incomplete-checkout.model.js";
import { StoreModel } from "../stores/store.model.js";
import { ProductModel } from "../products/product.model.js";
import { PlanModel } from "../plans/plan.model.js";
import { checkSubscription, checkFeature } from "../features/feature-access.service.js";
import type { TrackCheckoutProgressInput } from "./incomplete-checkout.validator.js";
import { isValidObjectId } from "../../common/utils/object-id.js";

const INACTIVITY_ABANDON_MS = 15 * 60 * 1000; // 15 minutes
const CHECKOUT_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Checks if user is authorized to access the store.
 */
export async function verifyStoreAccess(storeId: string, userId: string, userRole?: string) {
  if (userRole === "super_admin") return true;
  const store = await StoreModel.findById(storeId).select("userId").lean();
  if (!store) return false;
  return String((store as { userId?: unknown }).userId) === userId;
}

/**
 * Checks if store's subscription plan allows Incomplete Orders feature.
 */
export async function isIncompleteOrdersAllowed(storeId: string): Promise<{
  allowed: boolean;
  featureName: string;
  currentPlan?: { slug: string; name: string };
  requiredPlan?: { slug: string; name: string; priceBDT?: number };
}> {
  await connectDatabase();
  const subResult = await checkSubscription(storeId);
  const planSlug = subResult.plan?.slug ?? "free";
  const planName = subResult.plan?.name ?? "Free";

  const featureCheck = await checkFeature(storeId, "incomplete_orders");
  const abandonedCheck = await checkFeature(storeId, "abandoned_cart");

  const isAllowed = Boolean(featureCheck.allowed || abandonedCheck.allowed);

  if (isAllowed) {
    return {
      allowed: true,
      featureName: "Incomplete Orders & Abandoned Checkout",
      currentPlan: { slug: planSlug, name: planName },
    };
  }

  // Find the lowest plan that has this feature
  const requiredPlanDoc = await PlanModel.findOne({
    $or: [
      { "featureToggles.incompleteOrders": true },
      { "featureToggles.abandonedCart": true },
    ],
    isActive: true,
  })
    .sort({ priceBDT: 1 })
    .lean();

  return {
    allowed: false,
    featureName: "Incomplete Orders & Abandoned Checkout",
    currentPlan: { slug: planSlug, name: planName },
    requiredPlan: requiredPlanDoc
      ? {
          slug: (requiredPlanDoc as any).slug,
          name: (requiredPlanDoc as any).name,
          priceBDT: (requiredPlanDoc as any).priceBDT,
        }
      : {
          slug: "starter",
          name: "Starter",
          priceBDT: 499,
        },
  };
}

function sanitizeItems(items: any[] | undefined) {
  if (!items || !Array.isArray(items)) return [];
  return items.map((i) => ({
    productId: isValidObjectId(i.productId) ? i.productId : String(i.productId || ""),
    variantId: i.variantId && isValidObjectId(i.variantId) ? i.variantId : (i.variantId ? String(i.variantId) : undefined),
    variantTitle: i.variantTitle || "",
    name: i.name || "Product",
    price: Number(i.price) || 0,
    quantity: Number(i.quantity) || 1,
    image: i.image || "",
    sku: i.sku || "",
  }));
}

/**
 * Progressively tracks checkout session data from public storefront.
 */
export async function trackCheckoutProgress(
  storeId: string,
  input: TrackCheckoutProgressInput,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  await connectDatabase();

  const store = await StoreModel.findById(storeId).select("_id slug subdomain").lean();
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  // Check minimum required information: customer must provide phone OR name OR email
  const hasMinCustomerInfo = Boolean(
    (input.phone && input.phone.trim().length >= 6) ||
    (input.customerName && input.customerName.trim().length >= 2) ||
    (input.email && input.email.trim().length >= 5)
  );

  if (!hasMinCustomerInfo && (!input.items || input.items.length === 0)) {
    // Silently ignore empty visits without items and customer info
    return { ok: true, skipped: true, message: "Insufficient checkout data to record" };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CHECKOUT_EXPIRATION_MS);

  let doc = await IncompleteCheckoutModel.findOne({
    storeId,
    sessionId: input.sessionId,
  });

  const sanitizedItems = sanitizeItems(input.items);

  if (!doc) {
    // Generate secure unpredictable recovery token
    const recoveryToken = crypto.randomBytes(24).toString("hex");

    doc = new IncompleteCheckoutModel({
      storeId,
      customerId: input.customerId && isValidObjectId(input.customerId) ? input.customerId : undefined,
      sessionId: input.sessionId,
      customerName: input.customerName || "",
      phone: input.phone || "",
      email: input.email || "",
      address: input.address || input.street || "",
      street: input.street || input.address || "",
      apartment: input.apartment || "",
      city: input.city || "",
      area: input.area || "",
      state: input.state || "",
      zip: input.zip || "",
      country: input.country || "Bangladesh",
      landmark: input.landmark || "",
      notes: input.notes || "",
      items: sanitizedItems,
      subtotal: input.subtotal || 0,
      discount: input.discount || 0,
      shippingFee: input.shippingFee || 0,
      tax: input.tax || 0,
      total: input.total || 0,
      couponCode: input.couponCode || "",
      deliveryZoneId: input.deliveryZoneId || "",
      deliveryZoneName: input.deliveryZoneName || "",
      shippingMethod: input.shippingMethod || "",
      paymentMethod: input.paymentMethod || "cod",
      status: "in_progress",
      step: input.step || "customer_info",
      startedAt: now,
      lastActivityAt: now,
      expiresAt,
      recoveryToken,
      timeline: [
        {
          status: "started",
          note: "Checkout session started",
          timestamp: now,
        },
      ],
      ipAddress: meta?.ipAddress || "",
      userAgent: meta?.userAgent || "",
    });

    if (input.phone || input.customerName || input.email) {
      doc.timeline.push({
        status: "customer_info",
        note: `Customer info entered: ${input.customerName || ""} ${input.phone || ""}`.trim(),
        timestamp: now,
      });
    }

    await doc.save();
    return {
      ok: true,
      data: {
        checkoutId: String(doc._id),
        recoveryToken: doc.recoveryToken,
        status: doc.status,
      },
    };
  }

  // If already converted, do not modify
  if (doc.status === "converted") {
    return {
      ok: true,
      data: {
        checkoutId: String(doc._id),
        status: doc.status,
        convertedOrderId: doc.convertedOrderId,
      },
    };
  }

  // Track state transition and timeline note
  const prevPhone = doc.phone;
  const prevCity = doc.city;
  const prevPayment = doc.paymentMethod;

  if (input.customerName) doc.customerName = input.customerName;
  if (input.phone) doc.phone = input.phone;
  if (input.email) doc.email = input.email;
  if (input.address || input.street) {
    doc.address = input.address || input.street || doc.address;
    doc.street = input.street || input.address || doc.street;
  }
  if (input.apartment) doc.apartment = input.apartment;
  if (input.city) doc.city = input.city;
  if (input.area) doc.area = input.area;
  if (input.state) doc.state = input.state;
  if (input.zip) doc.zip = input.zip;
  if (input.country) doc.country = input.country;
  if (input.landmark) doc.landmark = input.landmark;
  if (input.notes) doc.notes = input.notes;
  if (input.step) doc.step = input.step;

  if (sanitizedItems.length > 0) {
    doc.items = sanitizedItems as any;
  }
  if (input.subtotal !== undefined) doc.subtotal = input.subtotal;
  if (input.discount !== undefined) doc.discount = input.discount;
  if (input.shippingFee !== undefined) doc.shippingFee = input.shippingFee;
  if (input.tax !== undefined) doc.tax = input.tax;
  if (input.total !== undefined) doc.total = input.total;
  if (input.couponCode !== undefined) doc.couponCode = input.couponCode;
  if (input.deliveryZoneId) doc.deliveryZoneId = input.deliveryZoneId;
  if (input.deliveryZoneName) doc.deliveryZoneName = input.deliveryZoneName;
  if (input.shippingMethod) doc.shippingMethod = input.shippingMethod;
  if (input.paymentMethod) doc.paymentMethod = input.paymentMethod;

  doc.lastActivityAt = now;
  if (doc.status === "abandoned") {
    doc.status = "in_progress"; // Customer returned
  }

  // Ensure recoveryToken exists
  if (!doc.recoveryToken) {
    doc.recoveryToken = crypto.randomBytes(24).toString("hex");
  }

  // Timeline events for step progressions
  if (!prevPhone && input.phone) {
    doc.timeline.push({
      status: "customer_info",
      note: `Contact number provided: ${input.phone}`,
      timestamp: now,
    });
  } else if (!prevCity && input.city) {
    doc.timeline.push({
      status: "shipping_info",
      note: `Delivery location provided: ${input.city}${input.area ? `, ${input.area}` : ""}`,
      timestamp: now,
    });
  } else if (prevPayment !== input.paymentMethod && input.paymentMethod) {
    doc.timeline.push({
      status: "payment_selected",
      note: `Payment method selected: ${input.paymentMethod.toUpperCase()}`,
      timestamp: now,
    });
  }

  await doc.save();

  return {
    ok: true,
    data: {
      checkoutId: String(doc._id),
      recoveryToken: doc.recoveryToken,
      status: doc.status,
    },
  };
}

/**
 * Retrieves paginated incomplete checkouts and real-time statistics for Shop Owner dashboard.
 */
export async function getIncompleteCheckouts(
  storeId: string,
  query: {
    page?: string | number;
    limit?: string | number;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
    minTotal?: string | number;
    maxTotal?: string | number;
    preset?: string;
  }
) {
  await connectDatabase();

  // 1. Check feature entitlement
  const entitlement = await isIncompleteOrdersAllowed(storeId);

  // 2. Automatically mark inactive checkouts (>15 min) as 'abandoned'
  const abandonThreshold = new Date(Date.now() - INACTIVITY_ABANDON_MS);
  await IncompleteCheckoutModel.updateMany(
    {
      storeId,
      status: "in_progress",
      lastActivityAt: { $lt: abandonThreshold },
    },
    {
      $set: { status: "abandoned", abandonedAt: new Date() },
      $push: {
        timeline: {
          status: "abandoned",
          note: "Checkout session marked abandoned due to inactivity",
          timestamp: new Date(),
        },
      },
    }
  );

  // 3. Build filter
  const filter: Record<string, unknown> = { storeId };

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  // Date range filter
  if (query.from || query.to) {
    const dateFilter: Record<string, Date> = {};
    if (query.from) dateFilter.$gte = new Date(query.from);
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = toDate;
    }
    filter.createdAt = dateFilter;
  }

  // Total value filter
  if (query.minTotal !== undefined || query.maxTotal !== undefined) {
    const totalFilter: Record<string, number> = {};
    if (query.minTotal) totalFilter.$gte = Number(query.minTotal);
    if (query.maxTotal) totalFilter.$lte = Number(query.maxTotal);
    filter.total = totalFilter;
  }

  // Search filter
  if (query.search && query.search.trim()) {
    const regex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { customerName: regex },
      { phone: regex },
      { email: regex },
      { city: regex },
      { "items.name": regex },
      { sessionId: regex },
    ];
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  // 4. Fetch list and aggregates in parallel
  const [items, totalCount, statsAgg] = await Promise.all([
    IncompleteCheckoutModel.find(filter)
      .populate("convertedOrderId", "orderNumber status paymentStatus total")
      .sort({ lastActivityAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    IncompleteCheckoutModel.countDocuments(filter),

    // Platform/Store Stats calculation
    IncompleteCheckoutModel.aggregate([
      { $match: { storeId: new (IncompleteCheckoutModel as any).base.Types.ObjectId(storeId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]),
  ]);

  // Aggregate breakdown
  let totalIncomplete = 0;
  let incompleteValue = 0;
  let abandonedCount = 0;
  let inProgressCount = 0;
  let recoveredCount = 0;
  let convertedCount = 0;
  let convertedValue = 0;
  let totalSessions = 0;

  for (const s of statsAgg) {
    totalSessions += s.count;
    if (s._id === "abandoned") {
      abandonedCount += s.count;
      totalIncomplete += s.count;
      incompleteValue += s.totalValue || 0;
    } else if (s._id === "in_progress") {
      inProgressCount += s.count;
      totalIncomplete += s.count;
      incompleteValue += s.totalValue || 0;
    } else if (s._id === "recovered") {
      recoveredCount += s.count;
    } else if (s._id === "converted") {
      convertedCount += s.count;
      convertedValue += s.totalValue || 0;
    }
  }

  const eligibleForRecovery = abandonedCount + recoveredCount + convertedCount;
  const recoveryRate = eligibleForRecovery > 0 ? Math.round(((recoveredCount + convertedCount) / eligibleForRecovery) * 100) : 0;
  const conversionRate = totalSessions > 0 ? Math.round((convertedCount / totalSessions) * 100) : 0;

  return {
    ok: true,
    entitlement,
    data: {
      checkouts: items,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalIncomplete,
        incompleteValue,
        abandonedCount,
        inProgressCount,
        recoveredCount,
        convertedCount,
        convertedValue,
        totalSessions,
        recoveryRate,
        conversionRate,
      },
    },
  };
}

/**
 * Retrieves full details for a specific incomplete checkout with live product & stock verification.
 */
export async function getIncompleteCheckoutById(storeId: string, checkoutId: string) {
  await connectDatabase();

  const checkout = await IncompleteCheckoutModel.findOne({
    _id: checkoutId,
    storeId,
  })
    .populate("convertedOrderId", "orderNumber status paymentStatus total createdAt")
    .lean();

  if (!checkout) {
    return { ok: false, message: "Incomplete checkout not found" };
  }

  // Live product verification: check if products still exist, are active, and have stock
  const productIds = (checkout as any).items?.map((item: any) => item.productId) || [];
  const liveProducts = await ProductModel.find({
    _id: { $in: productIds },
    storeId,
  }).lean();

  const productMap = new Map(liveProducts.map((p) => [String(p._id), p]));

  const verifiedItems = ((checkout as any).items || []).map((item: any) => {
    const live = productMap.get(String(item.productId));
    const exists = Boolean(live);
    const active = live ? (live as any).status === "active" : false;
    let availableStock = live ? Number((live as any).stock ?? 0) : 0;
    let currentPrice = live ? Number((live as any).price ?? item.price) : item.price;

    if (item.variantId && live && (live as any).variants?.length) {
      const variant = (live as any).variants.find((v: any) => String(v._id) === String(item.variantId));
      if (variant) {
        availableStock = Number(variant.stock ?? 0);
        if (variant.price !== undefined) currentPrice = Number(variant.price);
      }
    }

    const inStock = availableStock >= item.quantity;
    const priceChanged = currentPrice !== item.price;

    return {
      ...item,
      liveStatus: {
        exists,
        active,
        inStock,
        availableStock,
        currentPrice,
        priceChanged,
      },
    };
  });

  return {
    ok: true,
    data: {
      checkout: {
        ...checkout,
        items: verifiedItems,
      },
    },
  };
}

/**
 * Validates recovery token from customer link and restores cart with price/stock revalidation.
 */
export async function recoverCheckoutByToken(token: string) {
  await connectDatabase();

  if (!token || typeof token !== "string") {
    return { ok: false, message: "Invalid recovery token" };
  }

  const checkout = await IncompleteCheckoutModel.findOne({
    recoveryToken: token.trim(),
  }).lean();

  if (!checkout) {
    return { ok: false, message: "Recovery link is invalid or has expired." };
  }

  const now = new Date();
  if (checkout.expiresAt && checkout.expiresAt < now) {
    return { ok: false, message: "This checkout recovery link has expired." };
  }

  if (checkout.status === "converted") {
    return {
      ok: false,
      isConverted: true,
      message: "This order has already been completed.",
      convertedOrderId: checkout.convertedOrderId,
    };
  }

  const store = await StoreModel.findById(checkout.storeId).select("name slug subdomain status").lean();
  if (!store || (store as any).status !== "active") {
    return { ok: false, message: "Store is currently unavailable." };
  }

  // Live product verification
  const productIds = ((checkout as any).items || []).map((i: any) => i.productId);
  const liveProducts = await ProductModel.find({
    _id: { $in: productIds },
    storeId: checkout.storeId,
    status: "active",
  }).lean();

  const productMap = new Map(liveProducts.map((p) => [String(p._id), p]));

  const revalidatedItems: any[] = [];
  let recalculatedSubtotal = 0;

  for (const item of (checkout as any).items || []) {
    const live = productMap.get(String(item.productId));
    if (!live) continue; // Item deleted or inactive

    let currentPrice = Number((live as any).price ?? item.price);
    let availableStock = Number((live as any).stock ?? 0);

    if (item.variantId && (live as any).variants?.length) {
      const v = (live as any).variants.find((vr: any) => String(vr._id) === String(item.variantId));
      if (v) {
        availableStock = Number(v.stock ?? 0);
        if (v.price !== undefined) currentPrice = Number(v.price);
      }
    }

    if (availableStock <= 0) continue; // Skip out of stock items
    const validQty = Math.min(item.quantity, availableStock);

    recalculatedSubtotal += currentPrice * validQty;

    revalidatedItems.push({
      productId: String(item.productId),
      variantId: item.variantId ? String(item.variantId) : undefined,
      variantTitle: item.variantTitle,
      name: (live as any).name,
      price: currentPrice,
      quantity: validQty,
      image: item.image || (live as any).imageUrl || "",
      sku: item.sku || (live as any).sku || "",
    });
  }

  // Update checkout status to 'recovered'
  await IncompleteCheckoutModel.updateOne(
    { _id: checkout._id },
    {
      $set: {
        status: "recovered",
        recoveredAt: now,
        lastActivityAt: now,
      },
      $push: {
        timeline: {
          status: "recovered",
          note: "Customer reopened checkout via recovery link",
          timestamp: now,
        },
      },
    }
  );

  return {
    ok: true,
    data: {
      store: {
        _id: String(store._id),
        name: (store as any).name,
        slug: (store as any).slug,
        subdomain: (store as any).subdomain,
      },
      checkout: {
        _id: String(checkout._id),
        sessionId: checkout.sessionId,
        customerName: checkout.customerName,
        phone: checkout.phone,
        email: checkout.email,
        address: checkout.address || checkout.street,
        street: checkout.street,
        apartment: checkout.apartment,
        city: checkout.city,
        area: checkout.area,
        state: checkout.state,
        zip: checkout.zip,
        country: checkout.country,
        landmark: checkout.landmark,
        notes: checkout.notes,
        deliveryZoneId: checkout.deliveryZoneId,
        paymentMethod: checkout.paymentMethod,
        couponCode: checkout.couponCode,
        items: revalidatedItems,
        subtotal: recalculatedSubtotal,
      },
    },
  };
}

/**
 * Marks an incomplete checkout as CONVERTED when an order is placed.
 */
export async function markCheckoutConverted(
  storeId: string,
  sessionIdOrCheckoutId: string,
  orderId: string
) {
  await connectDatabase();
  try {
    const now = new Date();

    const query: Record<string, unknown> = {
      storeId,
      $or: [
        { sessionId: sessionIdOrCheckoutId },
        ...(isValidObjectId(sessionIdOrCheckoutId) ? [{ _id: sessionIdOrCheckoutId }] : []),
      ],
    };

    const doc = await IncompleteCheckoutModel.findOne(query);
    if (!doc) return;

    doc.status = "converted";
    doc.convertedOrderId = orderId as any;
    doc.convertedAt = now;
    doc.lastActivityAt = now;
    doc.timeline.push({
      status: "converted",
      note: `Order completed successfully (Order ID: ${orderId})`,
      timestamp: now,
    });

    await doc.save();
  } catch (err) {
    console.error("[incomplete-checkout] Failed to mark checkout converted", err);
  }
}

/**
 * Generates or retrieves the shareable recovery link.
 */
export async function generateRecoveryLink(storeId: string, checkoutId: string) {
  await connectDatabase();

  const [checkout, store] = await Promise.all([
    IncompleteCheckoutModel.findOne({ _id: checkoutId, storeId }),
    StoreModel.findById(storeId).select("slug subdomain customDomain").lean(),
  ]);

  if (!checkout || !store) {
    return { ok: false, message: "Incomplete checkout not found" };
  }

  if (!checkout.recoveryToken) {
    checkout.recoveryToken = crypto.randomBytes(24).toString("hex");
    await checkout.save();
  }

  const customDomain = (store as any).customDomain;
  const subdomain = (store as any).subdomain;
  const slug = (store as any).slug;

  const domain = customDomain
    ? `https://${customDomain}`
    : subdomain
    ? `https://${subdomain}.bornoland.com`
    : `https://bornoland.com/site/${slug}`;

  const recoveryUrl = `${domain}/checkout?recover=${checkout.recoveryToken}`;

  return {
    ok: true,
    data: {
      recoveryToken: checkout.recoveryToken,
      recoveryUrl,
      expiresAt: checkout.expiresAt,
    },
  };
}
