"use client";
import { getProductImageUrl } from "@/lib/product-media";

import { useState, useEffect } from "react";
import { BuilderLink as Link } from "./builder-link";
import { Zap } from "lucide-react";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";

export function FlashSale({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 4;
  const cols = p.gridColumns || "4";
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const display = products.filter((pr) => pr.status === "active").slice(0, count);

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
    update(); const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [p.endDate, p.showTimer]);

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <SectionTitle title={p.title || "Flash Sale"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
          {p.showTimer === "true" && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              <span className="text-xs font-semibold text-red-500">{p.timerLabel || "Ends in:"}</span>
              {Object.entries(timeLeft).map(([k, v]) => (
                <span key={k} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                  {String(v).padStart(2, "0")}{k}
                </span>
              ))}
            </div>
          )}
        </div>
        {display.length > 0 && (
          <ColumnGrid columns={cols}>
            {display.map((pr) => (
              <Link key={pr._id} href={`/products/${pr.slug}`}
                className="group relative rounded-xl border-2 border-red-100 bg-white p-3 transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-50">
                  {getProductImageUrl(pr) ? (
                    <img src={getProductImageUrl(pr)} alt={pr.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No Image</div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 truncate">{pr.name}</h3>
                <p className="mt-1 text-sm font-bold text-red-600">${pr.price}</p>
              </Link>
            ))}
          </ColumnGrid>
        )}
      </div>
    </SectionWrapper>
  );
}
