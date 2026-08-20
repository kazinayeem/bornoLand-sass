"use client";

import { landingContainer } from "./landing-ui";
import { Star, ShieldCheck, Sparkles, Store, ShoppingCart } from "lucide-react";

export function TrustBar() {
  const STATS = [
    { label: "Active Stores", value: "500+", icon: Store },
    { label: "Products Cataloged", value: "10K+", icon: Sparkles },
    { label: "Orders Processed", value: "50K+", icon: ShoppingCart },
    { label: "Merchant Rating", value: "4.9 / 5", icon: Star },
  ];

  return (
    <section className="border-y border-zinc-200/80 bg-zinc-50/50 py-10">
      <div className={landingContainer}>
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            TRUSTED BY GROWING BUSINESSES & E-COMMERCE ENTREPRENEURS
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-zinc-950 font-extrabold text-2xl sm:text-3xl tracking-tight">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  <span>{stat.value}</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
