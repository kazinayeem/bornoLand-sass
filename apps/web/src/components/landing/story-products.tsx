"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  Boxes,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Truck,
  ArrowDownUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryProducts() {
  const { locale, t } = useLandingLocale();
  const [selectedHub, setSelectedHub] = useState<"hubA" | "dhanmondi" | "ctg">("hubA");

  const INVENTORY_DATA = {
    hubA: [
      { name: "Premium Cotton Panjabi", sku: "PNJ-COT-01", stock: 450, cost: "৳৯৮০", status: "In Stock", alert: false },
      { name: "Wireless Earbuds Pro", sku: "EBD-WRL-04", stock: 12, cost: "৳১,৪০০", status: "Low Stock", alert: true },
      { name: "Classic Linen Shirt", sku: "SHR-LIN-02", stock: 240, cost: "৳৬২০", status: "In Stock", alert: false },
      { name: "Leather Formal Belt", sku: "BLT-LTH-09", stock: 8, cost: "৳৩৫০", status: "Low Stock", alert: true },
    ],
    dhanmondi: [
      { name: "Premium Cotton Panjabi", sku: "PNJ-COT-01", stock: 45, cost: "৳৯৮০", status: "In Stock", alert: false },
      { name: "Wireless Earbuds Pro", sku: "EBD-WRL-04", stock: 18, cost: "৳১,৪০০", status: "In Stock", alert: false },
      { name: "Classic Linen Shirt", sku: "SHR-LIN-02", stock: 6, cost: "৳৬২০", status: "Low Stock", alert: true },
      { name: "Leather Formal Belt", sku: "BLT-LTH-09", stock: 22, cost: "৳৩৫০", status: "In Stock", alert: false },
    ],
    ctg: [
      { name: "Premium Cotton Panjabi", sku: "PNJ-COT-01", stock: 120, cost: "৳৯৮০", status: "In Stock", alert: false },
      { name: "Wireless Earbuds Pro", sku: "EBD-WRL-04", stock: 35, cost: "৳১,৪০০", status: "In Stock", alert: false },
      { name: "Classic Linen Shirt", sku: "SHR-LIN-02", stock: 80, cost: "৳৬২০", status: "In Stock", alert: false },
      { name: "Leather Formal Belt", sku: "BLT-LTH-09", stock: 4, cost: "৳৩৫০", status: "Low Stock", alert: true },
    ],
  };

  const currentItems = INVENTORY_DATA[selectedHub];

  return (
    <section id="inventory" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Value Copy */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal direction="down" delay={50}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {t.inventory.eyebrow}
              </span>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                {t.inventory.title}
              </h2>
            </Reveal>

            <Reveal direction="up" delay={160}>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                {t.inventory.description}
              </p>
            </Reveal>

            <Reveal direction="up" delay={220}>
              <div className="space-y-3 pt-2">
                {t.inventory.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={280}>
              <div className="pt-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-all"
                >
                  <span>{t.inventory.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Multi-Warehouse Inventory Dashboard Mockup */}
          <div className="lg:col-span-7">
            <Reveal direction="scale" delay={180}>
              <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-5 sm:p-6 shadow-md space-y-4">
                {/* Warehouse Location Switcher */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-[#003399]" />
                    <span className="font-extrabold text-zinc-950">Multi-Warehouse Inventory Ledger</span>
                  </div>

                  {/* Warehouse Tabs */}
                  <div className="flex gap-1">
                    {[
                      { id: "hubA", label: "Central Hub A" },
                      { id: "dhanmondi", label: "Dhanmondi Branch" },
                      { id: "ctg", label: "Chittagong Hub" },
                    ].map((hub) => (
                      <button
                        key={hub.id}
                        type="button"
                        onClick={() => setSelectedHub(hub.id as any)}
                        className={cn(
                          "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                          selectedHub === hub.id
                            ? "bg-[#003399] text-white shadow-2xs"
                            : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        )}
                      >
                        {hub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Overview Table */}
                <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-500">
                        <th className="py-2.5 px-3.5">Product SKU</th>
                        <th className="py-2.5 px-3.5">Stock Level</th>
                        <th className="py-2.5 px-3.5">True Cost (FIFO)</th>
                        <th className="py-2.5 px-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {currentItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-3 px-3.5">
                            <p className="font-bold text-zinc-900">{item.name}</p>
                            <p className="font-mono text-[10px] text-zinc-400">{item.sku}</p>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-zinc-950">
                            {item.stock} units
                          </td>
                          <td className="py-3 px-3.5 font-mono text-zinc-600">
                            {item.cost}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            {item.alert ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0A8A00] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3 text-[#0A8A00]" />
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Real-Time Stock Transfer & Inbound Notification */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs text-zinc-700">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4 text-[#003399]" />
                    <span className="font-bold text-[#003399]">PO #482 Inbound Received:</span>
                    <span className="text-zinc-600">500 units added to Central Hub A</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Auto-Adjusted
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
