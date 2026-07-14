import { Suspense } from "react";
import { StorefrontPageRenderer } from "@/components/storefront/storefront-page-renderer";
import { generateStorefrontPageMetadata } from "@/lib/server/page-metadata";
import type { Metadata } from "next";

type StoreIndexPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: StoreIndexPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return generateStorefrontPageMetadata({ storeSlug, pageSlug: "home" });
}

export default async function StoreIndexPage({ params }: StoreIndexPageProps) {
  const { storeSlug } = await params;

  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" /></div>}>
      <StorefrontPageRenderer storeSlug={storeSlug} pageSlug="home" />
    </Suspense>
  );
}
