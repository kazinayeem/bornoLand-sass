"use client";

import type { ProductEditorForm } from "@/components/products/product-form";

type AdvancedTabProps = {
  form: ProductEditorForm;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductEditorAdvancedTab({ form, onChange }: AdvancedTabProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-apple-ink">Advanced</h2>
      <p className="mt-1 text-xs text-apple-ink-muted-48">Internal notes and tags visible only to your team.</p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Internal notes</label>
          <textarea
            value={form.internalNotes}
            onChange={(e) => onChange({ internalNotes: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            placeholder="Notes for your team only"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Internal tags</label>
          <input
            type="text"
            value={form.internalTags}
            onChange={(e) => onChange({ internalTags: e.target.value })}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"
            placeholder="wholesale, seasonal, clearance"
          />
        </div>
      </div>
    </section>
  );
}
