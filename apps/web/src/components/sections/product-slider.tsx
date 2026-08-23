"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { ProductCard } from "@/components/storefront/product-card";

export function ProductSlider({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 6;
  const display = products.slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Products"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map((pr) => (
            <ProductCard key={pr._id} product={pr} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
