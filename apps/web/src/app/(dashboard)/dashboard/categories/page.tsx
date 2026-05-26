"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import {
  useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation,
  useDeleteCategoryMutation, useReorderCategoriesMutation,
} from "@/redux/api/category-api";
import type { Category } from "@/redux/api/category-api";
import { toast } from "sonner";
import { getStoreDisplayDomain } from "@/utils/domain";
import {
  Layers, Plus, GripVertical, Pencil, Trash2, X, Check, Loader2, Store,
  Eye, EyeOff, ArrowUp, ArrowDown, Star, ImageIcon,
} from "lucide-react";

export default function CategoriesPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const store = stores.find((s) => s._id === selectedStoreId);

  const { data: catsData, isLoading: catsLoading } = useGetCategoriesQuery(selectedStoreId, { skip: !selectedStoreId });
  const categories = catsData?.data?.categories ?? [];

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [reorderCategories, { isLoading: reordering }] = useReorderCategoriesMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", imageUrl: "", description: "",
    parentId: "", featured: false, active: true,
  });

  const resetForm = () => {
    setForm({ name: "", slug: "", imageUrl: "", description: "", parentId: "", featured: false, active: true });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl, description: cat.description,
      parentId: cat.parentId ?? "", featured: cat.featured, active: cat.active,
    });
    setEditId(cat._id);
    setShowForm(true);
  };

  const parentOptions = useMemo(() => categories.filter((c) => c._id !== editId && !c.parentId), [categories, editId]);

  const handleSave = async () => {
    if (!selectedStoreId || !form.name.trim()) return;
    try {
      const payload = {
        name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
        parentId: form.parentId || null,
        featured: form.featured, active: form.active,
      };
      if (editId) {
        await updateCategory({ storeId: selectedStoreId, id: editId, data: payload }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory({ storeId: selectedStoreId, data: payload }).unwrap();
        toast.success("Category created");
      }
      resetForm();
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Failed to save category");
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await deleteCategory({ storeId: selectedStoreId, id: cat._id }).unwrap();
      toast.success("Category deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await updateCategory({ storeId: selectedStoreId, id: cat._id, data: { active: !cat.active } }).unwrap();
    } catch { toast.error("Failed to update"); }
  };

  const handleToggleFeatured = async (cat: Category) => {
    try {
      await updateCategory({ storeId: selectedStoreId, id: cat._id, data: { featured: !cat.featured } }).unwrap();
    } catch { toast.error("Failed to update"); }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...categories];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    try { await reorderCategories({ storeId: selectedStoreId, orderedIds: reordered.map((c) => c._id) }).unwrap(); }
    catch { toast.error("Failed to reorder"); }
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const reordered = [...categories];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    try { await reorderCategories({ storeId: selectedStoreId, orderedIds: reordered.map((c) => c._id) }).unwrap(); }
    catch { toast.error("Failed to reorder"); }
  };

  if (!selectedStoreId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Categories</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your store categories.</p>
        </div>
        {stores.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Store className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create a store first.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <button key={s._id} onClick={() => setSelectedStoreId(s._id)}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-red-600 text-lg font-bold text-white">
                  {s.name[0]}
                </div>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.name}</h3>
                <p className="text-xs text-zinc-400">{getStoreDisplayDomain(s.subdomain, s.slug)}</p>
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
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Categories</h2>
            {store && <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">{store.name}</span>}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{categories.length} categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedStoreId("")} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50">Change Store</button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-orange-700 active:scale-95">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      {catsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
            <Layers className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-zinc-900">No categories yet</h3>
          <p className="mt-2 text-sm text-zinc-500">Create your first category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <motion.div key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-0.5">
                  <button onClick={() => handleMoveUp(index)} disabled={index === 0 || reordering}
                    className="rounded p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                  <GripVertical className="h-4 w-4 text-zinc-300" />
                  <button onClick={() => handleMoveDown(index)} disabled={index === categories.length - 1 || reordering}
                    className="rounded p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900">{cat.name}</h4>
                    {cat.featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="text-xs text-zinc-500">/{cat.slug}{cat.parentId ? ` · Subcategory` : ""}</p>
                  {cat.description && <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleToggleFeatured(cat)}
                    className={`rounded-lg p-1.5 ${cat.featured ? "text-amber-500 hover:bg-amber-50" : "text-zinc-300 hover:text-zinc-500"}`}>
                    <Star className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleToggleActive(cat)}
                    className={`rounded-lg p-1.5 ${cat.active ? "text-green-500 hover:bg-green-50" : "text-zinc-300 hover:text-zinc-500"}`}>
                    {cat.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(cat)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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
                <h3 className="text-lg font-semibold text-zinc-900">{editId ? "Edit Category" : "Add Category"}</h3>
                <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editId ? f.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Slug</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Image URL</label>
                  <input type="text" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  {form.imageUrl && (
                    <div className="mt-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Parent Category</label>
                    <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                      <option value="">None (Top Level)</option>
                      {parentOptions.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">Status</label>
                    <div className="flex gap-3 pt-2">
                      <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                          className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500" />
                        Active
                      </label>
                      <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                          className="rounded border-zinc-300 text-amber-500 focus:ring-amber-400" />
                        Featured
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={resetForm} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button onClick={handleSave} disabled={creating || updating || !form.name}
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">
                  {(creating || updating) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
