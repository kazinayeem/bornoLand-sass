"use client";

import { useEffect, useRef, useCallback } from "react";

type UseInfiniteScrollOptions = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
};

export function useInfiniteScroll({ hasMore, isLoading, onLoadMore, threshold = 200 }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: `${threshold}px` });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, threshold]);

  return { sentinelRef };
}
