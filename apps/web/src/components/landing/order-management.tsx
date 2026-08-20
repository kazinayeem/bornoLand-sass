"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Eye,
  Download,
} from "lucide-react";

export function OrderManagement() {
  const [activeFilter, setActiveFilter] = useState("all");

  const ORDERS = [
    {
      id: "ORD-94812",
      customer: "Mohammad Ali Nayeem",
      phone: "+880 1711-223344",
      items: "Nike Air Max 270 (×2)",
      total: "৳ 26,774",
      payment: "bKash (Paid)",
      shipping: "Inside Dhaka (Steadfast)",
      status: "Processing",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "ORD-94811",
      customer: "Tanvir Ahmed",
      phone: "+880 1819-554433",
      items: "AirPods Pro (2nd Gen)",
      total: "৳ 24,990",
      payment: "COD (Unpaid)",
      shipping: "Chittagong (Pathao)",
      status: "Confirmed",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "ORD-94810",
      customer: "Farhana Yasmin",
      phone: "+880 1912-334455",
      items: "Bed Sheet Set · King Size",
      total: "৳ 3,850",
      payment: "Nagad (Paid)",
      shipping: "Sylhet (Steadfast)",
      status: "Delivered",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            ORDER LIFECYCLE & FULFILLMENT
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Every order. Under control.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Track and process orders seamlessly from cart checkout through courier booking, automated PDF invoicing, and delivery verification.
          </p>
        </div>

        {/* Order Table Mockup Container */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-zinc-200/90 bg-white shadow-xl overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 bg-zinc-50/70 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900">Orders Stream</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-700">
                128 Total
              </span>
            </div>

            <div className="flex items-center gap-1">
              {["All", "Pending", "Confirmed", "Processing", "Delivered"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter.toLowerCase())}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === filter.toLowerCase()
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-200/60"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Shipping</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {ORDERS.map((order, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">{order.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-zinc-900">{order.customer}</p>
                      <p className="text-[10px] text-zinc-400">{order.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium">{order.items}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-700">{order.payment}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">{order.shipping}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.statusColor}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-zinc-950">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
