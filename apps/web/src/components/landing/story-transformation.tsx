"use client";

import { landingContainer } from "./landing-ui";
import {
  Globe,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  Truck,
  LineChart,
  ArrowRight,
} from "lucide-react";

export function StoryTransformation() {
  const ECOSYSTEM = [
    { label: "Storefront", sub: "Visual Builder", icon: Globe },
    { label: "Products", sub: "Variants & SKUs", icon: Package },
    { label: "Inventory", sub: "Live Deductions", icon: Boxes },
    { label: "Orders", sub: "Real-Time Pipeline", icon: ShoppingCart },
    { label: "Payments", sub: "bKash & COD", icon: CreditCard },
    { label: "Shipping", sub: "Courier Sync", icon: Truck },
    { label: "Analytics", sub: "Growth Insights", icon: LineChart },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            THE UNIFIED ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            One place for your entire store.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Every layer of your e-commerce operations stays continuously synchronized in real-time.
          </p>
        </div>

        {/* Connected Ecosystem Horizontal Pipeline */}
        <div className="max-w-6xl mx-auto overflow-x-auto pb-4">
          <div className="flex items-center justify-between min-w-[840px] gap-2">
            {ECOSYSTEM.map((item, idx) => {
              const Icon = item.icon;
              const isLast = idx === ECOSYSTEM.length - 1;
              return (
                <div key={idx} className="flex items-center gap-2 flex-1">
                  <div className="w-full rounded-2xl border border-zinc-200/90 bg-white p-4 text-center space-y-2 shadow-2xs hover:border-blue-500 hover:shadow-md transition-all">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-950">{item.label}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{item.sub}</p>
                  </div>

                  {!isLast && (
                    <ArrowRight className="h-4 w-4 text-zinc-400 shrink-0 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
