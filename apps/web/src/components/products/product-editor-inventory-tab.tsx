"use client";

import type { ProductEditorForm } from "@/components/products/product-form";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type InventoryTabProps = {
  form: ProductEditorForm;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductEditorInventoryTab({ form, onChange }: InventoryTabProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-apple-ink">Inventory</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">SKU</label>
          <input type="text" value={form.sku} onChange={(e) => onChange({ sku: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Barcode</label>
          <input type="text" value={form.barcode} onChange={(e) => onChange({ barcode: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Stock quantity</label>
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => onChange({ stock: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Low stock alert</label>
          <input
            type="number"
            min={0}
            value={form.lowStockThreshold}
            onChange={(e) => onChange({ lowStockThreshold: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-apple-ink-muted-80">
            <input
              type="checkbox"
              checked={form.trackInventory}
              onChange={(e) => onChange({ trackInventory: e.target.checked })}
              className="rounded border-zinc-300"
            />
            Track inventory for this product
          </label>
        </div>
      </div>
    </section>
  );
}
