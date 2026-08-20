"use client";

import { landingContainer } from "./landing-ui";
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function StoryGrowth() {
  const STAGES = [
    {
      stage: "Stage 01",
      title: "1 Online Store",
      unlocked: "Launch free, upload first 25 products, accept Cash on Delivery.",
      icon: Store,
    },
    {
      stage: "Stage 02",
      title: "100+ Products",
      unlocked: "Connect custom apex domain, bKash merchant gateway, automated invoices.",
      icon: Package,
    },
    {
      stage: "Stage 03",
      title: "1,000+ Orders",
      unlocked: "Steadfast & Pathao courier sync, automated inventory alerts.",
      icon: ShoppingCart,
    },
    {
      stage: "Stage 04",
      title: "Multi-Store Scale",
      unlocked: "Multiple storefronts, staff role permissions, REST API & Webhooks.",
      icon: Layers,
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            SCALABILITY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Start small. <br className="hidden sm:inline" />
            Grow without rebuilding everything.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            As your sales volume surges from your first customer to multi-store retail empire, Bornoland scales with you effortlessly.
          </p>
        </div>

        {/* Growth Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {STAGES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-zinc-200/90 bg-zinc-50/40 hover:bg-white hover:shadow-lg hover:border-blue-500/80 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-zinc-400">
                      {s.stage}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-zinc-950">{s.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{s.unlocked}</p>
                </div>

                <div className="pt-3 border-t border-zinc-200/60 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Fully Scalable
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
