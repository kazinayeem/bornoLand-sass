"use client";

import { useState } from "react";
import { Star, ShieldCheck, MessageSquarePlus, ThumbsUp, User } from "lucide-react";
import { useGetPublicReviewsQuery } from "@/redux/api/review-api";
import { WriteReviewModal } from "./write-review-modal";
import { Skeleton } from "@/components/ui/skeleton";

type ProductReviewsProps = {
  storeId: string;
  productId: string;
  productName: string;
  primaryColor?: string;
};

export function ProductReviews({
  storeId,
  productId,
  productName,
  primaryColor = "#000000",
}: ProductReviewsProps) {
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPublicReviewsQuery(
    { storeId, productId, page, limit: 10 },
    { skip: !storeId || !productId }
  );

  const reviewsData = data?.data;
  const reviews = reviewsData?.reviews ?? [];
  const total = reviewsData?.total ?? 0;
  const averageRating = reviewsData?.averageRating ?? 0;
  const distribution = reviewsData?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <section className="w-full space-y-8 py-8 border-t border-zinc-200 dark:border-zinc-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Customer Reviews</h2>
          <p className="text-xs text-zinc-500 mt-1">Real ratings and feedback from verified purchasers</p>
        </div>

        <button
          type="button"
          onClick={() => setWriteModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 self-start sm:self-auto"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageSquarePlus className="h-4 w-4" /> Write a Review
        </button>
      </div>

      {/* Ratings Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6">
        {/* Rating Score */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 pb-6 md:pb-0">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-zinc-500">
            Based on {total} {total === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* 5-Star Distribution Breakdown */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as keyof typeof distribution] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-semibold text-right flex items-center justify-end gap-1">
                  {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: primaryColor }}
                  />
                </div>
                <span className="w-12 text-right text-zinc-400 text-[11px] font-medium">{count} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold">No reviews yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">Be the first customer to share your experience with this product!</p>
          <button
            type="button"
            onClick={() => setWriteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> Leave First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs"
            >
              {/* Header: User & Rating */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-xs">
                    {review.customerName ? review.customerName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{review.customerName || "Verified Buyer"}</span>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title & Body */}
              {review.title && <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{review.title}</h4>}
              {review.body && <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{review.body}</p>}

              {/* Attached Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {review.images.map((imgUrl, i) => (
                    <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="block h-14 w-14 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50">
                      <img src={imgUrl} alt={`Review media ${i + 1}`} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        open={writeModalOpen}
        storeId={storeId}
        productId={productId}
        productName={productName}
        onClose={() => setWriteModalOpen(false)}
      />
    </section>
  );
}
