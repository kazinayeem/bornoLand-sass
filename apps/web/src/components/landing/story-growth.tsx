"use client";

import { landingContainer } from "./landing-ui";
import {
  Store,
  PackagePlus,
  ShoppingCart,
  Users,
  Sparkles,
} from "lucide-react";

export function StoryGrowth() {
  const STAGES = [
    {
      stage: "STEP 01",
      title: "Add More Products",
      unlocked: "Start with the first 25 products and freely upload thousands of categories and products.",
      icon: PackagePlus,
    },
    {
      stage: "STEP 02",
      title: "Accept More Orders",
      unlocked: "Automatically accept and process daily orders from 10 to hundreds without any hassle.",
      icon: ShoppingCart,
    },
    {
      stage: "STEP 03",
      title: "Get More Customers",
      unlocked: "Retain customers by preserving their complete order history, phone numbers, and emails.",
      icon: Users,
    },
    {
      stage: "STEP 04",
      title: "Understand Sales & Reports",
      unlocked: "Make clear decisions about profit, loss, growth, and sales at every level of your business.",
      icon: Store,
    },
  ];

  return (
    <section id="growth" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Business Expansion
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Small today, bigger tomorrow.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            The bigger your business grows, the more easily your platform scales with you.
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
                  <Sparkles className="h-3 w-3" /> 100% Scalable
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
