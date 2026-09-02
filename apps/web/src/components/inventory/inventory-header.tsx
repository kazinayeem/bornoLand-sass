"use client";

import { useState } from "react";
import { Plus, ArrowLeftRight, Download, MoreVertical, PackagePlus, ScanBarcode, Warehouse, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/features/session/hooks";

type InventoryHeaderProps = {
  onAdjustStock: () => void;
  onTransferStock: () => void;
  onExport: () => void;
  onBarcodeScan?: () => void;
  onAddStock?: () => void;
};

export function InventoryHeader({
  onAdjustStock,
  onTransferStock,
  onExport,
  onBarcodeScan,
  onAddStock,
}: InventoryHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canUpdate = useHasPermission("inventory:update") || useHasPermission("inventory:*");
  const canAdjust = useHasPermission("inventory:adjust") || canUpdate;
  const canTransfer = useHasPermission("inventory:transfer") || canUpdate;
  const canExport = useHasPermission("inventory:export") || useHasPermission("inventory:read");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Inventory
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Enterprise stock control, warehouse locations, procurement, and valuation.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canExport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 gap-1.5 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>Export</span>
          </Button>
        )}

        {canTransfer && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTransferStock}
            className="h-9 gap-1.5 rounded-xl border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-zinc-500" />
            <span>Transfer Stock</span>
          </Button>
        )}

        {canAdjust && (
          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={onAdjustStock}
            className="h-9 gap-1.5 rounded-xl bg-zinc-900 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adjust Stock</span>
          </Button>
        )}

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 z-40 mt-1.5 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                {onAddStock && canAdjust && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onAddStock();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <PackagePlus className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Receive / Add Stock</span>
                  </button>
                )}
                {onBarcodeScan && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onBarcodeScan();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <ScanBarcode className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Scan Barcode</span>
                  </button>
                )}
                {canExport && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onExport();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Export CSV Summary</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
