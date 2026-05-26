import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { OrderModel } from "../models/order.model.js";
import { StoreModel } from "../models/store.model.js";

export async function listStoreOrdersController(request: AuthRequest, response: Response) {
  try {
    const { storeId } = request.params;
    const userId = request.user?.userId;
    const { status, paymentStatus, from, to, page = "1", limit = "20", search } = request.query as Record<string, string>;

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const filter: Record<string, unknown> = { storeId };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      filter.createdAt = dateFilter;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("customerId", "name email phone")
        .sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      OrderModel.countDocuments(filter)
    ]);

    const analytics = await OrderModel.aggregate([
      { $match: { storeId: store._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          pendingOrders: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          processingOrders: { $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          paidRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } }
        }
      }
    ]);

    response.json({
      data: {
        orders,
        analytics: analytics[0] ?? {
          totalOrders: 0, totalRevenue: 0, pendingOrders: 0,
          processingOrders: 0, deliveredOrders: 0, cancelledOrders: 0, paidRevenue: 0
        },
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Store orders error:", error);
    response.status(500).json({ message: "Failed to fetch orders" });
  }
}

export async function getStoreOrderController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const userId = request.user?.userId;

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const order = await OrderModel.findOne({ _id: id, storeId })
      .populate("customerId", "name email phone")
      .lean();

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    response.json({ data: { order } });
  } catch (error) {
    console.error("Store order detail error:", error);
    response.status(500).json({ message: "Failed to fetch order" });
  }
}

export async function updateOrderStatusController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const { status } = request.body;
    const userId = request.user?.userId;

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      { status },
      { new: true }
    ).populate("customerId", "name email phone").lean();

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    response.json({ data: { order } });
  } catch (error) {
    console.error("Update order status error:", error);
    response.status(500).json({ message: "Failed to update order status" });
  }
}

export async function updatePaymentStatusController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const { paymentStatus } = request.body;
    const userId = request.user?.userId;

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return response.status(400).json({ message: `Invalid payment status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      { paymentStatus },
      { new: true }
    ).populate("customerId", "name email phone").lean();

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    response.json({ data: { order } });
  } catch (error) {
    console.error("Update payment status error:", error);
    response.status(500).json({ message: "Failed to update payment status" });
  }
}
