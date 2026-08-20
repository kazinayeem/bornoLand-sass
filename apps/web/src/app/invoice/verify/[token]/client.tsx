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
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/access-token";
import { getApiUrl } from "@/lib/urls";
import { amountInWords } from "@/lib/amount-in-words";

function formatCurrency(amount: number, currency = "BDT") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
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

function formatDateTime(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function InvoiceVerifyClient({
  data,
  token,
}: {
  data: { type: string; invoice: Record<string, unknown> } | null;
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
    const inv = data?.invoice;
    if (!inv) return;
    const apiBase = getApiUrl();
    const accessToken = getAccessToken();
    const invId = inv._id as string;
    const isOrder = data?.type === "order";
    try {
      const url = isOrder
        ? `${apiBase}/orders/${invId}/invoice.pdf`
        : `${apiBase}/invoices/${invId}/pdf`;
      const res = await fetch(url, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = `${(inv.invoiceNumber as string) || "invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlObj);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Failed to download. Please sign in first.");
    }
  }, [data]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!data) {
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

  const inv = data.invoice;
  const isOrder = data.type === "order";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verificationUrl = `${baseUrl}/invoice/verify/${token}`;

  return (
    <div className="min-h-screen bg-zinc-100/70 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:min-h-0">
      {/* Top Action Bar (Print-Hidden) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
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
            onClick={() =>
              copyToClipboard(
                (inv.invoiceNumber as string) || (inv.orderNumber as string) || "",
                "Invoice ID",
              )
            }
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

      {/* Main Invoice Document Container (A4 Printable Layout) */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden print:border-0 print:shadow-none print:rounded-none print:m-0 print:p-0 print:max-w-none">
        {isOrder ? (
          <OrderInvoiceView inv={inv} verificationUrl={verificationUrl} />
        ) : (
          <SubscriptionInvoiceView inv={inv} verificationUrl={verificationUrl} />
        )}
      </div>
    </div>
  );
}

function OrderInvoiceView({
  inv,
  verificationUrl,
}: {
  inv: Record<string, unknown>;
  verificationUrl: string;
}) {
  const store = (inv.storeId as Record<string, unknown>) || {};
  const storeName = (store.name as string) || "Store";
  const storeLogo = (store.logoUrl as string) || "";
  const storeAddress = (store.address as string) || "";
  const storePhone = (store.phone as string) || "";
  const storeEmail = (store.email as string) || "";
  const storeWebsite = (store.websiteUrl as string) || "";

  const ship = inv.shippingAddress as Record<string, unknown> | undefined;
  const customerId = inv.customerId as Record<string, unknown> | string | undefined;
  const snapshot = inv.customerSnapshot as Record<string, unknown> | undefined;
  const customerName =
    (snapshot?.name as string) ||
    (typeof customerId === "object" ? (customerId?.name as string) : "") ||
    (ship?.fullName as string) ||
    "";
  const customerEmail =
    (snapshot?.email as string) ||
    (typeof customerId === "object" ? (customerId?.email as string) : "") ||
    "";
  const customerPhone =
    (snapshot?.phone as string) ||
    (typeof customerId === "object" ? (customerId?.phone as string) : "") ||
    (ship?.phone as string) ||
    "";

  const shipRecipient = (ship?.fullName as string) || customerName;
  const shipPhone = (ship?.phone as string) || customerPhone;
  const shipStreet = [ship?.street, ship?.area].map((v) => v?.toString().trim()).filter(Boolean).join(", ");
  const shipCityState = [ship?.city, ship?.state, ship?.zip].map((v) => v?.toString().trim()).filter(Boolean).join(" ");
  const shipCountry = (ship?.country as string) || "";

  const items = (inv.items as Array<Record<string, unknown>>) || [];
  const subtotal = Number(inv.subtotal ?? 0);
  const discount = Number(inv.discount ?? 0);
  const shipping = Number(inv.shipping ?? inv.deliveryCharge ?? 0);
  const tax = Number(inv.tax ?? 0);
  const total = Number(inv.total ?? 0);
  const refund = Number(inv.refundAmount ?? 0);
  const currency = (inv.currencyCode as string) || "BDT";
  const paymentStatus = ((inv.paymentStatus as string) || "pending").toLowerCase();
  const isPaid = paymentStatus === "paid";
  const paidAmount = isPaid ? Math.max(0, total - refund) : 0;
  const dueAmount = isPaid ? 0 : Math.max(0, total - refund);

  const invoiceNo = (inv.invoiceNumber as string) || "";
  const orderNo = (inv.orderNumber as string) || "";
  const invoiceDate = formatDate(inv.createdAt as string);
  const orderDate = formatDate(inv.createdAt as string);
  const paymentMethod = (inv.paymentMethod as string) || "Cash on Delivery";
  const orderStatus = (inv.status as string) || "Confirmed";

  const paymentVerification = inv.paymentVerification as Record<string, unknown> | undefined;
  const paymentDetails = inv.paymentDetails as Record<string, unknown> | undefined;
  const txnId =
    (paymentVerification?.transactionId as string) ||
    (paymentDetails?.transactionId as string) ||
    "";
  const senderNumber =
    (paymentVerification?.senderNumber as string) ||
    (paymentDetails?.senderNumber as string) ||
    "";
  const receiverNumber =
    (paymentVerification?.receiverNumber as string) ||
    (paymentDetails?.receiverNumber as string) ||
    "";

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    verificationUrl,
  )}`;

  return (
    <div className="p-8 sm:p-12 print:p-6 text-zinc-800 space-y-8 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-200/80 pb-8">
        {/* Left: Store Branding */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-3">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="h-10 w-10 object-contain rounded-lg border border-zinc-200"
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-base">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{storeName}</h1>
          </div>
          {storeAddress && <p className="text-xs text-zinc-500 leading-relaxed">{storeAddress}</p>}
          <div className="text-xs text-zinc-500 flex flex-wrap gap-x-2 gap-y-1">
            {storePhone && <span>{storePhone}</span>}
            {storePhone && storeEmail && <span>·</span>}
            {storeEmail && <span>{storeEmail}</span>}
            {(storePhone || storeEmail) && storeWebsite && <span>·</span>}
            {storeWebsite && <span>{storeWebsite}</span>}
          </div>
        </div>

        {/* Right: Invoice Metadata */}
        <div className="text-left sm:text-right space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight uppercase">
            INVOICE
          </h2>
          {invoiceNo && (
            <p className="text-xs font-semibold text-zinc-900">
              <span className="text-zinc-400 font-normal">Invoice No: </span>
              {invoiceNo}
            </p>
          )}
          {orderNo && (
            <p className="text-xs text-zinc-700">
              <span className="text-zinc-400">Order No: </span>
              #{orderNo}
            </p>
          )}
          <p className="text-xs text-zinc-600">
            <span className="text-zinc-400">Invoice Date: </span>
            {invoiceDate}
          </p>
          <p className="text-xs text-zinc-600">
            <span className="text-zinc-400">Order Date: </span>
            {orderDate}
          </p>
        </div>
      </div>

      {/* 2. Customer Information (Bill To & Ship To) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bill To */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            BILL TO
          </span>
          <p className="text-sm font-bold text-zinc-900">{customerName || "Walk-in Customer"}</p>
          {customerEmail && <p className="text-xs text-zinc-600">{customerEmail}</p>}
          {customerPhone && <p className="text-xs text-zinc-600">{customerPhone}</p>}
        </div>

        {/* Ship To */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            SHIP TO
          </span>
          <p className="text-sm font-bold text-zinc-900">{shipRecipient || "Same as Billing"}</p>
          {shipPhone && <p className="text-xs text-zinc-600">{shipPhone}</p>}
          {shipStreet && <p className="text-xs text-zinc-600">{shipStreet}</p>}
          {shipCityState && <p className="text-xs text-zinc-600">{shipCityState}</p>}
          {shipCountry && <p className="text-xs text-zinc-600">{shipCountry}</p>}
        </div>
      </div>

      {/* 3. Order / Payment Meta Row */}
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            PAYMENT METHOD
          </span>
          <span className="text-xs font-semibold text-zinc-900 capitalize">{paymentMethod}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            PAYMENT STATUS
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
              isPaid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : paymentStatus === "partial"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {isPaid ? "PAID" : paymentStatus.toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            CURRENCY
          </span>
          <span className="text-xs font-semibold text-zinc-900">{currency}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            ORDER STATUS
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-200/60 text-zinc-800">
            {orderStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 4. Products Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-3 text-center w-10">#</th>
              <th className="py-3 px-4">PRODUCT</th>
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3 text-center">QTY</th>
              <th className="py-3 px-4 text-right">UNIT PRICE</th>
              <th className="py-3 px-4 text-right">DISCOUNT</th>
              <th className="py-3 px-4 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-zinc-400">
                  No items in this invoice.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const qty = Number(item.quantity ?? 0);
                const unit = Number(item.price ?? 0);
                const disc = Number(item.discount ?? 0);
                const lineTotal = Math.max(0, qty * unit - disc);
                const hasVariant = Boolean(
                  item.variantTitle &&
                    item.variantTitle !== item.name &&
                    String(item.variantTitle).trim(),
                );

                return (
                  <tr key={index} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="py-3 px-3 text-center text-zinc-400">{index + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-900">{(item.name as string) || "Product"}</p>
                      {hasVariant && (
                        <p className="text-[11px] text-zinc-500">{item.variantTitle as string}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 font-mono text-[11px]">
                      {(item.sku as string) || "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-zinc-800">{qty}</td>
                    <td className="py-3 px-4 text-right text-zinc-700">
                      {formatCurrency(unit, currency)}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500">
                      {disc > 0 ? (
                        <span className="text-emerald-600 font-medium">
                          -{formatCurrency(disc, currency)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-zinc-900">
                      {formatCurrency(lineTotal, currency)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Bottom Section: Left (Details & QR) + Right (Totals) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        {/* Left Columns (Details & Verification) */}
        <div className="md:col-span-7 space-y-4">
          {/* Amount in Words */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              AMOUNT IN WORDS
            </span>
            <p className="text-xs font-semibold text-zinc-800 leading-relaxed">
              {amountInWords(total, currency)}
            </p>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              PAYMENT DETAILS
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Method</span>
                <span className="font-semibold text-zinc-800 capitalize">{paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Status</span>
                <span className="font-semibold text-zinc-800 capitalize">{paymentStatus}</span>
              </div>
              {txnId && (
                <div className="col-span-2">
                  <span className="text-zinc-400 block text-[11px]">Transaction ID (TrxID)</span>
                  <span className="font-mono font-medium text-zinc-900">{txnId}</span>
                </div>
              )}
              {senderNumber && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">Sender Number</span>
                  <span className="font-medium text-zinc-800">{senderNumber}</span>
                </div>
              )}
              {receiverNumber && (
                <div>
                  <span className="text-zinc-400 block text-[11px]">Receiver Number</span>
                  <span className="font-medium text-zinc-800">{receiverNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Verification */}
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
                Scan this QR code with your mobile camera to verify the authentic invoice.
              </p>
              <p className="text-[10px] text-zinc-400 truncate max-w-xs">{verificationUrl}</p>
            </div>
          </div>
        </div>

        {/* Right Columns (Totals) */}
        <div className="md:col-span-5 space-y-2">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/30 p-5 space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span className="font-medium text-zinc-900">
                {shipping > 0 ? formatCurrency(shipping, currency) : "Free"}
              </span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Tax / VAT</span>
                <span className="font-medium text-zinc-900">{formatCurrency(tax, currency)}</span>
              </div>
            )}

            <div className="border-t border-zinc-200/80 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-900">Grand Total</span>
              <span className="text-base font-extrabold text-zinc-900">
                {formatCurrency(total, currency)}
              </span>
            </div>

            <div className="border-t border-dashed border-zinc-200/80 pt-2 space-y-1.5">
              <div className="flex justify-between text-zinc-600">
                <span>Paid Amount</span>
                <span className="font-medium text-zinc-900">
                  {formatCurrency(paidAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className={dueAmount > 0 ? "text-red-600" : "text-zinc-800"}>Due Amount</span>
                <span className={dueAmount > 0 ? "text-red-600 font-extrabold" : "text-zinc-900"}>
                  {formatCurrency(dueAmount, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Notes & Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200/80 pt-6 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            NOTES
          </span>
          <p className="text-zinc-600 leading-relaxed">
            {(inv.notes as string)?.trim() ||
              "Thank you for shopping with us! Please keep this invoice for warranty and support."}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            TERMS & CONDITIONS
          </span>
          <p className="text-zinc-600 leading-relaxed">
            Goods once sold are subject to the store&apos;s return and exchange policies. Any disputes must be raised within 7 days of delivery.
          </p>
        </div>
      </div>

      {/* 7. Footer */}
      <div className="border-t border-zinc-200/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-400">
        <span>Page 1 of 1</span>
        <span className="font-medium text-zinc-600">Thank you for your purchase.</span>
        <span>Powered by Bornoland</span>
      </div>
    </div>
  );
}

function SubscriptionInvoiceView({
  inv,
  verificationUrl,
}: {
  inv: Record<string, unknown>;
  verificationUrl: string;
}) {
  const planName = (inv.planId as { name?: string })?.name || "Subscription Plan";
  const store = (inv.storeId as { name?: string; slug?: string }) || {};
  const user = (inv.userId as { name?: string; email?: string; phone?: string }) || {};
  const gateway = (inv.gateway as string) || "Online";
  const transactionId = (inv.transactionId as string) || "";
  const subtotal = Number(inv.subtotal ?? 0);
  const discount = Number(inv.discount ?? 0);
  const vatAmount = Number(inv.vatAmount ?? 0);
  const taxAmount = Number(inv.taxAmount ?? 0);
  const total = Number(inv.total ?? 0);
  const currency = (inv.currency as string) || "BDT";
  const status = ((inv.status as string) || "pending").toLowerCase();
  const isPaid = status === "paid";

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    verificationUrl,
  )}`;

  return (
    <div className="p-8 sm:p-12 print:p-6 text-zinc-800 space-y-8 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-200/80 pb-8">
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-zinc-900 text-white font-bold">
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
            {(inv.invoiceNumber as string) || "—"}
          </p>
          <p className="text-xs text-zinc-600">
            <span className="text-zinc-400">Issued: </span>
            {formatDate(inv.issuedAt as string)}
          </p>
          {inv.paidAt ? (
            <p className="text-xs text-zinc-600">
              <span className="text-zinc-400">Paid: </span>
              {formatDate(inv.paidAt as string)}
            </p>
          ) : null}

        </div>
      </div>

      {/* 2. Customer & Store */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            BILLED TO
          </span>
          <p className="text-sm font-bold text-zinc-900">{user.name || "Customer"}</p>
          {user.email && <p className="text-xs text-zinc-600">{user.email}</p>}
          {user.phone && <p className="text-xs text-zinc-600">{user.phone}</p>}
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            WORKSPACE / STORE
          </span>
          <p className="text-sm font-bold text-zinc-900">{store.name || "Store Workspace"}</p>
          <p className="text-xs text-zinc-600">{planName} Subscription</p>
        </div>
      </div>

      {/* 3. Items Table */}
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
                  {formatDate(inv.billingPeriodStart as string)} –{" "}
                  {formatDate(inv.billingPeriodEnd as string)}
                </p>
              </td>
              <td className="py-4 px-3 text-center font-medium text-zinc-700 capitalize">
                {(inv.duration as string) || "Monthly"}
              </td>
              <td className="py-4 px-4 text-right font-bold text-zinc-900">
                {formatCurrency(subtotal, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Totals & QR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        <div className="md:col-span-7 space-y-4">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              AMOUNT IN WORDS
            </span>
            <p className="text-xs font-semibold text-zinc-800 leading-relaxed">
              {amountInWords(total, currency)}
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
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-2">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/30 p-5 space-y-3 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            {vatAmount > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>VAT</span>
                <span className="font-medium text-zinc-900">{formatCurrency(vatAmount, currency)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Tax</span>
                <span className="font-medium text-zinc-900">{formatCurrency(taxAmount, currency)}</span>
              </div>
            )}
            <div className="border-t border-zinc-200/80 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-900">Total</span>
              <span className="text-base font-extrabold text-zinc-900">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="border-t border-zinc-200/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-400">
        <span>Page 1 of 1</span>
        <span className="font-medium text-zinc-600">Thank you for your business.</span>
        <span>Powered by Bornoland</span>
      </div>
    </div>
  );
}
