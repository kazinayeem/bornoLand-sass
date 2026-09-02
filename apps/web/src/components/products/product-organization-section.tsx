"use client";

import type { ProductEditorForm } from "@/components/products/product-form";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

type ProductOrganizationSectionProps = {
  form: ProductEditorForm;
  categories: Array<{ _id: string; name: string; parentId?: string | null }>;
  brands: Array<{ _id: string; name: string }>;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductOrganizationSection({
  form,
  categories = [],
  brands = [],
  onChange,
}: ProductOrganizationSectionProps) {
  const rootCategories = categories.filter((c) => !c.parentId);
  const selectedRootId = form.categoryId || (form.categoryIds?.[0] ? categories.find((c) => c._id === form.categoryIds[0] && !c.parentId)?._id : "");
  const matchingSubcategories = selectedRootId ? categories.filter((c) => c.parentId === selectedRootId) : [];

  const tagList = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <section id="section-organization" className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Organization & Categorization
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Assign category hierarchy, brands, and search tags for discovery.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Primary Category
            </label>
            <select
              value={selectedRootId || ""}
              onChange={(e) => {
                const catId = e.target.value;
                const cat = categories.find((c) => c._id === catId);
                onChange({
                  categoryId: catId,
                  category: cat?.name || "",
                  subcategoryId: "",
                  categoryIds: catId ? [catId] : [],
                });
              }}
              className={inputClass}
            >
              <option value="">Select Category</option>
              {rootCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Subcategory
            </label>
            <select
              disabled={!selectedRootId || matchingSubcategories.length === 0}
              value={form.subcategoryId || ""}
              onChange={(e) => {
                const subId = e.target.value;
                const newCategoryIds = [selectedRootId, subId].filter((x): x is string => Boolean(x));
                onChange({
                  subcategoryId: subId,
                  categoryIds: newCategoryIds,
                });
              }}
              className={inputClass}
            >
              <option value="">
                {!selectedRootId
                  ? "Select a primary category first"
                  : matchingSubcategories.length === 0
                  ? "No subcategories available"
                  : "Select subcategory (optional)"}
              </option>
              {matchingSubcategories.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Brand
            </label>
            {brands.length > 0 ? (
              <select
                value={form.brandId || ""}
                onChange={(e) => {
                  const bId = e.target.value;
                  const b = brands.find((item) => item._id === bId);
                  onChange({
                    brandId: bId,
                    brand: b?.name || "",
                  });
                }}
                className={inputClass}
              >
                <option value="">No Brand / Generic</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Brand Name"
                value={form.brand || ""}
                onChange={(e) => onChange({ brand: e.target.value })}
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Vendor / Manufacturer
            </label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => onChange({ vendor: e.target.value })}
              className={inputClass}
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Tags & Badges
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => onChange({ tags: e.target.value })}
            className={inputClass}
            placeholder="summer, bestseller, organic, new"
          />
          <p className="mt-1 text-[11px] text-zinc-400">Separate multiple tags with commas.</p>
          {tagList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagList.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
