"use client";

import { useMemo } from "react";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderCategories, useBuilderProducts } from "@/lib/use-builder-demo";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryGrid({ section }: { section: SectionData }) {
  const { categories: realCategories, products: realProducts } = useTenant();
  const rawCategories = useBuilderCategories(realCategories);
  const products = useBuilderProducts(realProducts);
  const p = section.props;

  const source = p.categorySource || "all";
  const limit = Math.min(Math.max(Number(p.categoryCount) || 6, 1), 12);
  const cols = p.gridColumns || "6";
  const cardStyle = p.cardStyle || "card";

  // Selected Category IDs
  const selectedIds: string[] = useMemo(() => {
    if (!p.categoryIds) return [];
    try {
      if (p.categoryIds.startsWith("[")) return JSON.parse(p.categoryIds);
      return p.categoryIds.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }, [p.categoryIds]);

  const displayCategories = useMemo(() => {
    let list = [...rawCategories];

    if (source === "selected" && selectedIds.length > 0) {
      // Respect user's custom ordering
      const ordered = selectedIds
        .map((id) => list.find((c) => c._id === id || c.slug === id))
        .filter(Boolean) as typeof list;
      return ordered.slice(0, limit);
    }

    if (source === "featured") {
      list = list.filter((c) => c.featured);
    } else if (source === "popular" || source === "latest") {
      // Sort by sortOrder / createdAt
      list = list.sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0));
    }

    return list.slice(0, limit);
  }, [rawCategories, source, selectedIds, limit]);

  if (displayCategories.length === 0) return null;

  const productCount = (catId: string) =>
    products.filter((pr) => (pr.categoryIds ?? []).includes(catId) || pr.category === catId).length;

  const gridClass =
    cols === "2"
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2"
      : cols === "3"
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      : cols === "4"
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SectionTitle
          title={p.title || "Shop by Category"}
          subtitle={p.subtitle || "Explore our top collections"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        <div className={cn("grid gap-4 sm:gap-6", gridClass)}>
          {displayCategories.map((cat) => {
            const count = productCount(cat._id);
            const showImg = p.showImage !== "false";
            const showTitle = p.showName !== "false";
            const showCount = p.showProductCount !== "false";

            if (cardStyle === "circle") {
              return (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center text-center transition-all duration-300"
                >
                  {showImg && (
                    <div className="relative mb-3 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-100 bg-zinc-50 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-zinc-900 group-hover:shadow-md">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Folder className="h-8 w-8 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                      )}
                    </div>
                  )}
                  {showTitle && (
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-full">
                      {cat.name}
                    </span>
                  )}
                  {showCount && (
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      {count} {count === 1 ? "Item" : "Items"}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={cat._id}
                href={`/category/${cat.slug}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
              >
                {showImg && (
                  <div className="relative mb-3.5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100/80 ring-1 ring-zinc-900/5">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <Folder className="h-7 w-7 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                    )}
                  </div>
                )}
                {showTitle && (
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-full">
                    {cat.name}
                  </span>
                )}
                {showCount && (
                  <span className="mt-1.5 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                    {count} {count === 1 ? "Product" : "Products"}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
