"use client";

import { landingContainer } from "./landing-ui";
import { LiveIndicator } from "./live-indicator";
import {
  CheckCircle2,
  CreditCard,
  Package,
  UserPlus,
  Truck,
  FileText,
  ArrowRight,
} from "lucide-react";

export function SplitActivityFeed() {
  const EVENTS = [
    {
      title: "Order #ORD-1042 Completed",
      desc: "Mohammad Ali Nayeem placed 2 items (Total: ৳ 26,774)",
      time: "2 mins ago",
      icon: CheckCircle2,
      badge: "Completed",
      color: "bg-emerald-500 text-white",
    },
    {
      title: "bKash Merchant Payment Verified",
      desc: "৳ 26,774 instant transaction verified (TrxID: 9K8L7M6N5P)",
      time: "2 mins ago",
      icon: CreditCard,
      badge: "Paid",
      color: "bg-blue-500 text-white",
    },
    {
      title: "Stock Level Auto-Deducted",
      desc: "Nike Air Max 270 (US 10.5) updated to 86 units available",
      time: "2 mins ago",
      icon: Package,
      badge: "Inventory",
      color: "bg-purple-500 text-white",
    },
    {
      title: "Courier Consignment Dispatched",
      desc: "Steadfast Courier pickup booked (Consignment ID: ST-998822)",
      time: "4 mins ago",
      icon: Truck,
      badge: "Logistics",
      color: "bg-amber-500 text-white",
    },
    {
      title: "Authentic A4 PDF Invoice Issued",
      desc: "Invoice #INV-2026-8941 compiled with live QR code verification",
      time: "4 mins ago",
      icon: FileText,
      badge: "Invoicing",
      color: "bg-zinc-900 text-white",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column: Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <LiveIndicator label="Live Activity" sublabel="Real-time telemetry" />
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
                Everything happening in your store.
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                Watch orders flow in, payments clear instantly via bKash, inventory synchronize across channels, and shipments dispatch with zero manual delay.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5 text-xs">
              <p className="font-bold text-zinc-900">12 orders processed in the last hour</p>
              <p className="text-zinc-500">Zero dropped checkouts and 99.98% webhook delivery reliability.</p>
            </div>
          </div>

          {/* Right Column: Live Feed Timeline */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200/90 bg-zinc-50/40 p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3 text-xs">
                <span className="font-bold text-zinc-900">Live Commerce Stream</span>
                <span className="text-[10px] text-zinc-400 font-mono">Synchronized</span>
              </div>

              <div className="space-y-2.5">
                {EVENTS.map((ev, idx) => {
                  const Icon = ev.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between gap-3 text-xs hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${ev.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{ev.title}</p>
                          <p className="text-[11px] text-zinc-500">{ev.desc}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-100 text-zinc-700">
                          {ev.badge}
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">{ev.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
