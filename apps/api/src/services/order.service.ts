import { connectDatabase } from "../config/database.js";
import { OrderModel } from "../models/order.model.js";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

export async function createOrder(
  storeId: string,
  customerId: string,
  payload: {
    shippingAddress: {
      fullName: string; phone: string; street: string; city: string;
      state?: string; zip?: string; country?: string;
    };
    paymentMethod?: string;
    notes?: string;
  }
) {
  await connectDatabase();

  const cart = await CartModel.findOne({ storeId, customerId });
  if (!cart || cart.items.length === 0) {
    return { ok: false as const, message: "Cart is empty" };
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const order = await OrderModel.create({
    storeId,
    customerId,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    subtotal,
    shipping,
    total,
    orderNumber: generateOrderNumber(),
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod ?? "cod",
    notes: payload.notes ?? ""
  });

  for (const item of cart.items) {
    await ProductModel.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    );
  }

  await CartModel.deleteOne({ _id: cart._id });

  return { ok: true as const, data: { order: order.toObject() } };
}

export async function getCustomerOrders(storeId: string, customerId: string) {
  await connectDatabase();
  const orders = await OrderModel.find({ storeId, customerId })
    .sort({ createdAt: -1 })
    .lean() as any[];
  return { ok: true as const, data: { orders } };
}

export async function getOrderById(orderId: string, customerId: string) {
  await connectDatabase();
  const order = await OrderModel.findOne({ _id: orderId, customerId }).lean() as any;
  if (!order) return { ok: false as const, message: "Order not found" };
  return { ok: true as const, data: { order } };
}
