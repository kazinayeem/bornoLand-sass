"use client";

export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-zinc-100">
          <div className="aspect-square animate-pulse bg-zinc-200" />
          <div className="space-y-2 p-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-100" />
            <div className="flex gap-1">
              <div className="h-7 flex-1 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-7 w-7 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-7 w-7 animate-pulse rounded-lg bg-zinc-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
