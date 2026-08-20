"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Grid3X3, List, Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { Pagination } from "@/components/ui/pagination";
import { StorefrontEmptyState, useStorefrontSurface } from "@/components/storefront/storefront-ui";
import { useTenant } from "@/providers/tenant-provider";
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/color-utils";
import { useGetProductsQuery, useGetPublicProductsQuery } from "@/redux/api/product-api";
import type { Product } from "@/redux/api/product-api";
import { useIsBuilderContext } from "@/components/sections/builder-link";
import { useDevice } from "@/lib/device-context";
import { ProductGridSkeleton } from "@/components/loading/storefront-skeletons";

const PAGE_SIZE_OPTIONS = [4, 8, 12, 16, 20, 24, 32, 48];

type PaginationMode = "pages" | "load-more" | "infinite";
type GridView = "grid" | "list";

type StorefrontProductGridProps = {
  title?: string;
  subtitle?: string;
  productCount?: number;
  gridColumns?: string;
  tabletColumns?: string;
  mobileColumns?: string;
  showFilters?: boolean;
  showSort?: boolean;
  showPagination?: boolean;
  showLoadMore?: boolean;
  paginationMode?: PaginationMode;
  allowRowsPerPage?: boolean;
  className?: string;
};

function mapSort(sort: string) {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price", sortOrder: "asc" as const };
    case "price-desc":
      return { sortBy: "price", sortOrder: "desc" as const };
    case "name-asc":
      return { sortBy: "name", sortOrder: "asc" as const };
    case "name-desc":
      return { sortBy: "name", sortOrder: "desc" as const };
    default:
      return { sortBy: "createdAt", sortOrder: "desc" as const };
  }
}

import { productGridClass } from "@/lib/storefront/responsive-grid";

