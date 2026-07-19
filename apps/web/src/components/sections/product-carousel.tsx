"use client";
import { getProductImageUrl } from "@/lib/product-media";

import { useRef } from "react";
import { BuilderLink as Link } from "./builder-link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useBuilderProducts } from "@/lib/use-builder-demo";

export function ProductCarousel({ section }: { section: SectionData }) {
  const { products: realProducts } = useTenant();
  const products = useBuilderProducts(realProducts);
  const p = section.props;
  const count = Number(p.productCount) || 12;
  const scrollRef = useRef<HTMLDivElement>(null);
  const display = products.filter((pr) => pr.status === "active").slice(0, count);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (display.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <SectionTitle title={p.title || "Products"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
          {p.showArrows !== "false" && (
            <div className="flex gap-1">
              <button onClick={() => scroll("left")} className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => scroll("right")} className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 scrollbar-hide">
        {display.map((pr) => (
          <Link key={pr._id} href={`/products/${pr.slug}`}
            className="group w-[200px] shrink-0 rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-md">
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
      </div>
    </SectionWrapper>
  );
}
