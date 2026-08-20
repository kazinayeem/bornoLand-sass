"use client";

import { landingContainer } from "./landing-ui";
import { Store, PackagePlus, Zap } from "lucide-react";

export function HowItWorks() {
  const STEPS = [
    {
      num: "01",
      title: "Create your store",
      desc: "Sign up, choose your store name and brand theme in 60 seconds.",
      icon: Store,
    },
    {
      num: "02",
      title: "Add your products",
      desc: "Upload images, configure variants, inventory counts, and delivery zones.",
      icon: PackagePlus,
    },
    {
      num: "03",
      title: "Start selling online",
      desc: "Launch your storefront, accept bKash & COD, and fulfill orders with automated invoices.",
      icon: Zap,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            SIMPLE ONBOARDING
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Launch in three simple steps.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            No coding required. No complex server configurations. Start selling today.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-8 rounded-2xl border border-zinc-200/80 bg-white shadow-sm space-y-4 relative"
              >
                <span className="font-mono text-xs font-bold text-zinc-400">
                  STEP {step.num}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs">
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-950">{step.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
