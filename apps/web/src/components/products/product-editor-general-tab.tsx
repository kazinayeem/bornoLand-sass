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

      {form.productType === "simple" && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-apple-ink">Pricing</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => onChange({ price: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Compare at price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.comparePrice}
                onChange={(e) => onChange({ comparePrice: e.target.value })}
                className={inputClass}
              />
            </div>
            {!isEdit && (
              <div>
                <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Initial stock</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => onChange({ stock: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
