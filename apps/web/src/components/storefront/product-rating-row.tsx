"use client";

import { Star } from "lucide-react";
import { useGetPublicReviewsQuery } from "@/redux/api/review-api";
import { cn } from "@/lib/utils";

type ProductRatingRowProps = {
  storeId: string;
  productId: string;
  className?: string;
};

/** Real review summary from the public reviews API — renders nothing when unavailable. */
export function ProductRatingRow({ storeId, productId, className }: ProductRatingRowProps) {
  const { data, isLoading, isError } = useGetPublicReviewsQuery(
    { storeId, productId, page: 1, limit: 1 },
    { skip: !storeId || !productId },
  );

  if (isLoading || isError) return null;

  const averageRating = data?.data?.averageRating ?? 0;
  const total = data?.data?.total ?? 0;

  if (total <= 0 || averageRating <= 0) return null;

  const rounded = Math.round(averageRating);

  return (
    <div className={cn("mt-1.5 flex items-center gap-1", className)}>
      <div className="flex text-amber-400" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3 w-3",
              star <= rounded ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200",
            )}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-zinc-500 ml-0.5">
        {averageRating.toFixed(1)} ({total})
      </span>
    </div>
  );
}
