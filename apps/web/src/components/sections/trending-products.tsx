"use client";
import { getProductImageUrl } from "@/lib/product-media";

import { BuilderLink as Link } from "./builder-link";
import { Flame } from "lucide-react";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";

export function TrendingProducts({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const display = products.filter((pr) => pr.status === "active").slice(0, count);

  if (display.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Trending Now"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((pr) => (
            <Link key={pr._id} href={`/products/${pr.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="mb-3 relative aspect-square overflow-hidden rounded-lg bg-zinc-50">
                {getProductImageUrl(pr) ? (
                  <img src={getProductImageUrl(pr)} alt={pr.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300">No Image</div>
                )}
                <span className="absolute left-2 top-2"><Flame className="h-4 w-4 text-orange-500" /></span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 truncate">{pr.name}</h3>
              <p className="mt-1 text-sm font-bold text-zinc-900">${pr.price}</p>
            </Link>
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
