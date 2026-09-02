"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, Percent, Sparkles } from "lucide-react";
import { formatBDT } from "@/lib/format-bdt";
import type { ProductEditorForm } from "@/components/products/product-form";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3.5 text-sm font-medium text-zinc-900 tabular-nums transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

type ProductPricingSectionProps = {
  form: ProductEditorForm;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductPricingSection({ form, onChange }: ProductPricingSectionProps) {
  const sellPrice = Number(form.price) || 0;
  const comparePrice = Number(form.comparePrice) || 0;
  const costPrice = Number(form.costPrice) || 0;

  const { profit, marginPercent, discountPercent } = useMemo(() => {
    const p = sellPrice > 0 && costPrice > 0 ? sellPrice - costPrice : null;
    const m = p != null && sellPrice > 0 ? (p / sellPrice) * 100 : null;
    const d = comparePrice > sellPrice && comparePrice > 0 ? ((comparePrice - sellPrice) / comparePrice) * 100 : null;
    return { profit: p, marginPercent: m, discountPercent: d };
  }, [sellPrice, comparePrice, costPrice]);

  return (
    <section id="section-pricing" className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Pricing & Profitability
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Set customer selling prices, cost of goods, and monitor gross margins.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={form.productType === "variable"}
            onChange={(e) =>
              onChange({
                productType: e.target.checked ? "variable" : "simple",
              })
            }
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
          />
          <span>This product has variants</span>
        </label>
      </div>

      {form.productType === "simple" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Selling Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">৳</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={form.price}
                  onChange={(e) => onChange({ price: e.target.value })}
                  className={inputClass}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">Price customers will pay.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Regular / Compare Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">৳</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.comparePrice}
                  onChange={(e) => onChange({ comparePrice: e.target.value })}
                  className={inputClass}
                />
              </div>
              {discountPercent != null && discountPercent > 0 ? (
                <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {discountPercent.toFixed(0)}% discount badge
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-zinc-400">Shows strikethrough price if higher.</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Cost Price (Buy Cost)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">৳</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.costPrice}
                  onChange={(e) => onChange({ costPrice: e.target.value })}
                  className={inputClass}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">For inventory valuation & profit calculation.</p>
            </div>
          </div>

          {/* Live Profitability Card */}
          {sellPrice > 0 && costPrice > 0 && profit != null && marginPercent != null && (
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">Selling Price</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-950 dark:text-emerald-200">
                  {formatBDT(sellPrice)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">Cost Price</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-950 dark:text-emerald-200">
                  {formatBDT(costPrice)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">Gross Profit / Unit</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-950 dark:text-emerald-200">
                  {formatBDT(profit)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">Profit Margin</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-950 dark:text-emerald-200">
                  {marginPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Sparkles className="h-5 w-5 shrink-0 text-zinc-500" />
          <div className="text-xs">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Variant-specific pricing active</p>
            <p className="text-zinc-500 dark:text-zinc-400">
              Each variant will have its own individual price, SKU, barcode, and inventory levels in the Variants section below.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