export function StorefrontProductGrid({
  title = "Products",
  subtitle = "",
  productCount = 12,
  gridColumns = "4",
  tabletColumns = "2",
  mobileColumns = "1",
  showFilters = false,
  showSort = false,
  showPagination = true,
  showLoadMore = false,
  paginationMode = "pages",
  allowRowsPerPage = false,
  className,
}: StorefrontProductGridProps) {
  const isBuilder = useIsBuilderContext();
  const device = useDevice();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { store, categories } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();

  const activeCategorySlug = typeof params?.slug === "string" ? params.slug : "";
  const queryFromRoute = searchParams.get("q") || searchParams.get("search") || "";
  const categoryIdFromSlug = categories.find((item) => item.slug === activeCategorySlug)?._id;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS.includes(productCount) ? productCount : 12);
  const [search, setSearch] = useState(queryFromRoute);
  const [selectedCategory, setSelectedCategory] = useState(categoryIdFromSlug ?? "");
  const [sort, setSort] = useState("newest");
  const [showFilterPanel, setShowFilterPanel] = useState(showFilters);
  const [view, setView] = useState<GridView>("grid");
  const [mergedItems, setMergedItems] = useState<Product[]>([]);
  const infiniteSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearch(queryFromRoute);
  }, [queryFromRoute]);

  useEffect(() => {
    setSelectedCategory(categoryIdFromSlug ?? "");
  }, [categoryIdFromSlug]);

  useEffect(() => {
    setPageSize(PAGE_SIZE_OPTIONS.includes(productCount) ? productCount : 12);
  }, [productCount]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sort, pageSize]);

  const queryArgs = useMemo(() => {
    const sortArgs = mapSort(sort);
    return {
      page,
      limit: pageSize,
      search: search.trim() || undefined,
      category: selectedCategory || undefined,
      status: "active",
      ...sortArgs,
    };
  }, [page, pageSize, search, selectedCategory, sort]);

  const liveQuery = useGetPublicProductsQuery(queryArgs, { skip: isBuilder });
  const builderQuery = useGetProductsQuery({ storeId: store._id, ...queryArgs }, { skip: !isBuilder || !store._id });
  const data = isBuilder ? builderQuery.data : liveQuery.data;
  const isLoading = isBuilder ? builderQuery.isLoading || builderQuery.isFetching : liveQuery.isLoading || liveQuery.isFetching;

  const rawProducts = data?.data?.products;
  const items = useMemo(() => rawProducts ?? [], [rawProducts]);
  const pagination = data?.data?.pagination;
  const total = pagination?.total ?? data?.data?.total ?? items.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? data?.data?.totalPages ?? 1);

  const effectiveMode: PaginationMode = showLoadMore ? "load-more" : paginationMode;

  useEffect(() => {
    if (!rawProducts) return;
    if (effectiveMode === "pages" || page === 1) {
      setMergedItems(rawProducts);
      return;
    }

    setMergedItems((current) => {
      const seen = new Set(current.map((item) => item._id));
      const next = [...current];
      for (const item of rawProducts) {
        if (!seen.has(item._id)) next.push(item);
      }
      return next;
    });
  }, [rawProducts, effectiveMode, page]);

  const displayProducts = effectiveMode === "pages" ? items : (mergedItems.length > 0 ? mergedItems : items);


  useEffect(() => {
    if (effectiveMode !== "infinite") return;
    const node = infiniteSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && page < totalPages && !isLoading) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [effectiveMode, isLoading, page, totalPages]);

  const handleCommitSearch = () => {
    const next = search.trim();
    if (queryFromRoute !== next) {
      router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
    }
  };

  const shouldShowSearchInput = showFilters || Boolean(queryFromRoute) || searchParams.has("q") || searchParams.has("search");
  const showPager = showPagination && effectiveMode === "pages";
  const showLoadMoreButton = showPagination && effectiveMode === "load-more" && page < totalPages;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-display-sm text-apple-ink dark:text-apple-body-on-dark">{title}</h2>
          {subtitle ? <p className="mt-2 text-body text-apple-ink-muted-48">{subtitle}</p> : null}
          <p className="mt-2 text-caption text-apple-ink-muted-48">{total} products</p>
        </div>
        <div className="flex items-center gap-2">
          {shouldShowSearchInput ? (
            <div className="relative flex-1 sm:w-72">
              {isLoading ? (
                <Loader2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-apple-primary" />
              ) : (
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
              )}
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleCommitSearch();
                }}
                placeholder="Search products..."
                className={cn(classes.inputCompact, "w-full pl-10 pr-10")}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    if (queryFromRoute) router.replace("/search");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}
          {showFilters ? (
            <button
              type="button"
              onClick={() => setShowFilterPanel((current) => !current)}
              className={cn("flex h-10 w-10 items-center justify-center border", classes.inputCompact, classes.divider)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setView((current) => (current === "grid" ? "list" : "grid"))}
            className={cn("flex h-10 w-10 items-center justify-center border", classes.inputCompact, classes.divider)}
            aria-label="Toggle view"
          >
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showFilters && showFilterPanel ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className={cn("overflow-hidden p-4", classes.card)}
        >
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1.5 block text-caption-strong text-apple-ink-muted-80">Category</label>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className={cn("min-w-44 px-3", classes.inputCompact)}
              >
                <option value="">All categories</option>
                {categories
                  .filter((category) => category.active)
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            {showSort ? (
              <div>
                <label className="mb-1.5 block text-caption-strong text-apple-ink-muted-80">Sort</label>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className={cn("min-w-44 px-3", classes.inputCompact)}
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="name-desc">Name: Z-A</option>
                </select>
              </div>
            ) : null}
            {allowRowsPerPage ? (
              <div>
                <label className="mb-1.5 block text-caption-strong text-apple-ink-muted-80">Rows per page</label>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className={cn("min-w-32 px-3", classes.inputCompact)}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {displayProducts.length === 0 && !isLoading ? (
        <StorefrontEmptyState
          icon={<Search className="h-12 w-12" />}
          title="No products found"
          description="Adjust your filters or add products in the builder."
        />
      ) : (
        <>
          <div className="relative">
            {/* Loading overlay for filter/search transitions */}
            {isLoading && displayProducts.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-start justify-center rounded-apple-lg bg-apple-canvas/60 pt-8 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-apple-pill bg-apple-canvas px-4 py-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-apple-primary" />
                  <span className="text-caption text-apple-ink-muted-80">Updating&hellip;</span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isLoading && displayProducts.length === 0 ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "grid gap-4 sm:gap-6",
                    productGridClass(
                      device === "mobile" ? mobileColumns : device === "tablet" ? tabletColumns : gridColumns,
                      view,
                      device,
                    ),
                  )}
                >
                  <ProductGridSkeleton count={pageSize} />
                </motion.div>
              ) : (
                <motion.div
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "grid gap-4 sm:gap-6",
                    productGridClass(
                      device === "mobile" ? mobileColumns : device === "tablet" ? tabletColumns : gridColumns,
                      view,
                      device,
                    ),
                  )}
                >
                  {displayProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

              )}
            </AnimatePresence>
          </div>

          {showPager ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={allowRowsPerPage ? setPageSize : undefined}
              isLoading={isLoading}
            />
          ) : null}

          {showLoadMoreButton ? (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                className="btn-press rounded-apple-pill px-6 py-3 text-body"
                style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
              >
                Load more
              </button>
            </div>
          ) : null}

          {effectiveMode === "infinite" && page < totalPages ? (
            <div ref={infiniteSentinelRef} className="h-10 w-full" aria-hidden="true" />
          ) : null}
        </>
      )}
    </div>
  );
}
