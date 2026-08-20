"use client";

import { landingContainer } from "./landing-ui";
import {
  Globe,
  Package,
  CreditCard,
  Boxes,
  ShoppingCart,
  Truck,
  LineChart,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function StoryProblem() {
  const SCATTERED_TOOLS = [
    { name: "Website Builder", tool: "Fragmented Tool #1", icon: Globe, issue: "Separate monthly fee" },
    { name: "Inventory Sheets", tool: "Fragmented Tool #2", icon: Boxes, issue: "Manual stock errors" },
    { name: "Payment Gateways", tool: "Fragmented Tool #3", icon: CreditCard, issue: "Disconnected TrxIDs" },
    { name: "Order Spreadsheets", tool: "Fragmented Tool #4", icon: ShoppingCart, issue: "Lost customer notes" },
    { name: "Courier Portals", tool: "Fragmented Tool #5", icon: Truck, issue: "Manual address typing" },
    { name: "Analytics Plugins", tool: "Fragmented Tool #6", icon: LineChart, issue: "Delayed metrics" },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
            THE FRAGMENTATION PROBLEM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Running an online store shouldn&apos;t mean running five different tools.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Merchants lose hours every day copying customer data between disconnected spreadsheets, courier portals, and payment apps.
          </p>
        </div>

        {/* Visual Storytelling Comparison */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Scattered Broken Tools */}
          <div className="lg:col-span-6 rounded-3xl border border-red-200/80 bg-red-50/20 p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>BEFORE BORNO LAND (DISCONNECTED)</span>
              </div>
              <span className="text-[10px] text-red-500 font-bold">5+ Subscriptions</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {SCATTERED_TOOLS.map((t, idx) => {
                const Icon = t.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-red-100/90 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-2 text-zinc-700 font-bold text-[11px]">
                      <Icon className="h-3.5 w-3.5 text-red-500" />
                      <span>{t.name}</span>
                    </div>
                    <p className="text-[10px] text-red-600/80 font-medium">{t.issue}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: The Transformation to Bornoland Unified OS */}
          <div className="lg:col-span-6 rounded-3xl border border-blue-200/80 bg-blue-50/20 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>WITH BORNO LAND (ONE UNIFIED OS)</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                100% Unified
              </span>
            </div>

            <div className="rounded-2xl bg-white border border-blue-100 p-5 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-zinc-950 text-sm">
                One platform handles everything automatically.
              </h4>
              <p className="text-zinc-600 leading-relaxed text-[11px]">
                When an order is placed on your storefront, payment is verified via bKash, inventory is decremented instantly, an A4 PDF invoice is generated, and a courier pickup is booked with Steadfast without manual intervention.
              </p>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                <span>Save 15+ hours every single week</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
