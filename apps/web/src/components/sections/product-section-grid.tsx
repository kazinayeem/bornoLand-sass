"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useSectionProducts } from "@/hooks/use-section-products";
import {
  isSectionPropEnabled,
  resolveProductCategoryLabel,
} from "@/lib/storefront/product-section-data";

type ProductSectionGridProps = {
  section: SectionData;
  defaultTitle: string;
  defaultSubtitle?: string;
  badge?: (productId: string) => ReactNode;
  emptyMessage?: string;
};

export function ProductSectionGrid({
  section,
  defaultTitle,
  defaultSubtitle = "",
  badge,
  emptyMessage = "No products available yet.",
}: ProductSectionGridProps) {
  const p = section.props;
  const cols = p.gridColumns || p.desktopColumns || "4";
  const { products, categories, isLoading, isError } = useSectionProducts({
    sectionType: section.type,
    props: p,
  });

  const showBadges = isSectionPropEnabled(p.showBadges, true);
  const showRatings = isSectionPropEnabled(p.showRatings, true);
  const showViewNow = isSectionPropEnabled(p.showViewNow, false);
  const viewNowText = p.viewNowText?.trim() || "View Now";

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <SectionTitle
        title={p.title || defaultTitle}
        subtitle={p.subtitle || defaultSubtitle}
        textColor={p.textColor}
        textAlignment={p.textAlignment}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-zinc-500">Could not load products. Please refresh.</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <ColumnGrid columns={cols}>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              badge={badge?.(product._id)}
              showBadges={showBadges}
              showRatings={showRatings}
              showViewNow={showViewNow}
              viewNowText={viewNowText}
              categoryLabel={resolveProductCategoryLabel(product, categories)}
            />
          ))}
        </ColumnGrid>
      )}
    </div>
  );
}
