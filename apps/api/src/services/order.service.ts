import { connectDatabase } from "../config/database.js";
import { OrderModel } from "../models/order.model.js";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";
import { DeliveryZoneModel } from "../models/delivery-zone.model.js";

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
    deliveryZoneId?: string;
    notes?: string;
  }
) {
  await connectDatabase();

  const cart = await CartModel.findOne({ storeId, customerId });
  if (!cart || cart.items.length === 0) {
    return { ok: false as const, message: "Cart is empty" };
  }

  const subtotal = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  let deliveryCharge = 0;
  let deliveryZoneName = "";
  if (payload.deliveryZoneId) {
    const zone = await DeliveryZoneModel.findOne({
      _id: payload.deliveryZoneId,
      storeId,
      enabled: true,
    }).lean() as any;
    if (zone) {
      deliveryCharge = zone.charge;
      deliveryZoneName = zone.name;
    }
  }

  const total = subtotal + deliveryCharge;

  const order = await OrderModel.create({
    storeId,
    customerId,
    items: cart.items.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    subtotal,
    deliveryCharge,
    deliveryZone: deliveryZoneName,
    shipping: deliveryCharge,
    total,
    orderNumber: generateOrderNumber(),
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod ?? "cod",
    notes: payload.notes ?? "",
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
