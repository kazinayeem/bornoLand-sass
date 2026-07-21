"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  useGetAdminInvoicesQuery,
  useUpdateInvoiceStatusMutation,
  useRegenerateInvoiceTokenMutation,
  useEmailInvoiceMutation,
  type Invoice,
} from "@/redux/api/billing-api";
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Copy,
  Mail,
  RefreshCcw,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAccessToken } from "@/lib/access-token";
import { getApiUrl } from "@/lib/urls";
import { toast } from "sonner";

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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  paid: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  rejected: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  refunded: { label: "Cancelled", color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment", border: "border-zinc-200", icon: AlertTriangle },
};

const STATUS_FILTERS = ["", "paid", "pending", "rejected", "refunded"];

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useGetAdminInvoicesQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const [updateStatus] = useUpdateInvoiceStatusMutation();
  const [regenerateToken] = useRegenerateInvoiceTokenMutation();
  const [emailInvoice] = useEmailInvoiceMutation();

  const invoices = data?.data?.invoices ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

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

  const handleDownloadPdf = useCallback(async (invoice: Invoice) => {
    const apiBase = getApiUrl();
    const token = getAccessToken();
    try {
      const res = await fetch(`${apiBase}/invoices/admin/${invoice._id}/pdf`, {
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
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    }
  }, []);

  const handlePrint = useCallback((invoice: Invoice) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const verificationUrl = `${baseUrl}/invoices/verify/${invoice.verificationCode}`;
    window.open(verificationUrl, "_blank");
  }, []);

  const handleRegenerateToken = useCallback(async (invoice: Invoice) => {
    try {
      await regenerateToken(invoice._id).unwrap();
      toast.success("Verification token regenerated");
    } catch {
      toast.error("Failed to regenerate token");
    }
  }, [regenerateToken]);

  const handleEmailInvoice = useCallback(async (invoice: Invoice) => {
    try {
      await emailInvoice({ id: invoice._id }).unwrap();
      toast.success("Invoice emailed successfully");
    } catch {
      toast.error("Failed to send email");
    }
  }, [emailInvoice]);

  const handleStatusChange = useCallback(async (invoice: Invoice, newStatus: string) => {
    try {
      await updateStatus({ id: invoice._id, status: newStatus as "paid" | "pending" | "rejected" | "refunded" }).unwrap();
      toast.success(`Invoice marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  }, [updateStatus]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices"
        description="Manage all invoices, verify payments, and download PDFs."
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
          <input
            type="text"
            placeholder="Search by invoice number or transaction ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-xl border border-zinc-200 pl-10 pr-4 text-sm outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || "all"}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                statusFilter === s
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-apple-ink-muted-80 hover:border-zinc-300"
              }`}
            >
              {s ? STATUS_CONFIG[s]?.label || s : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-lg font-semibold text-apple-ink">No invoices found</h3>
          <p className="mt-1 text-sm text-apple-ink-muted-48">
            {search || statusFilter ? "Try adjusting your filters" : "Invoices will appear here once payments are approved"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-apple-canvas-parchment/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Store</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoices.map((inv) => {
                const storeName = typeof inv.storeId === "object" ? inv.storeId?.name : "—";
                const planName = typeof inv.planId === "object" ? inv.planId?.name : "—";
                const status = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                const verificationUrl = `${baseUrl}/invoices/verify/${inv.verificationCode}`;

                return (
                  <motion.tr
                    key={inv._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-apple-canvas-parchment/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-apple-ink-muted-48" />
                        <span className="font-mono text-xs font-semibold text-apple-ink">{inv.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-apple-ink-muted-80">{storeName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium text-apple-ink-muted-80">
                        {planName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-apple-ink-muted-48">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-apple-ink">
                      {formatBDT(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.border} ${status.bg} ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(verificationUrl, "Verification Link")}
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                          title="Copy Verification Link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
              <p className="text-xs text-apple-ink-muted-48">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-medium text-apple-ink-muted-80">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDownloadPdf={handleDownloadPdf}
          onRegenerateToken={handleRegenerateToken}
          onEmailInvoice={handleEmailInvoice}
          onStatusChange={handleStatusChange}
          onCopyLink={copyToClipboard}
          copied={copied}
        />
      )}
    </div>
  );
}

/* ── Invoice Detail Modal ──────────────────────────────────────────────────── */

function InvoiceDetailModal({
  invoice,
  onClose,
  onDownloadPdf,
  onRegenerateToken,
  onEmailInvoice,
  onStatusChange,
  onCopyLink,
  copied,
}: {
  invoice: Invoice;
  onClose: () => void;
  onDownloadPdf: (inv: Invoice) => void;
  onRegenerateToken: (inv: Invoice) => void;
  onEmailInvoice: (inv: Invoice) => void;
  onStatusChange: (inv: Invoice, status: string) => void;
  onCopyLink: (text: string, label: string) => void;
  copied: string | null;
}) {
  const storeName = typeof invoice.storeId === "object" ? invoice.storeId?.name : "—";
  const planName = typeof invoice.planId === "object" ? invoice.planId?.name : "—";
  const customerName = typeof invoice.userId === "object" ? invoice.userId?.name : "—";
  const customerEmail = typeof invoice.userId === "object" ? invoice.userId?.email : "—";
  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verificationUrl = `${baseUrl}/invoices/verify/${invoice.verificationCode}`;

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
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-apple-ink-muted-48" />
            <div>
              <h2 className="text-lg font-bold text-apple-ink">{invoice.invoiceNumber}</h2>
              <p className="text-xs text-apple-ink-muted-48">{storeName}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-apple-canvas-parchment">
            <X className="h-4 w-4 text-apple-ink-muted-48" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.border} ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            <span className="text-xs text-apple-ink-muted-48">{formatDate(invoice.createdAt)}</span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-apple-canvas-parchment p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Plan</p>
              <p className="mt-0.5 text-sm font-semibold text-apple-ink">{planName}</p>
            </div>
            <div className="rounded-xl bg-apple-canvas-parchment p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Amount</p>
              <p className="mt-0.5 text-sm font-semibold text-apple-ink">{formatBDT(invoice.total)}</p>
            </div>
            <div className="rounded-xl bg-apple-canvas-parchment p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Customer</p>
              <p className="mt-0.5 text-sm font-semibold text-apple-ink">{customerName}</p>
              <p className="text-xs text-apple-ink-muted-48">{customerEmail}</p>
            </div>
            <div className="rounded-xl bg-apple-canvas-parchment p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Gateway</p>
              <p className="mt-0.5 text-sm font-semibold text-apple-ink capitalize">{invoice.gateway || "—"}</p>
            </div>
            {invoice.transactionId && (
              <div className="col-span-2 rounded-xl bg-apple-canvas-parchment p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Transaction ID</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-apple-ink">{invoice.transactionId}</p>
              </div>
            )}
          </div>

          {/* Verification URL */}
          <div className="rounded-xl border border-zinc-200 bg-apple-canvas-parchment p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48 mb-1">Verification URL</p>
            <p className="text-xs text-blue-600 break-all">{verificationUrl}</p>
          </div>

          {/* Status Change */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Change Status</p>
            <div className="flex gap-2">
              {["paid", "pending", "rejected", "refunded"].map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(invoice, s)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    invoice.status === s
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-apple-ink-muted-80 hover:border-zinc-300"
                  }`}
                >
                  {STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-zinc-100 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onDownloadPdf(invoice)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
            <button
              onClick={() => onRegenerateToken(invoice)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Regenerate Token
            </button>
            <button
              onClick={() => onEmailInvoice(invoice)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <Mail className="h-3.5 w-3.5" />
              Email Invoice
            </button>
            <button
              onClick={() => onCopyLink(verificationUrl, "Verification Link")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {copied === "Verification Link" ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={() => onCopyLink(invoice.invoiceNumber, "Invoice ID")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === "Invoice ID" ? "Copied!" : "Copy ID"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
