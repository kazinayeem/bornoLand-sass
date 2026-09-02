"use client";

import { Globe } from "lucide-react";
import type { ProductEditorForm } from "@/components/products/product-form";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

type ProductSeoSectionProps = {
  form: ProductEditorForm;
  storeSlug?: string;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductSeoSection({ form, storeSlug, onChange }: ProductSeoSectionProps) {
  const displayTitle = form.seoTitle || form.name || "Product Title";
  const displayUrl = `https://${storeSlug || "store"}.bornoland.com/products/${form.slug || "product-url"}`;
  const displayDescription =
    form.seoDescription ||
    form.shortDescription ||
    "Add a meta description to see how this product appears in Google search engine result snippets.";

  return (
    <section id="section-seo" className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Search Engine Optimization (SEO)
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Optimize title tags and meta descriptions to improve Google and social rankings.
        </p>
      </div>

      {/* Google SERP Preview Card */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <Globe className="h-3.5 w-3.5" />
          <span>Google Search Result Preview</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono truncate">{displayUrl}</p>
          <h3 className="text-sm font-semibold text-[#1a0dab] hover:underline dark:text-[#8ab4f8] cursor-pointer truncate">
            {displayTitle}
          </h3>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>SEO Page Title</span>
            <span className="text-[11px] font-normal text-zinc-400">{(form.seoTitle || form.name).length}/70</span>
          </div>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => onChange({ seoTitle: e.target.value })}
            className={inputClass}
            placeholder={form.name || "Default: Product Name"}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Meta Description</span>
            <span className="text-[11px] font-normal text-zinc-400">{form.seoDescription.length}/160</span>
          </div>
          <textarea
            rows={3}
            value={form.seoDescription}
            onChange={(e) => onChange({ seoDescription: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            placeholder="Brief summary optimized for search engines..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            SEO Keywords
          </label>
          <input
            type="text"
            value={form.seoKeywords}
            onChange={(e) => onChange({ seoKeywords: e.target.value })}
            className={inputClass}
            placeholder="organic, spices, ginger, powder"
          />
          <p className="mt-1 text-[11px] text-zinc-400">Comma-separated keywords for internal search and indexing.</p>
        </div>
      </div>
    </section>
  );
}
