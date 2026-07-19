import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { InvoiceModel, InvoiceCounterModel } from "./invoice.model.js";
import { StoreModel } from "../../models/store.model.js";
import { UserModel } from "../../models/user.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { getPlatformSettings } from "../settings/platform-settings.service.js";
import type { SubscriptionDuration } from "./subscription.constants.js";
import { DURATION_LABELS } from "./subscription.constants.js";

// ─── Sequential invoice number ───────────────────────────────────────────────

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counter = await InvoiceCounterModel.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );
  return `INV-${year}-${String(counter.count).padStart(6, "0")}`;
}

// ─── Verify invoice number uniqueness (safety net) ───────────────────────────

async function generateUniqueInvoiceNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const invNum = await nextInvoiceNumber();
    const exists = await InvoiceModel.findOne({ invoiceNumber: invNum });
    if (!exists) return invNum;
  }
  return `INV-${Date.now()}`;
}

// ─── Timeline helpers ────────────────────────────────────────────────────────

function makeTimelineEvent(event: string, date: Date, description?: string) {
  return { event, date, description: description ?? "" };
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
  discount?: number;
  gateway?: string;
  transactionId?: string;
  senderNumber?: string;
  approvedBy?: string;
  paidAt?: Date;
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
}) {
  await connectDatabase();

  const settings = await getPlatformSettings();
  const vatPercent = settings.vatPercent ?? 0;
  const taxPercent = settings.taxPercent ?? 0;
  const discountAmount = input.discount ?? 0;
  const vatAmount = Math.round((input.subtotal * vatPercent) / 100);
  const taxAmount = Math.round((input.subtotal * taxPercent) / 100);
  const total = input.subtotal - discountAmount + vatAmount + taxAmount;

  const verificationCode = crypto.randomBytes(16).toString("hex");

  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 7);

  const timeline = [
    makeTimelineEvent("invoice_created", now, "Invoice generated"),
  ];
  if (input.paidAt) {
    timeline.push(makeTimelineEvent("payment_received", input.paidAt, "Payment received"));
    timeline.push(makeTimelineEvent("payment_approved", input.paidAt, "Payment approved by admin"));
    timeline.push(makeTimelineEvent("subscription_activated", input.paidAt, "Subscription activated"));
  }

  const invoice = await InvoiceModel.create({
    invoiceNumber: await generateUniqueInvoiceNumber(),
    tenantId: input.tenantId,
    storeId: input.storeId,
    userId: input.userId,
    planId: input.planId,
    subscriptionId: input.subscriptionId,
    paymentId: input.paymentId,
    duration: input.duration,
    subtotal: input.subtotal,
    discount: discountAmount,
    vatAmount,
    taxAmount,
    total,
    currency: settings.currencyCode ?? "BDT",
    status: input.paidAt ? "paid" : "pending",
    gateway: input.gateway ?? "",
    transactionId: input.transactionId ?? "",
    senderNumber: input.senderNumber ?? "",
    approvedBy: input.approvedBy ?? undefined,
    approvedAt: input.paidAt ?? undefined,
    issuedAt: now,
    paidAt: input.paidAt ?? undefined,
    dueDate,
    billingPeriodStart: input.billingPeriodStart ?? undefined,
    billingPeriodEnd: input.billingPeriodEnd ?? undefined,
    companyName: settings.companyName ?? settings.platformName ?? "BornoLand",
    companyLogo: settings.invoiceLogo ?? settings.platformLogo ?? "",
    companyAddress: settings.companyAddress ?? "",
    companyPhone: settings.supportPhone ?? "",
    companyEmail: settings.supportEmail ?? "",
    companyWebsite: settings.companyWebsite ?? "",
    companyTaxId: settings.companyTaxId ?? "",
    timeline,
    verificationCode,
  });

  return invoice.toObject();
}

// ─── Get single invoice (store owner) ────────────────────────────────────────

export async function getInvoiceById(invoiceId: string, userId: string) {
  await connectDatabase();
  const invoice = await InvoiceModel.findOne({ _id: invoiceId, userId })
    .populate("planId", "name slug priceBDT")
    .populate("storeId", "name slug subdomain")
    .populate("userId", "name email phone")
    .populate("approvedBy", "name email")
    .lean();
  if (!invoice) return { ok: false as const, message: "Invoice not found" };
  return { ok: true as const, data: { invoice } };
}

