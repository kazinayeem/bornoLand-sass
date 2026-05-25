"use client";

import { Star } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-types";

const testimonials = [
  { name: "Sarah Johnson", role: "Verified Buyer", text: "Amazing quality! The product exceeded my expectations. Fast shipping too!", rating: 5 },
  { name: "Mike Chen", role: "Verified Buyer", text: "Great customer service and the product is top-notch. Will definitely order again.", rating: 5 },
  { name: "Emily Davis", role: "Verified Buyer", text: "Love the quality and the price. Best online shopping experience I've had.", rating: 4 },
];

export function TestimonialsSection({ section }: { section?: StorefrontSectionLike }) {
  const { theme } = useTenant();
  const { primaryColor, font, darkMode } = theme;
  const isDark = darkMode;
  const title = section?.props?.title ?? "What Our Customers Say";

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
            {title}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i}
              className="rounded-2xl border p-6 transition-all hover:shadow-md"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#ffffff" }}>
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{t.name}</p>
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
