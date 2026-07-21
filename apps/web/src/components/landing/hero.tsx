"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play, TrendingUp, ShoppingCart, Package, Users, BarChart3, Store,
  Sparkles, Check, ArrowRight
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const benefits = [
  "No Coding Required", "Custom Domain Support",
  "Mobile Friendly", "SSL Included", "Unlimited Products"
];

const floatingCards = [
  { icon: TrendingUp, label: "Revenue", value: "৳48,200", color: "text-emerald-500", bg: "bg-emerald-50", delay: 0.3 },
  { icon: ShoppingCart, label: "Orders", value: "342", color: "text-blue-500", bg: "bg-blue-50", delay: 0.5 },
  { icon: Package, label: "Products", value: "1,247", color: "text-violet-500", bg: "bg-violet-50", delay: 0.7 },
  { icon: Users, label: "Customers", value: "892", color: "text-amber-500", bg: "bg-amber-50", delay: 0.9 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-apple-canvas-parchment px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="relative">
            <motion.div variants={itemVariants} className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by Growing Businesses
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold leading-[1.1] tracking-tight text-apple-ink sm:text-5xl lg:text-6xl xl:text-7xl">
              Build Your Ecommerce
              <br />
              <span className="text-apple-primary">Store in Minutes</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-5 max-w-lg text-base leading-relaxed text-apple-ink-muted-48 sm:text-lg">
              Create your online store, manage products, orders, payments, delivery, customers, and analytics from one powerful platform.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-apple-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#builder"
                className="inline-flex items-center gap-2 rounded-xl border border-apple-hairline bg-apple-canvas/70 px-6 py-3 text-sm font-semibold text-apple-ink-muted-80 backdrop-blur-sm transition-colors hover:border-zinc-300 hover:bg-apple-canvas"
              >
                <Play className="h-4 w-4" />
                View Demo
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {benefits.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-apple-ink-muted-48">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-2.5 w-2.5 text-blue-600" />
                  </span>
                  {b}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="relative">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg lg:max-w-none">
              <div className="relative h-full w-full overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-apple-divider-soft px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-apple-primary">
                      <Store className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-800">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-medium text-emerald-600">Live</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-4 rounded-xl bg-apple-canvas-parchment p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-apple-ink-muted-48">Revenue (This Month)</span>
                      <span className="text-lg font-bold text-apple-ink">৳48,200</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[35, 45, 30, 55, 40, 60, 50, 65, 55, 70, 62, 80, 75, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-blue-500 transition-all duration-500"
                          style={{
                            height: `${h}%`,
                            opacity: 0.6 + (h / 100) * 0.4,
                            backgroundColor: i === 13 ? "#3b82f6" : i > 10 ? "#60a5fa" : "#93c5fd",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { icon: ShoppingCart, label: "Orders", value: "342", color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: Package, label: "Products", value: "1,247", color: "text-violet-600", bg: "bg-violet-50" },
                      { icon: Users, label: "Customers", value: "892", color: "text-amber-600", bg: "bg-amber-50" },
                      { icon: BarChart3, label: "Conversion", value: "3.2%", color: "text-emerald-600", bg: "bg-emerald-50" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-apple-divider-soft bg-apple-canvas p-2.5 sm:p-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                          <s.icon className={`h-4 w-4 ${s.color}`} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-apple-ink-muted-48">{s.label}</p>
                          <p className="text-sm font-bold text-apple-ink">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {floatingCards.map((card) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: card.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute -right-3 top-[calc(${card.delay === 0.3 ? "15%" : card.delay === 0.5 ? "38%" : card.delay === 0.7 ? "58%" : "78%"})] hidden rounded-xl border border-apple-hairline bg-apple-canvas/90 px-3.5 py-2.5 backdrop-blur-md lg:flex items-center gap-2.5`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-apple-ink-muted-48">{card.label}</p>
                    <p className="text-xs font-bold text-apple-ink">{card.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
