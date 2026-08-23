"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import { Award, CheckCircle2 } from "lucide-react";

export function BrandShowcase({ section }: { section: SectionData }) {
  const p = section.props;

  const brands = [
    { name: "Organic Farm Pure", logo: "🌿 Organic Pure", desc: "100% Certified" },
    { name: "Sundarbans Harvest", logo: "🍯 Sundarbans", desc: "Natural Wild Honey" },
    { name: "Madina Dates Co", logo: "🌴 Madina Gold", desc: "Premium Import" },
    { name: "Nature Spices Ltd", logo: "🌶️ Nature Spice", desc: "Stone Ground" },
    { name: "Green Fields", logo: "🌾 Green Fields", desc: "Direct Farm Source" },
    { name: "Village Ghee", logo: "🧈 Village Ghee", desc: "Pure Gawa Ghee" },
  ];

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
          {brands.map((b, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-200/70 bg-white shadow-2xs hover:border-zinc-300 hover:shadow-md transition-all text-center group cursor-pointer"
            >
              <div className="text-xl sm:text-2xl mb-1.5 transform group-hover:scale-110 transition-transform">
                {b.logo.split(" ")[0]}
              </div>
              <span className="font-bold text-xs text-zinc-800 line-clamp-1 group-hover:text-primary transition-colors">
                {b.name}
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                {b.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
