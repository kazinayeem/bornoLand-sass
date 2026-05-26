"use client";

import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";

export default function CategoriesPage() {
  const { theme, categories, products } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;

  const displayCategories = categories.filter((c) => c.active);

  const productCount = (catId: string) =>
    products.filter((p) => p.status === "active" && (p.categoryIds ?? []).includes(catId)).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Categories</h1>
          <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            Browse products by category
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayCategories.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>No categories yet</p>
            </div>
          ) : (
            displayCategories.map((cat, idx) => {
              const count = productCount(cat._id);
              return (
                <motion.a
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  key={cat._id} href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-4 rounded-2xl border p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                    style={{ backgroundColor: `${primaryColor}12` }}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8" style={{ color: primaryColor }} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{cat.name}</h3>
                    <p className="mt-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{count} {count === 1 ? "product" : "products"}</p>
                  </div>
                  {cat.description && (
                    <p className="text-xs line-clamp-2" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>{cat.description}</p>
                  )}
                  <span className="flex items-center gap-1 text-xs font-medium transition-colors group-hover:gap-2"
                    style={{ color: primaryColor }}>
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
