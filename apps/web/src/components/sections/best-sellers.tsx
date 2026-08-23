"use client";

import { TrendingUp } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { ProductSectionGrid } from "./product-section-grid";

export function BestSellers({ section }: { section: SectionData }) {
  return (
    <SectionWrapper section={section}>
      <ProductSectionGrid
        section={section}
        defaultTitle="Best Sellers"
        badge={() => (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
          </span>
        )}
      />
    </SectionWrapper>
  );
}
