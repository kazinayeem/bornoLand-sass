"use client";
import { getProductImageUrl } from "@/lib/product-media";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";

export function NewArrivals({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const sorted = [...products].filter((pr) => pr.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);

  if (sorted.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "New Arrivals"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {sorted.map((pr) => (
            <Link key={pr._id} href={`/products/${pr.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="mb-3 relative aspect-square overflow-hidden rounded-lg bg-zinc-50">
                {getProductImageUrl(pr) ? (
                  <img src={getProductImageUrl(pr)} alt={pr.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No Image</div>
                )}
                {p.showBadge !== "false" && (
                  <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">New</span>
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
