"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { ProductOption, ProductVariant } from "@/redux/api/product-api";
import { MediaPicker } from "@/components/media/media-picker";
import { selectionMediaId } from "@/lib/media-selection";
import { VariantDrawer } from "@/components/products/variant-drawer";

type VariantsPanelProps = {
  options: ProductOption[];
  variants: ProductVariant[];
  onChange: (next: { options: ProductOption[]; variants: ProductVariant[] }) => void;
  storeId: string;
  billingHref?: string;
};

const COLOR_PRESETS = [
  { name: "Black", color: "#000000" },
  { name: "White", color: "#ffffff" },
  { name: "Red", color: "#ef4444" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Green", color: "#22c55e" },
  { name: "Yellow", color: "#eab308" },
  { name: "Purple", color: "#a855f7" },
  { name: "Pink", color: "#ec4899" },
  { name: "Gray", color: "#6b7280" },
  { name: "Navy", color: "#1e3a8a" },
];

function comboKey(optionValues: Record<string, string>) {
  return Object.entries(optionValues || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

function buildVariantTitle(optionValues: Record<string, string>) {
  return Object.values(optionValues || {}).filter(Boolean).join(" / ");
}

function sanitizeOptions(options: ProductOption[]): ProductOption[] {
  return options
    .map((option, index) => ({
      ...option,
      name: option.name.trim(),
      values: option.values.map((v) => v.trim()).filter(Boolean),
      position: index,
    }))
    .filter((option) => option.name);
}

function generateCombinations(options: ProductOption[]): Record<string, string>[] {
  const clean = sanitizeOptions(options);
  if (clean.length === 0 || clean.some((o) => o.values.length === 0)) return [];

  const combos: Record<string, string>[] = [];
  function recurse(idx: number, current: Record<string, string>) {
    if (idx === clean.length) {
      combos.push({ ...current });
      return;
    }
    for (const val of clean[idx].values) {
      current[clean[idx].name] = val;
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
    enabled: true,
    status: "active",
    weight: undefined,
  };
}

function syncVariantsFromOptions(options: ProductOption[], existingVariants: ProductVariant[]): ProductVariant[] {
  const combos = generateCombinations(options);
  const variantMap = new Map(
    existingVariants.map((v) => [comboKey(v.optionValues), { ...v, title: v.title || buildVariantTitle(v.optionValues) }])
  );
  return combos.map((combo) => variantMap.get(comboKey(combo)) ?? blankVariant(combo));
}

const inputClass =
  "h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-apple-ink focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20";

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
  const [drawerVariant, setDrawerVariant] = useState<ProductVariant | null>(null);

  const combosWithData = useMemo(() => syncVariantsFromOptions(options, variants), [options, variants]);

  const commit = (nextOptions: ProductOption[], nextVariants?: ProductVariant[]) => {
    onChange({
      options: nextOptions,
      variants: nextVariants ?? syncVariantsFromOptions(nextOptions, variants),
    });
  };

  const addOptionGroup = () => {
    if (options.length >= 3) {
      toast.info("Maximum 3 option groups recommended");
    }
    commit([...options, { name: "", values: [""] }]);
  };

  const removeOptionGroup = (idx: number) => {
    const nextOptions = options.filter((_, i) => i !== idx);
    commit(nextOptions);
  };

  const updateOptionName = (idx: number, name: string) => {
    const previousName = options[idx]?.name;
    const nextOptions = options.map((opt, i) => (i === idx ? { ...opt, name } : opt));
    const nextVariants = variants.map((v) => {
      if (!previousName || !(previousName in (v.optionValues || {}))) return v;
      const optionValues = { ...v.optionValues };
      optionValues[name] = optionValues[previousName];
      delete optionValues[previousName];
      return { ...v, optionValues, title: buildVariantTitle(optionValues) };
    });
    commit(nextOptions, nextVariants);
  };

  const updateOptionValue = (optIdx: number, valIdx: number, value: string) => {
    const optionName = options[optIdx]?.name;
    const previousValue = options[optIdx]?.values[valIdx] ?? "";
    const nextOptions = options.map((opt, i) => {
      if (i !== optIdx) return opt;
      const values = [...opt.values];
      values[valIdx] = value;
      return { ...opt, values };
    });

    const nextVariants = variants.map((v) => {
      if (!optionName || v.optionValues?.[optionName] !== previousValue) return v;
      const optionValues = { ...v.optionValues, [optionName]: value };
      return { ...v, optionValues, title: buildVariantTitle(optionValues) };
    });
    commit(nextOptions, nextVariants);
  };

  const addOptionValue = (optIdx: number) => {
    const nextOptions = options.map((opt, i) =>
      i === optIdx ? { ...opt, values: [...opt.values, ""] } : opt
    );
    commit(nextOptions);
  };

  const removeOptionValue = (optIdx: number, valIdx: number) => {
    const nextOptions = options.map((opt, i) => {
      if (i !== optIdx) return opt;
      const values = opt.values.filter((_, vIdx) => vIdx !== valIdx);
      return { ...opt, values: values.length > 0 ? values : [""] };
    });
    commit(nextOptions);
  };

  const updateVariantRow = (idx: number, patch: Partial<ProductVariant>) => {
    const next = combosWithData.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    onChange({ options, variants: next });
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === combosWithData.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(combosWithData.map((v) => comboKey(v.optionValues))));
    }
  };

  const toggleSelectRow = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applyBulkAction = (action: "price" | "stock" | "sku" | "delete") => {
    if (selectedKeys.size === 0) {
      toast.error("Select at least one variant");
      return;
    }

    if (action === "delete") {
      const next = combosWithData.filter((v) => !selectedKeys.has(comboKey(v.optionValues)));
      onChange({ options, variants: next });
      setSelectedKeys(new Set());
      toast.success("Selected variants deleted");
      return;
    }

    const next = combosWithData.map((v) => {
      if (!selectedKeys.has(comboKey(v.optionValues))) return v;
      if (action === "price" && bulkPrice !== "") {
        return { ...v, price: Number(bulkPrice) };
      }
      if (action === "stock" && bulkStock !== "") {
        return { ...v, stock: Number(bulkStock) };
      }
      if (action === "sku") {
        return { ...v, sku: `SKU-${buildVariantTitle(v.optionValues).replace(/[^A-Z0-9]/gi, "-").toUpperCase()}` };
      }
      return v;
    });

    onChange({ options, variants: next });
    toast.success("Bulk update applied");
  };

  return (
    <div className="space-y-6">
      {/* ── Option Groups Configuration ─────────────────────────── */}
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-apple-ink">Option Groups</h3>
            <p className="text-xs text-apple-ink-muted-48">Define product options (e.g., Color, Size, Material)</p>
          </div>
          <button
            type="button"
            onClick={addOptionGroup}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-apple-ink hover:bg-zinc-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add Option
          </button>
        </div>

        {options.map((opt, optIdx) => {
          const isColor = opt.name.toLowerCase() === "color";
          return (
            <div key={optIdx} className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Option Name (e.g. Color, Size)"
                  value={opt.name}
                  onChange={(e) => updateOptionName(optIdx, e.target.value)}
                  className="h-9 w-64 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-apple-ink focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => removeOptionGroup(optIdx)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  title="Remove option group"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Option Values List */}
              <div className="flex flex-wrap items-center gap-2">
                {opt.values.map((val, valIdx) => (
                  <div
                    key={valIdx}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                  >
                    {isColor && (
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-zinc-300 shadow-2xs"
                        style={{
                          backgroundColor:
                            COLOR_PRESETS.find((c) => c.name.toLowerCase() === val.toLowerCase())?.color || "#94a3b8",
                        }}
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Value"
                      value={val}
                      onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)}
                      className="w-20 bg-transparent text-xs font-medium text-apple-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeOptionValue(optIdx, valIdx)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOptionValue(optIdx)}
                  className="inline-flex items-center gap-1 rounded-xl border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-violet-600 hover:border-violet-400 hover:bg-violet-50"
                >
                  <Plus className="h-3 w-3" /> Add Value
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Generated Variant Matrix Table ─────────────────────── */}
      {combosWithData.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {/* Quick Apply & Bulk Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-apple-ink">
                Variants ({combosWithData.length})
              </span>
              {selectedKeys.size > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  {selectedKeys.size} selected
                </span>
              )}
            </div>

            {/* Quick Setters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Price"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="h-8 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => applyBulkAction("price")}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-apple-ink hover:bg-zinc-100"
                >
                  Apply Price
                </button>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Stock"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  className="h-8 w-16 rounded-lg border border-zinc-200 bg-white px-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => applyBulkAction("stock")}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-apple-ink hover:bg-zinc-100"
                >
                  Apply Stock
                </button>
              </div>

              <button
                type="button"
                onClick={() => applyBulkAction("sku")}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-apple-ink hover:bg-zinc-100"
              >
                Auto SKUs
              </button>

              {selectedKeys.size > 0 && (
                <button
                  type="button"
                  onClick={() => applyBulkAction("delete")}
                  className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Delete Selected
                </button>
              )}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50 text-apple-ink-muted-48">
                  <th className="p-2.5 w-8">
                    <button type="button" onClick={toggleSelectAll}>
                      {selectedKeys.size === combosWithData.length ? (
                        <CheckSquare className="h-4 w-4 text-violet-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-2.5 w-12">Image</th>
                  <th className="p-2.5 font-bold text-apple-ink">Variant</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5">Price *</th>
                  <th className="p-2.5">Compare Price</th>
                  <th className="p-2.5">Cost</th>
                  <th className="p-2.5">Stock</th>
                  <th className="p-2.5 w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {combosWithData.map((v, idx) => {
                  const key = comboKey(v.optionValues);
                  const isSelected = selectedKeys.has(key);
                  const stock = v.stock ?? 0;
                  const stockBadgeClass =
                    stock > 5
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : stock > 0
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200";

                  return (
                    <tr
                      key={key}
                      className={`group transition-colors ${
                        isSelected ? "bg-violet-50/30" : "hover:bg-zinc-50/50"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-2.5">
                        <button type="button" onClick={() => toggleSelectRow(key)}>
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-violet-600" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500" />
                          )}
                        </button>
                      </td>

                      {/* Image Thumbnail */}
                      <td className="p-2.5">
                        <MediaPicker
                          storeId={storeId}
                          billingHref={billingHref || "#"}
                          value={v.imageUrl || ""}
                          onChange={(selection) => {
                            if (selection?.url) {
                              updateVariantRow(idx, {
                                imageUrl: selection.url,
                              });
                            }
                          }}
                        />
                      </td>


                      {/* Variant Title */}
                      <td className="p-2.5 font-bold text-apple-ink">
                        {v.title}
                      </td>

                      {/* SKU */}
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={v.sku || ""}
                          placeholder="SKU"
                          onChange={(e) => updateVariantRow(idx, { sku: e.target.value })}
                          className={`${inputClass} w-24`}
                        />
                      </td>

                      {/* Price */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={v.price ?? ""}
                          onChange={(e) =>
                            updateVariantRow(idx, { price: parseFloat(e.target.value) || 0 })
                          }
                          className={`${inputClass} w-20 font-bold text-violet-700`}
                        />
                      </td>

                      {/* Compare Price */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={v.comparePrice ?? ""}
                          onChange={(e) =>
                            updateVariantRow(idx, { comparePrice: parseFloat(e.target.value) || undefined })
                          }
                          className={`${inputClass} w-20 text-zinc-500`}
                        />
                      </td>

                      {/* Cost Price */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={v.costPrice ?? ""}
                          onChange={(e) =>
                            updateVariantRow(idx, { costPrice: parseFloat(e.target.value) || undefined })
                          }
                          className={`${inputClass} w-20`}
                        />
                      </td>

                      {/* Stock & Status Badge */}
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={v.stock ?? 0}
                            onChange={(e) =>
                              updateVariantRow(idx, { stock: parseInt(e.target.value) || 0 })
                            }
                            className={`${inputClass} w-16`}
                          />
                          <span
                            className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${stockBadgeClass}`}
                          >
                            {stock > 5 ? "In Stock" : stock > 0 ? "Low" : "Out"}
                          </span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDrawerVariant(v)}
                            className="rounded-lg p-1 text-apple-ink-muted-80 hover:bg-zinc-100 hover:text-apple-ink"
                            title="Edit variant details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-Over Variant Inspector Drawer ──────────────────── */}
      <VariantDrawer
        open={!!drawerVariant}
        variant={drawerVariant}
        storeId={storeId}
        billingHref={billingHref}
        onClose={() => setDrawerVariant(null)}
        onSave={(updated) => {
          const next = combosWithData.map((v) =>
            comboKey(v.optionValues) === comboKey(updated.optionValues) ? updated : v
          );
          onChange({ options, variants: next });
          toast.success("Variant details updated");
        }}
      />
    </div>
  );
}
