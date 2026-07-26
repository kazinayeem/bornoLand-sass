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
  Package,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { getAccessToken } from "@/lib/access-token";
import { getApiUrl } from "@/lib/urls";

type InvoiceData = {
  type: "subscription" | "order";
  invoice: Record<string, unknown>;
};

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
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const SUB_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  paid: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  rejected: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  refunded: { label: "Cancelled", color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment", border: "border-zinc-200", icon: AlertTriangle },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  paid: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  partial: { label: "Partial", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Clock },
  failed: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  refunded: { label: "Refunded", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: AlertTriangle },
  delivered: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment", border: "border-zinc-200", icon: XCircle },
};

export function InvoiceVerifyClient({ data, token }: { data: { type: string; invoice: Record<string, unknown> } | null; token: string }) {
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
      <div className="flex min-h-screen items-center justify-center bg-apple-canvas-parchment p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-apple-ink">Invalid Invoice</h1>
          <p className="mt-2 text-sm text-apple-ink-muted-48">
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

  const inv = data.invoice;
  const isOrder = data.type === "order";
  const statusConfig = isOrder ? ORDER_STATUS_CONFIG : SUB_STATUS_CONFIG;
  const statusKey = isOrder
    ? ((inv.paymentStatus as string) || inv.status as string || "pending")
    : (inv.status as string || "pending");
  const status = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = status.icon;

  const storeName = (inv.storeId as { name?: string })?.name || "—";
  const storeSlug = (inv.storeId as { slug?: string })?.slug || "";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verificationUrl = `${baseUrl}/invoice/verify/${token}`;

  return (
    <div className="min-h-screen bg-apple-canvas-parchment">
      <div className="hidden print:block print:min-h-0 print:bg-white print:p-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-apple-ink-muted-80" />
            <span className="text-sm font-semibold text-apple-ink">BornoLand</span>
          </div>
          <span className="text-xs text-apple-ink-muted-48">Invoice Verification</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 print:max-w-none print:px-0 print:py-0">
        <div className={`mb-8 rounded-2xl border ${status.border} ${status.bg} p-6 text-center print:mb-4 print:p-3`}>
          <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${status.bg} print:h-10 print:w-10`}>
            <StatusIcon className={`h-8 w-8 ${status.color} print:h-6 print:w-6`} />
          </div>
          <h1 className={`text-2xl font-bold ${status.color} print:text-lg`}>
            {isOrder ? "Order" : "Invoice"} {status.label}
          </h1>
          <p className="mt-1 text-sm text-apple-ink-muted-48">
            {(inv.invoiceNumber as string) || (inv.orderNumber as string) || ""}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm print:shadow-none print:border-zinc-200">
          <div className="border-b border-zinc-100 px-6 py-5 print:px-4 print:py-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {isOrder ? (
                    <Package className="h-5 w-5 text-apple-ink-muted-48" />
                  ) : (
                    <FileText className="h-5 w-5 text-apple-ink-muted-48" />
                  )}
                  <h2 className="text-lg font-bold text-apple-ink">
                    {(inv.invoiceNumber as string) || (inv.orderNumber as string) || ""}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-apple-ink-muted-48">{storeName}</p>
              </div>
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.border} ${status.bg} ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </div>
            </div>
          </div>

          {isOrder ? (
            <OrderDetails inv={inv} />
          ) : (
            <SubscriptionDetails inv={inv} />
          )}

          <div className="border-t border-zinc-100 px-6 py-4 print:hidden">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={() => copyToClipboard((inv.invoiceNumber as string) || (inv.orderNumber as string) || "", "Invoice ID")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment"
              >
                <Copy className="h-4 w-4" />
                {copied === "Invoice ID" ? "Copied!" : "Copy ID"}
              </button>
              <button
                onClick={() => copyToClipboard(verificationUrl, "Verification Link")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment"
              >
                <ExternalLink className="h-4 w-4" />
                {copied === "Verification Link" ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-apple-ink-muted-48 print:mt-4">
          <p>Powered by BornoLand · bornoland.com · support@bornoland.com</p>
          <p className="mt-1">Generated on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ inv }: { inv: Record<string, unknown> }) {
  const ship = inv.shippingAddress as Record<string, unknown> | undefined;
  const items = (inv.items as Array<Record<string, unknown>>) || [];
  const subtotal = Number(inv.subtotal ?? 0);
  const discount = Number(inv.discount ?? 0);
  const shipping = Number(inv.shipping ?? inv.deliveryCharge ?? 0);
  const tax = Number(inv.tax ?? 0);
  const total = Number(inv.total ?? 0);
  const refund = Number(inv.refundAmount ?? 0);
  const customerId = inv.customerId as Record<string, unknown> | string | undefined;
  const customerName = typeof customerId === "object" ? (customerId?.name as string) : "";
  const customerEmail = typeof customerId === "object" ? (customerId?.email as string) : ship?.email as string || "";
  const customerPhone = typeof customerId === "object" ? (customerId?.phone as string) : "";
  const currencyCode = (inv.currencyCode as string) || "BDT";
  const shipment = inv.shipment as Record<string, unknown> | null | undefined;
  const courierName =
    (shipment?.providerName as string) ||
    (inv.courier as string) ||
    (shipment?.provider as string) ||
    "";
  const trackingNo =
    (shipment?.trackingNumber as string) || (inv.trackingNumber as string) || "";
  const consignmentId = (shipment?.consignmentId as string) || "";
  const shipmentStatus = (shipment?.status as string) || "";
  const estimatedDelivery =
    (shipment?.estimatedDelivery as string) || (inv.estimatedDelivery as string) || "";
  const paymentVerification = inv.paymentVerification as Record<string, unknown> | undefined;

  return (
    <div className="divide-y divide-zinc-100">
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 print:grid-cols-2">
        <div className="space-y-4 border-b border-zinc-100 p-6 sm:border-b-0 sm:border-r print:p-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <User className="h-3.5 w-3.5" />
              Customer
            </h3>
            <p className="text-sm font-semibold text-apple-ink">{customerName || (ship?.fullName as string) || "—"}</p>
            {customerEmail ? <p className="text-xs text-apple-ink-muted-48">{customerEmail}</p> : null}
            {(customerPhone || ship?.phone) ? (
              <p className="text-xs text-apple-ink-muted-48">{customerPhone || String(ship?.phone || "")}</p>
            ) : null}
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <Truck className="h-3.5 w-3.5" />
              Shipping Address
            </h3>
            {ship ? (
              <>
                <p className="text-sm font-semibold text-apple-ink">{ship.fullName as string}</p>
                <p className="text-xs text-apple-ink-muted-48">
                  {[ship.street, ship.area, ship.city, ship.state, ship.zip, ship.country]
                    .map((v) => v?.toString().trim())
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </>
            ) : (
              <p className="text-xs text-apple-ink-muted-48">—</p>
            )}
          </div>
        </div>
        <div className="space-y-4 p-6 print:p-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <Calendar className="h-3.5 w-3.5" />
              Invoice Info
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-apple-ink-muted-48">Created</span>
                <span className="font-medium text-apple-ink">{formatDate(inv.createdAt as string)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-apple-ink-muted-48">Order Status</span>
                <span className="font-medium capitalize text-apple-ink">{(inv.status as string) || "—"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-apple-ink-muted-48">Currency</span>
                <span className="font-medium text-apple-ink">{currencyCode}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <CreditCard className="h-3.5 w-3.5" />
              Payment
            </h3>
            <p className="text-sm font-semibold capitalize text-apple-ink">{(inv.paymentMethod as string) || "—"}</p>
            <p className="text-xs capitalize text-apple-ink-muted-48">{(inv.paymentStatus as string) || ""}</p>
            {paymentVerification?.transactionId ? (
              <p className="mt-1 font-mono text-[11px] text-apple-ink-muted-48">
                TX: {String(paymentVerification.transactionId)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {(courierName || trackingNo) && (
        <div className="px-6 py-4 print:px-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
            <Truck className="h-3.5 w-3.5" />
            Courier / Shipment
          </h3>
          <div className="grid gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-apple-ink-muted-48">Provider</p>
              <p className="text-sm font-semibold text-apple-ink">{courierName || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-apple-ink-muted-48">Status</p>
              <p className="text-sm font-semibold capitalize text-apple-ink">
                {shipmentStatus ? shipmentStatus.replace(/_/g, " ") : "—"}
              </p>
            </div>
            {trackingNo ? (
              <div className="sm:col-span-2">
                <p className="text-[10px] uppercase tracking-wide text-apple-ink-muted-48">Tracking Number</p>
                <p className="font-mono text-sm font-semibold text-apple-ink">{trackingNo}</p>
              </div>
            ) : null}
            {consignmentId ? (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-apple-ink-muted-48">Consignment ID</p>
                <p className="font-mono text-xs font-medium text-apple-ink">{consignmentId}</p>
              </div>
            ) : null}
            {estimatedDelivery ? (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-apple-ink-muted-48">Est. Delivery</p>
                <p className="text-xs font-medium text-apple-ink">{estimatedDelivery}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="px-6 py-4 print:px-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Items</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-100">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-zinc-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
              <span>Product</span>
              <span>Qty</span>
              <span className="text-right">Total</span>
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] gap-2 border-t border-zinc-50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-apple-ink">{item.name as string}</p>
                  {(item.variantTitle as string) ? (
                    <p className="text-xs text-apple-ink-muted-48">{item.variantTitle as string}</p>
                  ) : null}
                </div>
                <p className="text-xs text-apple-ink-muted-80">×{String(item.quantity ?? 0)}</p>
                <p className="text-right text-sm font-semibold text-apple-ink">
                  {formatCurrency(Number(item.price ?? 0) * Number(item.quantity ?? 0), currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-5 print:px-4 print:py-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-apple-ink-muted-48">Subtotal</span>
            <span className="text-apple-ink">{formatCurrency(subtotal, currencyCode)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">Discount</span>
              <span className="text-emerald-600">-{formatCurrency(discount, currencyCode)}</span>
            </div>
          )}
          {shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Shipping</span>
              <span className="text-apple-ink">{formatCurrency(shipping, currencyCode)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Tax</span>
              <span className="text-apple-ink">{formatCurrency(tax, currencyCode)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
            <span className="text-apple-ink">Grand Total</span>
            <span className="text-apple-ink">{formatCurrency(total, currencyCode)}</span>
          </div>
          {refund > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Refunded</span>
              <span className="font-medium text-red-600">{formatCurrency(refund, currencyCode)}</span>
            </div>
          )}
        </div>
      </div>

      {typeof inv.notes === "string" && inv.notes.trim() ? (
        <div className="px-6 py-4 print:px-4">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Notes</h3>
          <p className="text-sm text-apple-ink-muted-80">{inv.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionDetails({ inv }: { inv: Record<string, unknown> }) {
  const planName = (inv.planId as { name?: string })?.name || "—";
  const ownerName = (inv.userId as { name?: string })?.name || "—";
  const ownerEmail = (inv.userId as { email?: string })?.email || "—";
  const gateway = (inv.gateway as string) || "";
  const transactionId = (inv.transactionId as string) || "";
  const subtotal = Number(inv.subtotal ?? 0);
  const discount = Number(inv.discount ?? 0);
  const vatAmount = Number(inv.vatAmount ?? 0);
  const taxAmount = Number(inv.taxAmount ?? 0);
  const total = Number(inv.total ?? 0);
  const currency = (inv.currency as string) || "BDT";

  return (
    <div>
      <div className="grid grid-cols-1 gap-0 border-b border-zinc-100 sm:grid-cols-2 print:grid-cols-2">
        <div className="space-y-4 border-b border-zinc-100 p-6 sm:border-b-0 sm:border-r print:p-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <Store className="h-3.5 w-3.5" />
              Store
            </h3>
            <p className="text-sm font-semibold text-apple-ink">{(inv.storeId as { name?: string })?.name || "—"}</p>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <User className="h-3.5 w-3.5" />
              Customer
            </h3>
            <p className="text-sm font-semibold text-apple-ink">{ownerName}</p>
            <p className="text-xs text-apple-ink-muted-48">{ownerEmail}</p>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <CreditCard className="h-3.5 w-3.5" />
              Payment
            </h3>
            <p className="text-sm font-semibold text-apple-ink capitalize">{gateway || "—"}</p>
            {transactionId && <p className="font-mono text-xs text-apple-ink-muted-48">{transactionId}</p>}
          </div>
        </div>
        <div className="space-y-4 p-6 print:p-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <FileText className="h-3.5 w-3.5" />
              Plan
            </h3>
            <p className="text-sm font-semibold text-apple-ink">{planName}</p>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
              <Calendar className="h-3.5 w-3.5" />
              Dates
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-apple-ink-muted-48">Issued</span>
                <span className="font-medium text-apple-ink">{formatDate(inv.issuedAt as string)}</span>
              </div>
              {typeof inv.paidAt === "string" && inv.paidAt ? (
                <div className="flex justify-between text-xs">
                  <span className="text-apple-ink-muted-48">Paid</span>
                  <span className="font-medium text-apple-ink">{formatDate(inv.paidAt)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 print:px-4 print:py-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-apple-ink-muted-48">Subtotal</span>
            <span className="text-apple-ink">{formatCurrency(subtotal, currency)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">Discount</span>
              <span className="text-emerald-600">-{formatCurrency(discount, currency)}</span>
            </div>
          )}
          {vatAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">VAT</span>
              <span className="text-apple-ink">{formatCurrency(vatAmount, currency)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Tax</span>
              <span className="text-apple-ink">{formatCurrency(taxAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
            <span className="text-apple-ink">Total</span>
            <span className="text-apple-ink">{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
