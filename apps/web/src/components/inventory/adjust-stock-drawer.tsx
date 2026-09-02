"use client";

import { useState, useMemo } from "react";
import { X, ArrowRight, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { useAdjustStockMutation, type InventoryItem } from "@/redux/api/inventory-api";
import { cn } from "@/lib/utils";

type AdjustStockDrawerProps = {
  open: boolean;
  onClose: () => void;
  product: InventoryItem | null;
  storeId: string;
};

type AdjustMode = "add" | "remove" | "set";

export function AdjustStockDrawer({
  open,
  onClose,
  product,
  storeId,
}: AdjustStockDrawerProps) {
  const [adjustStockMutation, { isLoading }] = useAdjustStockMutation();
  const [mode, setMode] = useState<AdjustMode>("add");
  const [qty, setQty] = useState<string>("1");
  const [reason, setReason] = useState("Restock / Received Stock");
  const [note, setNote] = useState("");

  const currentStock = product?.stock ?? 0;
  const numQty = Math.max(0, parseInt(qty, 10) || 0);

  const newStock = useMemo(() => {
    if (mode === "add") return currentStock + numQty;
    if (mode === "remove") return Math.max(0, currentStock - numQty);
    return numQty;
  }, [currentStock, mode, numQty]);

  const diff = newStock - currentStock;

  if (!open || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty === 0 && mode !== "set") {
      toast.error("Please enter a valid adjustment quantity");
      return;
    }

    try {
      await adjustStockMutation({
        storeId,
        productId: product.productId,
        variantId: product.variantId || undefined,
        quantity: newStock,
        reason,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success(
        `Stock updated for ${product.name}: ${currentStock} → ${newStock} (${diff >= 0 ? `+${diff}` : diff})`
      );
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message ?? "Failed to adjust stock")
          : "Failed to adjust stock";
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Adjust Stock Level
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Update physical inventory and record audit reason.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Product Header */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="h-12 w-12 shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 text-zinc-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {product.name}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span>SKU: {product.sku || "—"}</span>
                {product.variantTitle && (
                  <span className="rounded bg-zinc-200/80 px-1 py-0.2 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {product.variantTitle}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-zinc-400 font-medium">On Hand</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {currentStock} units
              </p>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={cn(
                  "rounded-xl border py-2 text-xs font-semibold transition-all",
                  mode === "add"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                )}
              >
                + Increase Stock
              </button>
              <button
                type="button"
                onClick={() => setMode("remove")}
                className={cn(
                  "rounded-xl border py-2 text-xs font-semibold transition-all",
                  mode === "remove"
                    ? "border-red-600 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-300"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                )}
              >
                − Decrease Stock
              </button>
              <button
                type="button"
                onClick={() => setMode("set")}
                className={cn(
                  "rounded-xl border py-2 text-xs font-semibold transition-all",
                  mode === "set"
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                )}
              >
                = Set Exact
              </button>
            </div>
          </div>

          {/* Quantity Input + Steppers */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {mode === "set" ? "New Total Quantity" : "Adjustment Quantity"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold tabular-nums text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="1"
              />
              <div className="flex gap-1">
                {[1, 5, 10, 50, 100].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      if (mode === "set") {
                        setQty(String(step));
                      } else {
                        setQty(String(numQty + step));
                      }
                    }}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Current:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">{currentStock}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">New Stock:</span>
              <span className="font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">{newStock}</span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.2 text-[10px] font-bold",
                  diff > 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : diff < 0
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {diff >= 0 ? `+${diff}` : diff}
              </span>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Adjustment Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="Restock / Received Stock">Restock / Received Stock</option>
              <option value="Cycle Count / Physical Audit">Cycle Count / Physical Audit</option>
              <option value="Customer Return">Customer Return</option>
              <option value="Damaged / Broken Goods">Damaged / Broken Goods (Waste)</option>
              <option value="Expired Product">Expired Product (Waste)</option>
              <option value="Inventory Discrepancy">Inventory Discrepancy</option>
              <option value="Theft / Unaccounted Loss">Theft / Unaccounted Loss</option>
              <option value="Other / Manual Adjustment">Other / Manual Adjustment</option>
            </select>
          </div>

          {/* Note Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Audit Note & Reference (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. PO #1042 or shelf count discrepancy"
              className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="primary"
              size="sm"
              loading={isLoading}
              loadingKey="update"
              className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              Confirm Adjustment
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
