"use client";

import { landingContainer } from "./landing-ui";
import {
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Banknote,
} from "lucide-react";

export function StoryPaymentsDelivery() {
  const JOURNEY = [
    { label: "01. Accept Order", sub: "1-Click Checkout", icon: ShieldCheck },
    { label: "02. Verify Payment", sub: "bKash / Nagad / COD", icon: Banknote },
    { label: "03. Create Invoice", sub: "Auto PDF Receipt", icon: CheckCircle2 },
    { label: "04. Book Courier", sub: "Pathao / Steadfast", icon: Truck },
    { label: "05. Track Delivery", sub: "Auto SMS Updates", icon: CheckCircle2 },
  ];

  return (
    <section id="payments" className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Payments & Delivery
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            From payment to delivery — everything in one place.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Easily manage popular payment and courier methods from a single location.
          </p>
        </div>

        {/* Horizontal Journey Flow */}
        <div className="max-w-5xl mx-auto overflow-x-auto pb-4 mb-10">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {JOURNEY.map((j, idx) => {
              const Icon = j.icon;
              const isLast = idx === JOURNEY.length - 1;
              return (
                <div key={idx} className="flex items-center gap-2 flex-1">
                  <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-center space-y-1.5 shadow-2xs hover:border-blue-500 transition-colors">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-zinc-950">{j.label}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{j.sub}</p>
                  </div>

                  {!isLast && (
                    <ArrowRight className="h-4 w-4 text-zinc-400 shrink-0 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Badges */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1 hover:border-emerald-300 transition-colors">
            <span className="font-bold text-zinc-900 block text-sm">Cash on Delivery (COD)</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Pay when you receive</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1 hover:border-pink-300 transition-colors">
            <span className="font-bold text-zinc-900 block text-sm">bKash, Nagad & Rocket</span>
            <span className="text-[10px] text-pink-600 font-semibold">Mobile Banking Payment</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1 hover:border-blue-300 transition-colors">
            <span className="font-bold text-zinc-900 block text-sm">Online Payment</span>
            <span className="text-[10px] text-blue-600 font-semibold">Debit/Credit Card Support</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1 hover:border-purple-300 transition-colors">
            <span className="font-bold text-zinc-900 block text-sm">Courier & Live Tracking</span>
            <span className="text-[10px] text-purple-600 font-semibold">Pathao, Steadfast & RedX</span>
          </div>
        </div>
      </div>
    </section>
  );
}
