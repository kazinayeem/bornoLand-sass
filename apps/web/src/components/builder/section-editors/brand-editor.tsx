"use client";

import { useMemo } from "react";
import { Field, SectionBlock, SelectField, TextField, ToggleField } from "./shared";
import type { SectionEditorProps } from "./types";
import { useTenant } from "@/providers/tenant-provider";
import { useGetBrandsQuery } from "@/redux/api/brand-api";
import { Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "all", label: "All Brands" },
  { value: "selected", label: "Selected Brands" },
  { value: "featured", label: "Featured Brands" },
  { value: "popular", label: "Popular Brands" },
];

const LIMIT_OPTIONS = [
  { value: "4", label: "4 Brands" },
  { value: "6", label: "6 Brands (Default)" },
  { value: "8", label: "8 Brands" },
  { value: "10", label: "10 Brands" },
  { value: "12", label: "12 Brands (Max)" },
];

const COLUMN_OPTIONS = [
  { value: "3", label: "3 Columns" },
  { value: "4", label: "4 Columns" },
  { value: "6", label: "6 Columns" },
];

export function BrandSectionEditor({
  section,
  storeId,
  onPropChange,
}: SectionEditorProps) {
  const p = section.props;
  const { brands: tenantBrands } = useTenant();
  const { data: brandData } = useGetBrandsQuery(storeId || "", { skip: !storeId });
  const realBrands = brandData?.data?.brands ?? tenantBrands ?? [];

  const source = p.brandSource || "all";
  const limit = Number(p.brandCount) || 6;

  // Selected Brand IDs
  const selectedIds: string[] = useMemo(() => {
    if (!p.brandIds) return [];
    try {
      if (p.brandIds.startsWith("[")) return JSON.parse(p.brandIds);
      return p.brandIds.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }, [p.brandIds]);

  const updateSelectedIds = (ids: string[]) => {
    onPropChange("brandIds", JSON.stringify(ids.slice(0, 12)));
  };

  const toggleBrand = (id: string) => {
    if (selectedIds.includes(id)) {
      updateSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 12) return;
      updateSelectedIds([...selectedIds, id]);
    }
  };

  const moveBrand = (index: number, direction: -1 | 1) => {
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
            value={p.title ?? "Our Trusted Brands & Partners"}
            onChange={(v) => onPropChange("title", v)}
            placeholder="Our Trusted Brands"
          />
        </Field>
        <Field label="Subtitle Description">
          <TextField
            value={p.subtitle ?? "Official warranty & authentic products guaranteed"}
            onChange={(v) => onPropChange("subtitle", v)}
            placeholder="Official warranty guaranteed"
          />
        </Field>
      </SectionBlock>

      <SectionBlock title="Brand Selection & Limit">
        <Field label="Content Source">
          <SelectField
            value={source}
            onChange={(v) => onPropChange("brandSource", v)}
            options={SOURCE_OPTIONS}
          />
        </Field>

        <Field label="Display Limit (Max 12)">
          <SelectField
            value={String(limit)}
            onChange={(v) => onPropChange("brandCount", v)}
            options={LIMIT_OPTIONS}
          />
        </Field>

        {source === "selected" && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Pick Brands ({selectedIds.length} / 12 selected)
              </label>
            </div>

            {/* Selected Brands Reorder List */}
            {selectedIds.length > 0 && (
              <div className="space-y-1 rounded-xl border border-zinc-200 bg-zinc-50/50 p-2">
                <p className="text-[10px] font-semibold text-zinc-600 mb-1.5 px-1">Selected Order:</p>
                {selectedIds.map((id, index) => {
                  const br = realBrands.find((b) => b._id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                    >
                      <span className="font-medium text-zinc-800 truncate">
                        {index + 1}. {br?.name || id}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveBrand(index, -1)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === selectedIds.length - 1}
                          onClick={() => moveBrand(index, 1)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBrand(id)}
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

            {/* Available Brands List */}
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-zinc-200 bg-white p-2">
              <p className="text-[10px] font-semibold text-zinc-500 mb-1 px-1">Available Store Brands:</p>
              {realBrands.length === 0 ? (
                <p className="text-xs text-zinc-400 px-1 py-2">No brands in store.</p>
              ) : (
                realBrands.map((br) => {
                  const isSelected = selectedIds.includes(br._id);
                  return (
                    <div
                      key={br._id}
                      onClick={() => toggleBrand(br._id)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                        isSelected
                          ? "bg-zinc-900 text-white font-medium"
                          : "hover:bg-zinc-100 text-zinc-800"
                      )}
                    >
                      <span className="truncate">{br.name}</span>
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
        <ToggleField
          label="Show Brand Logo"
          value={p.showLogo ?? "true"}
          onChange={(v) => onPropChange("showLogo", v)}
        />
        <ToggleField
          label="Show Brand Name"
          value={p.showName ?? "true"}
          onChange={(v) => onPropChange("showName", v)}
        />
      </SectionBlock>
    </div>
  );
}
