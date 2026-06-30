import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateProductPageMetadata } from "@/lib/server/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string; productId: string }> }): Promise<Metadata> {
  const { storeSlug, productId } = await params;
  return generateProductPageMetadata({
    storeSlug,
    productId,
    mode: "duplicate",
    canonicalPath: `/store/${storeSlug}/products/${productId}/duplicate`,
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
