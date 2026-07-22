import { connectDatabase } from "../../common/database/connection.js";
import { CartModel } from "../../models/cart.model.js";
import { ProductModel } from "../../models/product.model.js";
import { resolveVariantForCart } from "../products/variants/variant.service.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { validateCouponForCart } from "../coupons/coupon.service.js";

type CartDoc = {
  items: Array<{ price: number; quantity: number; productId: unknown }>;
  discount?: number;
  couponCode?: string;
  couponId?: unknown;
  toObject?: () => Record<string, unknown>;
};

function calcTotals(
  cart: CartDoc,
  taxSettings: { taxEnabled?: boolean; taxRate?: number; taxIncluded?: boolean },
  shipping = 0
) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.discount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  let tax = 0;
  if (taxSettings.taxEnabled && taxSettings.taxRate && !taxSettings.taxIncluded) {
    tax = Math.round(((taxable * taxSettings.taxRate) / 100) * 100) / 100;
  }
  const total = taxable + tax + shipping;
  return { subtotal, discount, tax, total };
}

async function getTaxSettings(storeId: string) {
  return (await StoreSettingsModel.findOne({ storeId }).lean()) as {
    taxEnabled?: boolean;
    taxRate?: number;
    taxIncluded?: boolean;
  } | null;
}

function cartResponse(cart: CartDoc, settings: { taxEnabled?: boolean; taxRate?: number; taxIncluded?: boolean }) {
  const totals = calcTotals(cart, settings ?? {});
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const base = typeof cart.toObject === "function" ? cart.toObject() : cart;
  return { ...base, ...totals, itemCount };
}

export async function getCart(storeId: string, customerId?: string, sessionId?: string) {
  await connectDatabase();

  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  // Empty customer cart must not hide a guest session cart that still has items.
  if ((!cart || cart.items.length === 0) && sessionId) {
    const sessionCart = await CartModel.findOne({ storeId, sessionId });
    if (sessionCart && sessionCart.items.length > 0) {
      cart = sessionCart;
    }
  }

  const settings = await getTaxSettings(storeId);
  if (!cart) {
    return { ok: true as const, data: { cart: { items: [], subtotal: 0, discount: 0, tax: 0, total: 0, itemCount: 0 } } };
  }

  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}) } };
}

export async function addToCart(
  storeId: string,
  productId: string,
  quantity: number,
  customerId?: string,
  sessionId?: string,
  variantId?: string
) {
  await connectDatabase();

  const product = (await ProductModel.findOne({
    _id: productId,
    storeId,
    status: { $in: ["active", "scheduled"] },
  }).lean()) as { _id: unknown; name: string } | null;
  if (!product) return { ok: false as const, message: "Product not found" };

  const resolved = await resolveVariantForCart(storeId, productId, variantId);
  if (!resolved.ok) return resolved;

  const { price, image, variantTitle, stock } = resolved.data;
  if (stock < quantity) return { ok: false as const, message: "Not enough stock available" };

  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });
  if (!cart) cart = await CartModel.create({ storeId, customerId, sessionId, items: [] });
  else if (customerId && !cart.customerId) cart.customerId = customerId as never;

  const existingIdx = cart.items.findIndex(
    (i: { productId: unknown; variantId?: unknown }) =>
      String(i.productId) === productId && String(i.variantId ?? "") === (variantId || "")
  );
  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += quantity;
    cart.items[existingIdx].price = price;
  } else {
    cart.items.push({
      productId: product._id as never,
      variantId: (variantId as never) ?? undefined,
      variantTitle,
      name: product.name,
      price,
      quantity,
      image,
    });
  }

  await cart.save();
  const settings = await getTaxSettings(storeId);
  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}) } };
}

export async function updateCartItem(
  storeId: string,
  productId: string,
  quantity: number,
  customerId?: string,
  sessionId?: string,
  variantId?: string
) {
  await connectDatabase();
  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });
  if (!cart) return { ok: false as const, message: "Cart not found" };

  const item = cart.items.find(
    (i: { productId: unknown; variantId?: unknown }) =>
      String(i.productId) === productId && String(i.variantId ?? "") === (variantId || "")
  );
  if (!item) return { ok: false as const, message: "Item not in cart" };

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i: { productId: unknown; variantId?: unknown }) =>
        !(String(i.productId) === productId && String(i.variantId ?? "") === (variantId || ""))
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const settings = await getTaxSettings(storeId);
  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}) } };
}

export async function removeFromCart(
  storeId: string,
  productId: string,
  customerId?: string,
  sessionId?: string,
  variantId?: string
) {
  await connectDatabase();
  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });
  if (!cart) return { ok: false as const, message: "Cart not found" };

  cart.items = cart.items.filter(
    (i: { productId: unknown; variantId?: unknown }) =>
      !(String(i.productId) === productId && String(i.variantId ?? "") === (variantId || ""))
  );
  await cart.save();
  const settings = await getTaxSettings(storeId);
  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}) } };
}

/**
 * Claim a guest session cart into the authenticated customer cart.
 * Merges quantities for matching product/variant lines.
 */
