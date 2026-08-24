import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProductCardSkeleton() {
  return (
    <div className="storefront-utility-card relative flex flex-col overflow-hidden p-apple-lg">
      <div className="relative flex flex-col">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-apple-sm bg-apple-canvas-parchment">
          <div className="h-full w-full skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-[1.125rem] w-4/5 rounded-apple-xs bg-apple-canvas-parchment skeleton-shimmer" />
          <div className="h-[1.125rem] w-3/5 rounded-apple-xs bg-apple-canvas-parchment skeleton-shimmer" />
        </div>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="h-3 w-3 rounded-apple-xs bg-apple-canvas-parchment skeleton-shimmer" />
          ))}
          <div className="ml-1 h-3 w-8 rounded-apple-xs bg-apple-canvas-parchment skeleton-shimmer" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-5 w-20 rounded-apple-xs bg-apple-canvas-parchment skeleton-shimmer" />
          <div className="h-4 w-16 rounded-apple-xs bg-apple-canvas-parchment skeleton-shimmer" />
        </div>
        <div className="mt-3 h-10 w-full rounded-apple-pill bg-apple-canvas-parchment skeleton-shimmer" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
}

function FeatureCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-apple-hairline bg-apple-canvas p-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

/** Home — hero + feature cards + product cards */
export function HomeStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full animate-fade-in", className)} aria-busy aria-label="Loading store">
      <Skeleton className="h-[min(72vh,560px)] w-full rounded-none" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <FeatureCardSkeleton key={i} />
          ))}
        </div>
        <div className="mt-14 mb-8 space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Shop / category / search — product grid */
export function ShopStorefrontSkeleton({ className, count = 12 }: { className?: string; count?: number }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl animate-fade-in px-4 py-8 sm:px-6", className)} aria-busy aria-label="Loading products">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 skeleton-shimmer" />
          <Skeleton className="h-4 w-56 skeleton-shimmer" />
        </div>
        <Skeleton className="h-10 w-full max-w-xs rounded-full sm:w-48 skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <ProductGridSkeleton count={count} />
      </div>
    </div>
  );
}

/** Product detail — image + info */
export function ProductStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl animate-fade-in px-4 py-8 sm:px-6", className)} aria-busy aria-label="Loading product">
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-5 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-6 w-28" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-36 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cart — line items */
export function CartStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl animate-fade-in px-4 py-8 sm:px-6", className)} aria-busy aria-label="Loading cart">
      <Skeleton className="mb-8 h-8 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-apple-hairline p-4">
            <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3 py-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-3 rounded-2xl border border-apple-hairline p-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-4 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Checkout — form layout */
export function CheckoutStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl animate-fade-in px-4 py-8 sm:px-6 lg:px-8", className)}
      aria-busy="true"
      aria-label="Loading checkout"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-32 rounded-md" />
            <Skeleton className="h-3.5 w-24 rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>

      {/* 5-col Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Column (3 cols) */}
        <div className="space-y-6 lg:col-span-3">
          {/* Step 1: Customer & Address */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Zone */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 w-44 rounded-md" />
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <div className="grid gap-2.5">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4 rounded-sm" />
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </div>
                <Skeleton className="h-4 w-12 rounded-sm" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3 rounded-sm" />
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </div>
                <Skeleton className="h-4 w-12 rounded-sm" />
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-100 pt-3">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-14" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-12" />
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Blog index — card grid */
export function BlogStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl animate-fade-in px-4 py-8 sm:px-6", className)} aria-busy aria-label="Loading blog">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Contact — form */
export function ContactStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl animate-fade-in px-4 py-10 sm:px-6", className)} aria-busy aria-label="Loading contact">
      <div className="mb-8 space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
      <div className="space-y-4 rounded-2xl border border-apple-hairline p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>
    </div>
  );
}

/** Account / login — compact form */
export function AccountStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-md animate-fade-in flex-col px-4 py-16 sm:px-6", className)} aria-busy aria-label="Loading account">
      <Skeleton className="mx-auto mb-8 h-8 w-40" />
      <div className="space-y-4 rounded-2xl border border-apple-hairline p-6">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="mx-auto h-3 w-40" />
      </div>
    </div>
  );
}

/** Generic lightweight storefront fallback (content pages) */
export function ContentStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl animate-fade-in px-4 py-12 sm:px-6", className)} aria-busy aria-label="Loading page">
      <Skeleton className="mb-6 h-9 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
