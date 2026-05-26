"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useGetCategoriesQuery, useCreateCategoryMutation,
  useUpdateCategoryMutation, useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} from "@/redux/api/category-api";
import type { Category } from "@/redux/api/category-api";
import {
  Layers, Plus, Loader2, Pencil, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, Star, X, Check,
} from "lucide-react";
import { toast } from "sonner";

type CategoriesTabProps = { storeId: string };

export function CategoriesTab({ storeId }: CategoriesTabProps) {
  const { data, isLoading } = useGetCategoriesQuery(storeId);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [reorderCategories] = useReorderCategoriesMutation();

  const categories = data?.data?.categories ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", imageUrl: "",
    parentId: "", active: true, featured: false,
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", imageUrl: "", parentId: "", active: true, featured: false });
    setEditCat(null);
    setShowForm(false);
  };

  const openEdit = (c: Category) => {
    setEditCat(c);
    setForm({
      name: c.name, slug: c.slug, description: c.description || "",
      imageUrl: c.imageUrl || "", parentId: c.parentId || "",
      active: c.active, featured: c.featured,
    });
    setShowForm(true);
  };

  const genSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || genSlug(form.name),
        description: form.description,
        imageUrl: form.imageUrl,
        parentId: form.parentId || null,
        active: form.active,
        featured: form.featured,
      };
      if (editCat) {
        await updateCategory({ storeId, id: editCat._id, data: payload }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory({ storeId, data: payload }).unwrap();
        toast.success("Category created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory({ storeId, id }).unwrap();
      toast.success("Category deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const idx = direction === "up" ? index - 1 : index + 1;
    if (idx < 0 || idx >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[idx]] = [reordered[idx], reordered[index]];
    try {
      await reorderCategories({ storeId, orderedIds: reordered.map((c) => c._id) }).unwrap();
      toast.success("Reordered");
    } catch { toast.error("Failed to reorder"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{categories.length} categories</p>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Category
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-base font-semibold text-zinc-900">No categories yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Create categories to organize your products.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((cat, i) => (
            <motion.div key={cat._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center gap-0.5">
                <button onClick={() => handleReorder(i, "up")} disabled={i === 0}
                  className="rounded p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button onClick={() => handleReorder(i, "down")} disabled={i === sorted.length - 1}
                  className="rounded p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                ) : (
                  <Layers className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">{cat.name}</p>
                  {cat.featured && <Star className="h-3 w-3 text-amber-500" fill="currentColor" />}
                </div>
                <p className="text-xs text-zinc-400">/{cat.slug}{cat.parentId ? " — subcategory" : ""}</p>
              </div>
              <button onClick={() => updateCategory({ storeId, id: cat._id, data: { active: !cat.active } }).unwrap()}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  cat.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                }`}>
                {cat.active ? "Active" : "Draft"}
              </button>
              <button onClick={() => openEdit(cat)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(cat._id)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-20"
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-zinc-900">{editCat ? "Edit" : "New"} Category</h3>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editCat ? form.slug : genSlug(e.target.value) })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Image URL</label>
                <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Parent Category</label>
                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                  <option value="">None (top level)</option>
                  {categories.filter((c) => c._id !== editCat?._id).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="rounded border-zinc-300" />
                  <span className="text-xs font-medium text-zinc-700">Active</span>
                </label>
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
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editCat ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
