"use client";

import { ProductCard } from "./product-card";
import type { Product } from "@/redux/api/product-api";

type FeaturedProductsProps = {
  products: Product[];
  primaryColor: string;
  buttonStyle: string;
  font: string;
  darkMode: boolean;
};

export function FeaturedProducts({ products, primaryColor, buttonStyle, font, darkMode }: FeaturedProductsProps) {
  const isDark = darkMode;

  if (!products || products.length === 0) return null;

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
              Our Bestsellers
            </h2>
            <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
              Handpicked products loved by our customers
            </p>
          </div>
          <a href="#" className="hidden items-center gap-1 text-sm font-medium sm:flex"
            style={{ color: primaryColor }}>
            View All &rarr;
          </a>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              primaryColor={primaryColor}
              buttonStyle={buttonStyle}
              font={font}
              darkMode={darkMode}
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <a href="#" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: primaryColor }}>
            View All Products &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
