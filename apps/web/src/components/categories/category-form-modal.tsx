"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Upload, Search, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/redux/api/category-api";
import { MediaPicker } from "@/components/media/media-picker";
import { selectionMediaId } from "@/lib/media-selection";

export type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageId: string;
  bannerUrl: string;
  bannerId: string;
  iconUrl: string;
  iconId: string;
  parentId: string;
  active: boolean;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
};

type CategoryFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  category?: Category | null;
  categories: Category[];
  storeId: string;
  billingHref?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
};

const EMPTY_FORM: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  imageId: "",
  bannerUrl: "",
  bannerId: "",
  iconUrl: "",
  iconId: "",
  parentId: "",
  active: true,
  featured: false,
  metaTitle: "",
  metaDescription: "",
};

const genSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function CategoryFormModal({
  open,
  mode,
  category,
  categories,
  storeId,
  billingHref = "#",
  saving = false,
  onClose,
  onSave,
}: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);

  useEffect(() => {
    if (category && mode === "edit") {
      setForm({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        imageUrl: category.imageUrl || "",
        imageId: category.imageId || "",
        bannerUrl: category.bannerUrl || "",
        bannerId: category.bannerId || "",
        iconUrl: category.iconUrl || "",
        iconId: category.iconId || "",
        parentId: category.parentId || "",
        active: category.active !== false,
        featured: !!category.featured,
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [category, mode, open]);

  if (!open) return null;

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: mode === "edit" ? prev.slug : genSlug(name),
    }));
  };

  const handleCopyUrl = (url: string, label: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success(`${label} URL copied to clipboard`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    await onSave(form);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !saving) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex flex-col w-full bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden"
          style={{
            width: "min(680px, calc(100vw - 24px))",
            maxHeight: "min(85vh, 760px)",
          }}
        >
          {/* ── 1. Sticky Header ────────────────────────────────────── */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-6 bg-white">
            <h3 className="text-sm font-bold text-apple-ink">
              {mode === "edit" ? "Edit Category" : "New Category"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── 2. Scrollable Body (Vertical Only, No Horizontal Overflow) ── */}
          <form id="category-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-5">
            {/* Name & Slug */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-apple-ink">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="e.g. Electronics"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-apple-ink">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="electronics"
                />
              </div>
            </div>

            {/* Parent Category & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="mb-1 block text-xs font-semibold text-apple-ink">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter((c) => c._id !== category?._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-semibold text-apple-ink">Status</label>
                <select
                  value={form.active ? "active" : "inactive"}
                  onChange={(e) => setForm({ ...form, active: e.target.value === "active" })}
                  className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Draft</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-apple-ink">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full min-w-0 min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-y"
                placeholder="Category summary for storefront and search engines..."
              />
            </div>

            {/* ── Media Section: Image, Banner, Icon ────────────────── */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Media</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1. Category Image (1:1) */}
                <div className="flex flex-col min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 space-y-2.5">
                  <span className="text-xs font-bold text-apple-ink">Category Image</span>
                  <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white flex items-center justify-center">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="Category image" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-zinc-400">
                        <ImageIcon className="h-6 w-6 mb-1" />
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <MediaPicker
                      storeId={storeId}
                      billingHref={billingHref}
                      folder="categories"
                      label="Image"
                      value={form.imageUrl}
                      onChange={(selection) =>
                        setForm({
                          ...form,
                          imageUrl: selection?.url || "",
                          imageId: selectionMediaId(selection) || "",
                        })
                      }
                    />
                    {form.imageUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(form.imageUrl, "Category Image")}
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-100"
                          title="Copy Image URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, imageUrl: "", imageId: "" })}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          title="Remove Image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Category Banner (16:7) */}
                <div className="flex flex-col min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 space-y-2.5">
                  <span className="text-xs font-bold text-apple-ink">Category Banner</span>
                  <div className="relative aspect-[16/7] w-full min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white flex items-center justify-center">
                    {form.bannerUrl ? (
                      <img src={form.bannerUrl} alt="Category banner" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-zinc-400">
                        <ImageIcon className="h-5 w-5 mb-0.5" />
                        <span className="text-[10px]">No banner</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <MediaPicker
                      storeId={storeId}
                      billingHref={billingHref}
                      folder="categories"
                      label="Banner"
                      value={form.bannerUrl}
                      onChange={(selection) =>
                        setForm({
                          ...form,
                          bannerUrl: selection?.url || "",
                          bannerId: selectionMediaId(selection) || "",
                        })
                      }
                    />
                    {form.bannerUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(form.bannerUrl, "Category Banner")}
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-100"
                          title="Copy Banner URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, bannerUrl: "", bannerId: "" })}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          title="Remove Banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Category Icon (1:1) */}
                <div className="flex flex-col min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 space-y-2.5">
                  <span className="text-xs font-bold text-apple-ink">Category Icon</span>
                  <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white flex items-center justify-center p-2">
                    {form.iconUrl ? (
                      <img src={form.iconUrl} alt="Category icon" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-zinc-400">
                        <ImageIcon className="h-6 w-6 mb-1" />
                        <span className="text-[10px]">No icon</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <MediaPicker
                      storeId={storeId}
                      billingHref={billingHref}
                      folder="categories"
                      label="Icon"
                      value={form.iconUrl}
                      onChange={(selection) =>
                        setForm({
                          ...form,
                          iconUrl: selection?.url || "",
                          iconId: selectionMediaId(selection) || "",
                        })
                      }
                    />
                    {form.iconUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(form.iconUrl, "Category Icon")}
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-100"
                          title="Copy Icon URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, iconUrl: "", iconId: "" })}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          title="Remove Icon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="pt-1">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-apple-ink">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                Featured category on storefront
              </label>
            </div>

            {/* SEO Section */}
            <div className="border-t border-zinc-200 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-zinc-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">SEO Settings</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-apple-ink">Meta Title</label>
                  <input
                    type="text"
                    maxLength={70}
                    value={form.metaTitle}
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    className="h-10 w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="SEO Title"
                  />
                  <p className="mt-1 text-[10px] text-zinc-400">{form.metaTitle.length}/70 characters</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-apple-ink">Meta Description</label>
                  <textarea
                    maxLength={160}
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    className="w-full min-w-0 min-h-[70px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-apple-ink focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-y"
                    placeholder="SEO Description"
                  />
                  <p className="mt-1 text-[10px] text-zinc-400">{form.metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>
          </form>

          {/* ── 3. Sticky Footer ────────────────────────────────────── */}
          <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-zinc-200 px-6 bg-zinc-50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-apple-ink-muted-80 hover:bg-zinc-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-modal-form"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {mode === "edit" ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
