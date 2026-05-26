"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { Pagination } from "@/components/ui/pagination";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, products, categories, settings } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const perPage = 12;

  const activeCategories = useMemo(() => categories.filter((c) => c.active), [categories]);
  const activeProducts = useMemo(() => products.filter((p) => p.status === "active"), [products]);
  const maxPrice = useMemo(() => Math.max(...activeProducts.map((p) => p.price), 100), [activeProducts]);

  useEffect(() => { setPriceRange([0, maxPrice]); }, [maxPrice]);

  const updateURL = useCallback((params: Record<string, string>) => {
    const next = { ...Object.fromEntries(searchParams.entries()), ...params };
    Object.keys(next).forEach((k) => { if (!next[k]) delete next[k]; });
    router.push(`${pathname}${Object.keys(next).length ? `?${new URLSearchParams(next)}` : ""}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
    updateURL({ search: val, page: "" });
  }, [updateURL]);

  const handleCategory = useCallback((id: string) => {
    setSelectedCategoryId(id);
    setPage(1);
    updateURL({ category: id, page: "" });
  }, [updateURL]);

  const handleSort = useCallback((val: string) => {
    setSort(val);
    setPage(1);
    updateURL({ sort: val, page: "" });
  }, [updateURL]);

  const handlePage = useCallback((p: number) => {
    setPage(p);
    updateURL({ page: p > 1 ? String(p) : "" });
  }, [updateURL]);

  const clearFilters = useCallback(() => {
    setSearch(""); setSelectedCategoryId(""); setSort("newest"); setPriceRange([0, maxPrice]); setPage(1);
    router.push(pathname, { scroll: false });
  }, [pathname, router, maxPrice]);

  const filtered = useMemo(() => {
    let result = [...activeProducts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    if (selectedCategoryId) {
      const catName = activeCategories.find((c) => c._id === selectedCategoryId)?.name;
      result = result.filter((p) => (p.categoryIds ?? []).includes(selectedCategoryId) || p.category === catName);
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return result;
  }, [activeProducts, search, selectedCategoryId, sort, priceRange, activeCategories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const hasActiveFilters = search || selectedCategoryId || priceRange[0] > 0 || priceRange[1] < maxPrice || sort !== "newest";

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
              Shop
            </h1>
            <p className="mt-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              {filtered.length} {filtered.length === 1 ? "product" : "products"} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text" value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                autoFocus={!!searchParams.get("search")}
                className="h-10 w-full rounded-xl border bg-transparent pl-9 pr-9 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-colors"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }}
              />
              {search && (
                <button onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#a1a1aa" : "#52525b", backgroundColor: showFilters ? (isDark ? "#27272a" : "#f4f4f5") : "transparent" }}>
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#a1a1aa" : "#52525b" }}>
              {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="mt-4 overflow-hidden rounded-xl border"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
              <div className="p-4 sm:p-5">
                <div className="grid gap-6 sm:grid-cols-3">
                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => handleCategory("")}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ backgroundColor: !selectedCategoryId ? primaryColor : isDark ? "#27272a" : "#e4e4e7", color: !selectedCategoryId ? "#fff" : isDark ? "#a1a1aa" : "#52525b" }}>
                        All
                      </button>
                      {activeCategories.map((cat) => (
                        <button key={cat._id} onClick={() => handleCategory(cat._id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{ backgroundColor: selectedCategoryId === cat._id ? primaryColor : isDark ? "#27272a" : "#e4e4e7", color: selectedCategoryId === cat._id ? "#fff" : isDark ? "#a1a1aa" : "#52525b" }}>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Price Range */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                      Price Range
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                        <span>{formatCurrency(priceRange[0], settings)}</span>
                        <span>{formatCurrency(priceRange[1], settings)}</span>
                      </div>
                      <div className="relative h-6">
                        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full" style={{ backgroundColor: isDark ? "#27272a" : "#e4e4e7" }} />
                        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ backgroundColor: primaryColor, left: `${(priceRange[0] / maxPrice) * 100}%`, right: `${100 - (priceRange[1] / maxPrice) * 100}%` }} />
                        <input type="range" min={0} max={maxPrice} value={priceRange[0]}
                          onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:bg-white" />
                        <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:bg-white" />
                      </div>
                    </div>
                  </div>
                  {/* Sort */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                      Sort By
                    </label>
                    <select value={sort} onChange={(e) => handleSort(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-transparent px-3 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }}>
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters tags */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                &ldquo;{search}&rdquo;
                <button onClick={() => handleSearch("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategoryId && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                {activeCategories.find((c) => c._id === selectedCategoryId)?.name}
                <button onClick={() => handleCategory("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                {formatCurrency(priceRange[0], settings)} &ndash; {formatCurrency(priceRange[1], settings)}
                <button onClick={() => setPriceRange([0, maxPrice])}><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
              style={{ backgroundColor: isDark ? "#27272a" : "#e4e4e7" }}>
              Clear all
            </button>
          </div>
        )}

        {/* Products */}
        {paginated.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3">
            <Search className="h-12 w-12" style={{ color: isDark ? "#27272a" : "#e4e4e7" }} />
            <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>No products found</p>
            <button onClick={clearFilters}
              className="rounded-xl px-4 py-2 text-xs font-medium text-white"
              style={{ backgroundColor: primaryColor }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`mt-6 ${view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}`}>
              {paginated.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePage}
                total={filtered.length}
                pageSize={perPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
