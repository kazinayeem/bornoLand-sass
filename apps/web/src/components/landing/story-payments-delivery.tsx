"use client";

import { landingContainer } from "./landing-ui";
import {
  CreditCard,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function StoryPaymentsDelivery() {
  const JOURNEY = [
    { label: "01 Order", sub: "1-Step Checkout", icon: ShieldCheck },
    { label: "02 Payment", sub: "bKash / COD / Nagad", icon: Zap },
    { label: "03 Invoice", sub: "Auto PDF Generated", icon: CheckCircle2 },
    { label: "04 Courier", sub: "Steadfast / Pathao", icon: Truck },
    { label: "05 Delivered", sub: "SMS Tracking Sync", icon: CheckCircle2 },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            STEP 03 · FULFILLMENT
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            From payment to delivery, <br className="hidden sm:inline" />
            everything stays connected.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Accept local Bangladesh payments and dispatch courier shipments without juggling separate portals or manual data entry.
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
                  <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 text-center space-y-1.5 shadow-2xs">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-zinc-950">{j.label}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{j.sub}</p>
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
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1">
            <span className="font-bold text-zinc-900 block">bKash Merchant</span>
            <span className="text-[10px] text-zinc-500">Instant TrxID Verification</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1">
            <span className="font-bold text-zinc-900 block">Nagad & Cards</span>
            <span className="text-[10px] text-zinc-500">Digital Wallet Gateway</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1">
            <span className="font-bold text-zinc-900 block">Steadfast Courier</span>
            <span className="text-[10px] text-zinc-500">1-Click Pickup Booking</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs text-center space-y-1">
            <span className="font-bold text-zinc-900 block">Pathao Logistics</span>
            <span className="text-[10px] text-zinc-500">Live Delivery Webhooks</span>
          </div>
        </div>
      </div>
    </section>
  );
}
