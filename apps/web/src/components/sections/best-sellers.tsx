"use client";

import { TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";

export function BestSellers({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const display = products.slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Best Sellers"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((pr) => (
            <ProductCard
              key={pr._id}
              product={pr}
              badge={
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                </span>
              }
            />
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
