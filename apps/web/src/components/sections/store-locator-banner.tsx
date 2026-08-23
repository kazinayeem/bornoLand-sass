"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { MapPin, Store, ArrowRight, ShieldCheck } from "lucide-react";

export function StoreLocatorBanner({ section }: { section: SectionData }) {
  const p = section.props;

  const headline = p.headline || "20+ Physical Stores Across Bangladesh";
  const subheadline = p.subheadline || "Experience products hands-on before you buy. Outlets across Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, and Rangpur.";
  const buttonText = p.buttonText || "Find Nearest Store";
  const buttonLink = p.buttonLink || "/branches";
  const bgColor = p.bgColor || "#0071dc";
  const textColor = p.textColor || "#ffffff";

  return (
    <SectionWrapper section={section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-10 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {/* Background decorative elements */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold opacity-90 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>NATIONWIDE PHYSICAL RETAIL NETWORK</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight">
                {headline}
              </h3>
              <p className="text-xs sm:text-sm opacity-90 max-w-xl mt-1 leading-relaxed">
                {subheadline}
              </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-zinc-900 shadow-sm transition-all hover:bg-zinc-100 hover:shadow active:scale-95"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
