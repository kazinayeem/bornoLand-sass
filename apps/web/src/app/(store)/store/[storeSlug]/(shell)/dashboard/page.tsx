"use client";

import { StoreDashboard } from "@/components/store-dashboard/store-dashboard";
import { useStorePage } from "@/components/store-dashboard/store-page";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[18px] bg-zinc-100 ${className ?? ""}`} />;
}

export default function StoreDashboardPage() {
  const { store, storeId, isLoading } = useStorePage();

  if (isLoading || !store || !storeId) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <SkeletonBlock className="h-32 w-full border border-[#ececec] bg-white" />
        {/* Stats skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-28 border border-[#ececec] bg-white" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonBlock key={i} className="h-28 border border-[#ececec] bg-white" />
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="grid gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonBlock key={i} className="h-40 border border-[#ececec] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return <StoreDashboard store={store} storeId={storeId} />;
}
