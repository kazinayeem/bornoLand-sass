"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";

export function ProductSlider({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 6;
  const display = products.filter((pr) => pr.status === "active").slice(0, count);
  if (display.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Products"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map((pr) => (
            <div key={pr._id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
              <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-zinc-50">
                {pr.imageUrl ? (
                  <img src={pr.imageUrl} alt={pr.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No Image</div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">{pr.name}</h3>
              <p className="mt-1 font-bold text-zinc-900">${pr.price}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
