"use client";

import { useMemo } from "react";
import { Field, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import type { SectionEditorProps } from "./types";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { getCategoryEnglishName } from "@/lib/storefront/category-label";
import { Check, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "selected", label: "Selected Categories" },
  { value: "featured", label: "Featured Categories" },
  { value: "popular", label: "Popular Categories" },
  { value: "latest", label: "Latest Categories" },
];

const LIMIT_OPTIONS = [
  { value: "4", label: "4 Categories" },
  { value: "6", label: "6 Categories (Default)" },
  { value: "8", label: "8 Categories" },
  { value: "10", label: "10 Categories" },
  { value: "12", label: "12 Categories (Max)" },
];

const COLUMN_OPTIONS = [
  { value: "2", label: "2 Columns" },
  { value: "3", label: "3 Columns" },
  { value: "4", label: "4 Columns" },
  { value: "6", label: "6 Columns" },
];

export function CategorySectionEditor({
  section,
  storeId,
  onPropChange,
}: SectionEditorProps) {
  const p = section.props;
  const { data: catData } = useGetCategoriesQuery(storeId || "", { skip: !storeId });
  const realCategories = useMemo(
    () => (catData?.data?.categories ?? []).filter((c) => c.active === true),
    [catData],
  );

  const source = p.categorySource || "all";
  const limit = Number(p.categoryCount) || 6;

  // Selected Category IDs
  const selectedIds: string[] = useMemo(() => {
    if (!p.categoryIds) return [];
    try {
      if (p.categoryIds.startsWith("[")) return JSON.parse(p.categoryIds);
      return p.categoryIds.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }, [p.categoryIds]);

  const updateSelectedIds = (ids: string[]) => {
    onPropChange("categoryIds", JSON.stringify(ids.slice(0, 12)));
  };

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      updateSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 12) return;
      updateSelectedIds([...selectedIds, id]);
    }
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    updateSelectedIds(next);
  };

  return (
    <div className="space-y-4">
      <SectionBlock title="Content">
        <Field label="Section Title">
          <TextField
            value={p.title ?? "Shop by Category"}
            onChange={(v) => onPropChange("title", v)}
            placeholder="Shop by Category"
          />
        </Field>
        <Field label="Subtitle Description">
          <TextField
            value={p.subtitle ?? "Explore our top collections"}
            onChange={(v) => onPropChange("subtitle", v)}
            placeholder="Explore our top collections"
          />
        </Field>
      </SectionBlock>

      <SectionBlock title="Category Selection & Limit">
        <Field label="Content Source">
          <SelectField
            value={source}
            onChange={(v) => onPropChange("categorySource", v)}
            options={SOURCE_OPTIONS}
          />
        </Field>

        <Field label="Display Limit (Max 12)">
          <SelectField
            value={String(limit)}
            onChange={(v) => onPropChange("categoryCount", v)}
            options={LIMIT_OPTIONS}
          />
        </Field>

        {source === "selected" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Pick Categories ({selectedIds.length} / 12 selected)
              </label>
            </div>

            {/* Selected Categories Reorder List */}
            {selectedIds.length > 0 && (
              <div className="space-y-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-2">
                <p className="text-[10px] font-semibold text-zinc-600 mb-1.5 px-1">Selected Order:</p>
                {selectedIds.map((id, index) => {
                  const cat = realCategories.find((c) => c._id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                    >
                      <span className="font-medium text-zinc-800 truncate">
                        {index + 1}. {cat ? getCategoryEnglishName(cat) : id}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveCategory(index, -1)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedIds.length - 1}
                          onClick={() => moveCategory(index, 1)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCategory(id)}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Available Categories Grid */}
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-zinc-200 bg-white p-2">
              <p className="text-[10px] font-semibold text-zinc-500 mb-1 px-1">Available Store Categories:</p>
              {realCategories.length === 0 ? (
                <p className="text-xs text-zinc-400 px-1 py-2">No categories in store.</p>
              ) : (
                realCategories.map((cat) => {
                  const isSelected = selectedIds.includes(cat._id);
                  return (
                    <div
                      key={cat._id}
                      onClick={() => toggleCategory(cat._id)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                        isSelected
                          ? "bg-zinc-900 text-white font-medium"
                          : "hover:bg-zinc-100 text-zinc-800"
                      )}
                    >
                      <span className="truncate">{getCategoryEnglishName(cat)}</span>
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </SectionBlock>

      <SectionBlock title="Layout & Appearance">
        <Field label="Columns (Desktop)">
          <SelectField
            value={p.gridColumns || "6"}
            onChange={(v) => onPropChange("gridColumns", v)}
            options={COLUMN_OPTIONS}
          />
        </Field>
        <Field label="Card Style">
          <SelectField
            value={p.cardStyle || "card"}
            onChange={(v) => onPropChange("cardStyle", v)}
            options={[
              { value: "card", label: "Rounded Card" },
              { value: "circle", label: "Circular Icon" },
              { value: "minimal", label: "Minimalist Pill" },
            ]}
          />
        </Field>
        <ToggleField
          label="Show Category Image"
          value={p.showImage ?? "true"}
          onChange={(v) => onPropChange("showImage", v)}
        />
        <ToggleField
          label="Show Category Name"
          value={p.showName ?? "true"}
          onChange={(v) => onPropChange("showName", v)}
        />
        <ToggleField
          label="Show Product Count"
          value={p.showProductCount ?? "true"}
          onChange={(v) => onPropChange("showProductCount", v)}
        />
      </SectionBlock>
    </div>
  );
}
