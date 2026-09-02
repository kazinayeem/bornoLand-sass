"use client";

import dynamic from "next/dynamic";
import type { ProductEditorForm } from "@/components/products/product-form";

const RichTextEditor = dynamic(() => import("@/components/cms/rich-text-editor"), {
  loading: () => <div className="min-h-[220px] rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />,
});

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

type ProductBasicSectionProps = {
  form: ProductEditorForm;
  isEdit: boolean;
  onChange: (patch: Partial<ProductEditorForm>) => void;
  onNameChange: (name: string) => void;
};

export function ProductBasicSection({
  form,
  isEdit,
  onChange,
  onNameChange,
}: ProductBasicSectionProps) {
  return (
    <section id="section-basic" className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Basic Information
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Essential details about your product shown across your store and POS.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Product Name <span className="text-red-500">*</span></span>
            <span className="text-[11px] font-normal text-zinc-400">{form.name.length}/200</span>
          </label>
          <input
            type="text"
            required
            autoFocus={!isEdit}
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            className={inputClass}
            placeholder="e.g. Pure Organic Ginger Powder 150g"
          />
          {!form.name.trim() && (
            <p className="mt-1 text-xs text-zinc-400">Enter a descriptive title for your product.</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Product Handle / URL Slug
            </label>
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden focus-within:border-zinc-900 dark:focus-within:border-zinc-100">
              <span className="inline-flex items-center px-3 text-xs text-zinc-400 select-none">/products/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => onChange({ slug: e.target.value })}
                className="h-10 w-full bg-transparent pr-3 text-xs font-mono text-zinc-900 focus:outline-none dark:text-zinc-100"
                placeholder="product-slug"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Short Description / Subtitle
            </label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              className={inputClass}
              placeholder="Brief summary for listings, POS & cards"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Full Description
          </label>
          <RichTextEditor
            content={form.description}
            onChange={(html) => onChange({ description: html })}
            placeholder="Write a detailed product description, ingredients, specifications..."
          />
        </div>
      </div>
    </section>
  );
}
