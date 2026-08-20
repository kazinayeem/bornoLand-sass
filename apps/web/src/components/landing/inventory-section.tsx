"use client";

import { landingContainer } from "./landing-ui";
import { Package, AlertCircle, ArrowDownRight, Layers, Tag } from "lucide-react";

export function InventorySection() {
  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                INVENTORY & PRODUCT CATALOG
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
                From one product to thousands.
              </h2>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                Manage multidimensional variants (size, color, material), track real-time stock deductions per SKU, and set automated low-inventory alerts before you run out of best sellers.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
                <div className="h-6 w-6 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Complex Variant Matrix</p>
                  <p className="text-zinc-500">Combine multiple attributes with individual prices and barcode SKUs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
                <div className="h-6 w-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Automated Restock Alerts</p>
                  <p className="text-zinc-500">Get notified when any product SKU drops below your safety threshold.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Inventory Movement Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-900">Live Inventory Movement</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">SKU: NK-AM270-BR-105</span>
              </div>

              {/* Visual Flow: In Stock -> Sold -> Remaining */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">STARTING STOCK</span>
                  <p className="text-2xl font-extrabold text-zinc-900">128</p>
                  <p className="text-[10px] text-zinc-500">Initial Batch</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-500">UNITS SOLD</span>
                  <p className="text-2xl font-extrabold text-blue-900">42</p>
                  <p className="text-[10px] text-blue-600">Online Checkout</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600">CURRENT AVAILABLE</span>
                  <p className="text-2xl font-extrabold text-emerald-950">86</p>
                  <p className="text-[10px] text-emerald-700">Ready to Ship</p>
                </div>
              </div>

              {/* Variant Matrix Breakdown */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-3.5 space-y-2 text-xs">
                <p className="text-[11px] font-bold text-zinc-700">Variant Breakdown for Nike Air Max 270</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white border border-zinc-200">
                    <span className="text-zinc-400 block text-[10px]">US 9.0 / Black</span>
                    <span className="font-bold text-zinc-900">24 in stock</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-zinc-200">
                    <span className="text-zinc-400 block text-[10px]">US 9.5 / Black</span>
                    <span className="font-bold text-zinc-900">32 in stock</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-zinc-200">
                    <span className="text-zinc-400 block text-[10px]">US 10.0 / Red</span>
                    <span className="font-bold text-zinc-900">18 in stock</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-zinc-200">
                    <span className="text-zinc-400 block text-[10px]">US 10.5 / Red</span>
                    <span className="font-bold text-zinc-900">12 in stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
