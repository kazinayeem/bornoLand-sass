"use client";

import { memo, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

type DataGridInfiniteLoaderProps = {
  hasNextPage?: boolean;
  isFetching?: boolean;
  onLoadMore?: () => void;
};

function DataGridInfiniteLoaderInner({ hasNextPage, isFetching, onLoadMore }: DataGridInfiniteLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || !onLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetching) onLoadMore();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, onLoadMore]);

  if (!hasNextPage) return null;

  return (
    <div ref={sentinelRef} className="flex items-center justify-center py-4 text-sm text-apple-ink-muted-48">
      {isFetching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading more…
        </>
      ) : (
        "Scroll to load more"
      )}
    </div>
  );
}

export const DataGridInfiniteLoader = memo(DataGridInfiniteLoaderInner);
