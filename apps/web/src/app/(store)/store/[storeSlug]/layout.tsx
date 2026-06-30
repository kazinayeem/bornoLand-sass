import type { ReactNode } from "react";
import { StoreProvider } from "@/providers/store-context";
import { buildPageMetadata, getStoreMetadataContext } from "@/lib/server/page-metadata";
import { getStoreContext } from "@/lib/server/store-context";
import type { Metadata } from "next";

/**
 * Store layout — Server Component.
 * Loads store (branding, theme, plan, subscription) once per navigation tree.
 * Child routes share StoreProvider without refetching on client navigations.
 * Dashboard pages under (shell) use SSR via force-dynamic on that layout.
 */

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreMetadataContext(storeSlug);
  const storeName = store?.shortName || store?.name || "Store";
  return buildPageMetadata({
    title: `${storeName}`,
    description: store?.description || `Manage ${storeName} in BornoLand.`,
    canonicalPath: `/store/${storeSlug}/dashboard`,
    iconUrl: store?.faviconUrl || store?.logoUrl,
    keywords: [storeName, "store dashboard", "ecommerce"].join(", "),
    ogImage: store?.logoUrl,
  });
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { storeSlug } = await params;
  const initialStore = await getStoreContext(storeSlug);

  return <StoreProvider initialStore={initialStore}>{children}</StoreProvider>;
}
