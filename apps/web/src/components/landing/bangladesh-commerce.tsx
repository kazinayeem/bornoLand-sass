"use client";

import { landingContainer } from "./landing-ui";
import {
  CheckCircle2,
  Truck,
  MapPin,
  Languages,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function BangladeshCommerce() {
  const LOCAL_FEATURES = [
    {
      title: "৳ BDT Native Currency",
      desc: "Built-in Taka formatting, Bengali number support, and standard South Asian currency conventions (Lakh / Crore).",
      icon: Zap,
    },
    {
      title: "bKash & Nagad Payments",
      desc: "Instant merchant number integration, manual TrxID verification, and automated confirmation workflows.",
      icon: CreditCard,
    },
    {
      title: "Smart Cash on Delivery",
      desc: "Configure minimum order thresholds, customer blacklist rules, and optional advance delivery charge collection.",
      icon: ShieldCheck,
    },
    {
      title: "Local Delivery Zones",
      desc: "Inside Dhaka (৳60-৳80), Outside Dhaka (৳120-৳150), and customized district-level shipping rates.",
      icon: MapPin,
    },
    {
      title: "Courier API Integration",
      desc: "One-click consignment creation, tracking number sync, and automated shipment status tracking with Steadfast and Pathao.",
      icon: Truck,
    },
    {
      title: "Bangla Storefront Ready",
      desc: "Bilingual storefront experience supporting English and Bengali product descriptions, checkout, and invoices.",
      icon: Languages,
    },
  ];

  return (
    <section id="bangladesh" className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 font-bold">
            LOCAL COMMERCE POWERHOUSE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Built for how Bangladesh sells.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            No overseas workarounds or complicated conversion setups. Bornoland is tailored from day one for Bangladesh’s retail, payment, and logistics ecosystem.
          </p>
        </div>

        {/* 6 Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {LOCAL_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 hover:bg-white hover:shadow-lg hover:border-zinc-300 transition-all space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">{feat.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
