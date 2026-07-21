"use client";

import { MediaLibrary } from "@/components/media/media-library";
import { Drawer } from "@/components/ui/drawer";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useRequiredStore } from "@/providers/store-context";
import { BUILDER_UPLOAD_FOLDER } from "@/lib/media-folders";

/** Builder sidebar — opens the same Store Media library used at /store/{slug}/media. */
export function MediaPanel({ billingHref }: { billingHref?: string }) {
  const { storeId, store } = useRequiredStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto overscroll-contain p-3">
      <div className="mb-3 space-y-2">
        <p className="text-[12px] text-apple-ink-muted-48">
          Same library as Store Media. Uploads appear everywhere instantly.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[12px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Open Store Media
        </button>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Store Media"
        description="Shared media library for this store."
        side="right"
        size="full"
        className="px-0 py-0"
      >
        <MediaLibrary
          storeId={storeId}
          store={store}
          billingHref={billingHref ?? `/store/${store?.slug ?? ""}/billing`}
          folder={BUILDER_UPLOAD_FOLDER}
        />
      </Drawer>
    </div>
  );
}
