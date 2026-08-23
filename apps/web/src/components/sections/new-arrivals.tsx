"use client";

import { ProductCard } from "@/components/storefront/product-card";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { ProductSectionGrid } from "./product-section-grid";

export function NewArrivals({ section }: { section: SectionData }) {
  const p = section.props;
  const showBadge = p.showBadge !== "false";

  return (
    <SectionWrapper section={section}>
      <ProductSectionGrid
        section={section}
        defaultTitle="New Arrivals"
        badge={
          showBadge
            ? () => (
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  New
                </span>
              )
            : undefined
        }
      />
    </SectionWrapper>
  );
}
