"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Printer, FileText, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import type { Invoice } from "@/redux/api/billing-api";
import { formatBDT } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";
import { getAccessToken } from "@/lib/access-token";
import { getApiUrl } from "@/lib/urls";
import { toast } from "sonner";

type Props = {
  invoice: Invoice;
  onClose: () => void;
  storeName?: string;
  ownerName?: string;
};

async function downloadInvoicePdf(invoiceId: string, invoiceNumber: string) {
  const apiBase = getApiUrl();
  const token = getAccessToken();
  const url = `${apiBase}/invoices/${invoiceId}/pdf`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

async function printInvoicePdf(invoiceId: string) {
  const apiBase = getApiUrl();
  const token = getAccessToken();
  const url = `${apiBase}/invoices/${invoiceId}/pdf`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Failed to load PDF for printing");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export function InvoiceDetail({ invoice, onClose, storeName, ownerName }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const planName = typeof invoice.planId === "object" ? invoice.planId.name : "—";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice._id, invoice.invoiceNumber);
      toast.success("Invoice downloaded successfully");
    } catch {
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printInvoicePdf(invoice._id);
    } catch {
      toast.error("Failed to open print dialog. Please try again.");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-apple-lg border border-apple-hairline bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-apple-divider-soft px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment">
              <FileText className="h-5 w-5 text-apple-ink-muted-80" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-apple-ink">Invoice</h2>
              <p className="text-sm text-apple-ink-muted-48">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-apple-canvas-parchment transition-colors">
            <X className="h-4 w-4 text-apple-ink-muted-48" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {invoice.status}
            </Badge>
            <p className="text-xs text-apple-ink-muted-48">
              Issued: {new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Business info */}
          <div className="rounded-xl bg-apple-canvas-parchment p-4 text-sm space-y-1">
            {storeName && <p className="text-apple-ink font-medium">{storeName}</p>}
            {ownerName && <p className="text-apple-ink-muted-48">{ownerName}</p>}
          </div>

          {/* Details */}
          <div className="space-y-3 border-t border-apple-divider-soft pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Plan</span>
              <span className="font-medium text-apple-ink">{planName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Duration</span>
              <span className="font-medium text-apple-ink capitalize">{invoice.duration?.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Invoice Number</span>
              <span className="font-mono font-medium text-apple-ink">{invoice.invoiceNumber}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2 border-t border-apple-divider-soft pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-apple-ink-muted-48">Subtotal</span>
              <span className="text-apple-ink">{formatBDT(invoice.subtotal)}</span>
            </div>
            {invoice.vatAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-apple-ink-muted-48">VAT</span>
                <span className="text-apple-ink">{formatBDT(invoice.vatAmount)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-apple-ink-muted-48">Tax</span>
                <span className="text-apple-ink">{formatBDT(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-apple-hairline pt-2">
              <span className="text-apple-ink">Total</span>
              <span className="text-apple-ink">{formatBDT(invoice.total)}</span>
            </div>
            <p className="text-xs text-apple-ink-muted-48">{invoice.currency}</p>
          </div>

          {/* Payment info */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-3 text-sm">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">Payment Received</p>
              <p className="text-emerald-600 text-xs">
                {new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-apple-divider-soft px-6 py-4 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-apple-hairline px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-all duration-200 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-apple-hairline px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-all duration-200 disabled:opacity-50"
          >
            {printing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            {printing ? "Opening..." : "Print"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
