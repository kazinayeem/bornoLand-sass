import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { StoreProvider } from "@/providers/store-context";
import { buildPageMetadata, getStoreMetadataContext } from "@/lib/server/page-metadata";
import { getStoreFullContext } from "@/lib/server/store-context";
import { getServerSession } from "@/lib/auth-session";
import type { Metadata } from "next";

/**
 * Store layout — Server Component.
 * Loads store context (branding, theme, plan, subscription, permissions) once per navigation tree.
 * Child routes share StoreProvider without refetching on client navigations.
 */

export const dynamic = "force-dynamic";

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ storeSlug: string }> }): Promise<Metadata> {
  const { storeSlug } = await params;
  const context = await getStoreFullContext(storeSlug);
  const store = context?.store || (await getStoreMetadataContext(storeSlug));
  const storeName = store?.shortName || store?.name || "Store";
  return buildPageMetadata({
    title: `${storeName}`,
    description: store?.description || `Manage ${storeName} in BornoLand.`,
    canonicalPath: `/store/${storeSlug}/dashboard`,
    iconUrl: store?.faviconUrl || store?.logoUrl,
    keywords: [storeName, "store dashboard", "ecommerce"].join(", "),
    ogImage: store?.logoUrl,
  });
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { storeSlug } = await params;
  const initialContext = await getStoreFullContext(storeSlug);

  if (!initialContext || !initialContext.store) {
    const session = await getServerSession();
    if (session?.defaultStoreSlug && session.defaultStoreSlug !== storeSlug) {
      redirect(`/store/${session.defaultStoreSlug}/dashboard`);
    } else {
      redirect("/unauthorized");
    }
  }

  return (
    <StoreProvider initialStore={initialContext.store} initialContext={initialContext as any}>
      {children}
    </StoreProvider>
  );
}
