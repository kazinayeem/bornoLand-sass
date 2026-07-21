"use client";

import { motion } from "framer-motion";
import { Check, ShoppingBag, Palette, Ruler, Package, Search, Layers3, Tags, Bell } from "lucide-react";
import { SectionHeading } from "./section-heading";

const features = [
  { icon: Palette, title: "Variants", description: "Size, color, material — unlimited options per product" },
  { icon: Ruler, title: "Size & Color", description: "Matrix-based variant generation with auto-combinations" },
  { icon: Package, title: "Inventory", description: "Per-variant stock tracking with low-stock alerts" },
  { icon: Tags, title: "SKU", description: "Auto-generated and custom SKU codes per variant" },
  { icon: Layers3, title: "Bulk Edit", description: "Update prices, stock, and status across multiple products" },
  { icon: Bell, title: "Stock Alerts", description: "Get notified when inventory runs low on any product" },
  { icon: Search, title: "Product SEO", description: "Custom slugs, meta titles, descriptions, and social previews" },
];

export function ProductManagement() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas">
              <div className="border-b border-apple-divider-soft px-5 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-apple-ink">Products</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">1,247 total</span>
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">24 low stock</span>
                  </div>
                </div>
              </div>
              {[
                { name: "Classic Cotton T-Shirt", sku: "TEE-001", price: "৳2,999", stock: 150, variant: "S, M, L, XL" },
                { name: "Running Sneakers Pro", sku: "SNK-001", price: "৳12,999", stock: 75, variant: "Red, Blue, Black / 40-45" },
                { name: "Chronograph Watch", sku: "WCH-001", price: "৳24,999", stock: 12, variant: "Gold, Silver / Leather, Steel" },
                { name: "Wireless Earbuds", sku: "EAR-001", price: "৳8,999", stock: 4, variant: "White, Black" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-zinc-50 px-5 py-3 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-apple-canvas-parchment" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-apple-ink truncate">{p.name}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">{p.sku} · {p.variant}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-apple-ink">{p.price}</p>
                    <p className={`text-[10px] font-medium ${p.stock < 10 ? "text-red-500" : "text-apple-ink-muted-48"}`}>{p.stock} in stock</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-apple-divider-soft bg-apple-canvas-parchment px-5 py-2 text-center">
                <span className="text-[10px] font-medium text-apple-ink-muted-48">View all products →</span>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="absolute -bottom-3 -right-3 rounded-xl border border-apple-hairline bg-apple-canvas px-3.5 py-2"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold text-apple-ink-muted-80">
                <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />
                Variants Supported
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeading
              align="left"
              eyebrow="Product Management"
              title="Powerful Product Controls"
              description="Manage unlimited products with variants, SKUs, inventory tracking, bulk editing, and SEO optimizations."
            />
            <div className="mt-6 space-y-3">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-3 w-3 text-blue-600" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-apple-ink">{f.title}</p>
                    <p className="text-xs text-apple-ink-muted-48">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
