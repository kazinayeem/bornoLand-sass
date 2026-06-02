"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  useGetProductsQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation,
  useDuplicateProductMutation,
} from "@/redux/api/product-api";
import type { Product } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import RichTextEditor from "@/components/cms/rich-text-editor";
import { VariantsPanel } from "@/components/workspace/variants-panel";
import {
  Package, Plus, Pencil, Trash2, Star, X, Check, Filter, Layers,
  LayoutGrid, List, Download, Upload, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column, type BulkAction } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, statusBadge } from "@/components/ui/badge";
import { FilterPanel, type FilterConfig } from "@/components/ui/filter-panel";
import { useQueryParams } from "@/hooks/use-query-params";

type ViewMode = "table" | "grid";

type ProductsTabProps = { storeId: string };

function csvEscape(val: string | number | undefined | null): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of text) {
    if (ch === '"') { inQuotes = !inQuotes; current += ch; }
    else if (ch === "\n" && !inQuotes) { lines.push(current); current = ""; }
    else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const vals: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') { q = !q; }
      else if (ch === "," && !q) { vals.push(cur.trim().replace(/^"|"$/g, "")); cur = ""; }
      else { cur += ch; }
    }
    vals.push(cur.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

export function ProductsTab({ storeId }: ProductsTabProps) {
  const { data, isLoading } = useGetProductsQuery(storeId);
  const { data: catsData } = useGetCategoriesQuery(storeId);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [duplicateProduct] = useDuplicateProductMutation();

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const storeSettings = settingsData?.data?.settings;
  const fmt = (amount: number) => formatCurrency(amount, storeSettings);

  const products = data?.data?.products ?? [];
  const categories = catsData?.data?.categories ?? [];

  const { search, setSearch, sort: sortKey, order, status, setStatus, page: rawPage, setPage, pageSize: rawPageSize, setPageSize, setParams, resetFilters } = useQueryParams({ sort: "createdAt", order: "desc" });

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    sku: "", imageUrl: "", thumbnailUrl: "", galleryImageUrls: "",
    description: "", featured: false,
    categoryIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState<"details" | "variants">("details");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = !!(status || categoryFilter || stockFilter || featuredFilter || priceMin || priceMax);

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
    if (status) result = result.filter((p) => p.status === status);
    if (categoryFilter) result = result.filter((p) => p.category === categoryFilter || p.categoryIds?.includes(categoryFilter));
    if (stockFilter === "in") result = result.filter((p) => p.stock > 0);
    if (stockFilter === "out") result = result.filter((p) => p.stock <= 0);
    if (featuredFilter === "true") result = result.filter((p) => p.featured);
    if (featuredFilter === "false") result = result.filter((p) => !p.featured);
    if (priceMin) result = result.filter((p) => p.price >= Number(priceMin));
    if (priceMax) result = result.filter((p) => p.price <= Number(priceMax));
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
  }, [products, search, status, categoryFilter, stockFilter, featuredFilter, priceMin, priceMax, sortCfg]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetForm = useCallback(() => {
    setForm({ name: "", slug: "", price: "", comparePrice: "", stock: "", category: "", status: "active", sku: "", imageUrl: "", thumbnailUrl: "", galleryImageUrls: "", description: "", featured: false, categoryIds: [] });
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
        thumbnailUrl: form.thumbnailUrl || undefined,
        galleryImageUrls: form.galleryImageUrls ? form.galleryImageUrls.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        description: form.description,
        featured: form.featured,
        categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
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

  const handleDuplicate = async (p: Product) => {
    try {
      await duplicateProduct({ storeId, id: p._id }).unwrap();
      toast.success("Product duplicated");
    } catch { toast.error("Failed to duplicate"); }
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, slug: p.slug, price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      stock: String(p.stock), category: p.category || "",
      status: p.status, sku: p.sku || "", imageUrl: p.imageUrl || "",
      thumbnailUrl: p.thumbnailUrl || "",
      galleryImageUrls: p.galleryImageUrls?.join(", ") || "",
      description: p.description || "", featured: p.featured,
      categoryIds: p.categoryIds ?? [],
    });
    setShowForm(true);
  };

  const handleExportCSV = useCallback(() => {
    const headers = ["name", "slug", "sku", "price", "comparePrice", "stock", "category", "status", "description", "imageUrl", "featured"];
    const rows = filtered.map((p) => [
      csvEscape(p.name), csvEscape(p.slug), csvEscape(p.sku), csvEscape(p.price),
      csvEscape(p.comparePrice), csvEscape(p.stock), csvEscape(p.category),
      csvEscape(p.status), csvEscape(p.description), csvEscape(p.imageUrl),
      csvEscape(p.featured ? "yes" : "no"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${storeId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} products`);
  }, [filtered, storeId]);

  const handleImportCSV = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) { toast.error("CSV is empty or invalid"); return; }
      let created = 0;
      let updated = 0;
      let errors = 0;
      for (const row of rows) {
        try {
          const existing = products.find((p) => p.sku && p.sku === row.sku);
          const payload = {
            name: row.name || "Untitled",
            slug: row.slug || genSlug(row.name || "untitled"),
            price: Number(row.price) || 0,
            comparePrice: row.comparePrice ? Number(row.comparePrice) : undefined,
            stock: Number(row.stock) || 0,
            category: row.category || "general",
            status: (row.status === "active" || row.status === "inactive" ? row.status : "active") as "active" | "inactive",
            sku: row.sku || "",
            imageUrl: row.imageUrl || "",
            description: row.description || "",
            featured: row.featured === "yes" || row.featured === "true",
          };
          if (existing) {
            await updateProduct({ storeId, id: existing._id, data: payload }).unwrap();
            updated++;
          } else {
            await createProduct({ storeId, data: payload }).unwrap();
            created++;
          }
        } catch { errors++; }
      }
      toast.success(`Import complete: ${created} created, ${updated} updated, ${errors} errors`);
    } catch { toast.error("Failed to import CSV"); }
    finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }, [products, storeId, createProduct, updateProduct]);

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
          <button onClick={() => handleDuplicate(p)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
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

  const advancedFilterCount = [categoryFilter, stockFilter, featuredFilter, priceMin, priceMax].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FilterPanel
            filters={productFilters}
            values={{ status: status ?? "" }}
            onChange={(key, val) => setStatus(val)}
            onClear={() => resetFilters()}
          />
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}>
            <Filter className="h-3.5 w-3.5" />
            Advanced
            {advancedFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {advancedFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <button onClick={() => setViewMode("table")}
              className={`p-2 transition-colors ${viewMode === "table" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
              title="Table view">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
              title="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            title="Export CSV">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={importing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            title="Import CSV">
            <Upload className="h-3.5 w-3.5" /> {importing ? "Importing..." : "Import"}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Category</label>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700">
                <option value="">All</option>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Stock</label>
              <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700">
                <option value="">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Featured</label>
              <select value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700">
                <option value="">All</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Min Price</label>
              <input type="number" min={0} value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Max Price</label>
              <input type="number" min={0} value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700" placeholder="9999" />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setCategoryFilter(""); setStockFilter(""); setFeaturedFilter(""); setPriceMin(""); setPriceMax(""); }}
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition-colors">
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginated.map((p) => (
            <motion.div key={p._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="group relative rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm hover:shadow-lg transition-all">
              <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-50">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8 text-zinc-300" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-zinc-900 truncate">{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900">{fmt(p.price)}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                    p.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}>
                    {p.stock > 0 ? `${p.stock}` : "OOS"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button onClick={() => toggleStatus(p)}
                    className={`flex-1 rounded-lg py-1 text-[10px] font-semibold transition-colors ${
                      p.status === "active" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                    }`}>
                    {p.status === "active" ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="rounded-lg p-1.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeleteTarget(p)}
                    className="rounded-lg p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {p.featured && (
                <div className="absolute right-3 top-3 rounded-full bg-amber-400 p-1 shadow">
                  <Star className="h-2.5 w-2.5 text-white" fill="currentColor" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
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
      )}

      {/* Modal */}
      <Modal
        open={showForm}
        onClose={resetForm}
        title={editProduct ? "Edit Product" : "Add Product"}
        size="xl"
      >
        {editProduct && (
          <div className="flex gap-1 border-b border-zinc-200 mb-6">
            <button onClick={() => setEditTab("details")}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${editTab === "details" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}>
              Details
            </button>
            <button onClick={() => setEditTab("variants")}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${editTab === "variants" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-700"}`}>
              <Layers className="h-3.5 w-3.5" /> Variants
            </button>
          </div>
        )}
        {(!editProduct || editTab === "details") ? (
          <>
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
                <label className="mb-1 block text-xs font-medium text-zinc-600">Thumbnail URL</label>
                <input type="text" value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-zinc-600">Gallery Image URLs (comma separated)</label>
                <input type="text" value={form.galleryImageUrls}
                  onChange={(e) => setForm({ ...form, galleryImageUrls: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="https://..., https://..." />
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
          </>
        ) : (
          <VariantsPanel product={editProduct} storeId={storeId} />
        )}
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
