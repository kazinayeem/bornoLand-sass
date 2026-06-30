"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { useGetInventoryQuery } from "@/redux/api/inventory-api";
import { Badge } from "@/components/ui/badge";

export function InventoryTab({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryQuery(storeId);
  const summary = data?.data?.summary;
  const items = data?.data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-100 p-4">
          <p className="text-xs text-zinc-500">Total SKUs</p>
          <p className="text-2xl font-semibold">{summary?.totalSkus ?? 0}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Low stock</p>
          <p className="text-2xl font-semibold text-amber-900">{summary?.lowStockCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs text-red-700">Out of stock</p>
          <p className="text-2xl font-semibold text-red-900">{summary?.outOfStockCount ?? 0}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-100">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.productId}-${item.variantId ?? "base"}`} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  {item.variantTitle && <p className="text-xs text-zinc-500">{item.variantTitle}</p>}
                </td>
                <td className="px-4 py-3 text-zinc-600">{item.sku || "—"}</td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">
                  {item.stock <= 0 ? (
                    <Badge variant="danger">Out of stock</Badge>
                  ) : item.lowStock ? (
                    <Badge variant="warning" className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low stock
                    </Badge>
                  ) : (
                    <Badge variant="success">In stock</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">No inventory-tracked products yet.</p>
        )}
      </div>
    </div>
  );
}
