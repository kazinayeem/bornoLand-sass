import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateStoreMetadata } from "@/lib/server/page-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  return generateStoreMetadata({
    storeSlug,
    pageTitle: "Store",
    description: "Manage your store workspace in BornoLand.",
    canonicalPath: `/store/${storeSlug}`,
  });
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return children;
}
