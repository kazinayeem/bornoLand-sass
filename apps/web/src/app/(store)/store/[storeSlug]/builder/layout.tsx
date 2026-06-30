import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BuilderShell } from "@/components/builder/builder-shell";
import { generateStorePageMetadata } from "@/lib/server/page-metadata";

/**
 * Builder shell — Server layout wrapping CSR editor (BuilderEditor is dynamically imported).
 * Canvas, layers, inspector, and media picker remain client-side for interactivity.
 */

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  return generateStorePageMetadata({
    storeSlug,
    pageTitle: "Builder",
    canonicalPath: `/store/${storeSlug}/builder`,
  });
}

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return <BuilderShell>{children}</BuilderShell>;
}
