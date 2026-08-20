"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";
import { ProductCard } from "@/components/storefront/product-card";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function FeaturedProducts({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const display = products.slice(0, count);
  const showViewAll = p.showViewAll !== "false";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionTitle
          title={p.title || "Featured Products"}
          subtitle={p.subtitle || "Explore our handpicked selection of top trending products"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        {display.length > 0 ? (
          <ColumnGrid columns={cols}>
            {display.map((pr) => (
              <ProductCard key={pr._id} product={pr} />
            ))}
          </ColumnGrid>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-zinc-300 mb-3" />
            <h4 className="text-sm font-semibold text-zinc-700">No products added yet</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Add products from your dashboard or content tab to see them showcased in this section.
            </p>
          </div>
        )}

        {showViewAll && display.length > 0 && (
          <div className="mt-10 sm:mt-12 text-center">
            <Link
              href={p.viewAllLink || "/shop"}
              className="group inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow active:scale-95"
            >
              <span>{p.viewAllText || "View All Products"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

