"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-types";

export function CatSection({ section }: { section?: StorefrontSectionLike }) {
  const { theme, categories, products } = useTenant();
  const { primaryColor, layoutWidth, darkMode } = theme;
  const layoutClass = layoutWidth === "100%" ? "" : "max-w-7xl";
  const isDark = darkMode;
  const p = section?.props ?? {};

  const title = (p.title as string) || "Shop by Category";
  const subtitle = (p.subtitle as string) || "";
  const gridCols = (p.gridColumns as string) || "4";
  const bgColor = (p.backgroundColor as string) || "";
  const cardStyle = (p.cardStyle as string) || "default";

  const colMap: Record<string, string> = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-3", "4": "sm:grid-cols-4", "5": "sm:grid-cols-5", "6": "sm:grid-cols-6" };
  const colClass = colMap[gridCols] ?? "sm:grid-cols-4";

  const displayCategories = categories.filter((c) => c.active);

  if (displayCategories.length === 0) return null;

  const productCount = (catId: string) => products.filter((p) => (p.categoryIds ?? []).includes(catId)).length;

  return (
    <section className="py-8 sm:py-12"
      style={{ backgroundColor: bgColor || (isDark ? "#000000" : "#ffffff") }}>
      <div className={`mx-auto ${layoutClass} px-4 sm:px-6 lg:px-8`}>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{subtitle}</p>
          )}
        </div>
        <div className={`grid grid-cols-2 gap-3 ${colClass} sm:gap-4`}>
          {displayCategories.map((cat) => {
            const count = productCount(cat._id);
            return (
              <Link key={cat._id} href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border p-4 sm:p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl sm:h-16 sm:w-16"
                  style={{ backgroundColor: `${primaryColor}12` }}>
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6" style={{ color: primaryColor }} />
                  )}
                </div>
                <span className="text-xs font-medium sm:text-sm" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{cat.name}</span>
                <span className="text-[10px] sm:text-xs" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>
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
