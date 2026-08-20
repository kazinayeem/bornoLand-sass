"use client";

import { useState } from "react";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import {
  useGetStoreReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
  type ReviewItem,
  type ReviewStatus,
} from "@/redux/api/review-api";
import { ReviewDetailModal } from "@/components/reviews/review-detail-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ShieldCheck,
  Loader2,
  MessageSquare,
  Clock,
  ThumbsUp,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusTab = "all" | "pending" | "approved" | "rejected";

export default function StoreReviewsPage() {
  const { storeId, store, isLoading: isStoreLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = getFeatureByKey(accessData?.data?.features ?? [], "reviews");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: reviewsData, isLoading: isReviewsLoading } = useGetStoreReviewsQuery(
    { storeId: storeId ?? "", status: activeTab, search, page, limit: 20 },
    { skip: !storeId }
  );

  const [updateStatus, { isLoading: isUpdating }] = useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const responseData = reviewsData?.data;
  const reviews = responseData?.reviews ?? [];
  const total = responseData?.total ?? 0;
  const pendingCount = responseData?.pendingCount ?? 0;
  const approvedCount = responseData?.approvedCount ?? 0;
  const rejectedCount = responseData?.rejectedCount ?? 0;
  const averageRating = responseData?.averageRating ?? 0;
  const totalPages = responseData?.pagination?.totalPages ?? 1;

  const handleUpdateStatus = async (reviewId: string, status: ReviewStatus) => {
    if (!storeId) return;
    try {
      const res = await updateStatus({ storeId, reviewId, status }).unwrap();
      if (res.success) {
        toast.success(`Review ${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "updated"}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update review status");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!storeId) return;
    try {
      const res = await deleteReview({ storeId, reviewId }).unwrap();
      if (res.success) {
        toast.success("Review deleted");
        setConfirmDeleteId(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  if (isStoreLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title="Product Reviews"
        description="Moderate, approve, and manage customer reviews and star ratings."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
        comingSoon={false}
      >
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Reviews</span>
                <MessageSquare className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-apple-ink">{total}</p>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 shadow-xs">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Approval</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</p>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                <ThumbsUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{approvedCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Rating</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-apple-ink">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
              </p>
            </div>
          </div>

          {/* Filter Bar & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
              {(["all", "pending", "approved", "rejected"] as const).map((tab) => {
                const count =
                  tab === "pending"
                    ? pendingCount
                    : tab === "approved"
                    ? approvedCount
                    : tab === "rejected"
                    ? rejectedCount
                    : total;
                const active = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setPage(1);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all capitalize",
                      active
                        ? "bg-white text-apple-ink shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                    )}
                  >
                    <span>{tab}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px]",
                        active ? "bg-zinc-100 text-zinc-800" : "bg-zinc-200/70 text-zinc-500"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search reviews or customers…"
                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-apple-ink focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
              />
            </div>
          </div>

          {/* Table / List View */}
          {isReviewsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-apple-ink">No reviews found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {activeTab === "pending"
                  ? "There are currently no pending reviews requiring approval."
                  : "No reviews match your selected filter or search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Review</th>
                      <th className="py-3 px-4">Order / Verified</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {reviews.map((review) => {
                      const statusBadgeClass =
                        review.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : review.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200";

                      return (
                        <tr key={review._id} className="hover:bg-zinc-50/60 transition-colors">
                          {/* Customer */}
                          <td className="py-3.5 px-4 font-semibold text-apple-ink">
                            <div className="flex flex-col">
                              <span>{review.customerName || "Anonymous"}</span>
                              {review.customerEmail && (
                                <span className="text-[10px] text-zinc-400 font-normal">{review.customerEmail}</span>
                              )}
                            </div>
                          </td>

                          {/* Rating */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    s <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                                  )}
                                />
                              ))}
                              <span className="ml-1 font-bold text-apple-ink">{review.rating}</span>
                            </div>
                          </td>

                          {/* Review Title & Body */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {review.title && <p className="font-bold text-apple-ink truncate">{review.title}</p>}
                            <p className="line-clamp-2 text-zinc-500">{review.body || "No text provided"}</p>
                          </td>

                          {/* Order / Verified Purchase */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              {review.verifiedPurchase ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                  <ShieldCheck className="h-3 w-3" /> Verified Purchase
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-400">Unverified</span>
                              )}
                              {review.orderId && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                                  <ShoppingBag className="h-3 w-3" /> Order #{review.orderId.slice(-6)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusBadgeClass)}>
                              {review.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setDetailModalOpen(true);
                                }}
                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {review.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(review._id, "approved")}
                                  disabled={isUpdating}
                                  className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                                  title="Approve Review"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}

                              {review.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(review._id, "rejected")}
                                  disabled={isUpdating}
                                  className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"
                                  title="Reject Review"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(review._id)}
                                disabled={isDeleting}
                                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                                title="Delete Review"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 bg-zinc-50/50">
                  <span className="text-xs text-zinc-500">
                    Page {page} of {totalPages} ({total} reviews)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Details Modal */}
        <ReviewDetailModal
          open={detailModalOpen}
          review={selectedReview}
          onClose={() => setDetailModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          updating={isUpdating || isDeleting}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            if (confirmDeleteId) handleDelete(confirmDeleteId);
          }}
          title="Delete Review"
          message="Are you sure you want to permanently delete this customer review? This action cannot be undone."
          confirmLabel="Delete Review"
          variant="danger"
        />

      </EcommerceModuleShell>
    </StorePageCard>
  );
}
