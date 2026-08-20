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
  Sparkles,
} from "lucide-react";

export function ActivityTimeline() {
  const EVENTS = [
    {
      title: "Order Completed",
      desc: "Order #ORD-1042 successfully placed by Mohammad Ali Nayeem (2 items)",
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
      title: "Real-Time Inventory Deducted",
      desc: "Nike Air Max 270 (US 10.5) stock updated from 128 to 86 available units",
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
    {
      title: "Customer Segment Upgraded",
      desc: "Mohammad Ali Nayeem reached ৳ 84,200 lifetime spend → VIP Status",
      time: "5 mins ago",
      icon: UserPlus,
      badge: "Customer",
      color: "bg-emerald-600 text-white",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <div className="flex justify-center mb-2">
            <LiveIndicator label="Real-Time Event Stream" sublabel="Live store activity" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Everything happening in real time.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Watch orders flow in, payments clear, inventory synchronize, and shipments dispatch with zero manual latency.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-200/90 bg-zinc-50/40 p-6 sm:p-8 shadow-xl">
          <div className="relative border-l border-zinc-200 ml-4 space-y-6">
            {EVENTS.map((event, idx) => {
              const Icon = event.icon;
              return (
                <div key={idx} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-3.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full shadow-xs ${event.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-zinc-200/70 shadow-2xs group-hover:border-zinc-300 transition-colors space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-zinc-900">{event.title}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono font-medium">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{event.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
