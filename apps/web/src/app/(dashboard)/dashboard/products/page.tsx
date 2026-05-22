"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useDuplicateProductMutation } from "@/redux/api/product-api";
import type { Product } from "@/redux/api/product-api";
import { toast } from "sonner";
import {
  Package, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Copy,
  Eye, EyeOff, Loader2, X, Check, AlertTriangle, Store, Grid3X3, List
} from "lucide-react";

const categories = ["All", "Clothing", "Footwear", "Accessories", "Electronics", "Furniture", "Beauty", "General"];

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-zinc-100 text-zinc-500"
};

export default function ProductsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const store = stores.find((s) => s._id === selectedStoreId);
  const { data: productsData, isLoading } = useGetProductsQuery(selectedStoreId, { skip: !selectedStoreId });
  const products = productsData?.data?.products ?? [];

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") result = result.filter((p) => p.category === categoryFilter);
    return result;
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", price: 0, comparePrice: 0, category: "general", stock: 0, sku: "", description: "", status: "active" as "active" | "inactive" });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [duplicateProduct, { isLoading: duplicating }] = useDuplicateProductMutation();

  const resetForm = () => {
    setForm({ name: "", slug: "", price: 0, comparePrice: 0, category: "general", stock: 0, sku: "", description: "", status: "active" });
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEdit = (p: Product) => {
    setForm({ name: p.name, slug: p.slug, price: p.price, comparePrice: p.comparePrice ?? 0, category: p.category, stock: p.stock, sku: p.sku, description: p.description, status: p.status });
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!selectedStoreId) return;
    try {
      if (editingProduct) {
        await updateProduct({ storeId: selectedStoreId, id: editingProduct._id, data: form }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct({ storeId: selectedStoreId, data: { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") } }).unwrap();
        toast.success("Product created");
      }
      resetForm();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to save product");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedStoreId) return;
    try {
      await deleteProduct({ storeId: selectedStoreId, id: deleteTarget._id }).unwrap();
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete"); }
  };

  const handleDuplicate = async (p: Product) => {
    if (!selectedStoreId) return;
    try {
      await duplicateProduct({ storeId: selectedStoreId, id: p._id }).unwrap();
      toast.success("Product duplicated");
    } catch { toast.error("Failed to duplicate"); }
  };

  const handleToggleStatus = async (p: Product) => {
    if (!selectedStoreId) return;
    try {
      await updateProduct({ storeId: selectedStoreId, id: p._id, data: { status: p.status === "active" ? "inactive" : "active" } }).unwrap();
      toast.success(p.status === "active" ? "Product deactivated" : "Product activated");
    } catch { toast.error("Failed to toggle status"); }
  };

  if (!selectedStoreId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Products</h2>
            <p className="mt-1 text-sm text-zinc-500">Select a store to manage its products.</p>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Store className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store first to start adding products.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <button key={s._id} onClick={() => setSelectedStoreId(s._id)}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{s.subdomain || s.slug}.bornoland.com</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Products</h2>
            {store && <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{store.name}</span>}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedStoreId("")} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50">Change Store</button>
          <div className="flex rounded-xl border border-zinc-200 bg-white p-0.5">
            <button onClick={() => setViewMode("grid")} className={`rounded-lg p-1.5 ${viewMode === "grid" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"}`}><Grid3X3 className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("list")} className={`rounded-lg p-1.5 ${viewMode === "list" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"}`}><List className="h-4 w-4" /></button>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-95">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
          <Filter className="ml-2 h-3.5 w-3.5 text-zinc-400" />
          {categories.map((cat) => (
            <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:text-zinc-700"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-100" />)}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
            <Package className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-zinc-900">No products found</h3>
          <p className="mt-2 text-sm text-zinc-500">{search ? "Try a different search." : "Add your first product to get started."}</p>
          {!search && (
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((p) => (
            <div key={p._id} className="group rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg">
              <div className="flex h-40 items-center justify-center rounded-t-2xl bg-gradient-to-br from-zinc-50 to-zinc-100">
                <Package className="h-12 w-12 text-zinc-300" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-zinc-900">{p.name}</h4>
                    <p className="text-xs text-zinc-400">{p.sku || p.category}</p>
                  </div>
                  <span className={`ml-2 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium ${statusColors[p.status]}`}>{p.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-zinc-900">${p.price.toFixed(2)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="ml-1.5 text-xs text-zinc-400 line-through">${p.comparePrice.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">Stock: {p.stock}</span>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDuplicate(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-violet-50 hover:text-violet-600"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleToggleStatus(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-amber-50 hover:text-amber-600">
                    {p.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginated.map((p) => (
                <tr key={p._id} className="group transition-colors hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                        <Package className="h-4 w-4 text-zinc-400" />
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{p.sku || "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{p.category}</span></td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-zinc-900">${p.price.toFixed(2)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="ml-1 text-xs text-zinc-400 line-through">${p.comparePrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDuplicate(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-violet-50 hover:text-violet-600"><Copy className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleToggleStatus(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-amber-50 hover:text-amber-600">
                        {p.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 disabled:opacity-50 hover:bg-zinc-50">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium ${page === p ? "bg-blue-600 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"}`}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 disabled:opacity-50 hover:bg-zinc-50">Next</button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editingProduct ? f.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Slug</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Price *</label>
                    <input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Compare Price</label>
                    <input type="number" min={0} step={0.01} value={form.comparePrice} onChange={(e) => setForm((f) => ({ ...f, comparePrice: Number(e.target.value) }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Stock</label>
                    <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Category</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">SKU</label>
                    <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={resetForm} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button onClick={handleSave} disabled={creating || updating || !form.name}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {(creating || updating) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingProduct ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Delete Product</h3>
                  <p className="text-sm text-zinc-500">This action cannot be undone.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-zinc-50 p-3">
                <p className="text-sm font-medium text-zinc-700">{deleteTarget.name}</p>
                <p className="text-xs text-zinc-400">${deleteTarget.price.toFixed(2)} &middot; Stock: {deleteTarget.stock}</p>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
