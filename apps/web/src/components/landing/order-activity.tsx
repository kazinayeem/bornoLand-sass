"use client";

import { LiveIndicator } from "./live-indicator";
import { CheckCircle2, ShoppingCart, Clock } from "lucide-react";

export function OrderActivity() {
  const LIVE_ORDERS = [
    {
      id: "ORD-1042",
      customer: "Mohammad Ali Nayeem",
      item: "Nike Air Max 270 (×2)",
      total: "৳ 26,774",
      time: "2 mins ago",
      method: "bKash Verified",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "ORD-1041",
      customer: "Tanvir Ahmed",
      item: "AirPods Pro (2nd Gen)",
      total: "৳ 24,990",
      time: "8 mins ago",
      method: "COD Confirmed",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "ORD-1040",
      customer: "Farhana Yasmin",
      item: "Egyptian Cotton Bed Sheet",
      total: "৳ 3,850",
      time: "14 mins ago",
      method: "Nagad Paid",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xl space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <ShoppingCart className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Live Order Stream</h3>
            <p className="text-[10px] text-zinc-400">Real-time checkout events</p>
          </div>
        </div>

        <LiveIndicator label="Live" sublabel="12 orders in past hour" />
      </div>

      {/* Orders List */}
      <div className="space-y-2.5">
        {LIVE_ORDERS.map((order) => (
          <div
            key={order.id}
            className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/60 hover:bg-zinc-50 transition-colors flex items-center justify-between text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-zinc-900 text-[11px]">{order.id}</span>
                <span className="text-zinc-300">·</span>
                <span className="font-semibold text-zinc-800">{order.customer}</span>
              </div>
              <p className="text-[11px] text-zinc-500">{order.item}</p>
            </div>

            <div className="text-right space-y-1">
              <p className="font-extrabold text-zinc-950">{order.total}</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${order.color}`}>
                  {order.method}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">{order.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
