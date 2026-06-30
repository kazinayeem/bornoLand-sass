import type { Metadata } from "next";
import { generateStorePageMetadata } from "@/lib/server/page-metadata";
import { StorePagesPanel } from "@/components/store-dashboard/store-pages-panel";

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  return generateStorePageMetadata({
    storeSlug,
    pageTitle: "Pages",
    canonicalPath: `/store/${storeSlug}/pages`,
  });
}

export default function StorePagesPage() {
  return <StorePagesPanel />;
}
