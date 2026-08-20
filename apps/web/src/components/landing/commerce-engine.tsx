"use client";

import { landingContainer } from "./landing-ui";
import {
  Package,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Truck,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function CommerceEngine() {
  const STEPS = [
    { label: "Product", sub: "Catalog & Stock", icon: Package },
    { label: "Cart", sub: "Live Drawer", icon: ShoppingCart },
    { label: "Checkout", sub: "1-Step Flow", icon: CreditCard },
    { label: "Payment", sub: "bKash / COD / Card", icon: Zap },
    { label: "Order", sub: "Live Status", icon: CheckCircle2 },
    { label: "Shipping", sub: "Courier Sync", icon: Truck },
    { label: "Invoice", sub: "Printable A4 PDF", icon: FileText },
  ];

  return (
    <section id="commerce" className="py-20 sm:py-28 bg-zinc-950 text-white border-b border-zinc-800">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            END-TO-END CHECKOUT PIPELINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything behind the checkout.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            From the moment a customer clicks Buy Now to automated warehouse fulfillment, our commerce engine orchestrates every touchpoint with zero manual latency.
          </p>
        </div>

        {/* Horizontal Pipeline Visualization */}
        <div className="max-w-5xl mx-auto overflow-x-auto pb-4">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === STEPS.length - 1;
              return (
                <div key={idx} className="flex items-center gap-2 flex-1">
                  <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-center space-y-1.5 hover:border-zinc-700 transition-colors">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold text-white">{step.label}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{step.sub}</p>
                  </div>

                  {!isLast && (
                    <ArrowRight className="h-4 w-4 text-zinc-600 shrink-0 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrations Badges Bar */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Pre-Integrated Commerce Channels</h4>
            <p className="text-xs text-zinc-400">Accept digital payments, dispatch shipments, and send notifications instantly.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-300">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">bKash Merchant</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">Nagad Pay</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">Cash on Delivery</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">Steadfast Courier</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">Pathao Logistics</span>
          </div>
        </div>
      </div>
    </section>
  );
}
