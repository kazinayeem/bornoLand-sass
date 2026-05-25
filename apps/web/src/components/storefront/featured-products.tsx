"use client";

import Link from "next/link";
import { ProductCard } from "./product-card";
import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-canvas";

export function FeaturedProducts({ section }: { section?: StorefrontSectionLike }) {
  const { theme, products } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;
  const title = section?.props?.title ?? "Featured Products";
  const subtitle = section?.props?.subtitle ?? "Handpicked products loved by our customers";
  const displayProducts = products.filter((p) => p.status === "active");

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: isDark ? "#09090b" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
              Featured Products
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: isDark ? "#fafafa" : "#18181b" }}>
              {title}
            </h2>
            <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              {subtitle}
            </p>
          </div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-medium sm:flex" style={{ color: primaryColor }}>
            View All &rarr;
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayProducts.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: primaryColor }}>
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
