"use client";

import { useMemo, useState } from "react";
import { GripVertical, Plus, RefreshCw, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import type { ProductOption, ProductVariant } from "@/redux/api/product-api";
import { MediaPicker } from "@/components/media/media-picker";
import { selectionMediaId } from "@/lib/media-selection";

type VariantsPanelProps = {
  options: ProductOption[];
  variants: ProductVariant[];
  onChange: (next: { options: ProductOption[]; variants: ProductVariant[] }) => void;
  storeId: string;
  billingHref?: string;
};

function comboKey(optionValues: Record<string, string>) {
  return Object.entries(optionValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

function buildVariantTitle(optionValues: Record<string, string>) {
  return Object.values(optionValues).filter(Boolean).join(" / ");
}

function sanitizeOptions(options: ProductOption[]) {
  return options
    .map((option, index) => ({
      ...option,
      name: option.name.trim(),
      values: option.values.map((value) => value.trim()).filter(Boolean),
      position: index,
    }))
    .filter((option) => option.name);
}

function generateCombinations(options: ProductOption[]): Record<string, string>[] {
  if (options.length === 0 || options.some((option) => option.values.length === 0)) return [];
  const combos: Record<string, string>[] = [];
  function recurse(idx: number, current: Record<string, string>) {
    if (idx === options.length) {
      combos.push({ ...current });
      return;
    }
    for (const val of options[idx].values) {
      current[options[idx].name] = val;
      recurse(idx + 1, current);
    }
  }
  recurse(0, {});
  return combos;
}

function blankVariant(optionValues: Record<string, string>): ProductVariant {
  return {
    title: buildVariantTitle(optionValues),
    optionValues,
    price: undefined,
    comparePrice: undefined,
    costPrice: undefined,
    stock: 0,
    sku: "",
    barcode: "",
    imageUrl: "",
    galleryUrls: [],
    enabled: true,
    status: "active",
    weight: undefined,
  };
}

function syncVariantsFromOptions(options: ProductOption[], variants: ProductVariant[]) {
  const normalizedOptions = sanitizeOptions(options);
  const combos = generateCombinations(normalizedOptions);
  const variantMap = new Map(
    variants.map((variant) => [comboKey(variant.optionValues), { ...variant, title: variant.title || buildVariantTitle(variant.optionValues) }])
  );
  return combos.map((combo) => variantMap.get(comboKey(combo)) ?? blankVariant(combo));
}

export function VariantsPanel({
  options,
  variants,
  onChange,
  storeId,
  billingHref = "#",
}: VariantsPanelProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const cleanOptions = useMemo(() => sanitizeOptions(options), [options]);
  const combosWithData = useMemo(() => syncVariantsFromOptions(options, variants), [options, variants]);

  const commit = (nextOptions: ProductOption[], nextVariants?: ProductVariant[]) => {
    onChange({
      options: nextOptions,
      variants: nextVariants ?? syncVariantsFromOptions(nextOptions, variants),
    });
  };

  const addOption = () => {
    commit([...options, { name: "", values: [""] }]);
  };

  const removeOption = (idx: number) => {
    const option = options[idx];
    const nextOptions = options.filter((_, index) => index !== idx);
    const nextVariants = variants
      .map((variant) => {
        const optionValues = { ...variant.optionValues };
        delete optionValues[option.name];
        return { ...variant, optionValues, title: buildVariantTitle(optionValues) };
      })
      .filter((variant) => Object.keys(variant.optionValues).length > 0);
    commit(nextOptions, nextVariants);
  };

  const updateOptionName = (idx: number, name: string) => {
    const previousName = options[idx]?.name;
    const nextOptions = options.map((option, index) => (index === idx ? { ...option, name } : option));
    const nextVariants = variants.map((variant) => {
      if (!previousName || !(previousName in variant.optionValues)) return variant;
      const optionValues = { ...variant.optionValues };
      optionValues[name] = optionValues[previousName];
      delete optionValues[previousName];
      return { ...variant, optionValues, title: buildVariantTitle(optionValues) };
    });
    commit(nextOptions, nextVariants);
  };

  const updateOptionValue = (optIdx: number, valIdx: number, value: string) => {
    const optionName = options[optIdx]?.name;
    const previousValue = options[optIdx]?.values[valIdx] ?? "";
    const nextOptions = options.map((option, index) => {
      if (index !== optIdx) return option;
      const values = [...option.values];
      values[valIdx] = value;
      return { ...option, values };
    });
    const nextVariants = variants.map((variant) => {
      if (!optionName || variant.optionValues[optionName] !== previousValue) return variant;
      const optionValues = { ...variant.optionValues, [optionName]: value };
      return { ...variant, optionValues, title: buildVariantTitle(optionValues) };
    });
    commit(nextOptions, nextVariants);
  };

  const addOptionValue = (optIdx: number) => {
    const nextOptions = options.map((option, index) =>
      index === optIdx ? { ...option, values: [...option.values, ""] } : option
    );
    commit(nextOptions);
  };

  const removeOptionValue = (optIdx: number, valIdx: number) => {
    const optionName = options[optIdx]?.name;
    const removedValue = options[optIdx]?.values[valIdx] ?? "";
    const nextOptions = options.map((option, index) => {
      if (index !== optIdx) return option;
      const values = option.values.filter((_, valueIndex) => valueIndex !== valIdx);
      return { ...option, values: values.length > 0 ? values : [""] };
    });
    const nextVariants = variants.filter(
      (variant) => !optionName || variant.optionValues[optionName] !== removedValue
    );
    commit(nextOptions, nextVariants);
  };

  const handleGenerate = () => {
    if (cleanOptions.length === 0) {
      toast.error("Add at least one option first");
      return;
    }
    if (cleanOptions.some((option) => option.values.length === 0)) {
      toast.error("Each option needs at least one value");
      return;
    }
    onChange({ options, variants: syncVariantsFromOptions(options, variants) });
    toast.success("Variant combinations generated");
  };

  const updateVariantField = <K extends keyof ProductVariant>(idx: number, field: K, value: ProductVariant[K]) => {
    const nextVariants = combosWithData.map((variant, variantIdx) => {
      if (variantIdx !== idx) return variant;
      return { ...variant, [field]: value };
    });
    onChange({ options, variants: nextVariants });
  };

  const toggleSelect = (key: string) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runBulk = (action: "update_price" | "update_stock" | "generate_sku" | "delete") => {
    if (selectedKeys.size === 0) {
      toast.error("Select variants first");
      return;
    }
    let nextVariants = combosWithData.filter((variant) =>
      action === "delete" ? !selectedKeys.has(comboKey(variant.optionValues)) : true
    );

    nextVariants = nextVariants.map((variant, index) => {
      if (!selectedKeys.has(comboKey(variant.optionValues))) return variant;
      if (action === "update_price") return { ...variant, price: Number(bulkPrice || 0) };
      if (action === "update_stock") return { ...variant, stock: Number(bulkStock || 0) };
      if (action === "generate_sku") {
        return { ...variant, sku: `VAR-${buildVariantTitle(variant.optionValues).replace(/[^A-Z0-9]+/gi, "-").toUpperCase()}` };
      }
      return variant;
    });

    onChange({ options, variants: nextVariants });
    setSelectedKeys(new Set());
    toast.success("Bulk update applied");
  };

  if (options.length === 0 && variants.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="mb-2 text-sm font-medium text-apple-ink-muted-80">No variants yet</p>
        <p className="mb-4 text-sm text-apple-ink-muted-48">
          Add options like Color or Size to create product variants.
        </p>
        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5" /> Add First Option
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-apple-ink">Variant Builder</h3>
          <p className="text-xs text-apple-ink-muted-48">Create options, then fill each generated combination.</p>
        </div>
        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
        >
          <Plus className="h-3 w-3" /> Add Option
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option, optionIndex) => (
          <div key={optionIndex} className="rounded-2xl border border-zinc-200 bg-apple-canvas-parchment p-4">
            <div className="mb-3 flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-zinc-300" />
              <input
                type="text"
                value={option.name}
                onChange={(event) => updateOptionName(optionIndex, event.target.value)}
                placeholder="Option name (e.g. Color)"
                className="h-9 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value, valueIndex) => (
                <div key={valueIndex} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={value}
                    onChange={(event) => updateOptionValue(optionIndex, valueIndex, event.target.value)}
                    placeholder={`Value ${valueIndex + 1}`}
                    className="h-8 w-28 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeOptionValue(optionIndex, valueIndex)}
                    className="rounded p-1 text-zinc-300 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOptionValue(optionIndex)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2.5 text-xs text-apple-ink-muted-48"
              >
                <Plus className="h-3 w-3" /> Add value
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-2">
        <p className="text-xs text-apple-ink-muted-48">
          {combosWithData.length > 0
            ? `${combosWithData.length} variant${combosWithData.length !== 1 ? "s" : ""} ready`
            : "Complete option names and values to generate combinations"}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Generate All Combinations
        </button>
      </div>

      {selectedKeys.size > 0 && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-zinc-200 bg-apple-canvas-parchment p-3">
          <p className="w-full text-xs font-medium text-apple-ink-muted-80">{selectedKeys.size} selected</p>
          <input
            type="number"
            placeholder="Bulk price"
            value={bulkPrice}
            onChange={(event) => setBulkPrice(event.target.value)}
            className="h-8 w-28 rounded-lg border border-zinc-200 px-2 text-xs"
          />
          <button
            type="button"
            onClick={() => runBulk("update_price")}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white"
          >
            Set price
          </button>
          <input
            type="number"
            placeholder="Bulk stock"
            value={bulkStock}
            onChange={(event) => setBulkStock(event.target.value)}
            className="h-8 w-28 rounded-lg border border-zinc-200 px-2 text-xs"
          />
          <button
            type="button"
            onClick={() => runBulk("update_stock")}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white"
          >
            Set stock
          </button>
          <button type="button" onClick={() => runBulk("generate_sku")} className="rounded-lg border px-3 py-1.5 text-xs">
            <Wand2 className="mr-1 inline h-3 w-3" />
            Gen SKU
          </button>
          <button
            type="button"
            onClick={() => runBulk("delete")}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
          >
            Delete
          </button>
        </div>
      )}

      {combosWithData.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-apple-canvas-parchment">
                <th className="px-2 py-2.5" />
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Variant</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Image</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">SKU</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Barcode</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Price</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Compare</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Cost</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Stock</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Weight</th>
                <th className="px-3 py-2.5 text-left font-semibold text-apple-ink-muted-80">Status</th>
                <th className="px-3 py-2.5 text-center font-semibold text-apple-ink-muted-80">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {combosWithData.map((variant, index) => {
                const key = comboKey(variant.optionValues);
                return (
                  <tr key={key} className="border-b border-zinc-100 last:border-b-0 hover:bg-apple-canvas-parchment/50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(key)}
                        onChange={() => toggleSelect(key)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="min-w-[140px]">
                        <p className="text-sm font-medium text-zinc-800">{variant.title || buildVariantTitle(variant.optionValues)}</p>
                        <p className="text-[11px] text-apple-ink-muted-48">
                          {Object.entries(variant.optionValues)
                            .map(([optionName, value]) => `${optionName}: ${value}`)
                            .join(" · ")}
                        </p>
                      </div>
                    </td>
                    <td className="min-w-[180px] px-3 py-2">
                      <MediaPicker
                        storeId={storeId}
                        billingHref={billingHref}
                        folder="products"
                        label=""
                        value={variant.imageUrl}
                        onChange={(selection) => {
                          updateVariantField(index, "imageUrl", selection.url);
                          updateVariantField(index, "imageMediaIds", selectionMediaId(selection) ? [selectionMediaId(selection)!] : []);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(event) => updateVariantField(index, "sku", event.target.value)}
                        className="h-8 w-28 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={variant.barcode ?? ""}
                        onChange={(event) => updateVariantField(index, "barcode", event.target.value)}
                        className="h-8 w-28 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.price ?? ""}
                        onChange={(event) =>
                          updateVariantField(index, "price", event.target.value ? Number(event.target.value) : undefined)
                        }
                        className="h-8 w-20 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.comparePrice ?? ""}
                        onChange={(event) =>
                          updateVariantField(index, "comparePrice", event.target.value ? Number(event.target.value) : undefined)
                        }
                        className="h-8 w-20 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.costPrice ?? ""}
                        onChange={(event) =>
                          updateVariantField(index, "costPrice", event.target.value ? Number(event.target.value) : undefined)
                        }
                        className="h-8 w-20 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={variant.stock}
                        onChange={(event) => updateVariantField(index, "stock", Number(event.target.value))}
                        className="h-8 w-16 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.weight ?? ""}
                        onChange={(event) =>
                          updateVariantField(index, "weight", event.target.value ? Number(event.target.value) : undefined)
                        }
                        className="h-8 w-16 rounded-lg border border-zinc-200 px-2 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={variant.status ?? "active"}
                        onChange={(event) => updateVariantField(index, "status", event.target.value as ProductVariant["status"])}
                        className="h-8 rounded-lg border border-zinc-200 px-2 text-xs"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="hidden">Hidden</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={variant.enabled}
                        onChange={(event) => updateVariantField(index, "enabled", event.target.checked)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
