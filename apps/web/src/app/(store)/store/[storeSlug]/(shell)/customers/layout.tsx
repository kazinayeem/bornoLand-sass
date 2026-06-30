import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateStorePageMetadata } from "@/lib/server/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  return generateStorePageMetadata({
    storeSlug,
    pageTitle: "Customers",
    canonicalPath: `/store/${storeSlug}/customers`,
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
