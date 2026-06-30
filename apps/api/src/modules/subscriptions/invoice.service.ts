import { connectDatabase } from "../../common/database/connection.js";
import { InvoiceModel } from "./invoice.model.js";
import { getPlatformSettings } from "../settings/platform-settings.service.js";
import type { SubscriptionDuration } from "./subscription.constants.js";

async function nextInvoiceNumber(prefix: string) {
  const count = await InvoiceModel.countDocuments();
  return `${prefix}${String(count + 1).padStart(6, "0")}`;
}

export async function createInvoice(input: {
  tenantId: string;
  storeId: string;
  userId: string;
  planId: string;
  subscriptionId?: string;
  paymentId?: string;
  duration: SubscriptionDuration;
  subtotal: number;
}) {
  await connectDatabase();
  const settings = await getPlatformSettings();
  const vatPercent = settings.vatPercent ?? 0;
  const taxPercent = settings.taxPercent ?? 0;
  const vatAmount = Math.round((input.subtotal * vatPercent) / 100);
  const taxAmount = Math.round((input.subtotal * taxPercent) / 100);
  const total = input.subtotal + vatAmount + taxAmount;

  const invoice = await InvoiceModel.create({
    invoiceNumber: await nextInvoiceNumber(settings.invoicePrefix ?? "INV-"),
    tenantId: input.tenantId,
    storeId: input.storeId,
    userId: input.userId,
    planId: input.planId,
    subscriptionId: input.subscriptionId,
    paymentId: input.paymentId,
    duration: input.duration,
    subtotal: input.subtotal,
    vatAmount,
    taxAmount,
    total,
    currency: settings.currencyCode ?? "BDT",
    companyName: settings.companyName ?? settings.platformName ?? "BornoLand",
    companyLogo: settings.invoiceLogo ?? settings.platformLogo ?? "",
    status: "paid",
    paidAt: new Date(),
  });

  return invoice.toObject();
}

export async function listStoreInvoices(storeId: string, userId: string) {
  await connectDatabase();
  const invoices = await InvoiceModel.find({ storeId, userId }).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { invoices } };
}

export async function listAllInvoices() {
  await connectDatabase();
  const invoices = await InvoiceModel.find()
    .populate("storeId", "name slug")
    .populate("userId", "name email")
    .populate("planId", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  return { ok: true as const, data: { invoices } };
}

export async function getInvoiceById(invoiceId: string, userId: string) {
  await connectDatabase();
  const invoice = await InvoiceModel.findOne({ _id: invoiceId, userId })
    .populate("planId", "name slug priceBDT")
    .populate("storeId", "name slug")
    .lean();
  if (!invoice) return { ok: false as const, message: "Invoice not found" };
  return { ok: true as const, data: { invoice } };
}
