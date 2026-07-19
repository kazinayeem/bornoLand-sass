"use client";

import { Star } from "lucide-react";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useBuilderTestimonials } from "@/lib/use-builder-demo";
import type { DemoTestimonial } from "@/lib/demo-data";

export function Testimonials({ section }: { section: SectionData }) {
  const realTestimonials: DemoTestimonial[] = [];
  const items = useBuilderTestimonials(realTestimonials);
  const p = section.props;
  const count = Number(p.testimonialsCount) || 6;
  const display = items.slice(0, count);
  const cols = p.layout === "carousel" ? "4" : "3";

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "What Our Customers Say"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {display.map((t, i) => (
            <div key={t._id || i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }, (_, j) => (
                  <Star key={j} className={`h-4 w-4 ${j < t.rating ? "text-amber-400" : "text-zinc-200"}`} fill={j < t.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 overflow-hidden">
                  {"avatar" in t && t.avatar ? <img src={t.avatar} alt="" className="h-full w-full object-cover" /> : t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900">{t.name}</p>
                  <p className="text-[10px] text-zinc-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </ColumnGrid>
      </div>
    </SectionWrapper>
  );
}
