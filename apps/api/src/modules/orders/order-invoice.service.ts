import { connectDatabase } from "../../common/database/connection.js";
import { OrderModel } from "../../models/order.model.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { StoreContactModel } from "../stores/store-contact.model.js";
import { generateOrderInvoicePdf } from "./order-invoice-pdf.service.js";

function generateInvoiceNumber(prefix: string): string {
  const cleanPrefix = (prefix || "INV").trim().replace(/[^A-Za-z0-9_-]/g, "").toUpperCase() || "INV";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanPrefix}-${ts}-${rand}`;
}

export async function generateOrderInvoice(params: {
  storeId: string;
  orderId: string;
  customerId?: string;
  verificationUrl?: string;
}) {
  try {
    await connectDatabase();

    const store = await StoreModel.findOne({ _id: params.storeId }).lean();
    if (!store) {
      return { ok: false as const, message: "Store not found" };
    }

    const orderQuery: Record<string, unknown> = {
      _id: params.orderId,
      storeId: params.storeId,
    };
    if (params.customerId) orderQuery.customerId = params.customerId;

    const order = await OrderModel.findOne(orderQuery).populate("customerId", "name email phone");
    if (!order) {
      return { ok: false as const, message: "Order not found" };
    }

    const [storeContact, storeSettings] = await Promise.all([
      StoreContactModel.findOne({ storeId: params.storeId }).lean(),
      StoreSettingsModel.findOne({ storeId: params.storeId }).lean(),
    ]);

    if (!order.invoiceNumber) {
      order.invoiceNumber = generateInvoiceNumber(storeSettings?.invoicePrefix ?? "INV");
      await order.save();
    }

    const buffer = await generateOrderInvoicePdf({
      order: order.toObject() as never,
      store: store as never,
      storeContact: storeContact as never,
      storeSettings: storeSettings as never,
      verificationUrl: params.verificationUrl,
    });

    return {
      ok: true as const,
      buffer,
      filename: `invoice-${order.invoiceNumber}.pdf`,
      order: order.toObject(),
    };
  } catch (error) {
    console.error("[orders] Failed to generate order invoice", error);
    return { ok: false as const, message: "Failed to generate invoice PDF" };
  }
}