export async function mergeGuestCartIntoCustomer(
  storeId: string,
  customerId: string,
  sessionId?: string,
) {
  await connectDatabase();

  let customerCart = await CartModel.findOne({ storeId, customerId });
  const sessionCart =
    sessionId && sessionId.length > 0
      ? await CartModel.findOne({ storeId, sessionId })
      : null;

  if (!sessionCart || sessionCart.items.length === 0) {
    const settings = await getTaxSettings(storeId);
    if (!customerCart) {
      return {
        ok: true as const,
        data: {
          cart: { items: [], subtotal: 0, discount: 0, tax: 0, total: 0, itemCount: 0 },
          merged: false,
        },
      };
    }
    return {
      ok: true as const,
      data: { cart: cartResponse(customerCart, settings ?? {}), merged: false },
    };
  }

  // Same document — just ensure customerId is set
  if (customerCart && String(customerCart._id) === String(sessionCart._id)) {
    if (!customerCart.customerId) {
      customerCart.customerId = customerId as never;
      await customerCart.save();
    }
    const settings = await getTaxSettings(storeId);
    return {
      ok: true as const,
      data: { cart: cartResponse(customerCart, settings ?? {}), merged: true },
    };
  }

  if (!customerCart) {
    sessionCart.customerId = customerId as never;
    await sessionCart.save();
    const settings = await getTaxSettings(storeId);
    return {
      ok: true as const,
      data: { cart: cartResponse(sessionCart, settings ?? {}), merged: true },
    };
  }

  if (customerCart.items.length === 0) {
    customerCart.items = sessionCart.items;
    customerCart.couponCode = sessionCart.couponCode || customerCart.couponCode;
    customerCart.discount = sessionCart.discount || customerCart.discount;
    (customerCart as { couponId?: unknown }).couponId =
      (sessionCart as { couponId?: unknown }).couponId ??
      (customerCart as { couponId?: unknown }).couponId;
    if (!customerCart.sessionId && sessionId) customerCart.sessionId = sessionId;
    await customerCart.save();
    if (String(sessionCart._id) !== String(customerCart._id)) {
      await CartModel.deleteOne({ _id: sessionCart._id });
    }
    const settings = await getTaxSettings(storeId);
    return {
      ok: true as const,
      data: { cart: cartResponse(customerCart, settings ?? {}), merged: true },
    };
  }

  for (const guestItem of sessionCart.items) {
    const idx = customerCart.items.findIndex(
      (i: { productId: unknown; variantId?: unknown }) =>
        String(i.productId) === String(guestItem.productId) &&
        String(i.variantId ?? "") === String(guestItem.variantId ?? ""),
    );
    if (idx >= 0) {
      customerCart.items[idx].quantity += guestItem.quantity;
      customerCart.items[idx].price = guestItem.price;
    } else {
      customerCart.items.push(guestItem);
    }
  }

  await customerCart.save();
  if (String(sessionCart._id) !== String(customerCart._id)) {
    await CartModel.deleteOne({ _id: sessionCart._id });
  }
  const settings = await getTaxSettings(storeId);
  return {
    ok: true as const,
    data: { cart: cartResponse(customerCart, settings ?? {}), merged: true },
  };
}

/**
 * Ensure the authenticated/session cart contains the provided lines.
 * Used when checkout UI has items but the Mongo cart is empty/out of sync.
 */
export async function syncCartItems(
  storeId: string,
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>,
  customerId?: string,
  sessionId?: string,
) {
  await connectDatabase();

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false as const, message: "No items to sync" };
  }

  if (customerId && sessionId) {
    await mergeGuestCartIntoCustomer(storeId, customerId, sessionId);
  }

  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });
  if (!cart) {
    cart = await CartModel.create({ storeId, customerId, sessionId, items: [] });
  } else if (customerId && !cart.customerId) {
    cart.customerId = customerId as never;
  }

  // Rebuild from authoritative client lines (validated against live products)
  const nextItems: Array<{
    productId: unknown;
    variantId?: unknown;
    variantTitle: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }> = [];

  for (const line of items) {
    if (!line.productId || line.quantity <= 0) continue;
    const product = (await ProductModel.findOne({
      _id: line.productId,
      storeId,
      status: { $in: ["active", "scheduled"] },
    }).lean()) as { _id: unknown; name: string } | null;
    if (!product) continue;

    const resolved = await resolveVariantForCart(storeId, line.productId, line.variantId);
    if (!resolved.ok) continue;

    const { price, image, variantTitle, stock } = resolved.data;
    const quantity = Math.min(line.quantity, Math.max(1, stock || line.quantity));
    nextItems.push({
      productId: product._id,
      variantId: line.variantId || undefined,
      variantTitle,
      name: product.name,
      price,
      quantity,
      image,
    });
  }

  if (nextItems.length === 0) {
    return { ok: false as const, message: "Could not sync cart items — products unavailable" };
  }

  cart.items = nextItems as never;
  await cart.save();

  const settings = await getTaxSettings(storeId);
  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}) } };
}

export async function applyCouponToCart(storeId: string, code: string, customerId?: string, sessionId?: string) {
  await connectDatabase();
  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });
  if (!cart || cart.items.length === 0) return { ok: false as const, message: "Cart is empty" };

  const subtotal = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const productIds = cart.items.map((i: { productId: unknown }) => String(i.productId));
  const result = await validateCouponForCart(storeId, code, subtotal, 0, customerId, productIds);
  if (!result.ok) return result;

  cart.couponCode = result.data.coupon.code;
  (cart as { couponId?: unknown }).couponId = result.data.coupon._id;
  cart.discount = result.data.discount;
  await cart.save();

  const settings = await getTaxSettings(storeId);
  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}), coupon: result.data.coupon } };
}

export async function removeCouponFromCart(storeId: string, customerId?: string, sessionId?: string) {
  await connectDatabase();
  let cart = customerId ? await CartModel.findOne({ storeId, customerId }) : null;
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });
  if (!cart) return { ok: false as const, message: "Cart not found" };

  cart.couponCode = "";
  cart.discount = 0;
  (cart as { couponId?: unknown }).couponId = undefined;
  await cart.save();

  const settings = await getTaxSettings(storeId);
  return { ok: true as const, data: { cart: cartResponse(cart, settings ?? {}) } };
}
