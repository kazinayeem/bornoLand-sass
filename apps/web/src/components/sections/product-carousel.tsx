"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { ProductCard } from "@/components/storefront/product-card";
import { useSectionProducts } from "@/hooks/use-section-products";
import {
  isSectionPropEnabled,
  resolveProductCategoryLabel,
} from "@/lib/storefront/product-section-data";

export function ProductCarousel({ section }: { section: SectionData }) {
  const p = section.props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, categories, isLoading, isError } = useSectionProducts({
    sectionType: section.type,
    props: p,
  });

  const showBadges = isSectionPropEnabled(p.showBadges, true);
  const showRatings = isSectionPropEnabled(p.showRatings, true);
  const showViewNow = isSectionPropEnabled(p.showViewNow, false);
  const viewNowText = p.viewNowText?.trim() || "View Now";

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <SectionTitle
            title={p.title || "Products"}
            subtitle={p.subtitle || ""}
            textColor={p.textColor}
            textAlignment={p.textAlignment}
          />
          {p.showArrows !== "false" && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="rounded-lg border border-zinc-200 p-2 hover:bg-apple-canvas-parchment"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="rounded-lg border border-zinc-200 p-2 hover:bg-apple-canvas-parchment"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : isError ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
          Could not load products. Please refresh.
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 scrollbar-hide"
        >
          {products.map((product) => (
            <div key={product._id} className="w-[220px] shrink-0">
              <ProductCard
                product={product}
                showBadges={showBadges}
                showRatings={showRatings}
                showViewNow={showViewNow}
                viewNowText={viewNowText}
                categoryLabel={resolveProductCategoryLabel(product, categories)}
              />
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
