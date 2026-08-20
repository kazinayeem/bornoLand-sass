import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BuilderModeProvider } from "@/lib/builder-mode";
import { BuilderShell } from "@/components/builder/builder-shell";
import { BuilderErrorBoundary } from "@/components/builder/builder-error-boundary";
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

export default async function BuilderLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  return (
    <BuilderModeProvider>
      <BuilderErrorBoundary storeSlug={storeSlug}>
        <BuilderShell>{children}</BuilderShell>
      </BuilderErrorBoundary>
    </BuilderModeProvider>
  );
}
