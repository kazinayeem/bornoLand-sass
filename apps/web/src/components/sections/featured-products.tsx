"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { ProductCard } from "@/components/storefront/product-card";
import { useSectionProducts } from "@/hooks/use-section-products";
import { isSectionPropEnabled, resolveProductCategoryLabel } from "@/lib/storefront/product-section-data";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";

export function FeaturedProducts({ section }: { section: SectionData }) {
  const p = section.props;
  const cols = p.gridColumns || p.desktopColumns || "4";
  const { products, categories, isLoading } = useSectionProducts({
    sectionType: section.type,
    props: p,
  });

  const showBadges = isSectionPropEnabled(p.showBadges, true);
  const showRatings = isSectionPropEnabled(p.showRatings, true);
  const showViewNow = isSectionPropEnabled(p.showViewNow, false);
  const showViewAll = isSectionPropEnabled(p.showViewAll, true);
  const viewNowText = p.viewNowText?.trim() || "View Now";
  const viewAllText = p.viewAllText?.trim() || "View All";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionTitle
          title={p.title || "Featured Products"}
          subtitle={p.subtitle || "Explore our handpicked selection of top trending products"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : products.length > 0 ? (
          <ColumnGrid columns={cols}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showBadges={showBadges}
                showRatings={showRatings}
                showViewNow={showViewNow}
                viewNowText={viewNowText}
                categoryLabel={resolveProductCategoryLabel(product, categories)}
              />
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

        {showViewAll && products.length > 0 && (
          <div className="mt-10 sm:mt-12 text-center">
            <Link
              href={p.viewAllLink || "/shop"}
              className="group inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow active:scale-95"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
