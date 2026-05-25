"use client";

import Link from "next/link";
import { useTenant } from "@/providers/tenant-provider";

const CATEGORIES = ["Clothing", "Electronics", "Accessories", "Footwear", "Furniture", "Beauty", "Fitness", "Home"];

export function CatSection() {
  const { theme } = useTenant();
  const { primaryColor, layoutWidth, darkMode } = theme;
  const layoutClass = layoutWidth === "100%" ? "" : "max-w-7xl";
  const isDark = darkMode;

  return (
    <section className="py-4 sm:py-6" style={{ backgroundColor: isDark ? "#000000" : "#ffffff" }}>
      <div className={`mx-auto ${layoutClass} px-4 sm:px-6 lg:px-8`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const slug = cat.toLowerCase();
            return (
              <Link key={cat} href={`/category/${slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border p-4 sm:p-6 transition-all hover:shadow-md"
                style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14"
                  style={{ backgroundColor: `${primaryColor}12` }}>
                  <span className="text-lg sm:text-xl" style={{ color: primaryColor }}>{cat[0]}</span>
                </div>
                <span className="text-xs font-medium sm:text-sm" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{cat}</span>
                <span className="text-[10px] sm:text-xs" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>Shop now</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
