"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderCategories, useBuilderProducts } from "@/lib/use-builder-demo";
import { Folder } from "lucide-react";

export function CategoryGrid({ section }: { section: SectionData }) {
  const { categories: realCategories, products: realProducts } = useTenant();
  const categories = useBuilderCategories(realCategories);
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const cols = p.gridColumns || "4";
  const display = categories;

  if (display.length === 0) return null;

  const productCount = (catId: string) => products.filter((pr) => (pr.categoryIds ?? []).includes(catId)).length;

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SectionTitle title={p.title || "Shop by Category"} subtitle={p.subtitle || "Explore our top collections"} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((cat) => {
            const count = productCount(cat._id);
            return (
              <Link
                key={cat._id}
                href={`/category/${cat.slug}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5"
              >
                <div className="relative mb-4 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100/80 ring-1 ring-zinc-900/5">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <Folder className="h-8 w-8 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </div>
                <span className="text-sm sm:text-base font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
                {p.showProductCount !== "false" && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
                    {count} {count === 1 ? "Product" : "Products"}
                  </span>
                )}
              </Link>
            );
          })}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}

