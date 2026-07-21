"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { useTenant } from "@/providers/tenant-provider";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontEmptyState,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import { useStoreHref } from "@/lib/store-href";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shopHref = useStoreHref("/shop");
  const { products } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const initial = searchParams.get("q") || searchParams.get("search") || "";
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const active = products.filter((p) => p.status === "active");
    if (!q) return active.slice(0, 12);
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [products, query]);

  const commitSearch = (value: string) => {
    const next = value.trim();
    const path = next ? `/search?q=${encodeURIComponent(next)}` : "/search";
    router.replace(path);
  };

  return (
    <StorefrontPage parchment>
      <StorefrontPageHeader
        title="Search"
        description={query.trim() ? `${results.length} results for “${query.trim()}”` : "Find products across the store"}
      />

      <div className="relative mb-apple-xl max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
        <input
          type="search"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitSearch(query);
          }}
          placeholder="Search products…"
          className={cn(classes.input, "pl-11 pr-11")}
          aria-label="Search products"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              commitSearch("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <StorefrontEmptyState
          icon={<Search className="h-12 w-12" />}
          title="No products found"
          description="Try a different search or browse the full catalog."
          action={
            <button
              type="button"
              onClick={() => router.push(shopHref)}
              className="btn-press rounded-apple-pill px-[22px] py-[11px] text-body text-apple-on-primary"
              style={{ backgroundColor: primaryColor }}
            >
              Browse shop
            </button>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {results.map((product) => (
            <ProductCard key={product._id} product={product as any} />
          ))}
        </motion.div>
      )}
    </StorefrontPage>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
