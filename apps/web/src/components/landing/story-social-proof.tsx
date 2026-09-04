"use client";

import { landingContainer } from "./landing-ui";
import { Reveal, AnimatedNumber } from "./motion-primitives";
import {
  Database,
  Scale,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  Star,
  Quote,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export function StorySocialProof() {
  const valueStatements = [
    {
      icon: Database,
      title: "Unified Transactional Core",
      description: "Zero latency between physical POS registers, online storefronts, and central inventory records.",
      tag: "REAL-TIME SYNC",
    },
    {
      icon: Scale,
      title: "Automated Double-Entry",
      description: "Every sale, return, and purchase instantly posts balanced debit and credit lines into your Chart of Accounts.",
      tag: "AUDIT-READY",
    },
    {
      icon: Warehouse,
      title: "Multi-Warehouse Intelligence",
      description: "Granular stock transfers, FIFO true landed cost tracking, and automated supplier reorder triggers.",
      tag: "TRUE COSTING",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Multi-Tenancy",
      description: "Strict database partitioning, granular role-based permissions (RBAC), and 99.99% system availability.",
      tag: "BANK-GRADE",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "Managing Director",
      business: "Aura Lifestyle & Boutique",
      avatar: "SA",
      text: "Before BornoLand, we juggled five different disconnected apps for online orders, POS cashiers, and stock counts. Having everything in one live operating system boosted our throughput with zero overselling.",
      highlight: "Unified online + retail POS",
    },
    {
      name: "Rafiul Hasan",
      role: "Head of Operations",
      business: "Apex Tech Retail",
      avatar: "RH",
      text: "The multi-warehouse inventory and automated accounting are phenomenal. Our monthly financial reconciliation went from 4 stressful days to literally 10 minutes of automated review.",
      highlight: "Saved 4 days of manual reconciliation",
    },
    {
      name: "Nusrat Jahan",
      role: "Co-Founder",
      business: "Artisan Craft Studio",
      avatar: "NJ",
      text: "The storefront builder is fast and elegant. Connecting checkout, thermal receipts, and employee payroll was completely seamless. It gave us the foundation we needed to scale.",
      highlight: "Clean design and fast checkout",
    },
  ];

  return (
    <section id="trust" className="py-16 sm:py-20 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Core Architecture Trust Grid (4 Pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {valueStatements.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={idx} direction="up" delay={idx * 60 + 80}>
                <div className="h-full p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-[#003399]/40 hover:shadow-xs transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#003399] bg-blue-50/80 border border-blue-200/60 px-2 py-0.5 rounded-md">
                      {item.tag}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-zinc-950">{item.title}</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Real Merchant Feedback Section */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              TRUSTED BY GROWING BUSINESSES
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Built for Modern Commerce & Multi-Branch Retail
            </h2>
          </Reveal>
          <Reveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
              Real feedback from entrepreneurs and operations leaders who replaced fragmented spreadsheets with BornoLand.
            </p>
          </Reveal>
        </div>

        {/* Testimonials Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((item, idx) => (
            <Reveal key={idx} direction="up" delay={idx * 80 + 150}>
              <div className="h-full flex flex-col justify-between p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs hover:shadow-md hover:border-[#003399]/40 transition-all space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#0A8A00] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Merchant
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#003399] text-white font-black text-xs">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950 text-xs">{item.name}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {item.role} · <span className="font-semibold text-zinc-800">{item.business}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
