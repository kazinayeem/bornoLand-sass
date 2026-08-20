"use client";

import { landingContainer } from "./landing-ui";
import { CreditCard, Zap, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";

export function IntegrationsGrid() {
  const INTEGRATIONS = [
    {
      title: "bKash Merchant Pay",
      type: "Payment Gateway",
      desc: "Instant digital payment clearing with manual and API TrxID verification.",
      icon: Zap,
      color: "bg-pink-50 text-pink-700 border-pink-100",
    },
    {
      title: "Nagad Instant Pay",
      type: "Payment Gateway",
      desc: "Direct Bangladesh Post Office digital wallet support.",
      icon: Zap,
      color: "bg-orange-50 text-orange-700 border-orange-100",
    },
    {
      title: "Cash on Delivery (COD)",
      type: "Offline Payment",
      desc: "Smart minimum order limits, auto-confirmation, and delivery charge advance.",
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Steadfast Courier",
      type: "Logistics Sync",
      desc: "One-click consignment booking, barcode labels, and doorstep pickup.",
      icon: Truck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      title: "Pathao Logistics",
      type: "Logistics Sync",
      desc: "Express delivery across 64 districts with automated status webhooks.",
      icon: Truck,
      color: "bg-red-50 text-red-700 border-red-100",
    },
    {
      title: "Card & Mobile Banking",
      type: "Payment Processing",
      desc: "Visa, Mastercard, and internet banking support for global and local buyers.",
      icon: CreditCard,
      color: "bg-purple-50 text-purple-700 border-purple-100",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            INTEGRATIONS & ECOSYSTEM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Connected to how you sell.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Direct integrations with Bangladesh’s leading payment methods and courier delivery networks.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {INTEGRATIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-zinc-200/80 bg-zinc-50/40 hover:bg-white hover:border-zinc-300 hover:shadow-lg transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {item.type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950">{item.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
