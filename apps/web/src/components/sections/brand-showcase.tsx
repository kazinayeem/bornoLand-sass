"use client";

import { useMemo } from "react";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { useTenant } from "@/providers/tenant-provider";
import { useGetBrandsQuery } from "@/redux/api/brand-api";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandShowcase({ section }: { section: SectionData }) {
  const p = section.props;
  const { store, brands: tenantBrands } = useTenant();
  const storeId = store._id;
  const { data: brandData } = useGetBrandsQuery(storeId || "", {
    skip: !storeId,
  });

  const rawBrands = brandData?.data?.brands ?? tenantBrands ?? [];

  const source = p.brandSource || "all";
  const limit = Math.min(Math.max(Number(p.brandCount) || 6, 1), 12);
  const cols = p.gridColumns || "6";

  // Selected Brand IDs
  const selectedIds: string[] = useMemo(() => {
    if (!p.brandIds) return [];
    try {
      if (p.brandIds.startsWith("[")) return JSON.parse(p.brandIds);
      return p.brandIds.split(",").map((s) => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }, [p.brandIds]);

  const displayBrands = useMemo(() => {
    let list = rawBrands.filter((b) => b.active !== false);

    if (source === "selected" && selectedIds.length > 0) {
      // Respect user's custom ordering
      const ordered = selectedIds
        .map((id) => list.find((b) => b._id === id || b.slug === id))
        .filter(Boolean) as typeof list;
      return ordered.slice(0, limit);
    }

    if (source === "featured") {
      list = list.filter((b) => b.featured);
    } else if (source === "popular") {
      list = list.sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0));
    }

    return list.slice(0, limit);
  }, [rawBrands, source, selectedIds, limit]);

  if (displayBrands.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <SectionTitle
            title={p.title || "Our Trusted Brands & Partners"}
            subtitle={p.subtitle || "No brands yet — add brands in your store dashboard."}
            textColor={p.textColor}
            textAlignment={p.textAlignment}
          />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-zinc-300 px-4 py-2 text-xs text-zinc-500">
            <Tag className="h-3.5 w-3.5" />
            Empty brand collection
          </div>
        </div>
      </SectionWrapper>
    );
  }

  const gridClass =
    cols === "3"
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      : cols === "4"
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

  const showLogo = p.showLogo !== "false";
  const showName = p.showName !== "false";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SectionTitle
          title={p.title || "Our Trusted Brands & Partners"}
          subtitle={p.subtitle || "Official warranty & authentic products guaranteed"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        <div className={cn("grid gap-4 sm:gap-6", gridClass)}>
          {displayBrands.map((b) => (
            <Link
              key={b._id}
              href={b.slug ? `/brand/${b.slug}` : "/shop"}
              className="group flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
            >
              {showLogo && (
                <div className="relative mb-3 flex h-14 w-full items-center justify-center overflow-hidden rounded-xl px-2">
                  {b.logoUrl ? (
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="max-h-12 max-w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      <Tag className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">{b.name}</span>
                    </div>
                  )}
                </div>
              )}

              {showName && (
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-full">
                  {b.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
