"use client";

import { Flame } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { ProductSectionGrid } from "./product-section-grid";

export function TrendingProducts({ section }: { section: SectionData }) {
  return (
    <SectionWrapper section={section}>
      <ProductSectionGrid
        section={section}
        defaultTitle="Trending Now"
        badge={() => <Flame className="h-4 w-4 text-orange-500" />}
      />
    </SectionWrapper>
  );
}
