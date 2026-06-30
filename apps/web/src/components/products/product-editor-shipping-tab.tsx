"use client";

import type { ProductEditorForm } from "@/components/products/product-form";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type ShippingTabProps = {
  form: ProductEditorForm;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductEditorShippingTab({ form, onChange }: ShippingTabProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">Shipping</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Weight</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Weight unit</label>
          <select
            value={form.weightUnit}
            onChange={(e) => onChange({ weightUnit: e.target.value })}
            className={inputClass}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Length</label>
          <input
            type="number"
            min={0}
            value={form.dimensionsLength}
            onChange={(e) => onChange({ dimensionsLength: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Width</label>
          <input
            type="number"
            min={0}
            value={form.dimensionsWidth}
            onChange={(e) => onChange({ dimensionsWidth: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Height</label>
          <input
            type="number"
            min={0}
            value={form.dimensionsHeight}
            onChange={(e) => onChange({ dimensionsHeight: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Dimension unit</label>
          <select
            value={form.dimensionsUnit}
            onChange={(e) => onChange({ dimensionsUnit: e.target.value })}
            className={inputClass}
          >
            <option value="cm">cm</option>
            <option value="in">in</option>
            <option value="m">m</option>
          </select>
        </div>
      </div>
    </section>
  );
}
