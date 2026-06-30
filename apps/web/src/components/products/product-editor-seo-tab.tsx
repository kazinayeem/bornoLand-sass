"use client";

import { SafeMediaImage } from "@/components/media/safe-media-image";
import type { ProductEditorForm } from "@/components/products/product-form";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type SeoTabProps = {
  form: ProductEditorForm;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductEditorSeoTab({ form, onChange }: SeoTabProps) {
  const previewTitle = form.seoTitle || form.name || "Product title";
  const previewDescription = form.seoDescription || form.shortDescription || "Product description preview";
  const previewImage = resolveMediaUrl(form.imageUrl);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Search engine listing</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">SEO title</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => onChange({ seoTitle: e.target.value })}
              className={inputClass}
              placeholder={form.name || "Page title"}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">SEO description</label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => onChange({ seoDescription: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Keywords</label>
            <input
              type="text"
              value={form.seoKeywords}
              onChange={(e) => onChange({ seoKeywords: e.target.value })}
              className={inputClass}
              placeholder="keyword1, keyword2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Preview</h2>
        <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-blue-700">{previewTitle}</p>
          <p className="mt-1 text-xs text-emerald-700">yourstore.com/products/{form.slug || "product-slug"}</p>
          <p className="mt-2 line-clamp-2 text-xs text-zinc-600">{previewDescription}</p>
          {previewImage && (
            <div className="mt-3 h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
              <SafeMediaImage src={previewImage} alt="" className="h-24 w-24" lazy={false} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
