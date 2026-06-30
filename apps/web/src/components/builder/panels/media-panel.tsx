"use client";

import dynamic from "next/dynamic";
import { ImagePlus } from "lucide-react";

const MediaLibrary = dynamic(
  () => import("@/components/media/media-library").then((module) => module.MediaLibrary),
  { loading: () => <div className="p-4 text-sm text-zinc-500">Loading media library...</div> }
);

export function MediaPanel({ storeId, billingHref }: { storeId?: string; billingHref?: string }) {
  if (!storeId) {
    return <div className="p-4 text-xs text-zinc-400">Select a store to browse media.</div>;
  }

  return (
    <div className="h-full">
      <div className="border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-sm font-semibold text-zinc-900">Media</p>
            <p className="text-xs text-zinc-500">Choose images for sections and backgrounds.</p>
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-73px)] overflow-hidden">
        <MediaLibrary storeId={storeId} billingHref={billingHref ?? "#"} folder="builder" />
      </div>
    </div>
  );
}
