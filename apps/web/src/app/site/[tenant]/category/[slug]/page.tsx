"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search, ImageIcon } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { useTenant } from "@/providers/tenant-provider";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { theme, products, categories } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;
  const [search, setSearch] = useState("");

  const category = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);
  const categoryName = category?.name ?? (slug.charAt(0).toUpperCase() + slug.slice(1));

  const filtered = useMemo(() => {
    let result = products.filter((p) => p.status === "active");
    if (category) {
      result = result.filter((p) => (p.categoryIds ?? []).includes(category._id) || p.category?.toLowerCase() === slug);
    } else {
      result = result.filter((p) => p.category?.toLowerCase() === slug);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, category, slug, search]);

  const hasAnyProduct = products.some((p) =>
    p.category?.toLowerCase() === slug || (category && (p.categoryIds ?? []).includes(category._id))
  );
  if (!hasAnyProduct && products.length > 0) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <a href="/categories" className="mb-6 flex items-center gap-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
          <ArrowLeft className="h-4 w-4" /> All Categories
        </a>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl"
              style={{ backgroundColor: `${primaryColor}12` }}>
              {category?.imageUrl ? (
                <img src={category.imageUrl} alt={categoryName} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6" style={{ color: primaryColor }} />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{categoryName}</h1>
              {category?.description && (
                <p className="mt-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{category.description}</p>
              )}
              <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in this category..."
              className="h-10 w-full rounded-xl border bg-transparent pl-9 pr-4 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: isDark ? "#fafafa" : "#18181b" }} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3">
            <Search className="h-12 w-12 text-zinc-200" />
            <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>No products found</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product, idx) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
