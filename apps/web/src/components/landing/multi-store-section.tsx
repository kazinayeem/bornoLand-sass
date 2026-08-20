"use client";

import { landingContainer } from "./landing-ui";
import {
  Layers,
  Store,
  Plus,
  ShieldCheck,
  Globe,
  Users,
  Settings2,
  Package,
  ShoppingBag,
} from "lucide-react";

export function MultiStoreSection() {
  const STORES = [
    {
      name: "TechGear Electronics",
      domain: "techgear.bornoland.com",
      status: "Active",
      orders: "1,248 orders",
      badge: "Primary Store",
      color: "bg-blue-500",
    },
    {
      name: "Modest Living Home",
      domain: "modestliving.store",
      status: "Active",
      orders: "482 orders",
      badge: "Custom Domain",
      color: "bg-emerald-500",
    },
    {
      name: "Organic Superfood BD",
      domain: "organic.bornoland.com",
      status: "Active",
      orders: "934 orders",
      badge: "Subdomain",
      color: "bg-amber-500",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Architectural Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                MULTI-STORE SAAS ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
                One account. <br />
                Multiple businesses.
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
                Scale your retail empire with isolated storefronts, independent inventory catalogs, dedicated domain names, and separate order databases under one central login.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Package className="h-4 w-4 text-zinc-400" />
                  Separate Products
                </div>
                <p className="text-zinc-500">Each store maintains its own catalog, SKUs, and pricing.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <ShoppingBag className="h-4 w-4 text-zinc-400" />
                  Isolated Orders
                </div>
                <p className="text-zinc-500">Dedicated invoices, fulfillment pipelines, and customer lists.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Globe className="h-4 w-4 text-zinc-400" />
                  Independent Domains
                </div>
                <p className="text-zinc-500">Attach distinct custom apex domains to each store.</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-zinc-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-zinc-900 font-bold">
                  <Users className="h-4 w-4 text-zinc-400" />
                  Team Permissions
                </div>
                <p className="text-zinc-500">Grant staff access to specific stores or entire workspaces.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Store Hierarchy Visualization */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
                    W
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Merchant Master Workspace</p>
                    <p className="text-[10px] text-zinc-400">Owner Account · 3 Active Stores</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-700">
                  PRO PLAN
                </span>
              </div>

              {/* Store List */}
              <div className="space-y-2.5">
                {STORES.map((store, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-zinc-200/70 bg-zinc-50/60 hover:bg-zinc-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${store.color}`} />
                      <div>
                        <p className="font-bold text-zinc-900">{store.name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">{store.domain}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-zinc-200 text-zinc-700">
                        {store.badge}
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-1">{store.orders}</p>
                    </div>
                  </div>
                ))}

                {/* Add Store Action Button */}
                <button
                  type="button"
                  className="w-full py-3 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-500" />
                  Create New Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
