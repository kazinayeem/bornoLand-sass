"use client";

import { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useSectionProducts } from "@/hooks/use-section-products";
import {
  isSectionPropEnabled,
  resolveProductCategoryLabel,
} from "@/lib/storefront/product-section-data";

export function FlashSale({ section }: { section: SectionData }) {
  const p = section.props;
  const cols = p.gridColumns || "4";
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const { products, categories, isLoading, isError } = useSectionProducts({
    sectionType: section.type,
    props: p,
  });

  const showBadges = isSectionPropEnabled(p.showBadges, true);
  const showRatings = isSectionPropEnabled(p.showRatings, true);
  const showViewNow = isSectionPropEnabled(p.showViewNow, false);
  const showAddToCart = isSectionPropEnabled(p.showAddToCart, true);
  const viewNowText = p.viewNowText?.trim() || "View Now";

  useEffect(() => {
    if (p.showTimer !== "true") return;
    const target = new Date(p.endDate || "2026-12-31").getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [p.endDate, p.showTimer]);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <SectionTitle
            title={p.title || "Flash Sale"}
            subtitle={p.subtitle || ""}
            textColor={p.textColor}
            textAlignment={p.textAlignment}
          />
          {p.showTimer === "true" && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              <span className="text-xs font-semibold text-red-500">{p.timerLabel || "Ends in:"}</span>
              {Object.entries(timeLeft).map(([k, v]) => (
                <span key={k} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                  {String(v).padStart(2, "0")}
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border-2 border-red-100 bg-gradient-to-b from-red-50/50 to-transparent p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-zinc-500">Could not load products. Please refresh.</p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No products available yet.</p>
          ) : (
            <ColumnGrid columns={cols}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showBadges={showBadges}
                  showRatings={showRatings}
                  showViewNow={showViewNow}
                  showAddToCart={showAddToCart}
                  viewNowText={viewNowText}
                  categoryLabel={resolveProductCategoryLabel(product, categories)}
                />
              ))}
            </ColumnGrid>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
