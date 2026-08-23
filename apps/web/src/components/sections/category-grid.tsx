"use client";

import { useMemo } from "react";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useStoreCategories } from "@/hooks/use-store-categories";
import { resolveCategorySectionDisplay } from "@/lib/storefront/category-section-data";
import { getCategoryEnglishName } from "@/lib/storefront/category-label";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryGrid({ section }: { section: SectionData }) {
  const { categories, isLoading, isError } = useStoreCategories();
  const p = section.props;

  const limit = Math.min(Math.max(Number(p.categoryCount) || 6, 1), 12);
  const cols = p.gridColumns || "6";
  const cardStyle = p.cardStyle || "card";

  const displayCategories = useMemo(
    () =>
      resolveCategorySectionDisplay(categories, {
        sectionType: section.type,
        categorySource: p.categorySource,
        categoryIds: p.categoryIds,
        limit,
      }),
    [categories, section.type, p.categorySource, p.categoryIds, limit],
  );

  if (isLoading && displayCategories.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <SectionTitle
            title={p.title || "Shop by Category"}
            subtitle={p.subtitle || ""}
            textColor={p.textColor}
            textAlignment={p.textAlignment}
          />
          <div className="mt-6 flex justify-center gap-3">
            {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
              <div key={i} className="h-20 w-20 animate-pulse rounded-2xl bg-zinc-100" />
            ))}
          </div>
        </div>
      </SectionWrapper>
    );
  }

  if (isError && displayCategories.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <SectionTitle
            title={p.title || "Shop by Category"}
            subtitle="Could not load categories. Please refresh the page."
            textColor={p.textColor}
            textAlignment={p.textAlignment}
          />
        </div>
      </SectionWrapper>
    );
  }

  if (displayCategories.length === 0) {
    if (section.type === "featured-categories" || p.categorySource === "featured") {
      return null;
    }
    return (
      <SectionWrapper section={section}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <SectionTitle
            title={p.title || "Shop by Category"}
            subtitle={p.subtitle || "No categories yet — add categories in your store dashboard."}
            textColor={p.textColor}
            textAlignment={p.textAlignment}
          />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-zinc-300 px-4 py-2 text-xs text-zinc-500">
            <Folder className="h-3.5 w-3.5" />
            Empty category collection
          </div>
        </div>
      </SectionWrapper>
    );
  }

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
            const label = getCategoryEnglishName(cat);
            const count = cat.productCount ?? 0;
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
                          alt={label}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Folder className="h-8 w-8 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                      )}
                    </div>
                  )}
                  {showTitle && (
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-full">
                      {label}
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
                        alt={label}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <Folder className="h-7 w-7 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                    )}
                  </div>
                )}
                {showTitle && (
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-full">
                    {label}
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
