"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ShoppingBag, AlertCircle, Plus, Minus, Tag } from "lucide-react";
import type { Product, ProductVariant } from "@/redux/api/product-api";
import { formatCurrency } from "@/lib/format-currency";
import { useTenant } from "@/providers/tenant-provider";
import { cn } from "@/lib/utils";

type PosVariantModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSelectVariant: (variant: ProductVariant, quantity: number) => void;
};

export function PosVariantModal({
  open,
  product,
  onClose,
  onSelectVariant,
}: PosVariantModalProps) {
  const { settings } = useTenant();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const variants = product?.variants ?? [];
  const options = product?.options ?? [];

  // Initialize first available option selections
  useMemo(() => {
    if (!product || !options.length) return;
    const initial: Record<string, string> = {};
    const firstAvailable = variants.find((v) => v.enabled && v.stock > 0) || variants[0];

    for (const opt of options) {
      initial[opt.name] = firstAvailable?.optionValues?.[opt.name] || opt.values[0] || "";
    }
    setSelectedOptions(initial);
    setQuantity(1);
  }, [product]);

  if (!open || !product) return null;

  // Find selected variant matching selectedOptions
  const activeVariant = variants.find((v) => {
    if (!v.enabled) return false;
    return Object.entries(selectedOptions).every(([key, value]) => v.optionValues?.[key] === value);
  });

  const inStock = activeVariant ? activeVariant.stock > 0 : false;

  const handleAdd = () => {
    if (!activeVariant || !inStock) return;
    onSelectVariant(activeVariant, quantity);
    onClose();
  };

  return (
    <div
      key="pos-variant-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        key="pos-variant-content"
        className="flex flex-col w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden text-apple-ink"
        style={{ maxHeight: "min(88vh, 700px)" }}
      >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-5 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-apple-primary" />
              <h3 className="text-sm font-bold truncate max-w-xs">{product.name}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Selected Product Overview Card */}
            <div className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <img
                  src={activeVariant?.imageUrl || product.imageUrl || `https://placehold.co/100x100?text=Product`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <h4 className="text-xs font-bold truncate">{product.name}</h4>
                  {activeVariant && (
                    <p className="text-[11px] font-mono text-zinc-400">SKU: {activeVariant.sku || "N/A"}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-apple-primary">
                    {formatCurrency(activeVariant?.price ?? product.price, settings)}
                  </span>
                  {activeVariant ? (
                    activeVariant.stock > 0 ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        {activeVariant.stock} in stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
                        Out of stock
                      </span>
                    )
                  ) : null}
                </div>
              </div>
            </div>

            {/* Option Attribute Chips */}
            {options.map((opt) => (
              <div key={opt.name} className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Select {opt.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selectedOptions[opt.name] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }))}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all",
                          isSelected
                            ? "border-apple-primary bg-apple-primary/10 text-apple-primary shadow-xs font-bold"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Variant Matrix Table */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                All Available Variants ({variants.length})
              </label>
              <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white overflow-hidden max-h-48 overflow-y-auto">
                {variants.map((v) => {
                  const title = Object.values(v.optionValues || {}).join(" / ") || v.sku || "Default";
                  const isSelected = activeVariant?._id === v._id;
                  const available = v.enabled && v.stock > 0;

                  return (
                    <div
                      key={v._id || title}
                      onClick={() => {
                        if (available) setSelectedOptions(v.optionValues || {});
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 transition-colors cursor-pointer text-xs",
                        isSelected ? "bg-apple-primary/5 font-bold" : "hover:bg-zinc-50",
                        !available && "opacity-40 cursor-not-allowed bg-zinc-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("flex h-4 w-4 items-center justify-center rounded-full border text-[10px]", isSelected ? "border-apple-primary bg-apple-primary text-white" : "border-zinc-300")}>
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-apple-ink truncate">{title}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">SKU: {v.sku || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right shrink-0">
                        <span className="font-bold">{formatCurrency(v.price ?? product.price ?? 0, settings)}</span>
                        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200")}>

                          {available ? `${v.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <span className="text-xs font-semibold text-zinc-700">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (activeVariant ? Math.min(activeVariant.stock, q + 1) : q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!activeVariant || !inStock}
              className="inline-flex items-center gap-2 rounded-xl bg-apple-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              Add Variant to Order ({formatCurrency((activeVariant?.price ?? product.price) * quantity, settings)})
            </button>
          </div>
        </div>
      </div>
  );
}
