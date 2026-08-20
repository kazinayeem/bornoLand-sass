"use client";

import { landingContainer } from "./landing-ui";
import { Star, Store, Sparkles, ShoppingBag, Award } from "lucide-react";

export function StorySocialProof() {
  const STATS = [
    { label: "Active Stores", val: "500+", icon: Store },
    { label: "Products Cataloged", val: "10K+", icon: Sparkles },
    { label: "Orders Processed", val: "50K+", icon: ShoppingBag },
    { label: "Merchant Rating", val: "4.9 / 5", icon: Award },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            PROVEN TRACK RECORD
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Built for businesses that are ready to grow.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Trusted by creators, boutique brands, and multi-store retailers across Bangladesh.
          </p>
        </div>

        {/* Compact Trust Metrics Strip */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1"
              >
                <div className="flex items-center justify-center gap-1.5 text-zinc-950 font-extrabold text-2xl">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{s.val}</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Large Featured Testimonial */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-8 sm:p-12 shadow-xl space-y-6">
          <div className="flex gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400" />
            ))}
          </div>

          <p className="text-xl sm:text-2xl font-semibold text-zinc-950 leading-relaxed font-sans">
            &ldquo;Bornoland helped us launch our brand in under an afternoon. Having native bKash merchant verification and Steadfast courier sync in one place saved us weeks of custom development.&rdquo;
          </p>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-zinc-950">Farhan Kabir</p>
              <p className="text-xs text-zinc-500">
                Founder & Creative Director · <span className="font-semibold text-zinc-900">Aura Lifestyle BD</span>
              </p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              Verified Merchant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
