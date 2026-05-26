"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { ShoppingBag, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { getProductImageUrl } from "@/lib/product-media";

type Props = { storeId?: string };

export function ProductsPanel({ storeId }: Props) {
  const { data, isLoading } = useGetProductsQuery(storeId ?? "", { skip: !storeId });
  const products = data?.data?.products ?? [];
  const theme = useSelector((s: RootState) => s.theme);
  const storeSettings = useSelector((s: RootState) => s.storeSettings);
  const fmt = (amount: number) => formatCurrency(amount, storeSettings);

  if (!storeId) {
    return (
      <div className="p-4 text-center text-xs text-zinc-400">
        Select a store to view products
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Products ({products.length})
        </p>
      </div>

      <div className="space-y-1.5">
        {products.map((product) => (
          <div key={product._id}
            className="flex items-center gap-3 rounded-lg border border-zinc-100 p-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50">
              {getProductImageUrl(product) ? (
                <img src={getProductImageUrl(product)} alt={product.name} className="h-full w-full rounded-lg object-cover" />
              ) : (
                <ShoppingBag className="h-4 w-4 text-zinc-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-zinc-700">{product.name}</p>
              <p className="text-[11px] text-zinc-400">{fmt(product.price)}</p>
            </div>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              product.status === "active" ? "bg-green-50 text-green-600" : "bg-zinc-50 text-zinc-400"
            }`}>
              {product.status}
            </span>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="mt-8 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-zinc-200" />
          <p className="mt-2 text-xs text-zinc-400">No products yet</p>
        </div>
      )}
    </div>
  );
}
