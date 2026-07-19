"use client";

import { Flame } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";

export function TrendingProducts({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const display = products.slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Trending Now"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((pr) => (
            <ProductCard
              key={pr._id}
              product={pr}
              badge={<Flame className="h-4 w-4 text-orange-500" />}
            />
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
