import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from "@/providers/store-context";
import { buildPageMetadata, getStoreMetadataContext } from "@/lib/server/page-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  });
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return <StoreProvider>{children}</StoreProvider>;
}
