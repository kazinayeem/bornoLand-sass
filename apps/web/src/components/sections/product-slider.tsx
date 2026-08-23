"use client";

import { Loader2 } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { ProductCard } from "@/components/storefront/product-card";
import { useSectionProducts } from "@/hooks/use-section-products";
import {
  isSectionPropEnabled,
  resolveProductCategoryLabel,
} from "@/lib/storefront/product-section-data";

export function ProductSlider({ section }: { section: SectionData }) {
  const p = section.props;
  const { products, categories, isLoading, isError } = useSectionProducts({
    sectionType: section.type,
    props: p,
  });

  const showBadges = isSectionPropEnabled(p.showBadges, true);
  const showRatings = isSectionPropEnabled(p.showRatings, true);
  const showViewNow = isSectionPropEnabled(p.showViewNow, false);
  const showAddToCart = isSectionPropEnabled(p.showAddToCart, true);
  const viewNowText = p.viewNowText?.trim() || "View Now";

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Products"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-zinc-500">Could not load products. Please refresh.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showBadges={showBadges}
                showRatings={showRatings}
                showViewNow={showViewNow}
                showAddToCart={showAddToCart}
                viewNowText={viewNowText}
                categoryLabel={resolveProductCategoryLabel(product, categories)}
              />
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
