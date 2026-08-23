"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { HelpCircle, MessageSquare, Wrench, MapPin, ArrowRight } from "lucide-react";

const DEFAULT_ICONS = [HelpCircle, MessageSquare, Wrench, MapPin];
const DEFAULT_COLORS = [
  "bg-blue-500/10 text-blue-600 border-blue-200",
  "bg-rose-500/10 text-rose-600 border-rose-200",
  "bg-amber-500/10 text-amber-600 border-amber-200",
  "bg-emerald-500/10 text-emerald-600 border-emerald-200",
];

export function QuickServiceLinks({ section }: { section: SectionData }) {
  const p = section.props;

  const items = [
    {
      title: p.item1Title || "Quick Links",
      subtitle: p.item1Subtitle || "",
      link: p.item1Link || "#",
      color: DEFAULT_COLORS[0],
    },
    {
      title: p.item2Title || "Get Support",
      subtitle: p.item2Subtitle || "",
      link: p.item2Link || "#",
      color: DEFAULT_COLORS[1],
    },
    {
      title: p.item3Title || "Services",
      subtitle: p.item3Subtitle || "",
      link: p.item3Link || "#",
      color: DEFAULT_COLORS[2],
    },
    {
      title: p.item4Title || "Find Us",
      subtitle: p.item4Subtitle || "",
      link: p.item4Link || "#",
      color: DEFAULT_COLORS[3],
    },
  ].filter((item) => item.title && item.link !== "#");

  if (items.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 py-10 text-center">
            <h4 className="text-sm font-semibold text-zinc-700">No quick links configured</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Add item titles and links in the Content tab to display quick service links.
            </p>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const Icon = DEFAULT_ICONS[idx] ?? HelpCircle;
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
                  {item.subtitle && (
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
