"use client";

import { ProductCard } from "@/components/storefront/product-card";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";

export function NewArrivals({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const sorted = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "New Arrivals"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {sorted.map((pr) => (
            <ProductCard
              key={pr._id}
              product={pr}
              badge={p.showBadge !== "false" ? (
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">New</span>
              ) : undefined}
            />
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
