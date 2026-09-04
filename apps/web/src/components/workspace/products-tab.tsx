"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazyGetProductQuery,
} from "@/redux/api/product-api";
import type {
  CreateProductRequest,
  Product,
  ProductOption,
  ProductVariant,
  ProductsListQuery,
} from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { formatCurrency } from "@/lib/format-currency";
import { getProductImageUrl } from "@/lib/product-media";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Star,
  Filter,
  LayoutGrid,
  List,
  Download,
  Upload,
  Copy,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column, type BulkAction } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";
import { useQueryParams } from "@/hooks/use-query-params";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStaleWhileFetching } from "@/hooks/use-stale-while-fetching";
import { genSlug } from "@/components/products/product-form";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "grid";
type TabStatus = "all" | "active" | "draft" | "archived" | "out_of_stock";

type ProductsTabProps = {
  storeId: string;
  storeSlug?: string;
  billingHref?: string;
};

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
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals: string[] = [];
      let cur = "";
      let q = false;
      for (const ch of line) {
        if (ch === '"') {
          q = !q;
        } else if (ch === "," && !q) {
          vals.push(cur.trim().replace(/^"|"$/g, ""));
          cur = "";
        } else {
          cur += ch;
        }
      }
      vals.push(cur.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = vals[i] ?? "";
      });
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
  const { language, t } = useLanguage();
  const isBn = false;

  const router = useRouter();
  const editorBase = storeSlug ? `/store/${storeSlug}/products` : null;

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [fetchProduct] = useLazyGetProductQuery();

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const storeSettings = settingsData?.data?.settings;
  const fmt = (amount: number) => formatCurrency(amount, storeSettings);

  const {
    search,
    setSearch,
    sort: sortKey,
    order,
    status,
    setStatus,
    page: rawPage,
    setPage,
    pageSize: rawPageSize,
    setPageSize,
    setParams,
    resetFilters,
  } = useQueryParams({ sort: "createdAt", order: "desc" });

  const [activeTab, setActiveTab] = useState<TabStatus>("all");
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

  // Derive status & stock status according to activeTab
  const derivedStatus = useMemo(() => {
    if (activeTab === "active") return "active";
    if (activeTab === "draft") return "draft";
    if (activeTab === "archived") return "archived";
    return status || undefined;
  }, [activeTab, status]);

  const derivedStockStatus = useMemo(() => {
    if (activeTab === "out_of_stock") return "out";
    return stockFilter || undefined;
  }, [activeTab, stockFilter]);

  const listQuery = useMemo<ProductsListQuery>(
    () => ({
      storeId,
      page,
      limit: pageSize,
      search: debouncedSearch || undefined,
      sortBy: sortKey || "createdAt",
      sortOrder: (order as "asc" | "desc") || "desc",
      status: derivedStatus,
      category: categoryFilter || undefined,
      stockStatus: derivedStockStatus,
      featured: featuredFilter || undefined,
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
    }),
    [
      storeId,
      page,
      pageSize,
      debouncedSearch,
      sortKey,
      order,
      derivedStatus,
      categoryFilter,
      derivedStockStatus,
      featuredFilter,
      priceMin,
      priceMax,
    ]
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(listQuery);
  const stableData = useStaleWhileFetching(data, isFetching);
  const { data: catsData } = useGetCategoriesQuery(storeId);

  const products = stableData?.data?.products ?? [];
  const categories = catsData?.data?.categories ?? [];
  const pagination = stableData?.data?.pagination;
  const totalPages = pagination?.totalPages ?? stableData?.data?.totalPages ?? 1;
  const total = pagination?.total ?? stableData?.data?.total ?? products.length;

  const handleSort = useCallback(
    (s: { key: string; order: "asc" | "desc" }) => {
      setParams({ sort: s.key, order: s.order, page: undefined });
    },
    [setParams]
  );

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = Boolean(
    categoryFilter || stockFilter || featuredFilter || priceMin || priceMax || searchInput
  );

  const openCreate = useCallback(() => {
    if (editorBase) router.push(`${editorBase}/new`);
  }, [editorBase, router]);

  const openEdit = useCallback(
    (p: Product) => {
      if (editorBase) router.push(`${editorBase}/${p._id}/edit`);
    },
    [editorBase, router]
  );

  const handleDuplicate = useCallback(
    (p: Product) => {
      if (editorBase) router.push(`${editorBase}/${p._id}/duplicate`);
    },
    [editorBase, router]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct({ storeId, id: deleteTarget._id }).unwrap();
      toast.success(isBn ? "পণ্য মুছে ফেলা হয়েছে" : "Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error(isBn ? "পণ্য মুছতে সমস্যা হয়েছে" : "Failed to delete product");
    }
  };

  const toggleStatus = async (p: Product) => {
    try {
      await updateProduct({
        storeId,
        id: p._id,
        data: { status: p.status === "active" ? "draft" : "active" },
      }).unwrap();
      toast.success(p.status === "active" ? "Set to Draft" : "Published");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleExportCSV = useCallback(async () => {
    const headers = [
      "name",
      "slug",
      "productType",
      "sku",
      "price",
      "comparePrice",
      "stock",
      "category",
      "status",
      "description",
      "imageUrl",
      "featured",
      "options",
      "variants",
    ];
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
      csvEscape(p.name),
      csvEscape(p.slug),
      csvEscape(p.productType ?? "simple"),
      csvEscape(p.sku),
      csvEscape(p.price),
      csvEscape(p.comparePrice),
      csvEscape(p.stock),
      csvEscape(p.category),
      csvEscape(p.status),
      csvEscape(p.description),
      csvEscape(p.imageUrl || p.images?.[0]),
      csvEscape(p.featured ? "yes" : "no"),
      csvEscape(p.options ? JSON.stringify(p.options) : ""),
      csvEscape(p.variants ? JSON.stringify(p.variants) : ""),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isBn ? "CSV ফাইল ডাউনলোড হয়েছে" : "CSV exported successfully");
  }, [products, fetchProduct, isBn]);

  const handleImportCSV = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const text = await file.text();
        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast.error(isBn ? "CSV ফাইলটি খালি বা সঠিক নয়" : "CSV is empty or invalid");
          return;
        }
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
              status: (row.status === "active" ||
              row.status === "inactive" ||
              row.status === "draft" ||
              row.status === "archived"
                ? row.status
                : "active") as "active" | "inactive" | "draft" | "archived",
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
          } catch {
            errors++;
          }
        }
        toast.success(
          isBn
            ? `ইমপোর্ট সম্পন্ন: ${created}টি নতুন, ${updated}টি আপডেট, ${errors}টি ত্রুটি`
            : `Import complete: ${created} created, ${updated} updated, ${errors} errors`
        );
      } catch {
        toast.error(isBn ? "CSV ইমপোর্ট করতে সমস্যা হয়েছে" : "Failed to import CSV");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [products, storeId, createProduct, updateProduct, isBn]
  );

  const bulkActions: BulkAction<Product>[] = [
    {
      label: isBn ? "মুছুন" : "Delete Selected",
      icon: Trash2,
      variant: "danger",
      onClick: async (selected) => {
        for (const p of selected) {
          try {
            await deleteProduct({ storeId, id: p._id }).unwrap();
          } catch {}
        }
        toast.success(
          isBn
            ? `${selected.length}টি পণ্য মুছে ফেলা হয়েছে`
            : `${selected.length} products deleted`
        );
      },
    },
    {
      label: isBn ? "সক্রিয় করুন" : "Set Active",
      onClick: async (selected) => {
        for (const p of selected) {
          try {
            await updateProduct({ storeId, id: p._id, data: { status: "active" } }).unwrap();
          } catch {}
        }
        toast.success(
          isBn
            ? `${selected.length}টি পণ্য সক্রিয় করা হয়েছে`
            : `${selected.length} products published`
        );
      },
    },
    {
      label: isBn ? "ড্রাফট করুন" : "Set Draft",
      onClick: async (selected) => {
        for (const p of selected) {
          try {
            await updateProduct({ storeId, id: p._id, data: { status: "draft" } }).unwrap();
          } catch {}
        }
        toast.success(
          isBn
            ? `${selected.length}টি পণ্য ড্রাফট করা হয়েছে`
            : `${selected.length} products moved to draft`
        );
      },
    },
  ];

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: isBn ? "পণ্যের নাম" : "Product",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200/80 dark:border-zinc-700">
            {getProductImageUrl(p) ? (
              <img
                src={getProductImageUrl(p)}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-5 w-5 text-zinc-400" />
            )}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => openEdit(p)}
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-[#003399] dark:hover:text-[#FFDA1A] truncate max-w-[220px] text-left block"
            >
              {p.name}
            </button>
            <p className="text-[11px] text-zinc-400 font-mono">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      hideOnMobile: true,
      render: (p) => <span className="text-xs font-mono text-zinc-500">{p.sku || "—"}</span>,
    },
    {
      key: "category",
      label: isBn ? "ক্যাটাগরি" : "Category",
      hideOnMobile: true,
      render: (p) => (
        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          {p.category || "General"}
        </span>
      ),
    },
    {
      key: "price",
      label: isBn ? "মূল্য" : "Price",
      sortable: true,
      render: (p) => (
        <div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{fmt(p.price)}</span>
          {p.comparePrice && Number(p.comparePrice) > Number(p.price) && (
            <span className="ml-1.5 text-[11px] text-zinc-400 line-through">
              {fmt(p.comparePrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: isBn ? "স্টক" : "Stock",
      sortable: true,
      render: (p) => {
        const isOut = p.stock <= 0;
        const isLow = p.stock > 0 && p.stock <= 5;
        return (
          <Badge variant={isOut ? "danger" : isLow ? "warning" : "success"}>
            {isOut ? "Out of Stock" : `${p.stock} units`}
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: isBn ? "স্ট্যাটাস" : "Status",
      sortable: true,
      render: (p) => {
        const badge = statusBadge(p.status);
        return (
          <button
            type="button"
            onClick={() => toggleStatus(p)}
            title="Click to toggle status"
            className="cursor-pointer"
          >
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </button>
        );
      },
    },
    {
      key: "_actions",
      label: "",
      className: "w-28 text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEdit(p)}
            className="h-8 w-8 min-w-0 min-h-0 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            title="Edit product"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDuplicate(p)}
            className="h-8 w-8 min-w-0 min-h-0 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            title="Duplicate product"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTarget(p)}
            className="h-8 w-8 min-w-0 min-h-0 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            title="Delete product"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const tabs: Array<{ id: TabStatus; label: string; count?: number }> = [
    { id: "all", label: "All Products" },
    { id: "active", label: "Active" },
    { id: "draft", label: "Draft" },
    { id: "archived", label: "Archived" },
    { id: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Top Header Strip ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <span>Products</span>
            <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
              {total}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your store catalog, SKU inventory, variants, and pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{importing ? "Importing..." : "Import"}</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />

          <Button
            onClick={openCreate}
            size="sm"
            className="gap-1.5 bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────── */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        {tabs.map((tItem) => {
          const isActive = activeTab === tItem.id;
          return (
            <button
              key={tItem.id}
              type="button"
              onClick={() => {
                setActiveTab(tItem.id);
                setPage(1);
              }}
              className={cn(
                "relative py-2.5 px-4 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                isActive
                  ? "text-[#003399] dark:text-[#FFDA1A] font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              {tItem.label}
              {isActive && (
                <motion.div
                  layoutId="product-active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#003399] dark:bg-[#FFDA1A]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Filter & Search Toolbar ──────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search product name, SKU, slug..."
              className="h-9 pl-9 text-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-700 outline-none hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "gap-1.5 text-xs cursor-pointer",
              showAdvancedFilters || hasActiveFilters
                ? "border-blue-200 bg-blue-50/70 text-[#003399] dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
                : ""
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#003399] dark:bg-[#FFDA1A]" />
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setCategoryFilter("");
                setStockFilter("");
                setFeaturedFilter("");
                setPriceMin("");
                setPriceMax("");
                resetFilters();
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
              title="Table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Advanced Filters Drawer/Panel ────────────────────── */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Stock Status
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Stock</option>
                  <option value="in">In Stock Only</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Featured
                </label>
                <select
                  value={featuredFilter}
                  onChange={(e) => {
                    setFeaturedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="">All Products</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Standard Only</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Min Price (BDT)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={priceMin}
                  onChange={(e) => {
                    setPriceMin(e.target.value);
                    setPage(1);
                  }}
                  placeholder="0"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Max Price (BDT)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    setPage(1);
                  }}
                  placeholder="99999"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Area: Table vs Grid vs Skeletons ─────── */}
      {isLoading ? (
        <TablePageSkeleton rows={7} cols={6} />
      ) : isError ? (
        <ErrorState
          title="Unable to load products"
          message="Check your network connection and try again."
          onRetry={refetch}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            hasActiveFilters
              ? "No products matched the selected filters. Try broadening your criteria."
              : "Get started by adding your first product to your store catalog."
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setCategoryFilter("");
                  setStockFilter("");
                  setFeaturedFilter("");
                  setPriceMin("");
                  setPriceMax("");
                  resetFilters();
                }}
                className="cursor-pointer text-xs"
              >
                Clear all filters
              </Button>
            ) : (
              <Button
                onClick={openCreate}
                size="sm"
                className="bg-[#003399] text-white hover:bg-[#002B80] cursor-pointer text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Product
              </Button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => {
              const badge = statusBadge(p.status);
              const isOut = p.stock <= 0;
              return (
                <div
                  key={p._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-3 shadow-2xs transition-all hover:border-zinc-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 relative">
                      {getProductImageUrl(p) ? (
                        <img
                          src={getProductImageUrl(p)}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-zinc-400" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950 dark:text-white">
                          {fmt(p.price)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            isOut
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          )}
                        >
                          {isOut ? "Out of Stock" : `${p.stock} in stock`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(p)}
                      className="h-7 px-2 text-xs font-semibold cursor-pointer text-zinc-700 dark:text-zinc-300"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(p)}
                        className="h-7 w-7 p-0 cursor-pointer text-zinc-500"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(p)}
                        className="h-7 w-7 p-0 cursor-pointer text-rose-500 hover:text-rose-700"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages} ({total} total products)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="text-xs cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="text-xs cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          keyField="_id"
          searchable={false}
          selectable
          bulkActions={bulkActions}
          sort={sortKey && order ? { key: sortKey, order: order as "asc" | "desc" } : undefined}
          onSort={handleSort}
          pagination={
            totalPages > 1
              ? {
                  page,
                  pageSize,
                  total,
                  onPageChange: (p) => setPage(p),
                  onPageSizeChange: (s) => setPageSize(s),
                }
              : undefined
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={isBn ? "পণ্য মুছে ফেলবেন?" : "Delete Product?"}
        description={
          isBn
            ? `আপনি কি নিশ্চিত যে "${deleteTarget?.name}" মুছে ফেলতে চান? এই কাজটি ফিরিয়ে নেওয়া যাবে না।`
            : `Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText={isBn ? "মুছে ফেলুন" : "Delete Product"}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
