"use client";

import { MediaPicker } from "@/components/media/media-picker";
import { MediaGalleryPicker } from "@/components/media/media-gallery-picker";
import type { ProductEditorForm } from "@/components/products/product-form";
import { selectionMediaId } from "@/lib/media-selection";

type MediaTabProps = {
  form: ProductEditorForm;
  storeId: string;
  billingHref: string;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductEditorMediaTab({ form, storeId, billingHref, onChange }: MediaTabProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-apple-ink">Featured image</h2>
        <p className="mt-1 text-xs text-apple-ink-muted-48">Used in product cards, search results, and social previews.</p>
        <div className="mt-4">
          <MediaPicker
            storeId={storeId}
            billingHref={billingHref}
            folder="products"
            label="Featured image"
            value={{ mediaId: form.featuredImageId || undefined, url: form.imageUrl }}
            onChange={(selection) =>
              onChange({
                imageUrl: selection.url,
                thumbnailUrl: selection.thumbnailUrl || selection.url,
                featuredImageId: selectionMediaId(selection) ?? "",
              })
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-apple-ink">Gallery</h2>
        <p className="mt-1 text-xs text-apple-ink-muted-48">Upload, choose from library, drag to reorder.</p>
        <div className="mt-4">
          <MediaGalleryPicker
            storeId={storeId}
            billingHref={billingHref}
            folder="products"
            label="Product gallery"
            value={form.gallery}
            onChange={(gallery) => onChange({ gallery })}
          />
        </div>
      </section>
    </div>
  );
}
