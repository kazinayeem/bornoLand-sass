"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { Laptop, Headphones, Wrench, Store, ArrowRight, Shield, Zap } from "lucide-react";

export function QuickServiceLinks({ section }: { section: SectionData }) {
  const p = section.props;

  const items = [
    {
      title: p.item1Title || "Laptop Finder",
      subtitle: p.item1Subtitle || "Find your ideal laptop in 3 easy steps",
      link: p.item1Link || "/laptop-finder",
      icon: Laptop,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      title: p.item2Title || "Raise a Complaint",
      subtitle: p.item2Subtitle || "Fast customer RMA & warranty claim",
      link: p.item2Link || "/support",
      icon: Headphones,
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
    },
    {
      title: p.item3Title || "Online Service",
      subtitle: p.item3Subtitle || "Expert PC diagnostic & remote support",
      link: p.item3Link || "/service",
      icon: Wrench,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
    },
    {
      title: p.item4Title || "20+ Physical Stores",
      subtitle: p.item4Subtitle || "Experience products before buying",
      link: p.item4Link || "/branches",
      icon: Store,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    },
  ];

  return (
    <SectionWrapper section={section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.link}
                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-zinc-200/80 bg-white shadow-2xs hover:border-zinc-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`h-11 w-11 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
