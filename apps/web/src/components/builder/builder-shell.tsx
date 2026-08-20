"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";
import {
  BuilderLoadingScreen,
  useMinimumLoading,
} from "@/components/builder/builder-loading-screen";

export function BuilderShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();
  const { show, exiting } = useMinimumLoading(isLoading);

  if (show || isLoading || (!store && !isError)) {
    return <BuilderLoadingScreen exiting={exiting} className="h-screen min-h-0" />;
  }

  if (isError || !store) {
    return (
      <div className="flex h-screen items-center justify-center bg-apple-canvas-parchment p-6">
        <div className="max-w-sm rounded-apple-lg border border-apple-hairline bg-apple-canvas p-8 text-center shadow-sm">
          <h2 className="text-tagline text-apple-ink">Store not found</h2>
          <p className="mt-2 text-caption text-apple-ink-muted-48">
            This store doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Link
            href="/dashboard/stores"
            className="mt-5 inline-block text-caption font-medium text-apple-primary underline underline-offset-4"
          >
            Back to stores
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen overflow-hidden bg-apple-canvas-parchment">
      <StoreBrandingSync store={store} />
      {children}
    </div>
  );
}
