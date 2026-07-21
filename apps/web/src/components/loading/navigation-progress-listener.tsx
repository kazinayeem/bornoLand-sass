"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/hooks/use-loading";

/**
 * Starts navigation progress on internal link clicks;
 * completes when the route (pathname / search) settles.
 */
export function NavigationProgressListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startNavigation, completeNavigation } = useLoading();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("href")?.startsWith("#")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
        startNavigation();
      } catch {
        // ignore malformed href
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startNavigation]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    completeNavigation();
  }, [pathname, searchParams, completeNavigation]);

  return null;
}
