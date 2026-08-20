"use client";

import { landingContainer } from "./landing-ui";
import { Zap, Bell, CheckCircle2, ArrowRight, Truck, FileText } from "lucide-react";

export function AutomationSection() {
  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            AUTOMATED WORKFLOWS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Less manual work. More selling.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Eliminate repetitive tasks with automated invoice generation, instant delivery booking, and real-time merchant notifications.
          </p>
        </div>

        {/* 3 Automation Workflows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-xs">
          {/* Automation 1: Order Lifecycle */}
          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                ORDER DISPATCH
              </span>
              <h3 className="text-base font-bold text-zinc-950">Checkout to Invoice</h3>
              <p className="text-zinc-600 leading-relaxed">
                When a customer completes checkout, the system instantly generates an authentic A4 PDF invoice and sends an order confirmation.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 font-mono text-[11px] text-zinc-700">
              ⚡ Order Placed → Invoice PDF Generated → Email Dispatched
            </div>
          </div>

          {/* Automation 2: Inventory Safety */}
          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-100">
                STOCK PROTECTION
              </span>
              <h3 className="text-base font-bold text-zinc-950">Low Stock Alert</h3>
              <p className="text-zinc-600 leading-relaxed">
                Receive real-time notifications via dashboard when any variant SKU falls below your custom minimum reorder threshold.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 font-mono text-[11px] text-zinc-700">
              🔔 Stock &lt; 10 Units → Merchant Alert Triggered
            </div>
          </div>

          {/* Automation 3: Courier Tracking */}
          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100">
                LOGISTICS SYNC
              </span>
              <h3 className="text-base font-bold text-zinc-950">Courier Integration</h3>
              <p className="text-zinc-600 leading-relaxed">
                One-click consignment creation with Steadfast & Pathao. Automated tracking link sent to the customer upon courier pickup.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 font-mono text-[11px] text-zinc-700">
              🚚 Consignment Created → Live Tracking Link Active
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
