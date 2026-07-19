"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  Copy,
  ArrowLeft,
  FileText,
  Calendar,
  CreditCard,
  User,
  Store,
  ExternalLink,
  Clock,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/access-token";
import { getApiUrl } from "@/lib/urls";

type Invoice = {
  _id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  vatAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  duration: string;
  gateway: string;
  transactionId: string;
  senderNumber: string;
  issuedAt: string;
  paidAt: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  planId?: { name: string; slug: string } | string;
  storeId?: { name: string; slug: string; subdomain: string } | string;
  userId?: { name: string; email: string; phone?: string } | string;
  approvedBy?: { name: string } | string;
  companyName: string;
  companyWebsite: string;
  companyEmail: string;
  verificationCode: string;
};

function formatBDT(amount: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `BDT ${amount.toLocaleString()}`;
  }
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  paid: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  rejected: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  refunded: { label: "Cancelled", color: "text-zinc-600", bg: "bg-zinc-50", border: "border-zinc-200", icon: AlertTriangle },
};

export function InvoiceVerifyClient({ invoice, token }: { invoice: Invoice | null; token: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!invoice) return;
    const apiBase = getApiUrl();
    const token = getAccessToken();
    try {
      const res = await fetch(`${apiBase}/invoices/${invoice._id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to download. Please sign in first.");
    }
  }, [invoice]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Invalid / Not Found ───────────────────────────────────────────────────

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Invalid Invoice</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This invoice verification link is invalid or the invoice does not exist.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Valid Invoice ──────────────────────────────────────────────────────────

  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const planName = typeof invoice.planId === "object" ? invoice.planId?.name : "—";
  const storeName = typeof invoice.storeId === "object" ? invoice.storeId?.name : "—";
  const storeSlug = typeof invoice.storeId === "object" ? invoice.storeId?.slug : "";
  const customerName = typeof invoice.userId === "object" ? invoice.userId?.name : "—";
  const customerEmail = typeof invoice.userId === "object" ? invoice.userId?.email : "—";
  const approvedByName = typeof invoice.approvedBy === "object" ? invoice.approvedBy?.name : "—";

  const baseUrl = getApiUrl();
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invoices/verify/${token}`;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Print-only header */}
      <div className="hidden print:block print:min-h-0 print:bg-white print:p-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-600" />
            <span className="text-sm font-semibold text-zinc-900">BornoLand</span>
          </div>
          <span className="text-xs text-zinc-500">Invoice Verification</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 print:max-w-none print:px-0 print:py-0">
        {/* Status Banner */}
        <div className={`mb-8 rounded-2xl border ${status.border} ${status.bg} p-6 text-center print:mb-4 print:p-3`}>
          <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${status.bg} print:h-10 print:w-10`}>
            <StatusIcon className={`h-8 w-8 ${status.color} print:h-6 print:w-6`} />
          </div>
          <h1 className={`text-2xl font-bold ${status.color} print:text-lg`}>
            Invoice {status.label}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 print:text-xs">
            {invoice.invoiceNumber}
          </p>
        </div>

        {/* Invoice Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm print:shadow-none print:border-zinc-200">
          {/* Header */}
          <div className="border-b border-zinc-100 px-6 py-5 print:px-4 print:py-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-zinc-400" />
                  <h2 className="text-lg font-bold text-zinc-900">{invoice.invoiceNumber}</h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{invoice.companyName || "BornoLand"}</p>
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.border} ${status.bg} ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-0 border-b border-zinc-100 sm:grid-cols-2 print:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4 border-b border-zinc-100 p-6 sm:border-b-0 sm:border-r print:p-4">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Store className="h-3.5 w-3.5" />
                  Store
                </h3>
                <p className="text-sm font-semibold text-zinc-900">{storeName}</p>
                {storeSlug && (
                  <p className="text-xs text-zinc-500">{storeSlug}.bornoland.com</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <User className="h-3.5 w-3.5" />
                  Customer
                </h3>
                <p className="text-sm font-semibold text-zinc-900">{customerName}</p>
                <p className="text-xs text-zinc-500">{customerEmail}</p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <CreditCard className="h-3.5 w-3.5" />
                  Payment
                </h3>
                <p className="text-sm font-semibold text-zinc-900">
                  {invoice.gateway ? invoice.gateway.charAt(0).toUpperCase() + invoice.gateway.slice(1) : "—"}
                </p>
                {invoice.transactionId && (
                  <p className="font-mono text-xs text-zinc-500">{invoice.transactionId}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 p-6 print:p-4">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <FileText className="h-3.5 w-3.5" />
                  Plan
                </h3>
                <p className="text-sm font-semibold text-zinc-900">{planName}</p>
                <p className="text-xs text-zinc-500 capitalize">{invoice.duration?.replace("_", " ")}</p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Dates
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Issued</span>
                    <span className="font-medium text-zinc-900">{formatDate(invoice.issuedAt)}</span>
                  </div>
                  {invoice.paidAt && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Paid</span>
                      <span className="font-medium text-zinc-900">{formatDate(invoice.paidAt)}</span>
                    </div>
                  )}
                  {invoice.billingPeriodEnd && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Renewal</span>
                      <span className="font-medium text-zinc-900">{formatDate(invoice.billingPeriodEnd)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Approved By
                </h3>
                <p className="text-sm font-medium text-zinc-900">{approvedByName}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="px-6 py-5 print:px-4 print:py-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-900">{formatBDT(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Discount</span>
                  <span className="text-emerald-600">-{formatBDT(invoice.discount)}</span>
                </div>
              )}
              {invoice.vatAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">VAT</span>
                  <span className="text-zinc-900">{formatBDT(invoice.vatAmount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tax</span>
                  <span className="text-zinc-900">{formatBDT(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
                <span className="text-zinc-900">Total</span>
                <span className="text-zinc-900">{formatBDT(invoice.total)}</span>
              </div>
              {invoice.paidAt && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Paid</span>
                    <span className="font-medium text-emerald-600">{formatBDT(invoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Remaining</span>
                    <span className="font-bold text-emerald-600">{formatBDT(0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-zinc-100 px-6 py-4 print:hidden">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={() => copyToClipboard(invoice.invoiceNumber, "Invoice ID")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                <Copy className="h-4 w-4" />
                {copied === "Invoice ID" ? "Copied!" : "Copy Invoice ID"}
              </button>
              <button
                onClick={() => copyToClipboard(verificationUrl, "Verification Link")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50"
              >
                <ExternalLink className="h-4 w-4" />
                {copied === "Verification Link" ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-400 print:mt-4">
          <p>Powered by BornoLand · bornoland.com · support@bornoland.com</p>
          <p className="mt-1">
            Generated on {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </div>
  );
}
