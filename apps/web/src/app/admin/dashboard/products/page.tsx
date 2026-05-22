"use client";

import { useState, useMemo } from "react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { Package, Search, Store } from "lucide-react";

export default function AdminProductsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [search, setSearch] = useState("");

  const { data: productsData } = useGetProductsQuery(selectedStoreId, { skip: !selectedStoreId });
  const products = productsData?.data?.products ?? [];

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Products</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage products across all stores</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..." className="h-10 w-56 rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <select value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
            <option value="">Filter by store...</option>
            {stores.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((p) => (
              <tr key={p._id} className="transition-colors hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                      <Package className="h-4 w-4 text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-zinc-500">{p.stock}</td>
                <td className="px-4 py-3"><span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{p.category}</span></td>
                <td className="px-4 py-3">
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{p.status}</span>
                </td>
              </tr>
            ))}
            {selectedStoreId && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">No products for this store.</td></tr>
            )}
            {!selectedStoreId && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">Select a store to view products.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
