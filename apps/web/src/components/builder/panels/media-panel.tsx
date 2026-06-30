"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";

const MediaLibrary = dynamic(
  () => import("@/components/media/media-library").then((module) => module.MediaLibrary),
  { loading: () => <div className="p-4 text-sm text-zinc-500">Loading media library...</div> }
);

export function MediaPanel({ storeId, billingHref }: { storeId?: string; billingHref?: string }) {
  const [open, setOpen] = useState(false);
  if (!storeId) {
    return <div className="p-4 text-xs text-zinc-400">Select a store to browse media.</div>;
  }

  return (
    <>
      <div className="h-full p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Media</p>
        <div className="mt-3 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
              <ImagePlus className="h-4 w-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Asset Manager</p>
              <p className="text-xs text-zinc-500">Open the media drawer only when you need to pick or upload assets.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded-2xl bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white"
          >
            Open Media Drawer
          </button>
        </div>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Media Library"
        description="Browse, upload, and select assets without permanently reducing canvas space."
        side="right"
        size="full"
        className="px-0 py-0"
      >
        <MediaLibrary storeId={storeId} billingHref={billingHref ?? "#"} folder="builder" />
      </Drawer>
    </>
  );
}
