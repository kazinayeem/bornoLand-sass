"use client";
import { getProductImageUrl } from "@/lib/product-media";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";

export function FeaturedProducts({ section }: { section: SectionData }) {
  const { products } = useTenant();
  const p = section.props;
  const count = Number(p.productCount) || 8;
  const cols = p.gridColumns || "4";
  const display = products.filter((pr) => pr.status === "active").slice(0, count);

  if (display.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Featured Products"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((pr) => (
            <Link key={pr._id} href={`/products/${pr.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-zinc-50">
                {getProductImageUrl(pr) ? (
                  <img src={getProductImageUrl(pr)} alt={pr.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300 text-xs">No Image</div>
                )}
                {p.showBadges === "true" && pr.featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">Featured</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 truncate">{pr.name}</h3>
              <p className="mt-1 text-sm font-bold text-zinc-900">${pr.price}</p>
            </Link>
          ))}
        </ColumnGrid>
        {p.showViewAll !== "false" && (
          <div className="mt-8 text-center">
            <Link href={p.viewAllLink || "/shop"}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all">
              View All →</Link>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
