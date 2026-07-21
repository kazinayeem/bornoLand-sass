"use client";

import { useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";

export function ProductSkeleton() {
  const { classes } = useStorefrontSurface();

  return (
    <div className={cn("storefront-utility-card animate-pulse overflow-hidden", classes.card)}>
      <div className={cn("aspect-square rounded-apple-sm", classes.imageWell)} />
      <div className="mt-4 space-y-3">
        <div className={cn("h-3 w-16 rounded-apple-xs", classes.imageWell)} />
        <div className={cn("h-4 w-3/4 rounded-apple-xs", classes.imageWell)} />
        <div className={cn("h-3 w-1/2 rounded-apple-xs", classes.imageWell)} />
        <div className="flex items-center justify-between">
          <div className={cn("h-5 w-16 rounded-apple-xs", classes.imageWell)} />
          <div className={cn("h-3 w-12 rounded-apple-xs", classes.imageWell)} />
        </div>
        <div className={cn("h-10 w-full rounded-apple-pill", classes.imageWell)} />
      </div>
    </div>
  );
}
