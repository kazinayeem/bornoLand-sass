"use client";

import CmsPageView from "@/components/storefront/cms-page-view";

/** Thin client wrappers kept for SSR page.tsx files that pass initial CMS data. */
export function PolicyPageClient(props: {
  slug: string;
  title: string;
  description?: string;
  iconName?: "help" | "file" | "shield" | "truck" | "returns" | "ruler";
  initialPage?: import("@/lib/cms-page-types").CmsPageData | null;
}) {
  return <CmsPageView {...props} />;
}
