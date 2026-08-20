"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import {
  Globe,
  Package,
  ShoppingCart,
  LineChart,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Tag,
  Shield,
} from "lucide-react";

type TabId = "storefront" | "products" | "orders" | "analytics" | "customers" | "settings";

const TABS: Array<{ id: TabId; label: string; icon: typeof Globe }> = [
  { id: "storefront", label: "Storefront", icon: Globe },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("storefront");

  return (
    <section id="product" className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            COMPLETE COMMERCE SUITE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            One platform. <br className="hidden sm:inline" />
            Your entire business.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Switch between your public storefront, inventory engine, order pipeline, customer profiles, and analytics without juggling separate tools.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-2xs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display Container */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-zinc-200/90 bg-white shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3 bg-zinc-50/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 capitalize">{activeTab} Workspace</span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400 font-mono text-[11px]">techgear.bornoland.com</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              SYNCHRONIZED
            </span>
          </div>

          {/* Dynamic Tab Body */}
          <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center">
            {activeTab === "storefront" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-zinc-950">High-Converting Live Storefront</h4>
                    <p className="text-xs text-zinc-500">Fast Next.js SSR/ISR rendering with responsive grid layout</p>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-lg">
                    Full Builder Controls
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">HERO SLIDER</span>
                    <p className="text-xs font-semibold text-zinc-900">Dynamic Promotional Banner</p>
                    <p className="text-[11px] text-zinc-500">Curated deal banners with CTA buttons</p>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">PRODUCT GRID</span>
                    <p className="text-xs font-semibold text-zinc-900">Featured & Best Sellers</p>
                    <p className="text-[11px] text-zinc-500">Live filters, search and instant cart drawer</p>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CHECKOUT FLOW</span>
                    <p className="text-xs font-semibold text-zinc-900">Guest Checkout & Mobile Pay</p>
                    <p className="text-[11px] text-zinc-500">1-step ordering with automated invoice delivery</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-zinc-950">Catalog & Inventory Management</h4>
                    <p className="text-xs text-zinc-500">Manage SKUs, variants, categories, and automated stock alerts</p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-100 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-100">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Stock Level</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-zinc-900">Nike Air Max 270</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-500">NK-AM270-BR</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-medium">86 in stock</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳ 13,387</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-zinc-900">AirPods Pro (2nd Gen)</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-500">APL-APP2-USBC</td>
                        <td className="py-2.5 px-3 text-amber-600 font-medium">12 in stock (Low)</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳ 24,990</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-zinc-900">Smart Fitness Band 8</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-500">MI-BAND-8-BLK</td>
                        <td className="py-2.5 px-3 text-emerald-600 font-medium">145 in stock</td>
                        <td className="py-2.5 px-3 text-right font-bold">৳ 3,850</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-zinc-950">Order Pipeline & Logistics</h4>
                    <p className="text-xs text-zinc-500">Track order lifecycle from placement to doorstep delivery</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">PENDING</span>
                    <p className="text-xl font-bold text-zinc-900">14</p>
                    <p className="text-[10px] text-zinc-500">Awaiting review</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                    <span className="text-[10px] font-bold text-blue-500">PROCESSING</span>
                    <p className="text-xl font-bold text-blue-900">38</p>
                    <p className="text-[10px] text-blue-600">Packing in warehouse</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                    <span className="text-[10px] font-bold text-purple-500">WITH COURIER</span>
                    <p className="text-xl font-bold text-purple-900">62</p>
                    <p className="text-[10px] text-purple-600">Steadfast / Pathao</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600">DELIVERED</span>
                    <p className="text-xl font-bold text-emerald-950">1,134</p>
                    <p className="text-[10px] text-emerald-700">Completed this month</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-lg font-bold text-zinc-950">Real-Time Store Intelligence</h4>
                  <p className="text-xs text-zinc-500">Conversion funnels, top product metrics, and revenue breakdown</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">AVERAGE ORDER VALUE</span>
                    <p className="text-2xl font-bold text-zinc-950">৳ 2,840</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">+12% vs last month</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">CHECKOUT CONVERSION</span>
                    <p className="text-2xl font-bold text-zinc-950">4.2%</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">+0.8% with 1-step checkout</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">REPEAT CUSTOMER RATE</span>
                    <p className="text-2xl font-bold text-zinc-950">34.6%</p>
                    <p className="text-[10px] text-blue-600 font-semibold">Healthy customer loyalty</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-lg font-bold text-zinc-950">Customer Profiles & Order History</h4>
                  <p className="text-xs text-zinc-500">Full 360-degree customer records, lifetime value, and order history</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-zinc-900">Mohammad Ali Nayeem</p>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        VIP Customer
                      </span>
                    </div>
                    <p className="text-zinc-500">nayeem@example.com · +880 1711-223344</p>
                    <div className="pt-2 border-t border-zinc-200/60 flex justify-between">
                      <span className="text-zinc-400">Total Spent:</span>
                      <span className="font-bold text-zinc-900">৳ 84,200 (6 orders)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-zinc-900">Tanvir Ahmed</p>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold">
                        Active Buyer
                      </span>
                    </div>
                    <p className="text-zinc-500">tanvir@example.com · +880 1819-554433</p>
                    <div className="pt-2 border-t border-zinc-200/60 flex justify-between">
                      <span className="text-zinc-400">Total Spent:</span>
                      <span className="font-bold text-zinc-900">৳ 18,500 (3 orders)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-lg font-bold text-zinc-950">Store Preferences & Payment Rules</h4>
                  <p className="text-xs text-zinc-500">Configure Cash on Delivery, bKash merchant credentials, tax, and shipping zones</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">GUEST CHECKOUT</span>
                    <p className="text-xs font-bold text-emerald-700">Enabled</p>
                    <p className="text-[11px] text-zinc-500">Customers can order without logging in</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">PAYMENT GATEWAYS</span>
                    <p className="text-xs font-bold text-zinc-900">COD, bKash, Nagad</p>
                    <p className="text-[11px] text-zinc-500">Instant merchant verification enabled</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400">DELIVERY ZONES</span>
                    <p className="text-xs font-bold text-zinc-900">Inside & Outside Dhaka</p>
                    <p className="text-[11px] text-zinc-500">Dynamic zone fee calculation</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
