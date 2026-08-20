"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, CheckCircle, XCircle, Trash2, ShieldCheck, ShoppingBag, Calendar, User, Mail } from "lucide-react";
import type { ReviewItem, ReviewStatus } from "@/redux/api/review-api";

type ReviewDetailModalProps = {
  open: boolean;
  review: ReviewItem | null;
  onClose: () => void;
  onUpdateStatus: (reviewId: string, status: ReviewStatus) => void;
  onDelete: (reviewId: string) => void;
  updating?: boolean;
};

export function ReviewDetailModal({
  open,
  review,
  onClose,
  onUpdateStatus,
  onDelete,
  updating = false,
}: ReviewDetailModalProps) {
  if (!open || !review) return null;

  const statusBadge =
    review.status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : review.status === "rejected"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !updating) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="flex flex-col w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden"
          style={{ maxHeight: "min(85vh, 700px)" }}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-5 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-apple-ink">Review Details</h3>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                {review.status}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Rating Stars & Title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs font-bold text-apple-ink">{review.rating} / 5</span>
              </div>

              {review.title && <h4 className="text-sm font-bold text-apple-ink">{review.title}</h4>}
            </div>

            {/* Review Body */}
            {review.body && (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 text-xs leading-relaxed text-zinc-700">
                {review.body}
              </div>
            )}

            {/* Attached Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Attached Images</span>
                <div className="flex flex-wrap gap-2">
                  {review.images.map((imgUrl, i) => (
                    <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="block h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      <img src={imgUrl} alt={`Review media ${i + 1}`} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Customer & Purchase Details */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Customer & Verification</span>

              <div className="grid grid-cols-2 gap-2 text-apple-ink">
                <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-2.5">
                  <User className="h-4 w-4 text-zinc-400" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-medium">Customer</p>
                    <p className="font-bold">{review.customerName || "Anonymous"}</p>
                  </div>
                </div>

                {review.customerEmail && (
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-2.5">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-400 font-medium">Email</p>
                      <p className="font-bold truncate">{review.customerEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-zinc-600">
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Purchase
                  </span>
                )}
                {review.orderId && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                    <ShoppingBag className="h-3.5 w-3.5" /> Order #{review.orderId.slice(-6)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 ml-auto">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={() => {
                onDelete(review._id);
                onClose();
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>

            <div className="flex items-center gap-2">
              {review.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(review._id, "rejected");
                    onClose();
                  }}
                  disabled={updating}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-500" /> Reject
                </button>
              )}

              {review.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(review._id, "approved");
                    onClose();
                  }}
                  disabled={updating}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve Review
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
