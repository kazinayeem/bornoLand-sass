import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StoreShell } from "@/components/store-dashboard/store-shell";
import { generateStoreMetadata } from "@/lib/server/page-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }> | { storeSlug: string };
};

async function resolveParams(params: StoreLayoutProps["params"]) {
  return params instanceof Promise ? params : Promise.resolve(params);
}

export async function generateMetadata({ params }: { params: StoreLayoutProps["params"] }): Promise<Metadata> {
  const { storeSlug } = await resolveParams(params);
  return generateStoreMetadata({
    storeSlug,
    pageTitle: "Dashboard",
    description: "Manage your store workspace in BornoLand.",
    canonicalPath: `/store/${storeSlug}`,
  });
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  return <StoreShell>{children}</StoreShell>;
}
