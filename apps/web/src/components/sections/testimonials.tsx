"use client";

import { Star, CheckCircle2, Quote } from "lucide-react";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";
import { useBuilderTestimonials } from "@/lib/use-builder-demo";
import type { DemoTestimonial } from "@/lib/demo-data";

export function Testimonials({ section }: { section: SectionData }) {
  const p = section.props;
  const styleItems = (section.style?.testimonialItems ?? []) as { id: string; name: string; role: string; text: string; rating: number | string; avatar: string; avatarMediaId?: string; badge?: string }[];
  const realTestimonials: DemoTestimonial[] = [];
  const demoItems = useBuilderTestimonials(realTestimonials);
  const items = styleItems.length > 0 ? styleItems : demoItems;
  const count = Number(p.testimonialsCount) || 6;
  const display = items.slice(0, count);
  const cols = p.layout === "carousel" ? "4" : "3";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionTitle title={p.title || "Loved by Customers"} subtitle={p.subtitle || "Real stories and verified reviews from people who love our products"} textColor={p.textColor} textAlignment={p.textAlignment} />
        {display.length > 0 ? (
          <ColumnGrid columns={cols}>
            {display.map((t, i) => {
              const id = (t as any).id || (t as any)._id || i;
              const avatarSrc = (t as any).avatar || "";
              const rating = Number(t.rating) || 5;
              return (
                <div
                  key={id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5"
                >
                  <Quote className="absolute right-4 top-4 h-10 w-10 text-zinc-100 -z-0 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${j < rating ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200"}`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-zinc-800">{rating}.0</span>
                    </div>

                    <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-normal">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-between pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm overflow-hidden ring-2 ring-blue-100">
                        {avatarSrc ? <img src={avatarSrc} alt={t.name} className="h-full w-full object-cover" /> : t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 leading-tight">{t.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{t.role || "Verified Buyer"}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </ColumnGrid>
        ) : (
          <p className="text-sm text-zinc-400 text-center py-8">No testimonials yet. Add them in the Content tab.</p>
        )}
      </div>
    </SectionWrapper>
  );
}

