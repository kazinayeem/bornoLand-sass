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
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/access-token";
import { getApiUrl } from "@/lib/urls";
import { amountInWords } from "@/lib/amount-in-words";

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
  return new Date(d).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoiceVerifyClient({
  invoice,
  token,
}: {
  invoice: Invoice | null;
  token: string;
}) {

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

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Invalid Invoice</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This invoice verification link is invalid or the invoice does not exist.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const planName = typeof invoice.planId === "object" ? invoice.planId?.name : "Subscription Plan";
  const storeName = typeof invoice.storeId === "object" ? invoice.storeId?.name : "Store Workspace";
  const customerName = typeof invoice.userId === "object" ? invoice.userId?.name : "Customer";
  const customerEmail = typeof invoice.userId === "object" ? invoice.userId?.email : "";
  const customerPhone = typeof invoice.userId === "object" ? invoice.userId?.phone : "";
  const isPaid = invoice.status === "paid";
  const currency = invoice.currency || "BDT";
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invoice/verify/${token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    verificationUrl,
  )}`;

  return (
    <div className="min-h-screen bg-zinc-100/70 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:min-h-0">
      {/* Top Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <button
            onClick={() => copyToClipboard(invoice.invoiceNumber, "Invoice ID")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-all"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied === "Invoice ID" ? "Copied!" : "Copy ID"}
          </button>
          <button
            onClick={() => copyToClipboard(verificationUrl, "Verification Link")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {copied === "Verification Link" ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Main A4 Document */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden print:border-0 print:shadow-none print:rounded-none print:m-0 print:p-0 print:max-w-none">
        <div className="p-8 sm:p-12 print:p-6 text-zinc-800 space-y-8 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-200/80 pb-8">
            <div className="space-y-2 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-base">
                  B
                </div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Bornoland SaaS</h1>
              </div>
              <p className="text-xs text-zinc-500">Dhaka, Bangladesh · support@bornoland.com</p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight uppercase">
                INVOICE
              </h2>
              <p className="text-xs font-semibold text-zinc-900">
                <span className="text-zinc-400 font-normal">Invoice No: </span>
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs text-zinc-600">
                <span className="text-zinc-400">Issued: </span>
                {formatDate(invoice.issuedAt)}
              </p>
              {invoice.paidAt && (
                <p className="text-xs text-zinc-600">
                  <span className="text-zinc-400">Paid: </span>
                  {formatDate(invoice.paidAt)}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Workspace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                BILLED TO
              </span>
              <p className="text-sm font-bold text-zinc-900">{customerName}</p>
              {customerEmail && <p className="text-xs text-zinc-600">{customerEmail}</p>}
              {customerPhone && <p className="text-xs text-zinc-600">{customerPhone}</p>}
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                WORKSPACE / STORE
              </span>
              <p className="text-sm font-bold text-zinc-900">{storeName}</p>
              <p className="text-xs text-zinc-600">{planName} Subscription</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-3 text-center w-10">#</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-3 text-center">DURATION</th>
                  <th className="py-3 px-4 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-zinc-50/40 transition-colors">
                  <td className="py-4 px-3 text-center text-zinc-400">1</td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-zinc-900">{planName} Subscription</p>
                    <p className="text-[11px] text-zinc-500">
                      {formatDate(invoice.billingPeriodStart)} – {formatDate(invoice.billingPeriodEnd)}
                    </p>
                  </td>
                  <td className="py-4 px-3 text-center font-medium text-zinc-700 capitalize">
                    {invoice.duration?.replace("_", " ") || "Monthly"}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-zinc-900">
                    {formatBDT(invoice.subtotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & QR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            <div className="md:col-span-7 space-y-4">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  AMOUNT IN WORDS
                </span>
                <p className="text-xs font-semibold text-zinc-800 leading-relaxed">
                  {amountInWords(invoice.total, currency)}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 flex items-center gap-4">
                <img
                  src={qrImageUrl}
                  alt="Verification QR"
                  className="h-16 w-16 rounded-lg border border-zinc-200 bg-white p-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    VERIFY INVOICE
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Scan this QR code to verify this official invoice online.
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate max-w-xs">{verificationUrl}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-2">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/30 p-5 space-y-3 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900">{formatBDT(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatBDT(invoice.discount)}</span>
                  </div>
                )}
                {invoice.vatAmount > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>VAT</span>
                    <span className="font-medium text-zinc-900">{formatBDT(invoice.vatAmount)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Tax</span>
                    <span className="font-medium text-zinc-900">{formatBDT(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="border-t border-zinc-200/80 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-zinc-900">Total</span>
                  <span className="text-base font-extrabold text-zinc-900">
                    {formatBDT(invoice.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-400">
            <span>Page 1 of 1</span>
            <span className="font-medium text-zinc-600">Thank you for your business.</span>
            <span>Powered by Bornoland</span>
          </div>
        </div>
      </div>
    </div>
  );
}
