"use client";

import { useCallback, useMemo } from "react";
import { Plus, X, GripVertical, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProductMutation } from "@/redux/api/product-api";
import type { Product, ProductOption, ProductVariant } from "@/redux/api/product-api";

type VariantsPanelProps = {
  product: Product;
  storeId: string;
};

function generateCombinations(options: ProductOption[]): Record<string, string>[] {
  if (options.length === 0) return [];
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

export function VariantsPanel({ product, storeId }: VariantsPanelProps) {
  const [updateProduct] = useUpdateProductMutation();
  const options = product.options ?? [];
  const variants = product.variants ?? [];

  const possibleCombos = useMemo(() => generateCombinations(options), [options]);
  const combosWithData = useMemo(() => {
    return possibleCombos.map((combo) => {
      const existing = variants.find((v) =>
        Object.entries(combo).every(([k, val]) => v.optionValues[k] === val)
      );
      return {
        optionValues: combo,
        _id: existing?._id,
        price: existing?.price,
        stock: existing?.stock ?? 0,
        sku: existing?.sku ?? "",
        imageUrl: existing?.imageUrl ?? "",
        enabled: existing?.enabled ?? true,
      };
    });
  }, [possibleCombos, variants]);

  const saveProduct = useCallback(async (newOptions: ProductOption[], newVariants: ProductVariant[]) => {
    try {
      await updateProduct({
        storeId,
        id: product._id,
        data: { options: newOptions, variants: newVariants }
      }).unwrap();
      toast.success("Variants saved");
    } catch {
      toast.error("Failed to save variants");
    }
  }, [updateProduct, storeId, product._id]);

  const addOption = useCallback(() => {
    const newOptions = [...options, { name: "", values: [""] }];
    saveProduct(newOptions, variants);
  }, [options, variants, saveProduct]);

  const removeOption = useCallback((idx: number) => {
    const name = options[idx].name;
    const newOptions = options.filter((_, i) => i !== idx);
    const newVariants = variants.filter((v) => !(name in v.optionValues));
    saveProduct(newOptions, newVariants);
  }, [options, variants, saveProduct]);

  const updateOptionName = useCallback((idx: number, name: string) => {
    const newOptions = options.map((o, i) => i === idx ? { ...o, name } : o);
    saveProduct(newOptions, variants);
  }, [options, variants, saveProduct]);

  const updateOptionValue = useCallback((optIdx: number, valIdx: number, value: string) => {
    const newOptions = options.map((o, i) => {
      if (i !== optIdx) return o;
      const values = [...o.values];
      values[valIdx] = value;
      return { ...o, values };
    });
    saveProduct(newOptions, variants);
  }, [options, variants, saveProduct]);

  const addOptionValue = useCallback((optIdx: number) => {
    const newOptions = options.map((o, i) => i === optIdx ? { ...o, values: [...o.values, ""] } : o);
    saveProduct(newOptions, variants);
  }, [options, variants, saveProduct]);

  const removeOptionValue = useCallback((optIdx: number, valIdx: number) => {
    const newOptions = options.map((o, i) => {
      if (i !== optIdx) return o;
      const values = o.values.filter((_, vi) => vi !== valIdx);
      return { ...o, values: values.length === 0 ? [""] : values };
    });
    saveProduct(newOptions, variants);
  }, [options, variants, saveProduct]);

  const generateVariants = useCallback(() => {
    if (options.length === 0) {
      toast.error("Add at least one option to generate variants");
      return;
    }
    const allEmpty = options.some((o) => !o.name.trim() || o.values.some((v) => !v.trim()));
    if (allEmpty) {
      toast.error("Fill in all option names and values first");
      return;
    }
    const newCombos = generateCombinations(options);
    const merged = newCombos.map((combo) => {
      const existing = variants.find((v) =>
        Object.entries(combo).every(([k, val]) => v.optionValues[k] === val)
      );
      return existing ?? { optionValues: combo, stock: 0, sku: "", imageUrl: "", enabled: true };
    });
    saveProduct(options, merged);
    toast.success(`Generated ${merged.length} variants`);
  }, [options, variants, saveProduct]);

  const updateVariantField = useCallback((idx: number, field: string, value: unknown) => {
    const newVariants = combosWithData.map((v, i) => i === idx ? { ...v, [field]: value } : v);
    saveProduct(options, newVariants);
  }, [options, combosWithData, saveProduct]);

  if (options.length === 0 && variants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-zinc-500 mb-4">No variants defined yet. Add options like Size or Color to create product variants.</p>
        <button onClick={addOption}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add First Option
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Options</h3>
        <div className="flex gap-2">
          <button onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Plus className="h-3 w-3" /> Add Option
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((opt, optIdx) => (
          <div key={optIdx} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <GripVertical className="h-4 w-4 text-zinc-300" />
              <input
                type="text"
                value={opt.name}
                onChange={(e) => updateOptionName(optIdx, e.target.value)}
                placeholder="Option name (e.g. Size)"
                className="h-9 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button onClick={() => removeOption(optIdx)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val, valIdx) => (
                <div key={valIdx} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateOptionValue(optIdx, valIdx, e.target.value)}
                    placeholder={`Value ${valIdx + 1}`}
                    className="h-8 w-28 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button onClick={() => removeOptionValue(optIdx, valIdx)}
                    className="rounded p-1 text-zinc-300 hover:text-red-500 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button onClick={() => addOptionValue(optIdx)}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2.5 text-xs text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors">
                <Plus className="h-3 w-3" /> Add value
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
        <p className="text-xs text-zinc-500">
          {combosWithData.length > 0
            ? `${combosWithData.length} variant${combosWithData.length !== 1 ? "s" : ""}`
            : "No variants"}
        </p>
        <button onClick={generateVariants}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Generate Variants
        </button>
      </div>

      {combosWithData.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                {options.map((opt) => (
                  <th key={opt.name} className="px-3 py-2.5 text-left font-semibold text-zinc-600">{opt.name}</th>
                ))}
                <th className="px-3 py-2.5 text-left font-semibold text-zinc-600">Price</th>
                <th className="px-3 py-2.5 text-left font-semibold text-zinc-600">Stock</th>
                <th className="px-3 py-2.5 text-left font-semibold text-zinc-600">SKU</th>
                <th className="px-3 py-2.5 text-left font-semibold text-zinc-600">Image URL</th>
                <th className="px-3 py-2.5 text-center font-semibold text-zinc-600">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {combosWithData.map((v, idx) => (
                <tr key={idx} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors">
                  {options.map((opt) => (
                    <td key={opt.name} className="px-3 py-2 text-sm font-medium text-zinc-800">
                      {v.optionValues[opt.name]}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={v.price ?? ""}
                      onChange={(e) => updateVariantField(idx, "price", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="—"
                      className="h-8 w-20 rounded-lg border border-zinc-200 px-2 text-xs focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => updateVariantField(idx, "stock", Number(e.target.value))}
                      className="h-8 w-16 rounded-lg border border-zinc-200 px-2 text-xs focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariantField(idx, "sku", e.target.value)}
                      placeholder="—"
                      className="h-8 w-24 rounded-lg border border-zinc-200 px-2 text-xs focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={v.imageUrl}
                      onChange={(e) => updateVariantField(idx, "imageUrl", e.target.value)}
                      placeholder="https://..."
                      className="h-8 w-32 rounded-lg border border-zinc-200 px-2 text-xs focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <label className="inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.enabled}
                        onChange={(e) => updateVariantField(idx, "enabled", e.target.checked)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
