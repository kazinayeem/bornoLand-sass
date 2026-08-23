"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { useStoreCategories } from "@/hooks/use-store-categories";
import { resolveCategorySectionDisplay } from "@/lib/storefront/category-section-data";
import { getCategoryEnglishName } from "@/lib/storefront/category-label";
import type { StorefrontSectionLike } from "./storefront-types";

export function CatSection({ section }: { section?: StorefrontSectionLike }) {
  const { theme } = useTenant();
  const { categories } = useStoreCategories();
  const { primaryColor, layoutWidth, darkMode } = theme;
  const layoutClass = layoutWidth === "100%" ? "" : "max-w-[1440px]";
  const isDark = darkMode;
  const p = section?.props ?? {};

  const title = (p.title as string) || "Shop by Category";
  const subtitle = (p.subtitle as string) || "";
  const gridCols = (p.gridColumns as string) || "4";
  const bgColor = (p.backgroundColor as string) || "";

  const colMap: Record<string, string> = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-3", "4": "sm:grid-cols-4", "5": "sm:grid-cols-5", "6": "sm:grid-cols-6" };
  const colClass = colMap[gridCols] ?? "sm:grid-cols-4";

  const displayCategories = resolveCategorySectionDisplay(categories, {
    sectionType: section?.type || "category-grid",
    categorySource: p.categorySource as string | undefined,
    categoryIds: p.categoryIds as string | undefined,
    limit: 12,
  });

  if (displayCategories.length === 0) return null;

  return (
    <section className="py-apple-section"
      style={{ backgroundColor: bgColor || (isDark ? "var(--color-apple-surface-black)" : "var(--color-apple-canvas)") }}>
      <div className={`mx-auto ${layoutClass} px-4 sm:px-6 lg:px-8`}>
        <div className="mb-8 text-center">
          <h2 className="text-display-lg"
            style={{ color: isDark ? "var(--color-apple-body-on-dark)" : "var(--color-apple-ink)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lead" style={{ color: isDark ? "var(--color-apple-body-muted)" : "var(--color-apple-ink-muted-48)" }}>{subtitle}</p>
          )}
        </div>
        <div className={`grid grid-cols-2 gap-3 ${colClass} sm:gap-4`}>
          {displayCategories.map((cat) => {
            const label = getCategoryEnglishName(cat);
            const count = cat.productCount ?? 0;
            return (
              <Link key={cat._id} href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-apple-lg border border-apple-hairline bg-apple-canvas p-4 transition-all hover:bg-apple-canvas-parchment sm:p-6"
                style={{ borderColor: isDark ? "var(--color-apple-surface-tile-3)" : "var(--color-apple-hairline)", backgroundColor: isDark ? "var(--color-apple-surface-tile-2)" : "var(--color-apple-canvas)" }}>
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-apple-sm sm:h-16 sm:w-16"
                  style={{ backgroundColor: `${primaryColor}12` }}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={label} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6" style={{ color: primaryColor }} />
                  )}
                </div>
                <span className="text-caption-strong text-apple-ink">{label}</span>
                <span className="text-fine-print text-apple-ink-muted-48">
                  {count} {count === 1 ? "product" : "products"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
