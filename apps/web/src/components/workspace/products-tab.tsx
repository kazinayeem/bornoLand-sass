"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useGetProductsQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation,
} from "@/redux/api/product-api";
import type { Product } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import RichTextEditor from "@/components/cms/rich-text-editor";
import {
  Package, Plus, Search, Loader2, Pencil, Trash2,
  Eye, EyeOff, Star, X, Check,
} from "lucide-react";
import { toast } from "sonner";

type ProductsTabProps = { storeId: string };

export function ProductsTab({ storeId }: ProductsTabProps) {
  const { data, isLoading } = useGetProductsQuery(storeId);
  const { data: catsData } = useGetCategoriesQuery(storeId);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data?.products ?? [];
  const categories = catsData?.data?.categories ?? [];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", price: "", comparePrice: "", stock: "",
    category: "", status: "active" as "active" | "inactive",
    sku: "", imageUrl: "", description: "", featured: false,
    categoryIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const resetForm = () => {
    setForm({ name: "", slug: "", price: "", comparePrice: "", stock: "", category: "", status: "active", sku: "", imageUrl: "", description: "", featured: false, categoryIds: [] });
    setEditProduct(null);
    setShowForm(false);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, slug: p.slug, price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      stock: String(p.stock), category: p.category || "",
      status: p.status, sku: p.sku || "", imageUrl: p.imageUrl || "",
      description: p.description || "", featured: p.featured,
      categoryIds: p.categoryIds ?? [],
    });
    setShowForm(true);
  };

  const genSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || genSlug(form.name),
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock) || 0,
        category: form.category,
        status: form.status,
        sku: form.sku,
        imageUrl: form.imageUrl,
        description: form.description,
        featured: form.featured,
        categoryIds: form.categoryIds,
      };
      if (editProduct) {
        await updateProduct({ storeId, id: editProduct._id, data: payload }).unwrap();
        toast.success("Product updated");
      } else {
        await createProduct({ storeId, data: payload }).unwrap();
        toast.success("Product created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct({ storeId, id }).unwrap();
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const toggleStatus = async (p: Product) => {
    try {
      await updateProduct({ storeId, id: p._id, data: { status: p.status === "active" ? "inactive" : "active" } }).unwrap();
    } catch { toast.error("Failed to update status"); }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await updateProduct({ storeId, id: p._id, data: { featured: !p.featured } }).unwrap();
    } catch { toast.error("Failed to update featured"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-base font-semibold text-zinc-900">{search ? "No matches" : "No products yet"}</h3>
          <p className="mt-1 text-sm text-zinc-500">{search ? "Try a different search." : "Add your first product to get started."}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-zinc-400">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{p.sku || "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">${p.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${p.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(p)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                          p.status === "active" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}>
                        {p.status === "active" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {p.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleFeatured(p)}
                          className={`rounded-lg p-1.5 transition-colors ${p.featured ? "text-amber-500 hover:bg-amber-50" : "text-zinc-300 hover:bg-zinc-100"}`}
                          title={p.featured ? "Unfeature" : "Feature"}>
                          <Star className="h-3.5 w-3.5" fill={p.featured ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-zinc-900">
                {editProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600">Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editProduct ? form.slug : genSlug(e.target.value) })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Price</label>
                <input type="number" min={0} step="0.01" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Compare Price</label>
                <input type="number" min={0} step="0.01" value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Stock</label>
                <input type="number" min={0} value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Category</label>
                <input type="text" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="e.g. Electronics" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600">Image URL</label>
                <input type="text" value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600">Description</label>
                <RichTextEditor
                  content={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Write a detailed product description..."
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-zinc-300" />
                  <span className="text-xs font-medium text-zinc-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editProduct ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