// ─── Get invoice by store slug + invoiceId (store owner) ─────────────────────

export async function getInvoiceByStoreSlug(storeSlug: string, invoiceId: string, userId: string) {
  await connectDatabase();
  const store = (await StoreModel.findOne({ slug: storeSlug, userId }).lean()) as Record<string, unknown> | null;
  if (!store) return { ok: false as const, message: "Store not found" };

  const invoice = await InvoiceModel.findOne({ _id: invoiceId, storeId: store._id as string, userId })
    .populate("planId", "name slug priceBDT pricing description features")
    .populate("storeId", "name slug subdomain domain customDomain")
    .populate("userId", "name email phone")
    .populate("approvedBy", "name email")
    .populate("paymentId")
    .lean();
  if (!invoice) return { ok: false as const, message: "Invoice not found" };
  return { ok: true as const, data: { invoice, store } };
}

// ─── List invoices for a store ───────────────────────────────────────────────

export async function listStoreInvoices(storeId: string, userId: string) {
  await connectDatabase();
  const invoices = await InvoiceModel.find({ storeId, userId })
    .populate("planId", "name slug")
    .populate("storeId", "name slug")
    .sort({ createdAt: -1 })
    .lean();
  return { ok: true as const, data: { invoices } };
}

// ─── List all invoices (admin) ───────────────────────────────────────────────

export async function listAllInvoices(status?: string) {
  await connectDatabase();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const invoices = await InvoiceModel.find(filter)
    .populate("storeId", "name slug subdomain")
    .populate("userId", "name email")
    .populate("planId", "name slug")
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
  return { ok: true as const, data: { invoices } };
}

// ─── Get invoice by verification code (public) ───────────────────────────────

export async function verifyInvoice(verificationCode: string) {
  await connectDatabase();
  const invoice = await InvoiceModel.findOne({ verificationCode })
    .populate("planId", "name slug")
    .populate("storeId", "name slug subdomain")
    .populate("userId", "name email")
    .populate("approvedBy", "name")
    .lean();
  if (!invoice) return { ok: false as const, message: "Invoice not found or invalid verification code" };
  return { ok: true as const, data: { invoice } };
}

// ─── Update invoice status (admin) ───────────────────────────────────────────

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "paid" | "pending" | "rejected" | "refunded",
  adminUserId: string
) {
  await connectDatabase();
  const invoice = await InvoiceModel.findById(invoiceId);
  if (!invoice) return { ok: false as const, message: "Invoice not found" };

  invoice.status = status;
  invoice.approvedBy = adminUserId as never;
  invoice.approvedAt = new Date();
  if (status === "paid" && !invoice.paidAt) {
    invoice.paidAt = new Date();
  }
  await invoice.save();
  return { ok: true as const, data: { invoice: invoice.toObject() } };
}

// ─── Regenerate verification token (admin) ──────────────────────────────────

export async function regenerateVerificationToken(invoiceId: string) {
  await connectDatabase();
  const invoice = await InvoiceModel.findById(invoiceId);
  if (!invoice) return { ok: false as const, message: "Invoice not found" };

  invoice.verificationCode = crypto.randomBytes(16).toString("hex");
  await invoice.save();
  return { ok: true as const, data: { invoice: invoice.toObject() } };
}

// ─── Search invoices (admin) ────────────────────────────────────────────────

export async function searchInvoices(params: {
  status?: string;
  storeId?: string;
  planId?: string;
  gateway?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await connectDatabase();

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.storeId) filter.storeId = params.storeId;
  if (params.planId) filter.planId = params.planId;
  if (params.gateway) filter.gateway = params.gateway;
  if (params.search) {
    filter.$or = [
      { invoiceNumber: { $regex: params.search, $options: "i" } },
      { transactionId: { $regex: params.search, $options: "i" } },
    ];
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    InvoiceModel.find(filter)
      .populate("planId", "name slug")
      .populate("storeId", "name slug subdomain")
      .populate("userId", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InvoiceModel.countDocuments(filter),
  ]);

  return {
    ok: true as const,
    data: {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
