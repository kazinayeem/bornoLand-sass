"use client";

import type { ProductEditorForm } from "@/components/products/product-form";
import type { Product } from "@/redux/api/product-api";
import { Copy, ExternalLink, Trash2, FolderPlus } from "lucide-react";

type ProductEditorSidebarProps = {
  form: ProductEditorForm;
  product?: Product | null;
  storeName: string;
  categories?: { _id: string; name: string }[];
  onChange: (patch: Partial<ProductEditorForm>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  previewHref?: string;
};

const inputClass =
  "h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function ProductEditorSidebar({
  form,
  product,
  storeName,
  categories = [],
  onChange,
  onDuplicate,
  onDelete,
  previewHref,
}: ProductEditorSidebarProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* ── Category Section ───────────────────────────────────── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-ink-muted-48">Category</h3>
        <select
          value={form.categoryIds?.[0] || form.category || ""}
          onChange={(e) => onChange({ category: e.target.value, categoryIds: e.target.value ? [e.target.value] : [] })}
          className={inputClass}
        >
          <option value="">No assigned category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {/* ── Brand (SEO & Data Feed) ───────────────────────────── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-ink-muted-48">Brand (SEO & Data Feed)</h3>
        <input
          type="text"
          placeholder="Brand Name"
          value={form.brand || ""}
          onChange={(e) => onChange({ brand: e.target.value })}
          className={inputClass}
        />
      </section>

      {/* ── Product Weight & Dimensions ───────────────────────── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-ink-muted-48">Product Weight & Dimensions</h3>
        <div>
          <label className="text-[11px] text-apple-ink-muted-80">Weight (kg)</label>
          <input
            type="text"
            placeholder="e.g., 1.5"
            value={form.weight ?? ""}
            onChange={(e) => onChange({ weight: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div>
          <label className="text-[11px] text-apple-ink-muted-80">Dimensions (cm) — L x W x H</label>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            <input
              type="text"
              placeholder="L"
              value={form.dimensionsLength ?? ""}
              onChange={(e) => onChange({ dimensionsLength: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="W"
              value={form.dimensionsWidth ?? ""}
              onChange={(e) => onChange({ dimensionsWidth: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="H"
              value={form.dimensionsHeight ?? ""}
              onChange={(e) => onChange({ dimensionsHeight: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Product Status ─────────────────────────────────────── */}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-ink-muted-48">Product Status</h3>
        <select
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value as ProductEditorForm["status"] })}
          className={inputClass}
        >
          <option value="active">ACTIVE</option>
          <option value="draft">DRAFT</option>
          <option value="archived">ARCHIVED</option>
        </select>
      </section>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-ink-muted-48">Actions</h3>
        <div className="mt-3 space-y-2">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
          )}
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            >
              <Copy className="h-4 w-4" /> Duplicate
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

