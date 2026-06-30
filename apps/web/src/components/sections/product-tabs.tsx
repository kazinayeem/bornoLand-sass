"use client";
import { getProductImageUrl } from "@/lib/product-media";

import { useState } from "react";
import Link from "next/link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";

export function ProductTabs({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 4;
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: p.tab1Label || "Featured", filter: (pr: any) => pr.featured },
    { label: p.tab2Label || "New Arrivals", filter: (pr: any) => pr.status === "active" },
    { label: p.tab3Label || "Best Sellers", filter: (pr: any) => pr.status === "active" },
  ];
  const filtered = products.filter((pr) => pr.status === "active" && tabs[activeTab]?.filter(pr)).slice(0, count);
  if (products.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Products"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="mb-6 flex justify-center gap-2">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === i ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <ColumnGrid columns="4">
          {filtered.map((pr) => (
            <Link key={pr._id} href={`/products/${pr.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-md">
              <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-50">
                {getProductImageUrl(pr) ? (
                  <img src={getProductImageUrl(pr)} alt={pr.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No Image</div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 truncate">{pr.name}</h3>
              <p className="mt-1 text-sm font-bold text-zinc-900">${pr.price}</p>
            </Link>
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
