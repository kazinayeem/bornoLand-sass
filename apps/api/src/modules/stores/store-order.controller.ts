import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";
import { generateOrderInvoice } from "../orders/order-invoice.service.js";
import { sendEmail } from "../../common/integrations/email.js";
import { createCustomerNotification } from "../customers/customer-notification.service.js";

function getPopulatedCustomerId(customerRef: { _id?: unknown } | string | undefined) {
  if (customerRef && typeof customerRef === "object" && customerRef._id) return String(customerRef._id);
  return customerRef ? String(customerRef) : "";
}

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

    const validStatuses = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded", "partial_refund"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const before = await OrderModel.findOne({ _id: id, storeId }).lean() as { status?: string; paymentStatus?: string; orderNumber?: string } | null;
    const actor = request.user?.userId || "admin";
    const note = (request.body as { note?: string; courier?: string; trackingNumber?: string; estimatedDelivery?: string }).note
      ?? `Status changed to ${status}`;
    const extras = request.body as { courier?: string; trackingNumber?: string; estimatedDelivery?: string };
    const $set: Record<string, unknown> = { status };
    if (typeof extras.courier === "string") $set.courier = extras.courier;
    if (typeof extras.trackingNumber === "string") $set.trackingNumber = extras.trackingNumber;
    if (typeof extras.estimatedDelivery === "string") $set.estimatedDelivery = extras.estimatedDelivery;

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      {
        $set,
        $push: {
          timeline: {
            status,
            note,
            createdBy: actor,
            updatedBy: actor,
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

    try {
      const customerRef = (order as { customerId?: { _id?: unknown } | string }).customerId;
      const customerId = getPopulatedCustomerId(customerRef);
      if (customerId) {
        const { syncCustomerOrderStats } = await import("../customers/customer.service.js");
        await syncCustomerOrderStats(String(storeId), customerId);
        await createCustomerNotification({
          customerId,
          storeId: String(storeId),
          type: status === "cancelled" ? "order" : status === "delivered" ? "order" : "shipping",
          icon:
            status === "cancelled"
              ? "x-circle"
              : status === "delivered"
                ? "check-circle"
                : status === "shipped" || status === "out_for_delivery"
                  ? "truck"
                  : "package",
          priority: status === "cancelled" ? "high" : "medium",
          title: `Order update: ${before?.orderNumber ?? "Order"}`,
          message:
            before?.status && before.status !== status
              ? `Status changed: ${before.status} -> ${status}`
              : `Order status changed to ${status}`,
          link: `/orders/${String(id)}`,
          metadata: { orderId: String(id), orderNumber: before?.orderNumber ?? "", previousStatus: before?.status ?? "", status },
        });
      }
    } catch (err) {
      console.error("[orders] Failed to sync customer stats after status change", err);
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

    const validStatuses = ["pending", "paid", "partial", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return response.status(400).json({ message: `Invalid payment status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const before = await OrderModel.findOne({ _id: id, storeId }).lean() as { status?: string; paymentStatus?: string; orderNumber?: string } | null;
    const actor = request.user?.userId || "admin";
    const timelineStatus = paymentStatus === "paid" ? "paid" : paymentStatus === "pending" ? "payment_pending" : paymentStatus;

    const order = await OrderModel.findOneAndUpdate(
      { _id: id, storeId },
      {
        $set: { paymentStatus },
        $push: {
          timeline: {
            status: timelineStatus,
            note: (request.body as { note?: string }).note
              ?? (paymentStatus === "paid" ? "Payment received" : `Payment status: ${paymentStatus}`),
            createdBy: actor,
            updatedBy: actor,
          },
        },
      },
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

    try {
      const customerId = getPopulatedCustomerId((order as { customerId?: { _id?: unknown } | string }).customerId);
      if (customerId) {
        await createCustomerNotification({
          customerId,
          storeId: String(storeId),
          type: "payment",
          icon: paymentStatus === "paid" ? "credit-card" : "wallet",
          priority: paymentStatus === "failed" ? "high" : "medium",
          title: `Payment update: ${before?.orderNumber ?? "Order"}`,
          message:
            before?.paymentStatus && before.paymentStatus !== paymentStatus
              ? `Payment status changed: ${before.paymentStatus} -> ${paymentStatus}`
              : `Payment status changed to ${paymentStatus}`,
          link: `/orders/${String(id)}`,
          metadata: { orderId: String(id), orderNumber: before?.orderNumber ?? "", previousPaymentStatus: before?.paymentStatus ?? "", paymentStatus },
        });
      }
    } catch (err) {
      console.error("[orders] Failed to create customer payment notification", err);
    }

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

    try {
      const customerId = getPopulatedCustomerId((order as { customerId?: { _id?: unknown } | string } | null)?.customerId);
      if (customerId) {
        await createCustomerNotification({
          customerId,
          storeId: String(storeId),
          type: "payment",
          icon: "rotate-ccw",
          priority: "high",
          title: `Refund update: ${(order as { orderNumber?: string } | null)?.orderNumber ?? "Order"}`,
          message: status === "partial_refund" ? `A partial refund of ${refundAmount} was processed.` : `A refund of ${refundAmount} was processed.`,
          link: `/orders/${String(id)}`,
          metadata: { orderId: String(id), refundAmount, status },
        });
      }
    } catch (err) {
      console.error("[orders] Failed to create customer refund notification", err);
    }

    response.json({ data: { order } });
  } catch (error) {
    console.error("Process refund error:", error);
    response.status(500).json({ message: "Failed to process refund" });
  }
}

export async function downloadStoreOrderInvoiceController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const userId = request.user?.userId;

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const result = await generateOrderInvoice({
      storeId: String(storeId),
      orderId: String(id),
    });

    if (!result.ok) {
      const statusCode = result.message.includes("not found") ? 404 : 500;
      return response.status(statusCode).json({ message: result.message });
    }

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    response.setHeader("Content-Length", result.buffer.length);
    return response.send(result.buffer);
  } catch (error) {
    console.error("Download store order invoice error:", error);
    response.status(500).json({ message: "Failed to generate invoice" });
  }
}

export async function emailStoreOrderInvoiceController(request: AuthRequest, response: Response) {
  try {
    const { storeId, id } = request.params;
    const userId = request.user?.userId;
    const { email } = (request.body || {}) as { email?: string };

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) {
      return response.status(404).json({ message: "Store not found" });
    }

    const result = await generateOrderInvoice({
      storeId: String(storeId),
      orderId: String(id),
    });

    if (!result.ok) {
      const statusCode = result.message.includes("not found") ? 404 : 500;
      return response.status(statusCode).json({ message: result.message });
    }

    const customer = result.order.customerId as { email?: string; name?: string } | string | undefined;
    const customerEmail =
      email?.trim() ||
      (typeof customer === "object" && customer?.email ? customer.email : "");

    if (!customerEmail) {
      return response.status(400).json({ message: "No customer email found" });
    }

    const invoiceNumber = result.order.invoiceNumber || result.filename;
    const orderNumber = result.order.orderNumber || id;

    await sendEmail({
      to: customerEmail,
      subject: `Invoice ${invoiceNumber} — ${store.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Invoice ${invoiceNumber}</h2>
          <p>Your invoice for order <strong>${orderNumber}</strong> from <strong>${store.name}</strong> is attached.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Powered by BornoLand</p>
        </div>
      `,
      attachments: [
        {
          filename: result.filename,
          content: result.buffer,
          contentType: "application/pdf",
        },
      ],
    });

    return response.json({ data: { sent: true, email: customerEmail } });
  } catch (error) {
    console.error("Email store order invoice error:", error);
    response.status(500).json({ message: "Failed to email invoice" });
  }
}
