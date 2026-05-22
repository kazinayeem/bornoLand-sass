"use client";

import { Star, Quote } from "lucide-react";

type TestimonialsSectionProps = {
  primaryColor: string;
  font: string;
  darkMode: boolean;
};

const testimonials = [
  { name: "Sarah Johnson", role: "Verified Buyer", text: "Amazing quality and fast shipping! The product exceeded my expectations. Will definitely shop here again.", rating: 5 },
  { name: "Michael Chen", role: "Verified Buyer", text: "Best online shopping experience. The customer service team was incredibly helpful with my order.", rating: 5 },
  { name: "Emma Williams", role: "Verified Buyer", text: "Love the products! The quality is outstanding for the price. My new favorite online store.", rating: 4 }
];

export function TestimonialsSection({ primaryColor, font, darkMode }: TestimonialsSectionProps) {
  const isDark = darkMode;

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: isDark ? "#09090b" : "#fafafa" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            What Our Customers Say
          </h2>
          <p className="mt-2 text-sm" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            Real reviews from real customers
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="relative rounded-2xl border bg-white p-6 transition-all hover:shadow-md"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#ffffff" }}>
              <Quote className="h-8 w-8 opacity-10" style={{ color: primaryColor }} />
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: isDark ? "#27272a" : "#f4f4f5" }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
