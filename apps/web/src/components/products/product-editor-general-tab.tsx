"use client";

import dynamic from "next/dynamic";
import type { ProductEditorForm } from "@/components/products/product-form";

const RichTextEditor = dynamic(() => import("@/components/cms/rich-text-editor"), {
  loading: () => <div className="min-h-[240px] rounded-xl border border-zinc-200 bg-apple-canvas-parchment" />,
});

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type GeneralTabProps = {
  form: ProductEditorForm;
  categories: Array<{ _id: string; name: string }>;
  isEdit: boolean;
  onChange: (patch: Partial<ProductEditorForm>) => void;
  onNameChange: (name: string) => void;
};

export function ProductEditorGeneralTab({ form, categories, isEdit, onChange, onNameChange }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-apple-ink">General</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Product name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              className={inputClass}
              placeholder="e.g. Classic Cotton T-Shirt"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Short description</label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              placeholder="Brief summary for listings and SEO"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Full description</label>
            <RichTextEditor
              content={form.description}
              onChange={(html) => onChange({ description: html })}
              placeholder="Write a detailed product description..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-apple-ink">Organization</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Category</label>
            <select
              value={form.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Vendor</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => onChange({ vendor: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => onChange({ tags: e.target.value })}
              className={inputClass}
              placeholder="summer, cotton, bestseller"
            />
            <p className="mt-1 text-xs text-apple-ink-muted-48">Comma-separated tags</p>
          </div>
        </div>
      </section>

      {/* ── Pricing & Product Variant Toggle ─────────────────────── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-apple-ink">Pricing & Stock</h2>
            <p className="text-xs text-apple-ink-muted-48">Configure base pricing or enable variant-specific pricing</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-apple-ink transition-colors hover:bg-zinc-100">
            <input
              type="checkbox"
              checked={form.productType === "variable"}
              onChange={(e) =>
                onChange({
                  productType: e.target.checked ? "variable" : "simple",
                })
              }
              className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
            />
            This product has variants
          </label>
        </div>

        {form.productType === "simple" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Sell / Current Price *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => onChange({ price: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Regular / Old Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.comparePrice}
                onChange={(e) => onChange({ comparePrice: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Initial Stock</label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => onChange({ stock: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 text-xs text-violet-900">
            <p className="font-semibold">Variant-wise pricing enabled</p>
            <p className="mt-0.5 text-violet-700">
              Configure options, prices, stock, and images under the <strong>Variants</strong> tab.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

