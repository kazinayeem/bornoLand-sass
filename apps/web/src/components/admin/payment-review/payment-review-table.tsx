"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  Clock,
  Filter,
  ChevronDown,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminSubscriptionPaymentsQuery,
  useApproveSubscriptionPaymentMutation,
  useRejectSubscriptionPaymentMutation,
  type SubscriptionPayment,
} from "@/redux/api/subscription-payment-api";
import { formatBDT } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "requested_info", label: "More Info Needed" },
  { value: "expired", label: "Expired" },
];

const METHOD_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank Transfer",
};

const STATUS_BADGE: Record<string, "warning" | "success" | "danger" | "violet" | "slate"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  requested_info: "violet",
  expired: "slate",
};

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentDetailModal({
  payment,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
}: {
  payment: SubscriptionPayment;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestInfo: (id: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showInfoInput, setShowInfoInput] = useState(false);

  const storeName = typeof payment.storeId === "object" ? payment.storeId.name : "—";
  const storeSlug = typeof payment.storeId === "object" ? payment.storeId.slug : "";
  const userName = typeof payment.userId === "object" ? payment.userId.name : "—";
  const userEmail = typeof payment.userId === "object" ? payment.userId.email : "—";
  const planName = typeof payment.planId === "object" ? payment.planId.name : "—";

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
        className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Payment Review</h2>
            <p className="text-sm text-zinc-500">{payment.transactionId}</p>
          </div>
          <Badge variant={STATUS_BADGE[payment.status]}>{payment.status.replace("_", " ")}</Badge>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Store</p>
              <p className="text-sm font-medium text-zinc-900">{storeName}</p>
              {storeSlug && <p className="text-xs text-zinc-500">/{storeSlug}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Owner</p>
              <p className="text-sm font-medium text-zinc-900">{userName}</p>
              <p className="text-xs text-zinc-500">{userEmail}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Plan</p>
              <p className="text-sm font-medium text-zinc-900">{planName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Duration</p>
              <p className="text-sm font-medium text-zinc-900 capitalize">{payment.duration?.replace("_", " ") || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Amount</p>
              <p className="text-lg font-bold text-zinc-900">{formatBDT(payment.amount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Gateway</p>
              <p className="text-sm font-medium text-zinc-900">{METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Sender Number</p>
              <p className="text-sm font-medium text-zinc-900">{payment.senderNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Transaction ID</p>
              <p className="text-sm font-mono font-medium text-zinc-900">{payment.transactionId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Submitted</p>
              <p className="text-sm text-zinc-900">{formatDate(payment.createdAt)}</p>
            </div>
            {payment.approvedAt && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Reviewed</p>
                <p className="text-sm text-zinc-900">{formatDate(payment.approvedAt)}</p>
              </div>
            )}
          </div>

          {payment.screenshotUrl && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Payment Screenshot</p>
              <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
                <img
                  src={payment.screenshotUrl}
                  alt="Payment screenshot"
                  className="max-h-64 w-full object-contain"
                />
              </div>
            </div>
          )}

          {payment.notes && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Reference Note</p>
              <p className="text-sm text-zinc-700 bg-zinc-50 rounded-lg p-3 border border-zinc-100">{payment.notes}</p>
            </div>
          )}

          {payment.rejectedReason && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-red-500">Rejection Reason</p>
              <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3 border border-red-100">{payment.rejectedReason}</p>
            </div>
          )}

          {payment.requestInfoMessage && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-500">Requested Information</p>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-100">{payment.requestInfoMessage}</p>
            </div>
          )}

          {showRejectInput && (
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Reason for rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="Enter the reason for rejecting this payment..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (rejectReason.length < 3) { toast.error("Please enter a reason"); return; }
                    onReject(payment._id);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}

          {showInfoInput && (
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">Message to user</label>
              <textarea
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="Ask for additional information..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowInfoInput(false); setInfoMessage(""); }}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (infoMessage.length < 3) { toast.error("Please enter a message"); return; }
                    onRequestInfo(payment._id);
                  }}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                >
                  Send Request
                </button>
              </div>
            </div>
          )}
        </div>

        {payment.status === "pending" && (
          <div className="border-t border-zinc-100 px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => onApprove(payment._id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => { setShowInfoInput(true); }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Request Info
            </button>
            <button
              onClick={() => { setShowRejectInput(true); }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}

        {payment.status !== "pending" && (
          <div className="border-t border-zinc-100 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function PaymentReviewTable() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<SubscriptionPayment | null>(null);

  const { data, isLoading, refetch } = useGetAdminSubscriptionPaymentsQuery(
    statusFilter ? { status: statusFilter } : undefined
  );
  const [approvePayment] = useApproveSubscriptionPaymentMutation();
  const [rejectPayment] = useRejectSubscriptionPaymentMutation();

  const payments = data?.data?.payments ?? [];

  const filtered = useMemo(() => {
    if (!searchQuery) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter((p) => {
      const storeName = typeof p.storeId === "object" ? p.storeId.name : "";
      const userName = typeof p.userId === "object" ? p.userId.name : "";
      const email = typeof p.userId === "object" ? p.userId.email : "";
      return (
        p.transactionId.toLowerCase().includes(q) ||
        p.senderNumber.includes(q) ||
        storeName.toLowerCase().includes(q) ||
        userName.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q)
      );
    });
  }, [payments, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      await approvePayment(id).unwrap();
      toast.success("Payment approved successfully");
      setSelectedPayment(null);
    } catch {
      toast.error("Failed to approve payment");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPayment({ id, reason: selectedPayment?.requestInfoMessage || "" }).unwrap();
      toast.success("Payment rejected");
      setSelectedPayment(null);
    } catch {
      toast.error("Failed to reject payment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction, store, user..."
            className="w-full h-10 rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="h-10 px-3 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-sm"
          >
            <Loader2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-lg font-semibold text-zinc-900">No payments to review</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {searchQuery || statusFilter ? "Try adjusting your filters." : "All caught up! New payments will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Store</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Gateway</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Submitted</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((payment, idx) => {
                const storeName = typeof payment.storeId === "object" ? payment.storeId.name : "—";
                const userName = typeof payment.userId === "object" ? payment.userId.name : "—";
                const planName = typeof payment.planId === "object" ? payment.planId.name : "—";
                return (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-zinc-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-zinc-900">{payment.transactionId}</p>
                      <p className="text-xs text-zinc-400">{payment.senderNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{storeName}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-zinc-900">{userName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-zinc-900">{planName}</p>
                      <p className="text-xs text-zinc-400 capitalize">{payment.duration?.replace("_", " ")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-900">{formatBDT(payment.amount)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="bg-zinc-100 text-zinc-700 border-0">
                        {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[payment.status]}>
                        {payment.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestInfo={(id) => {
            toast.info("Request info feature coming soon");
          }}
        />
      )}
    </div>
  );
}
