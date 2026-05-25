"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";

const CATEGORY_ICONS: Record<string, string> = {
  clothing: "👕", electronics: "💻", accessories: "⌚", footwear: "👟",
  furniture: "🪑", beauty: "💄", fitness: "🏋️", home: "🏠",
};

export default function CategoriesPage() {
  const { theme, products } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.filter((p) => p.status === "active").forEach((p) => {
      if (p.category) map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

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
          {categories.map(([category, count], idx) => {
            const slug = category.toLowerCase();
            return (
              <motion.a
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                key={category} href={`/category/${slug}`}
                className="group flex flex-col items-center gap-4 rounded-2xl border p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
                <span className="text-5xl">{CATEGORY_ICONS[slug] || "🛍️"}</span>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{category}</h3>
                  <p className="mt-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{count} products</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium transition-colors group-hover:gap-2"
                  style={{ color: primaryColor }}>
                  Shop Now <ArrowRight className="h-3 w-3" />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
