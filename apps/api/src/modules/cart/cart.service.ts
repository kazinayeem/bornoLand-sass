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
  if (!cart && sessionId) cart = await CartModel.findOne({ storeId, sessionId });

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
