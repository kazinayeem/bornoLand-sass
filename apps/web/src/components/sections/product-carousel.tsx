"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { ProductCard } from "@/components/storefront/product-card";

export function ProductCarousel({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 12;
  const scrollRef = useRef<HTMLDivElement>(null);
  const display = products.slice(0, count);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <SectionTitle title={p.title || "Products"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
          {p.showArrows !== "false" && (
            <div className="flex gap-1">
              <button onClick={() => scroll("left")} className="rounded-lg border border-zinc-200 p-2 hover:bg-apple-canvas-parchment"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => scroll("right")} className="rounded-lg border border-zinc-200 p-2 hover:bg-apple-canvas-parchment"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 scrollbar-hide">
        {display.map((pr) => (
          <div key={pr._id} className="w-[220px] shrink-0">
            <ProductCard product={pr} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
