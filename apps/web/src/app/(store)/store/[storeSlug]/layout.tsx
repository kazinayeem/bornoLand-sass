import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StoreShell } from "@/components/store-dashboard/store-shell";
import { buildPageMetadata, getStoreMetadataContext } from "@/lib/server/page-metadata";

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await getStoreMetadataContext(storeSlug);
  const storeName = store?.name ?? "Store";
  return buildPageMetadata({
    title: `Dashboard • ${storeName}`,
    description: `Manage ${storeName} in BornoLand.`,
    canonicalPath: `/store/${storeSlug}`,
  });
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  return <StoreShell>{children}</StoreShell>;
}
