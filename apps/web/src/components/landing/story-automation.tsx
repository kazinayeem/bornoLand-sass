"use client";

import { landingContainer } from "./landing-ui";
import {
  ShoppingCart,
  CreditCard,
  Boxes,
  Bell,
  Truck,
  ArrowDown,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function StoryAutomation() {
  const WORKFLOW = [
    {
      step: "01",
      title: "ORDER RECEIVED",
      desc: "Customer completes checkout on your storefront.",
      icon: ShoppingCart,
    },
    {
      step: "02",
      title: "PAYMENT CONFIRMED",
      desc: "bKash / Nagad TrxID verified or COD rules validated.",
      icon: CreditCard,
    },
    {
      step: "03",
      title: "INVENTORY UPDATED",
      desc: "Product variant stock deducted across all channels in real-time.",
      icon: Boxes,
    },
    {
      step: "04",
      title: "CUSTOMER NOTIFIED",
      desc: "Automated SMS/Email sent with verified A4 PDF invoice download.",
      icon: Bell,
    },
    {
      step: "05",
      title: "COURIER CREATED",
      desc: "Consignment automatically registered with Steadfast or Pathao.",
      icon: Truck,
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 font-bold">
            THE MAGIC MOMENT · AUTOMATION
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Your store keeps working, <br className="hidden sm:inline" />
            even when you&apos;re not.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            No more manual spreadsheet copying, manual stock counting, or late-night courier portal bookings.
          </p>
        </div>

        {/* Vertical Connected Workflow */}
        <div className="max-w-2xl mx-auto space-y-3">
          {WORKFLOW.map((w, idx) => {
            const Icon = w.icon;
            const isLast = idx === WORKFLOW.length - 1;
            return (
              <div key={idx} className="space-y-3">
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-5 shadow-xs flex items-center justify-between gap-4 hover:bg-white hover:border-emerald-500/80 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white font-bold text-xs shrink-0 shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-zinc-400">STEP {w.step}</span>
                        <span className="text-zinc-300">·</span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-950">{w.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{w.desc}</p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                </div>

                {!isLast && (
                  <div className="flex justify-center py-0.5">
                    <div className="h-5 w-0.5 bg-zinc-300 relative flex items-center justify-center">
                      <ArrowDown className="h-3 w-3 text-zinc-400 -mb-2" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
