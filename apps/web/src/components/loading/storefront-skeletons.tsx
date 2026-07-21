import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
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
export function ShopStorefrontSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl animate-fade-in px-4 py-8 sm:px-6", className)} aria-busy aria-label="Loading products">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-full max-w-xs rounded-full sm:w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
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
    <div className={cn("mx-auto w-full max-w-5xl animate-fade-in px-4 py-8 sm:px-6", className)} aria-busy aria-label="Loading checkout">
      <Skeleton className="mb-8 h-8 w-40" />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, block) => (
            <div key={block} className="space-y-4 rounded-2xl border border-apple-hairline p-6">
              <Skeleton className="h-5 w-36" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl sm:col-span-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-fit space-y-4 rounded-2xl border border-apple-hairline p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-4 h-12 w-full rounded-full" />
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
