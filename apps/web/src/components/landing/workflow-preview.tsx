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
} from "lucide-react";

export function WorkflowPreview() {
  const STEPS = [
    {
      step: "01",
      title: "New Order Placed",
      desc: "Customer selects items and places order with 1-step checkout.",
      icon: ShoppingCart,
      badge: "Trigger",
    },
    {
      step: "02",
      title: "Payment Verified",
      desc: "bKash/Nagad TrxID matched or COD rules verified automatically.",
      icon: CreditCard,
      badge: "Verification",
    },
    {
      step: "03",
      title: "Inventory Deducted",
      desc: "Stock deducted across all active sales channels in real-time.",
      icon: Boxes,
      badge: "Sync",
    },
    {
      step: "04",
      title: "Customer Notified",
      desc: "Instant SMS/Email dispatched with verified PDF invoice download link.",
      icon: Bell,
      badge: "Communication",
    },
    {
      step: "05",
      title: "Courier Shipment Booked",
      desc: "Consignment created with Steadfast/Pathao with live tracking barcode.",
      icon: Truck,
      badge: "Logistics",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            AUTONOMOUS OPERATIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Let your store run itself.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Automate the entire post-purchase chain from payment clearing to inventory deduction and courier consignment booking.
          </p>
        </div>

        {/* Sequential Workflow Steps */}
        <div className="max-w-2xl mx-auto space-y-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={idx} className="space-y-3">
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex items-center justify-between gap-4 hover:border-zinc-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-xs shrink-0 shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-zinc-400">STEP {step.step}</span>
                        <span className="text-zinc-300">·</span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-950">{step.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                    {step.badge}
                  </span>
                </div>

                {!isLast && (
                  <div className="flex justify-center py-1">
                    <div className="h-6 w-0.5 bg-zinc-300 relative flex items-center justify-center">
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
