"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGetStoreQuery } from "@/redux/api/store-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useDuplicateProductMutation } from "@/redux/api/product-api";
import type { Product } from "@/redux/api/product-api";
import { toast } from "sonner";
import {
  Package, Plus, Search, Filter, ArrowLeft, Edit, Trash2, Copy,
  Eye, EyeOff, Loader2, X, AlertTriangle, Store, Grid3X3, List
} from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { getProductImageUrl } from "@/lib/product-media";

const categories = ["All", "Clothing", "Footwear", "Accessories", "Electronics", "Furniture", "Beauty", "General"];

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-zinc-100 text-zinc-500"
};

export default function StoreProductsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const { data: storeData, isLoading: storeLoading } = useGetStoreQuery(storeId);
  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(storeId);
  const products = productsData?.data?.products ?? [];
  const store = storeData?.data?.store;
  const storeSettings = settingsData?.data?.settings;
  const fmt = (amount: number) => formatCurrency(amount, storeSettings ?? "BDT");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 12;

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

  const activeCount = products.filter((p) => p.status === "active").length;
  const inactiveCount = products.filter((p) => p.status === "inactive").length;

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: 0,
    comparePrice: 0,
    category: "general",
    stock: 0,
    sku: "",
    description: "",
    status: "active" as "active" | "inactive",
    imageUrl: "",
    thumbnailUrl: "",
    galleryImageUrls: ""
  });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [duplicateProduct, { isLoading: duplicating }] = useDuplicateProductMutation();

  const resetForm = () => {
    setForm({ name: "", slug: "", price: 0, comparePrice: 0, category: "general", stock: 0, sku: "", description: "", status: "active", imageUrl: "", thumbnailUrl: "", galleryImageUrls: "" });
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      slug: p.slug,
      price: p.price,
      comparePrice: p.comparePrice ?? 0,
      category: p.category,
      stock: p.stock,
      sku: p.sku,
      description: p.description,
      status: p.status,
      imageUrl: p.imageUrl ?? p.images?.[0] ?? "",
      thumbnailUrl: p.thumbnailUrl ?? p.imageUrl ?? p.images?.[0] ?? "",
      galleryImageUrls: (p.galleryImageUrls ?? p.images ?? []).join("\n")
    });
    setEditingProduct(p);
    setShowForm(true);
  };

  const parseImageList = (value: string) =>
    value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateProduct({ storeId, id: editingProduct._id, data: { ...form, galleryImageUrls: parseImageList(form.galleryImageUrls) } }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct({ storeId, data: { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"), galleryImageUrls: parseImageList(form.galleryImageUrls) } }).unwrap();
        toast.success("Product created");
      }
      resetForm();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to save product");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct({ storeId, id: deleteTarget._id }).unwrap();
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete"); }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      await duplicateProduct({ storeId, id: p._id }).unwrap();
      toast.success("Product duplicated");
    } catch { toast.error("Failed to duplicate"); }
  };

  const handleToggleStatus = async (p: Product) => {
    try {
      await updateProduct({ storeId, id: p._id, data: { status: p.status === "active" ? "inactive" : "active" } }).unwrap();
      toast.success(p.status === "active" ? "Product deactivated" : "Product activated");
    } catch { toast.error("Failed to toggle status"); }
  };

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
        <Store className="mx-auto h-12 w-12 text-zinc-300" />
        <h3 className="mt-4 text-lg font-semibold text-zinc-700">Store not found</h3>
        <Link href="/dashboard/stores" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to stores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/stores"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" /> Stores
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm">
              {store.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{store.name}</h2>
              <p className="text-sm text-zinc-500">{products.length} products</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: products.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: activeCount, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Inactive", value: inactiveCount, color: "text-zinc-600", bg: "bg-zinc-100" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">{m.label}</p>
            <p className={`mt-1 text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
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

      {/* Products */}
      {productsLoading ? (
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
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-zinc-50 to-zinc-100">
                {getProductImageUrl(p) ? (
                  <img src={getProductImageUrl(p)} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-zinc-300" />
                )}
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
                    <span className="text-lg font-bold text-zinc-900">{fmt(p.price)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="ml-1.5 text-xs text-zinc-400 line-through">{fmt(p.comparePrice)}</span>
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
                        {getProductImageUrl(p) ? <img src={getProductImageUrl(p)} alt={p.name} className="h-9 w-9 rounded-lg object-cover" /> : <Package className="h-4 w-4 text-zinc-400" />}
                      </div>
                      <span className="text-sm font-medium text-zinc-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{p.sku || "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{p.category}</span></td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-zinc-900">{fmt(p.price)}</span>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="ml-1 text-xs text-zinc-400 line-through">{fmt(p.comparePrice)}</span>
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

      {/* Add/Edit Product Modal */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Primary Image URL</label>
                    <input type="text" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Thumbnail URL</label>
                    <input type="text" value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Gallery Image URLs</label>
                  <textarea value={form.galleryImageUrls} onChange={(e) => setForm((f) => ({ ...f, galleryImageUrls: e.target.value }))} rows={3}
                    placeholder="One URL per line or comma separated"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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

      {/* Delete Confirmation Modal */}
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
                <p className="text-xs text-zinc-400">{fmt(deleteTarget.price)} &middot; Stock: {deleteTarget.stock}</p>
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
