"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Users, Target, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

const stats = [
  { icon: TrendingUp, label: "Revenue", value: "৳48,200", change: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: ShoppingCart, label: "Orders", value: "342", change: "+8.2%", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Users, label: "Customers", value: "892", change: "+15.3%", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Target, label: "Conversion", value: "3.2%", change: "+0.8%", color: "text-amber-600", bg: "bg-amber-50" },
];

const topProducts = [
  { name: "Classic Cotton T-Shirt", revenue: "৳45,800", orders: 152 },
  { name: "Running Sneakers Pro", revenue: "৳38,400", orders: 98 },
  { name: "Wireless Earbuds", revenue: "৳32,100", orders: 124 },
  { name: "Leather Crossbody Bag", revenue: "৳28,700", orders: 87 },
  { name: "Chronograph Watch", revenue: "৳24,500", orders: 63 },
];

export function AnalyticsSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Analytics"
          title="Data-Driven Insights"
          description="Track revenue, orders, customer growth, and product performance with visual dashboards."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-apple-hairline bg-apple-canvas p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
                    <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                    {s.change} <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-apple-ink">{s.value}</p>
                <p className="text-xs font-medium text-apple-ink-muted-48">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Chart Area */}
            <div className="rounded-lg border border-apple-hairline bg-apple-canvas p-5">
              <h3 className="mb-4 text-sm font-bold text-apple-ink">Revenue Overview</h3>
              <div className="flex items-end gap-2 h-40">
                {[28, 35, 22, 42, 30, 48, 38, 52, 45, 58, 50, 65, 55, 72, 62, 78, 68, 85, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i > 15 ? "#3b82f6" : i > 10 ? "#60a5fa" : "#93c5fd",
                      opacity: 0.5 + (h / 100) * 0.5,
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] font-medium text-apple-ink-muted-48">
                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
              </div>
            </div>

            {/* Top Products */}
            <div className="rounded-lg border border-apple-hairline bg-apple-canvas p-5">
              <h3 className="mb-3 text-sm font-bold text-apple-ink">Top Products</h3>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-bold text-zinc-300 w-4">{i + 1}</span>
                      <span className="text-xs font-medium text-apple-ink-muted-80 truncate">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-apple-ink">{p.revenue}</p>
                      <p className="text-[10px] text-apple-ink-muted-48">{p.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
