"use client";

import { useState } from "react";
import { X, ArrowRight, Warehouse, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import {
  useCreateInventoryTransferMutation,
  useGetInventoryWarehousesQuery,
  type InventoryItem,
} from "@/redux/api/inventory-api";

type StockTransferDrawerProps = {
  open: boolean;
  onClose: () => void;
  product: InventoryItem | null;
  storeId: string;
};

export function StockTransferDrawer({
  open,
  onClose,
  product,
  storeId,
}: StockTransferDrawerProps) {
  const { data: warehousesData } = useGetInventoryWarehousesQuery(
    { storeId },
    { skip: !open || !storeId }
  );
  const warehouses = warehousesData?.data?.items ?? [];

  const [createTransferMutation, { isLoading }] = useCreateInventoryTransferMutation();

  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");

  const currentStock = product?.stock ?? 0;
  const transferQty = Math.max(1, parseInt(qty, 10) || 1);

  if (!open || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromWarehouseId || !toWarehouseId) {
      toast.error("Please select both source and destination warehouses");
      return;
    }

    if (fromWarehouseId === toWarehouseId) {
      toast.error("Source and destination warehouses cannot be the same");
      return;
    }

    if (transferQty <= 0) {
      toast.error("Please enter a valid transfer quantity");
      return;
    }

    try {
      await createTransferMutation({
        storeId,
        body: {
          fromWarehouseId,
          toWarehouseId,
          items: [
            {
              productId: product.productId,
              quantity: transferQty,
              variantId: product.variantId || undefined,
            },
          ],
          notes: notes.trim() || undefined,
        },
      }).unwrap();

      toast.success(
        `Transfer initiated for ${transferQty} unit(s) of ${product.name}`
      );
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message ?? "Failed to create transfer")
          : "Failed to create transfer";
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
              Inter-Warehouse Stock Transfer
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Transfer physical inventory between store locations.
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
              <p className="text-[11px] text-zinc-400 font-mono">
                SKU: {product.sku || "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-zinc-400 font-medium">Available</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {currentStock} units
              </p>
            </div>
          </div>

          {/* Warehouses Selection Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Source Warehouse (From) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={fromWarehouseId}
                onChange={(e) => setFromWarehouseId(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="">Select source warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id} disabled={w._id === toWarehouseId}>
                    {w.name} {w.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Destination Warehouse (To) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={toWarehouseId}
                onChange={(e) => setToWarehouseId(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="">Select destination warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id} disabled={w._id === fromWarehouseId}>
                    {w.name} {w.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Transfer Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold tabular-nums text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="1"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Transfer Notes / Dispatch Ref
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Branch replenishment, Truck #4"
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
              loadingKey="create"
              className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              Initiate Transfer
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
