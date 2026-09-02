"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductEditorForm } from "@/components/products/product-form";

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

type ProductInventorySectionProps = {
  form: ProductEditorForm;
  onChange: (patch: Partial<ProductEditorForm>) => void;
};

export function ProductInventorySection({ form, onChange }: ProductInventorySectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <section id="section-inventory" className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Inventory & Stock
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage barcodes, SKU identifiers, on-hand stock, and low stock warnings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => onChange({ sku: e.target.value })}
              className={cn(inputClass, "font-mono uppercase")}
              placeholder="e.g. CKG-GNG-150G"
            />
            <p className="mt-1 text-[11px] text-zinc-400">Unique identifier for inventory tracking.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Barcode / UPC / EAN / ISBN
            </label>
            <input
              type="text"
              value={form.barcode}
              onChange={(e) => onChange({ barcode: e.target.value })}
              className={cn(inputClass, "font-mono")}
              placeholder="e.g. 8941234567890"
            />
            <p className="mt-1 text-[11px] text-zinc-400">Scannable barcode in POS & warehouse.</p>
          </div>
        </div>

        {form.productType === "simple" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Initial Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => onChange({ stock: e.target.value })}
                className={inputClass}
                placeholder="0"
              />
              <p className="mt-1 text-[11px] text-zinc-400">Available physical stock in default warehouse.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={(e) => onChange({ lowStockThreshold: e.target.value })}
                className={inputClass}
                placeholder="5"
              />
              <p className="mt-1 text-[11px] text-zinc-400">Receive alert when stock drops to or below this level.</p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={form.trackInventory}
              onChange={(e) => onChange({ trackInventory: e.target.checked })}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
            />
            <span>Track inventory and adjust stock automatically on orders & POS sales</span>
          </label>
        </div>

        {/* Collapsible Advanced Inventory */}
        <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAdvanced && "rotate-180")} />
            <span>Advanced Inventory Settings</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 grid gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Vendor / Brand Supplier</label>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(e) => onChange({ vendor: e.target.value })}
                  className={inputClass}
                  placeholder="Primary supplier or manufacturer"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Warehouse Location / Bin</label>
                <input
                  type="text"
                  placeholder="e.g. Aisle 3, Shelf B"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
