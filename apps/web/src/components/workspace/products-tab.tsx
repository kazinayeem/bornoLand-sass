"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  useGetProductsQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation,
  useLazyGetProductQuery,
} from "@/redux/api/product-api";
import type { CreateProductRequest, Product, ProductOption, ProductVariant } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import { getProductImageUrl } from "@/lib/product-media";
import {
  Package, Plus, Pencil, Trash2, Star, Filter,
  LayoutGrid, List, Download, Upload, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column, type BulkAction } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, statusBadge } from "@/components/ui/badge";
import { FilterPanel, type FilterConfig } from "@/components/ui/filter-panel";
import { useQueryParams } from "@/hooks/use-query-params";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStaleWhileFetching } from "@/hooks/use-stale-while-fetching";
import type { ProductsListQuery } from "@/redux/api/product-api";
import { genSlug } from "@/components/products/product-form";

type ViewMode = "table" | "grid";

type ProductsTabProps = { storeId: string; storeSlug?: string; billingHref?: string };

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

function parseJsonArray<T>(value: string | undefined, fallback: T[]): T[] {
  if (!value?.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function ProductsTab({ storeId, storeSlug, billingHref = "#" }: ProductsTabProps) {
  const router = useRouter();
  const editorBase = storeSlug ? `/store/${storeSlug}/products` : null;

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [fetchProduct] = useLazyGetProductQuery();

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const storeSettings = settingsData?.data?.settings;
  const fmt = (amount: number) => formatCurrency(amount, storeSettings);

  const { search, setSearch, sort: sortKey, order, status, setStatus, page: rawPage, setPage, pageSize: rawPageSize, setPageSize, setParams, resetFilters } = useQueryParams({ sort: "createdAt", order: "desc" });

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(search || "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== (search || "")) setSearch(debouncedSearch);
  }, [debouncedSearch, search, setSearch]);

  const page = rawPage ?? 1;
  const pageSize = rawPageSize ?? 20;
  const sortCfg = sortKey && order ? { key: sortKey, order: order as "asc" | "desc" } : undefined;

  const listQuery = useMemo<ProductsListQuery>(() => ({
    storeId,
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    sortBy: sortKey || "createdAt",
    sortOrder: (order as "asc" | "desc") || "desc",
    status: status || undefined,
    category: categoryFilter || undefined,
    stockStatus: stockFilter || undefined,
    featured: featuredFilter || undefined,
    priceMin: priceMin || undefined,
    priceMax: priceMax || undefined,
  }), [storeId, page, pageSize, debouncedSearch, sortKey, order, status, categoryFilter, stockFilter, featuredFilter, priceMin, priceMax]);

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(listQuery);
  const stableData = useStaleWhileFetching(data, isFetching);
  const { data: catsData } = useGetCategoriesQuery(storeId);

  const products = stableData?.data?.products ?? [];
  const categories = catsData?.data?.categories ?? [];
  const pagination = stableData?.data?.pagination;
  const totalPages = pagination?.totalPages ?? stableData?.data?.totalPages ?? 1;
  const total = pagination?.total ?? stableData?.data?.total ?? products.length;
  const paginated = products;

  const handleSort = useCallback((s: { key: string; order: "asc" | "desc" }) => {
    setParams({ sort: s.key, order: s.order, page: undefined });
  }, [setParams]);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = !!(status || categoryFilter || stockFilter || featuredFilter || priceMin || priceMax);

  const openCreate = () => {
    if (editorBase) router.push(`${editorBase}/new`);
  };

  const openEdit = (p: Product) => {
    if (editorBase) router.push(`${editorBase}/${p._id}/edit`);
  };

  const openDuplicate = (p: Product) => {
    if (editorBase) router.push(`${editorBase}/${p._id}/duplicate`);
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

  const handleDuplicate = (p: Product) => openDuplicate(p);

  const handleExportCSV = useCallback(async () => {
    const headers = ["name", "slug", "productType", "sku", "price", "comparePrice", "stock", "category", "status", "description", "imageUrl", "featured", "options", "variants"];
    const productsForExport = await Promise.all(
      products.map(async (product) => {
        if (product.productType !== "variable" && !product.variantCount) return product;
        try {
          const response = await fetchProduct(product._id).unwrap();
          return response.data?.product ?? product;
        } catch {
          return product;
        }
      })
    );
    const rows = productsForExport.map((p) => [
      csvEscape(p.name), csvEscape(p.slug), csvEscape(p.productType ?? "simple"), csvEscape(p.sku), csvEscape(p.price),
      csvEscape(p.comparePrice), csvEscape(p.stock), csvEscape(p.category),
      csvEscape(p.status), csvEscape(p.description), csvEscape(p.imageUrl),
      csvEscape(p.featured ? "yes" : "no"),
      csvEscape(JSON.stringify(p.options ?? [])),
      csvEscape(JSON.stringify(p.variants ?? [])),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${storeId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${productsForExport.length} products`);
  }, [fetchProduct, products, storeId]);

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
          const payload: CreateProductRequest = {
            name: row.name || "Untitled",
            slug: row.slug || genSlug(row.name || "untitled"),
            productType: row.productType === "variable" ? "variable" : "simple",
            price: Number(row.price) || 0,
            comparePrice: row.comparePrice ? Number(row.comparePrice) : undefined,
            stock: Number(row.stock) || 0,
            category: row.category || "general",
            status: (
              row.status === "active" || row.status === "inactive" || row.status === "draft" || row.status === "archived"
                ? row.status
                : "active"
            ) as "active" | "inactive" | "draft" | "archived",
            sku: row.sku || "",
            imageUrl: row.imageUrl || "",
            description: row.description || "",
            featured: row.featured === "yes" || row.featured === "true",
            options: parseJsonArray<ProductOption>(row.options, []),
            variants: parseJsonArray<ProductVariant>(row.variants, []),
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
          <div className="h-9 w-9 shrink-0 rounded-lg bg-apple-canvas-parchment flex items-center justify-center overflow-hidden">
            {getProductImageUrl(p) ? <img src={getProductImageUrl(p)} alt={p.name} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-apple-ink-muted-48" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-apple-ink truncate max-w-[200px]">{p.name}</p>
            <p className="text-xs text-apple-ink-muted-48">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sku", label: "SKU", hideOnMobile: true,
      render: (p) => <span className="text-xs text-apple-ink-muted-48">{p.sku || "—"}</span>,
    },
    {
      key: "price", label: "Price", sortable: true,
      render: (p) => (
        <div>
          <span className="text-sm font-medium text-apple-ink">{fmt(p.price)}</span>
          {p.comparePrice && Number(p.comparePrice) > Number(p.price) && (
            <span className="ml-1.5 text-xs text-apple-ink-muted-48 line-through">{fmt(p.comparePrice)}</span>
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
            className={`rounded-lg p-1.5 transition-colors ${p.featured ? "text-amber-500 hover:bg-amber-50" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"}`}
            title={p.featured ? "Unfeature" : "Feature"}>
            <Star className="h-3.5 w-3.5" fill={p.featured ? "currentColor" : "none"} />
          </button>
          <button onClick={() => handleDuplicate(p)}
            className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-colors"
            title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => openEdit(p)}
            className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteTarget(p)}
            className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-500 transition-colors">
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
                : "border-apple-hairline bg-white text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
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
          <div className="flex overflow-hidden rounded-xl border border-apple-hairline bg-white">
            <button onClick={() => setViewMode("table")}
              className={`p-2 transition-colors ${viewMode === "table" ? "bg-apple-canvas-parchment text-apple-ink" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"}`}
              title="Table view">
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-apple-canvas-parchment text-apple-ink" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"}`}
              title="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-apple-hairline bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors"
            title="Export CSV">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={importing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-apple-hairline bg-white px-3 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors disabled:opacity-50"
            title="Import CSV">
            <Upload className="h-3.5 w-3.5" /> {importing ? "Importing..." : "Import"}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          <button onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-apple-lg border border-apple-hairline bg-white p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Category</label>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80">
                <option value="">All</option>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Stock</label>
              <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80">
                <option value="">All</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Featured</label>
              <select value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80">
                <option value="">All</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Min Price</label>
              <input type="number" min={0} value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Max Price</label>
              <input type="number" min={0} value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80" placeholder="9999" />
            </div>
            <div className="flex items-end">
              <button onClick={() => { setCategoryFilter(""); setStockFilter(""); setFeaturedFilter(""); setPriceMin(""); setPriceMax(""); }}
                className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs font-medium text-apple-ink-muted-48 hover:bg-apple-canvas-parchment transition-colors">
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
              className="group relative rounded-apple-lg border border-apple-hairline bg-white p-3  hover:shadow-lg transition-all">
              <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-apple-canvas-parchment">
                {getProductImageUrl(p) ? (
                  <img src={getProductImageUrl(p)} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8 text-apple-ink-muted-48" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-apple-ink truncate">{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-apple-ink">{fmt(p.price)}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                    p.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}>
                    {p.stock > 0 ? `${p.stock}` : "OOS"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button onClick={() => toggleStatus(p)}
                    className={`flex-1 rounded-lg py-1 text-[10px] font-semibold transition-colors ${
                      p.status === "active" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-apple-canvas-parchment text-apple-ink-muted-48 hover:bg-zinc-200"
                    }`}>
                    {p.status === "active" ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setDeleteTarget(p)}
                    className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-500 transition-colors">
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
          isLoading={isLoading && !stableData}
          isFetching={isFetching}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search products..."
          emptyIcon={Package}
          emptyTitle={isError ? "Could not load products" : "No products yet"}
          emptyDescription={isError ? "Check your connection and try again." : "Add your first product to get started."}
          emptyAction={isError ? <button type="button" onClick={() => refetch()} className="text-sm font-medium text-apple-primary">Retry</button> : undefined}
          sort={sortCfg}
          onSort={handleSort}
          bulkActions={bulkActions}
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Modal removed — product create/edit uses dedicated editor pages */}

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
