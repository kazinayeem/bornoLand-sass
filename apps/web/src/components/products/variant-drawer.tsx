"use client";

import { useState, useEffect } from "react";
import { X, Check, Upload, Image as ImageIcon } from "lucide-react";
import type { ProductVariant } from "@/redux/api/product-api";
import { MediaPicker } from "@/components/media/media-picker";
import { selectionMediaId } from "@/lib/media-selection";

type VariantDrawerProps = {
  open: boolean;
  variant: ProductVariant | null;
  storeId: string;
  billingHref?: string;
  onClose: () => void;
  onSave: (updatedVariant: ProductVariant) => void;
};

const inputClass =
  "h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-apple-ink focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20";

export function VariantDrawer({
  open,
  variant,
  storeId,
  billingHref,
  onClose,
  onSave,
}: VariantDrawerProps) {
  const [draft, setDraft] = useState<ProductVariant | null>(variant);

  useEffect(() => {
    setDraft(variant);
  }, [variant]);

  if (!open || !draft) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-5">
          <div>
            <h3 className="text-sm font-bold text-apple-ink">{draft.title || "Variant Details"}</h3>
            <p className="text-[11px] text-apple-ink-muted-48">Edit pricing, stock, media, and dimensions</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-zinc-100 hover:text-apple-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Variant Media */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Image</h4>
            <div className="flex items-center gap-3">
              {draft.imageUrl ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                  <img src={draft.imageUrl} alt={draft.title} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, imageUrl: "" })}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <MediaPicker
                storeId={storeId}
                billingHref={billingHref || "#"}
                value={draft.imageUrl || ""}
                onChange={(selection) => {
                  if (selection?.url) {
                    setDraft({ ...draft, imageUrl: selection.url });
                  }
                }}
              />

            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Pricing</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-ink-muted-80">Price (BDT) *</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.price ?? ""}
                  onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
                  className={`${inputClass} mt-1`}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-apple-ink-muted-80">Compare-at Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.comparePrice ?? ""}
                  onChange={(e) => setDraft({ ...draft, comparePrice: parseFloat(e.target.value) || undefined })}
                  className={`${inputClass} mt-1`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-apple-ink-muted-80">Cost Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.costPrice ?? ""}
                onChange={(e) => setDraft({ ...draft, costPrice: parseFloat(e.target.value) || undefined })}
                className={`${inputClass} mt-1`}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Inventory Section */}
          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Inventory</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-ink-muted-80">SKU</label>
                <input
                  type="text"
                  value={draft.sku || ""}
                  onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                  className={`${inputClass} mt-1`}
                  placeholder="e.g. TS-BLK-M"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-apple-ink-muted-80">Barcode</label>
                <input
                  type="text"
                  value={draft.barcode || ""}
                  onChange={(e) => setDraft({ ...draft, barcode: e.target.value })}
                  className={`${inputClass} mt-1`}
                  placeholder="Barcode / EAN"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-apple-ink-muted-80">Stock Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={draft.stock ?? 0}
                  onChange={(e) => setDraft({ ...draft, stock: parseInt(e.target.value) || 0 })}
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-apple-ink-muted-80">Low Stock Threshold</label>
                <input
                  type="number"
                  min={0}
                  value={draft.lowStockThreshold ?? 5}
                  onChange={(e) => setDraft({ ...draft, lowStockThreshold: parseInt(e.target.value) || 5 })}
                  className={`${inputClass} mt-1`}
                />
              </div>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Shipping Details</h4>
            <div>
              <label className="text-[11px] font-medium text-apple-ink-muted-80">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={draft.weight ?? ""}
                onChange={(e) => setDraft({ ...draft, weight: parseFloat(e.target.value) || undefined })}
                className={`${inputClass} mt-1`}
                placeholder="0.5"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3 bg-zinc-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-apple-ink-muted-80 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-700 active:scale-[0.98]"
          >
            <Check className="h-3.5 w-3.5" /> Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
