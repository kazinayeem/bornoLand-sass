"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductSkeleton } from "@/components/storefront/product-skeleton";
import { useTenant } from "@/providers/tenant-provider";
import { useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { theme, products, categories } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const activeCategories = useMemo(() => categories.filter((c) => c.active), [categories]);

  const activeProducts = useMemo(() => products.filter((p) => p.status === "active"), [products]);

  const filtered = useMemo(() => {
    let result = [...activeProducts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryId) {
      result = result.filter((p) =>
        (p.categoryIds ?? []).includes(selectedCategoryId) || p.category === activeCategories.find((c) => c._id === selectedCategoryId)?.name
      );
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

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const maxPrice = useMemo(() => Math.max(...activeProducts.map((p) => p.price), 100), [activeProducts]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Shop</h1>
            <p className="mt-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              {filtered.length} products found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..." autoFocus={!!searchParams.get("search")}
                className="h-10 w-full rounded-xl border bg-transparent pl-9 pr-4 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#a1a1aa" : "#52525b" }}>
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#a1a1aa" : "#52525b" }}>
              {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="mt-4 overflow-hidden rounded-xl border p-4"
            style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => { setSelectedCategoryId(""); setPage(1); }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ backgroundColor: !selectedCategoryId ? primaryColor : isDark ? "#27272a" : "#e4e4e7", color: !selectedCategoryId ? "#fff" : isDark ? "#a1a1aa" : "#52525b" }}>
                    All
                  </button>
                  {activeCategories.map((cat) => (
                    <button key={cat._id} onClick={() => { setSelectedCategoryId(cat._id); setPage(1); }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{ backgroundColor: selectedCategoryId === cat._id ? primaryColor : isDark ? "#27272a" : "#e4e4e7", color: selectedCategoryId === cat._id ? "#fff" : isDark ? "#a1a1aa" : "#52525b" }}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Price Range</label>
                <div className="flex items-center gap-2 text-xs" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                  <span>${priceRange[0]}</span>
                  <input type="range" min={0} max={maxPrice} value={priceRange[0]}
                    onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                    className="w-24 accent-zinc-900" />
                  <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                    className="w-24 accent-zinc-900" />
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Sort By</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="h-9 rounded-xl border bg-transparent px-3 text-xs focus:outline-none"
                  style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }}>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filters tags */}
        {(search || selectedCategoryId) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {search && (
              <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                Search: {search}
                <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategoryId && (
              <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                {activeCategories.find((c) => c._id === selectedCategoryId)?.name ?? "Category"}
                <button onClick={() => setSelectedCategoryId("")}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        {paginated.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-3">
            <Search className="h-12 w-12 text-zinc-200" />
            <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>No products found</p>
            <button onClick={() => { setSearch(""); setSelectedCategoryId(""); setPriceRange([0, maxPrice]); }}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white">Clear Filters</button>
          </div>
        ) : (
          <div className={`mt-6 ${view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}`}>
            {paginated.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: page === p ? primaryColor : isDark ? "#18181b" : "#f4f4f5",
                  color: page === p ? "#fff" : isDark ? "#a1a1aa" : "#52525b"
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
