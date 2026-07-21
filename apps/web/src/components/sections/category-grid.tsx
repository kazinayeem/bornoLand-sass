"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderCategories, useBuilderProducts } from "@/lib/use-builder-demo";
import { ImageIcon } from "lucide-react";

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
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Shop by Category"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((cat) => (
            <Link key={cat._id} href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-apple-canvas-parchment">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-apple-ink-muted-48" />
                )}
              </div>
              <span className="text-sm font-semibold text-apple-ink">{cat.name}</span>
              {p.showProductCount !== "false" && (
                <span className="text-xs text-apple-ink-muted-48">{productCount(cat._id)} products</span>
              )}
            </Link>
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
