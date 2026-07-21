"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/** Resolve storefront-relative hrefs for builder preview and /site/[tenant] paths. */
export function resolveStoreHref(href: string, pathname: string): string {
  if (!href || href === "#") return href;
  if (!isInternalHref(href)) return href;

  if (pathname.startsWith("/store/")) {
    const storeSlug = pathname.split("/")[2];
    if (storeSlug && !href.startsWith(`/store/${storeSlug}`)) {
      return href === "/" ? `/store/${storeSlug}` : `/store/${storeSlug}${href}`;
    }
    return href;
  }

  if (pathname.startsWith("/site/")) {
    const tenant = pathname.split("/")[2];
    if (tenant && !href.startsWith(`/site/${tenant}`)) {
      return href === "/" ? `/site/${tenant}` : `/site/${tenant}${href}`;
    }
    return href;
  }

  return href;
}

export function useStoreHref(href: string): string {
  const pathname = usePathname() || "";
  return useMemo(() => resolveStoreHref(href, pathname), [href, pathname]);
}

export function useProductHref(slug: string, disabled = false): string {
  const pathname = usePathname() || "";
  return useMemo(() => {
    if (disabled || !slug) return "#";
    return resolveStoreHref(`/products/${slug}`, pathname);
  }, [slug, disabled, pathname]);
}
