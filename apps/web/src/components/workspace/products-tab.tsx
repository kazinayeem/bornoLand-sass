"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  useGetProductsQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation,
} from "@/redux/api/product-api";
import type { Product } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import RichTextEditor from "@/components/cms/rich-text-editor";
import {
  Package, Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Check, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column, type BulkAction } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, statusBadge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterPanel, type FilterConfig } from "@/components/ui/filter-panel";
import { useQueryParams } from "@/hooks/use-query-params";

type ProductsTabProps = { storeId: string };

export function ProductsTab({ storeId }: ProductsTabProps) {
  const { data, isLoading } = useGetProductsQuery(storeId);
  const { data: catsData } = useGetCategoriesQuery(storeId);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const storeSettings = settingsData?.data?.settings;
  const fmt = (amount: number) => formatCurrency(amount, storeSettings);

  const products = data?.data?.products ?? [];
  const categories = catsData?.data?.categories ?? [];

  const { search, setSearch, sort: sortKey, order, status, setStatus, resetFilters, page: rawPage, setPage, pageSize: rawPageSize, setPageSize, setParams } = useQueryParams({ sort: "createdAt", order: "desc" });

  const page = rawPage ?? 1;
  const pageSize = rawPageSize ?? 20;
  const sortCfg = sortKey && order ? { key: sortKey, order: order as "asc" | "desc" } : undefined;
  const handleSort = useCallback((s: { key: string; order: "asc" | "desc" }) => {
    setParams({ sort: s.key, order: s.order, page: undefined });
  }, [setParams]);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", price: "", comparePrice: "", stock: "",
    category: "", status: "active" as "active" | "inactive",
    sku: "", imageUrl: "", description: "", featured: false,
    categoryIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }
    if (status) {
      result = result.filter((p) => p.status === status);
    }
    if (sortCfg?.key) {
      result = [...result].sort((a, b) => {
        const dir = sortCfg.order === "asc" ? 1 : -1;
        switch (sortCfg.key) {
          case "name": return dir * a.name.localeCompare(b.name);
          case "price": return dir * (a.price - b.price);
          case "stock": return dir * (a.stock - b.stock);
          case "status": return dir * a.status.localeCompare(b.status);
          default: return dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      });
    }
    return result;
  }, [products, search, status, sortCfg]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetForm = useCallback(() => {
    setForm({ name: "", slug: "", price: "", comparePrice: "", stock: "", category: "", status: "active", sku: "", imageUrl: "", description: "", featured: false, categoryIds: [] });
    setEditProduct(null);
    setShowForm(false);
  }, []);

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
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct({ storeId, id: deleteTarget._id }).unwrap();
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete product"); }
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

  const bulkActions: BulkAction<Product>[] = [
    {
      label: "Delete",
      icon: Trash2,
      variant: "danger",
      onClick: async (selected) => {
        for (const p of selected) {
          try { await deleteProduct({ storeId, id: p._id }).unwrap(); } catch { }
        }
        toast.success(`${selected.length} products deleted`);
      },
    },
    {
      label: "Publish",
      onClick: async (selected) => {
        for (const p of selected) {
          try { await updateProduct({ storeId, id: p._id, data: { status: "active" } }).unwrap(); } catch { }
        }
        toast.success(`${selected.length} products published`);
      },
    },
    {
      label: "Unpublish",
      onClick: async (selected) => {
        for (const p of selected) {
          try { await updateProduct({ storeId, id: p._id, data: { status: "inactive" } }).unwrap(); } catch { }
        }
        toast.success(`${selected.length} products unpublished`);
      },
    },
  ];

  const productFilters: FilterConfig[] = [
    { key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
  ];

  const columns: Column<Product>[] = [
    {
      key: "name", label: "Product", sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden">
            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-zinc-400" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">{p.name}</p>
            <p className="text-xs text-zinc-400">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sku", label: "SKU", hideOnMobile: true,
      render: (p) => <span className="text-xs text-zinc-500">{p.sku || "—"}</span>,
    },
    {
      key: "price", label: "Price", sortable: true,
      render: (p) => (
        <div>
          <span className="text-sm font-medium text-zinc-900">{fmt(p.price)}</span>
          {p.comparePrice && Number(p.comparePrice) > Number(p.price) && (
            <span className="ml-1.5 text-xs text-zinc-400 line-through">{fmt(p.comparePrice)}</span>
          )}
        </div>
      ),
    },
    {
      key: "stock", label: "Stock", sortable: true,
      render: (p) => (
        <span className={`text-xs font-medium ${p.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
        </span>
      ),
    },
    {
      key: "status", label: "Status", sortable: true,
      render: (p) => {
        const badge = statusBadge(p.status);
        return (
          <button onClick={() => toggleStatus(p)} className="hover:opacity-80 transition-opacity">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </button>
        );
      },
    },
    {
      key: "actions", label: "", className: "text-right",
      render: (p) => (
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
          <button onClick={() => setDeleteTarget(p)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <FilterPanel
          filters={productFilters}
          values={{ status: status ?? "" }}
          onChange={(key, val) => setStatus(val)}
          onClear={() => resetFilters()}
        />
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
      </div>

      <DataTable
        data={paginated}
        columns={columns}
        keyExtractor={(p) => p._id}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
        emptyIcon={Package}
        emptyTitle="No products yet"
        emptyDescription="Add your first product to get started."
        sort={sortCfg}
        onSort={handleSort}
        bulkActions={bulkActions}
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editProduct ? "Edit Product" : "Add Product"}
        size="xl"
      >
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
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
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
              <span className="text-xs font-medium text-zinc-700">Featured product</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={resetForm}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors">
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check className="h-4 w-4" />}
            {editProduct ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
