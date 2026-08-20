"use client";

import { landingContainer } from "./landing-ui";
import { ArrowRight, ShoppingCart, CheckCircle2, Truck, FileText, Package } from "lucide-react";

export function OperationsSplit() {
  const PIPELINE = [
    "Product",
    "Inventory",
    "Order",
    "Payment",
    "Courier",
    "Delivered",
  ];

  const ORDERS = [
    {
      id: "ORD-94812",
      customer: "Mohammad Ali Nayeem",
      items: "Nike Air Max 270 (×2)",
      total: "৳ 26,774",
      status: "Processing",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "ORD-94811",
      customer: "Tanvir Ahmed",
      items: "AirPods Pro (2nd Gen)",
      total: "৳ 24,990",
      status: "Confirmed",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "ORD-94810",
      customer: "Farhana Yasmin",
      items: "Bed Sheet Set · King",
      total: "৳ 3,850",
      status: "Delivered",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Pipeline Story */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
                COMMERCE PIPELINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
                From product to delivery.
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                Bornoland handles every operational step between catalog upload and doorstep courier delivery without missing a heartbeat.
              </p>
            </div>

            {/* Horizontal / Wrapped Pipeline Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-zinc-700 pt-2">
              {PIPELINE.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                    {p}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-zinc-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Realistic Order Management UI */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="font-bold text-zinc-900">Order Management Queue</span>
                <span className="text-[10px] text-zinc-400">128 Orders Total</span>
              </div>

              <div className="divide-y divide-zinc-50">
                {ORDERS.map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900">{o.id}</span>
                        <span className="text-zinc-300">·</span>
                        <span className="font-semibold text-zinc-800">{o.customer}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{o.items}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-extrabold text-zinc-950">{o.total}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${o.statusColor}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
