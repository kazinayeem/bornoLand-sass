"use client";

import { landingContainer } from "./landing-ui";
import { LiveIndicator } from "./live-indicator";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export function StoryOrders() {
  const STREAMING_ORDERS = [
    {
      id: "ORD-1048",
      customer: "Mohammad Ali Nayeem",
      items: "Nike Air Max 270 (×2)",
      total: "৳ 26,774",
      payment: "bKash Paid",
      time: "Just now",
      status: "Confirmed",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "ORD-1047",
      customer: "Tanvir Ahmed",
      items: "AirPods Pro (2nd Gen)",
      total: "৳ 24,990",
      payment: "COD Verified",
      time: "3 mins ago",
      status: "Confirmed",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "ORD-1046",
      customer: "Farhana Yasmin",
      items: "Luxury Bed Sheet Set",
      total: "৳ 3,850",
      payment: "Nagad Paid",
      time: "7 mins ago",
      status: "Processing",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <div className="flex justify-center mb-1">
            <LiveIndicator label="LIVE" sublabel="Orders streaming in real-time" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Then the orders start coming in.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Customer checkouts, payment confirmations, stock deductions, and customer alerts happen simultaneously.
          </p>
        </div>

        {/* Live Orders Container */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200/90 bg-zinc-50/40 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3 text-xs">
            <span className="font-bold text-zinc-900">Real-Time Order Queue</span>
            <span className="text-[10px] text-zinc-400 font-mono">12 orders in past hour</span>
          </div>

          <div className="space-y-3">
            {STREAMING_ORDERS.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white border border-zinc-200/70 shadow-2xs flex items-center justify-between gap-4 text-xs hover:border-zinc-300 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900">{order.id}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="font-semibold text-zinc-800">{order.customer}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{order.items}</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-extrabold text-zinc-950">{order.total}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${order.color}`}>
                      {order.payment}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
