"use client";

import { landingContainer } from "./landing-ui";
import { Package, ArrowRight, CheckCircle2, Layers, Tag, Sparkles } from "lucide-react";

export function StoryProducts() {
  const PRODUCTS = [
    {
      name: "Nike Air Max 270",
      sku: "NK-AM270-BR",
      variants: "4 Sizes · 2 Colors",
      stock: "86 in stock",
      price: "৳ 13,387",
      status: "Active in Store",
    },
    {
      name: "AirPods Pro (2nd Gen)",
      sku: "APL-APP2-USBC",
      variants: "White · MagSafe",
      stock: "24 in stock",
      price: "৳ 24,990",
      status: "Active in Store",
    },
    {
      name: "Smart Fitness Band 8",
      sku: "MI-BAND-8-BLK",
      variants: "Black · TPU Strap",
      stock: "145 in stock",
      price: "৳ 3,850",
      status: "Active in Store",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            STEP 02 · SELL
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Once your store is ready, <br className="hidden sm:inline" />
            bring your products to life.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Create products with multidimensional variant matrices, set individual SKU prices, and watch them publish to your storefront instantly.
          </p>
        </div>

        {/* Large Product Management Interface */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <Package className="h-4 w-4 text-blue-600" />
              <span>Catalog Management</span>
            </div>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
              LIVE SYNC ACTIVE
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60 text-[10px] font-bold uppercase text-zinc-400">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Variants</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Storefront Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {PRODUCTS.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-zinc-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">{p.sku}</td>
                    <td className="py-3.5 px-4 text-zinc-600">{p.variants}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold">{p.stock}</td>
                    <td className="py-3.5 px-4 font-extrabold text-zinc-950">{p.price}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> {p.status}
                      </span>
                    </td>
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
