"use client";

import { Star } from "lucide-react";
import { SectionWrapper, ColumnGrid, SectionTitle, type SectionData } from "./section-renderer";

const sampleTestimonials = [
  { name: "Sarah Johnson", role: "Verified Buyer", text: "Amazing quality! The product exceeded my expectations. Will definitely buy again.", rating: 5 },
  { name: "Michael Chen", role: "Verified Buyer", text: "Fast shipping and excellent customer service. The item was exactly as described.", rating: 5 },
  { name: "Emily Rodriguez", role: "Verified Buyer", text: "Great value for money. I've recommended this store to all my friends and family.", rating: 5 },
  { name: "David Kim", role: "Verified Buyer", text: "The attention to detail is impressive. This is my go-to store for quality products.", rating: 4 },
  { name: "Lisa Thompson", role: "Verified Buyer", text: "Beautiful products and wonderful packaging. Makes a great gift experience.", rating: 5 },
  { name: "James Wilson", role: "Verified Buyer", text: "Outstanding selection and competitive prices. The quality is consistently excellent.", rating: 5 },
];

export function Testimonials({ section }: { section: SectionData }) {
  const p = section.props;
  const count = Number(p.testimonialsCount) || 6;
  const items = sampleTestimonials.slice(0, count);
  const cols = p.layout === "carousel" ? "4" : "3";

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "What Our Customers Say"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <ColumnGrid columns={cols}>
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }, (_, j) => (
                  <Star key={j} className={`h-4 w-4 ${j < t.rating ? "text-amber-400" : "text-zinc-200"}`} fill={j < t.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                  {t.name.charAt(0)}
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
