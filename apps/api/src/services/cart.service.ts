import { connectDatabase } from "../config/database.js";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

export async function getCart(storeId: string, customerId?: string, sessionId?: string) {
  await connectDatabase();

  let cart;
  if (customerId) {
    cart = await CartModel.findOne({ storeId, customerId }).lean() as any;
  } else if (sessionId) {
    cart = await CartModel.findOne({ storeId, sessionId }).lean() as any;
  }

  if (!cart) {
    return { ok: true as const, data: { cart: { items: [], subtotal: 0, itemCount: 0 } } };
  }

  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  return {
    ok: true as const,
    data: {
      cart: { ...cart, subtotal, itemCount: cart.items.reduce((s: number, i: any) => s + i.quantity, 0) }
    }
  };
}

export async function addToCart(
  storeId: string,
  productId: string,
  quantity: number,
  customerId?: string,
  sessionId?: string
) {
  await connectDatabase();

  const product: any = await ProductModel.findOne({ _id: productId, storeId, status: "active" }).lean();
  if (!product) return { ok: false as const, message: "Product not found" };

  const identifier = customerId ? { customerId } : { sessionId };
  let cart = await CartModel.findOne({ storeId, ...identifier });

  if (!cart) {
    cart = await CartModel.create({ storeId, ...identifier, items: [] });
  }

  const existingIdx = cart.items.findIndex((i: any) => i.productId.toString() === productId);
  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += quantity;
  } else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] ?? ""
    });
  }

  await cart.save();
  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return {
    ok: true as const,
    data: {
      cart: { ...cart.toObject(), subtotal, itemCount: cart.items.reduce((s: number, item: any) => s + item.quantity, 0) }
    }
  };
}

export async function updateCartItem(storeId: string, productId: string, quantity: number, customerId?: string, sessionId?: string) {
  await connectDatabase();

  const identifier = customerId ? { customerId } : { sessionId };
  const cart = await CartModel.findOne({ storeId, ...identifier });
  if (!cart) return { ok: false as const, message: "Cart not found" };

  const item = cart.items.find((i: any) => i.productId.toString() === productId);
  if (!item) return { ok: false as const, message: "Item not in cart" };

  if (quantity <= 0) {
    cart.items = cart.items.filter((i: any) => i.productId.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return {
    ok: true as const,
    data: {
      cart: { ...cart.toObject(), subtotal, itemCount: cart.items.reduce((s: number, item: any) => s + item.quantity, 0) }
    }
  };
}

export async function removeFromCart(storeId: string, productId: string, customerId?: string, sessionId?: string) {
  await connectDatabase();

  const identifier = customerId ? { customerId } : { sessionId };
  const cart = await CartModel.findOne({ storeId, ...identifier });
  if (!cart) return { ok: false as const, message: "Cart not found" };

  cart.items = cart.items.filter((i: any) => i.productId.toString() !== productId);
  await cart.save();

  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return {
    ok: true as const,
    data: {
      cart: { ...cart.toObject(), subtotal, itemCount: cart.items.reduce((s: number, item: any) => s + item.quantity, 0) }
    }
  };
}
