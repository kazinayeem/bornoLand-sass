import { Suspense } from "react";
import { StorefrontPageRenderer } from "@/components/storefront/storefront-page-renderer";
import { generateStorefrontPageMetadata } from "@/lib/server/page-metadata";
import type { Metadata } from "next";

type StorefrontPageProps = {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
};

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { storeSlug, pageSlug } = await params;
  return generateStorefrontPageMetadata({ storeSlug, pageSlug });
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { storeSlug, pageSlug } = await params;

  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-apple-hairline border-t-zinc-900" /></div>}>
      <StorefrontPageRenderer storeSlug={storeSlug} pageSlug={pageSlug} />
    </Suspense>
  );
}
