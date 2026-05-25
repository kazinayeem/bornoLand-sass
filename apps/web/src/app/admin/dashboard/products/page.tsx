"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGetAdminProductsQuery } from "@/redux/api/admin-api";
import { Package, Search, Store, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";

export default function AdminProductsPage() {
  const { data, isLoading } = useGetAdminProductsQuery();
  const products = data?.data?.products ?? [];
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 15;

  const stores = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((p) => unique.add(p.storeName));
    return Array.from(unique).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) return false;
      if (storeFilter !== "all" && p.storeName !== storeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, storeFilter, statusFilter]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Products</h2>
        <p className="mt-1 text-sm text-zinc-500">{products.length} products across all stores</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search products..." className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={storeFilter} onChange={(e) => { setStoreFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
          <option value="all">All Stores</option>
          {stores.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paged.map((p) => (
                <tr key={p._id} className="transition-colors hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{p.name}</p>
                        {p.sku && <p className="text-xs text-zinc-400">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-zinc-600">
                      <Store className="h-3.5 w-3.5 text-zinc-400" />
                      {p.storeName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${p.stock > 10 ? "text-zinc-700" : p.stock > 0 ? "text-amber-600" : "text-red-600"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{p.salesCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                      p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
          <p className="text-sm text-zinc-500">Showing {(page * perPage) + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Previous</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
