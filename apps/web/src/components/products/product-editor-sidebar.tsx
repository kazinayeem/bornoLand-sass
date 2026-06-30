"use client";

import type { ProductEditorForm } from "@/components/products/product-form";
import type { Product } from "@/redux/api/product-api";
import { Copy, ExternalLink, Trash2 } from "lucide-react";

type ProductEditorSidebarProps = {
  form: ProductEditorForm;
  product?: Product | null;
  storeName: string;
  onChange: (patch: Partial<ProductEditorForm>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  previewHref?: string;
};

const inputClass =
  "h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function ProductEditorSidebar({
  form,
  product,
  storeName,
  onChange,
  onDuplicate,
  onDelete,
  previewHref,
}: ProductEditorSidebarProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</h3>
        <select
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value as ProductEditorForm["status"] })}
          className={`${inputClass} mt-2`}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Product Type</h3>
        <select
          value={form.productType}
          onChange={(e) => onChange({ productType: e.target.value as ProductEditorForm["productType"] })}
          className={`${inputClass} mt-2`}
        >
          <option value="simple">Simple</option>
          <option value="variable">Variable</option>
          <option value="digital">Digital</option>
          <option value="service">Service</option>
        </select>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Visibility</h3>
        <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => onChange({ featured: e.target.checked })}
            className="rounded border-zinc-300"
          />
          Featured product
        </label>
        <p className="mt-2 text-xs text-zinc-500">
          {form.status === "active" ? "Published and visible in storefront" : "Not published"}
        </p>
      </section>

      {product && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Details</h3>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Created</dt>
              <dd className="font-medium text-zinc-800">
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Updated</dt>
              <dd className="font-medium text-zinc-800">
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Store</dt>
              <dd className="font-medium text-zinc-800">{storeName}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Quick Actions</h3>
        <div className="mt-3 space-y-2">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              className="flex w-full items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </a>
          )}
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="flex w-full items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
