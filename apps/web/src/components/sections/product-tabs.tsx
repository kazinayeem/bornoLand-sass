"use client";

import { useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";

export function ProductTabs({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 4;
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: p.tab1Label || "Featured", filter: (pr: any) => pr.featured },
    { label: p.tab2Label || "New Arrivals", filter: (_pr: any) => true },
    { label: p.tab3Label || "Best Sellers", filter: (_pr: any) => true },
  ];
  const filtered = products.filter(tabs[activeTab]?.filter ?? (() => true)).slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Products"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="mb-6 flex justify-center gap-2">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === i ? "bg-zinc-900 text-white" : "bg-zinc-100 text-apple-ink-muted-80 hover:bg-zinc-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <ColumnGrid columns="4">
          {filtered.map((pr) => (
            <ProductCard key={pr._id} product={pr} />
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
