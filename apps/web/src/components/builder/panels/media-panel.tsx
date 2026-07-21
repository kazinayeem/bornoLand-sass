"use client";

import { MediaLibrary } from "@/components/media/media-library";
import { Drawer } from "@/components/ui/drawer";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useRequiredStore } from "@/providers/store-context";

export function MediaPanel({ billingHref }: { billingHref?: string }) {
  const { storeId } = useRequiredStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto overscroll-contain p-3">
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-apple-ink-muted-80"
        >
          <ImagePlus className="mr-1 inline h-3 w-3" /> Open library
        </button>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Builder Media"
        description="Upload images and files for your storefront sections."
        side="right"
        size="full"
        className="px-0 py-0"
      >
        <MediaLibrary storeId={storeId} billingHref={billingHref ?? "#"} folder="builder" />
      </Drawer>
    </div>
  );
}
