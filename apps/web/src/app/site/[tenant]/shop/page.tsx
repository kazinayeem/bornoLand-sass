"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { useTenant } from "@/providers/tenant-provider";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/format-currency";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontButton,
  StorefrontEmptyState,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { products, categories, settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();

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
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryId) {
      result = result.filter(
        (p) =>
          (p.categoryIds ?? []).includes(selectedCategoryId) ||
          p.category === activeCategories.find((c) => c._id === selectedCategoryId)?.name
      );
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [activeProducts, search, selectedCategoryId, sort, priceRange, activeCategories]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const maxPrice = useMemo(() => Math.max(...activeProducts.map((p) => p.price), 100), [activeProducts]);

  return (
    <StorefrontPage parchment>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <StorefrontPageHeader
          title="Shop"
          description={`${filtered.length} products found`}
          className="mb-0"
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              autoFocus={!!searchParams.get("search")}
              className={cn(classes.inputCompact, "w-full pl-10 pr-4")}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("flex h-10 w-10 items-center justify-center border", classes.inputCompact, classes.divider)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className={cn("flex h-10 w-10 items-center justify-center border", classes.inputCompact, classes.divider)}
            aria-label="Toggle view"
          >
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className={cn("mt-4 overflow-hidden p-4", classes.card)}
        >
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <label className={cn("mb-1.5 block text-caption-strong", classes.body)}>Category</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId("");
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 text-caption font-medium transition-colors",
                    !selectedCategoryId ? "rounded-apple-pill text-apple-on-primary" : classes.chip
                  )}
                  style={!selectedCategoryId ? { backgroundColor: primaryColor } : undefined}
                >
                  All
                </button>
                {activeCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat._id);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-caption font-medium transition-colors",
                      selectedCategoryId === cat._id ? "rounded-apple-pill text-apple-on-primary" : classes.chip
                    )}
                    style={selectedCategoryId === cat._id ? { backgroundColor: primaryColor } : undefined}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={cn("mb-1.5 block text-caption-strong", classes.body)}>Price Range</label>
              <div className={cn("flex items-center gap-2 text-caption", classes.muted)}>
                <span>{formatCurrency(priceRange[0], settings)}</span>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])
                  }
                  className="w-24 accent-apple-primary"
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])
                  }
                  className="w-24 accent-apple-primary"
                />
                <span>{formatCurrency(priceRange[1], settings)}</span>
              </div>
            </div>
            <div>
              <label className={cn("mb-1.5 block text-caption-strong", classes.body)}>Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={cn("px-3", classes.inputCompact)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {(search || selectedCategoryId) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {search && (
            <span
              className="flex items-center gap-1 rounded-apple-pill px-3 py-1 text-caption font-medium text-apple-primary"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
            >
              Search: {search}
              <button type="button" onClick={() => setSearch("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCategoryId && (
            <span
              className="flex items-center gap-1 rounded-apple-pill px-3 py-1 text-caption font-medium text-apple-primary"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
            >
              {activeCategories.find((c) => c._id === selectedCategoryId)?.name ?? "Category"}
              <button type="button" onClick={() => setSelectedCategoryId("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {paginated.length === 0 ? (
        <StorefrontEmptyState
          className="mt-16 min-h-0"
          icon={<Search className="h-12 w-12" />}
          title="No products found"
          action={
            <StorefrontButton
              variant="utility"
              onClick={() => {
                setSearch("");
                setSelectedCategoryId("");
                setPriceRange([0, maxPrice]);
              }}
            >
              Clear Filters
            </StorefrontButton>
          }
        />
      ) : (
        <div
          className={cn(
            "mt-6",
            view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"
          )}
        >
          {paginated.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                "btn-press flex h-9 w-9 items-center justify-center rounded-apple-sm text-caption font-medium transition-all",
                page === p ? "text-apple-on-primary" : classes.chip
              )}
              style={page === p ? { backgroundColor: primaryColor } : undefined}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </StorefrontPage>
  );
}
