import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";

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

    const validStatuses = ["pending", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled", "refunded", "partial_refund"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const before = await OrderModel.findOne({ _id: id, storeId }).lean() as { status?: string; paymentStatus?: string; orderNumber?: string } | null;

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      {
        $set: { status },
        $push: {
          timeline: {
            status,
            note: (request.body as { note?: string }).note ?? `Status changed to ${status}`,
            createdBy: request.user?.userId ?? "admin",
          },
        },
      },
      { new: true }
    ).populate("customerId", "name email phone").lean();

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    const action =
      status === "delivered" ? AUDIT_ACTIONS.ORDER_DELIVERED
        : status === "cancelled" ? AUDIT_ACTIONS.ORDER_CANCELLED
          : status === "refunded" || status === "partial_refund" ? AUDIT_ACTIONS.ORDER_REFUNDED
            : AUDIT_ACTIONS.ORDER_STATUS_CHANGED;

    await recordAuditFromRequest(request, {
      action,
      module: AUDIT_MODULES.ORDERS,
      entityType: "Order",
      entityId: String(id),
      entityName: (order as { orderNumber?: string }).orderNumber,
      storeId: String(storeId),
      oldValue: { status: before?.status },
      newValue: { status },
    });

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

    const validStatuses = ["pending", "paid", "partial", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return response.status(400).json({ message: `Invalid payment status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const before = await OrderModel.findOne({ _id: id, storeId }).lean() as { status?: string; paymentStatus?: string; orderNumber?: string } | null;

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      { paymentStatus },
      { new: true }
    ).populate("customerId", "name email phone").lean();

    if (!order) {
      return response.status(404).json({ message: "Order not found" });
    }

    await recordAuditFromRequest(request, {
      action: paymentStatus === "paid" ? AUDIT_ACTIONS.ORDER_PAID : AUDIT_ACTIONS.ORDER_STATUS_CHANGED,
      module: AUDIT_MODULES.ORDERS,
      entityType: "Order",
      entityId: String(id),
      entityName: (order as { orderNumber?: string }).orderNumber,
      storeId: String(storeId),
      oldValue: { paymentStatus: before?.paymentStatus },
      newValue: { paymentStatus },
    });

    response.json({ data: { order } });
  } catch (error) {
    console.error("Update payment status error:", error);
    response.status(500).json({ message: "Failed to update payment status" });
  }
}

export async function addOrderNoteController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const { body, type = "internal" } = request.body as { body?: string; type?: string };
    const userId = request.user?.userId;
    if (!body) return response.status(400).json({ message: "Note body required" });

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) return response.status(404).json({ message: "Store not found" });

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      {
        $push: {
          orderNotes: {
            body,
            type: type === "customer" ? "customer" : "internal",
            createdBy: request.user?.userId ?? "admin",
          },
        },
      },
      { new: true }
    ).lean();

    if (!order) return response.status(404).json({ message: "Order not found" });
    response.json({ data: { order } });
  } catch (error) {
    console.error("Add order note error:", error);
    response.status(500).json({ message: "Failed to add order note" });
  }
}

export async function processRefundController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const { amount, partial } = request.body as { amount?: number; partial?: boolean };
    const userId = request.user?.userId;

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) return response.status(404).json({ message: "Store not found" });

    const existing = await OrderModel.findOne({ _id: id, storeId }).lean() as { total?: number; refundAmount?: number } | null;
    if (!existing) return response.status(404).json({ message: "Order not found" });

    const refundAmount = amount ?? existing.total ?? 0;
    const newRefundTotal = (existing.refundAmount ?? 0) + refundAmount;
    const status = partial || newRefundTotal < (existing.total ?? 0) ? "partial_refund" : "refunded";

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      {
        $set: { status, paymentStatus: "refunded", refundAmount: newRefundTotal },
        $push: {
          timeline: {
            status,
            note: `Refund processed: ${refundAmount}`,
            createdBy: request.user?.userId ?? "admin",
          },
        },
      },
      { new: true }
    ).lean();

    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.ORDER_REFUNDED,
      module: AUDIT_MODULES.ORDERS,
      entityType: "Order",
      entityId: String(id),
      entityName: (order as { orderNumber?: string } | null)?.orderNumber,
      storeId: String(storeId),
      newValue: { refundAmount, status },
    });

    response.json({ data: { order } });
  } catch (error) {
    console.error("Process refund error:", error);
    response.status(500).json({ message: "Failed to process refund" });
  }
}
