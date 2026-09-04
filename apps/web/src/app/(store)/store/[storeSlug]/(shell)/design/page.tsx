"use client";

import Link from "next/link";
import { StoreDesignHub } from "@/components/store-dashboard/store-design-hub";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { Button } from "@/components/ui/button";
import { ExternalLink, Palette, Wand2 } from "lucide-react";
import { getStoreUrl } from "@/lib/urls";

export default function StoreDesignPage() {
  const { storeId, store, isLoading } = useStorePage();
  const storefrontUrl = store ? getStoreUrl(store.slug) : "#";
  const builderUrl = store ? `/store/${store.slug}/builder/home` : "#";

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Store Design & Theme Studio"
        description="Customize storefront themes, color palettes, typography, responsive layouts, and drag-and-drop landing sections."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Appearance" },
          { label: "Theme & Design" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <span>Live Storefront</span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </a>

            <Link href={builderUrl}>
              <Button
                size="sm"
                className="gap-1.5 bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold shadow-2xs cursor-pointer"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Launch Visual Builder</span>
              </Button>
            </Link>
          </div>
        }
      />

      <StorePageCard>
        {isLoading || !storeId ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#003399] border-t-transparent" />
          </div>
        ) : (
          <StoreDesignHub storeId={storeId} />
        )}
      </StorePageCard>
    </div>
  );
}
