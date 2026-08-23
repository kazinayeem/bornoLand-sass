"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import { Award, CheckCircle2 } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { useGetBrandsQuery } from "@/redux/api/brand-api";

export function BrandShowcase({ section }: { section: SectionData }) {
  const p = section.props;
  const tenant = useTenant();
  const storeId = tenant?.store?._id;

  const { data: brandData } = useGetBrandsQuery(storeId || "", {
    skip: !storeId,
  });

  const realBrands = brandData?.data?.brands ?? [];

  const defaultBrands = [
    { name: "Honeyraj", logoUrl: "", desc: "Pure Honey Specialist" },
    { name: "Khaijuri", logoUrl: "", desc: "Authentic Arabian Dates" },
    { name: "Glarevest", logoUrl: "", desc: "Premium Cold-Pressed Oils" },
    { name: "Shomi", logoUrl: "", desc: "Pure Mustard & Ghee" },
    { name: "Pure Harvest", logoUrl: "", desc: "Natural Organic Foods" },
    { name: "Deshi Naturals", logoUrl: "", desc: "Traditional Spices" },
  ];

  const displayBrands =
    realBrands.length > 0
      ? realBrands.filter((b) => b.active).map((b) => ({
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl,
          desc: b.description || "Official Brand Partner",
        }))
      : defaultBrands;

  return (
    <SectionWrapper section={section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SectionTitle
          title={p.title || "Our Trusted Brands & Partners"}
          subtitle={p.subtitle || "Authentic products directly sourced from verified farms and authorized distributors"}
          textColor={p.textColor}
          textAlignment={p.textAlignment}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {displayBrands.map((b, idx) => (
            <Link
              key={idx}
              href={(b as any).slug ? `/brand/${(b as any).slug}` : "/shop"}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-200/70 bg-white shadow-2xs hover:border-zinc-300 hover:shadow-md transition-all text-center group cursor-pointer"
            >
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 mb-2 p-1.5 flex items-center justify-center">
                {b.logoUrl ? (
                  <SmartImage src={b.logoUrl} alt={b.name} fill className="object-contain p-1" />
                ) : (
                  <Award className="w-6 h-6 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                )}
              </div>
              <span className="font-bold text-xs text-zinc-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {b.name}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                <span className="truncate">{b.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
