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
    <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/8 via-indigo-500/5 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-purple-500/6 to-transparent blur-3xl" />
        <div className="absolute left-0 top-1/3 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-cyan-500/6 to-transparent blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left Column */}
          <div className="relative">
            <motion.div variants={itemVariants} className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by Growing Businesses
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold leading-[1.1] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl">
              Build Your Ecommerce
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Store in Minutes</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-5 max-w-lg text-base leading-relaxed text-zinc-500 sm:text-lg">
              Create your online store, manage products, orders, payments, delivery, customers, and analytics from one powerful platform.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#builder"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/70 px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-white hover:shadow-md"
              >
                <Play className="h-4 w-4" />
                View Demo
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {benefits.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-2.5 w-2.5 text-blue-600" />
                  </span>
                  {b}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg lg:max-w-none">
              {/* Main Dashboard Card */}
              <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-zinc-200/60 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600">
                      <Store className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-800">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-medium text-emerald-600">Live</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 sm:p-5">
                  {/* Revenue Chart */}
                  <div className="mb-4 rounded-xl bg-zinc-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-500">Revenue (This Month)</span>
                      <span className="text-lg font-bold text-zinc-900">৳48,200</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[35, 45, 30, 55, 40, 60, 50, 65, 55, 70, 62, 80, 75, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${h}%`,
                            background: i === 13
                              ? "linear-gradient(180deg, #3b82f6, #6366f1)"
                              : i > 10
                                ? "linear-gradient(180deg, #60a5fa, #818cf8)"
                                : "linear-gradient(180deg, #93c5fd, #a5b4fc)",
                            opacity: 0.6 + (h / 100) * 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { icon: ShoppingCart, label: "Orders", value: "342", color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: Package, label: "Products", value: "1,247", color: "text-violet-600", bg: "bg-violet-50" },
                      { icon: Users, label: "Customers", value: "892", color: "text-amber-600", bg: "bg-amber-50" },
                      { icon: BarChart3, label: "Conversion", value: "3.2%", color: "text-emerald-600", bg: "bg-emerald-50" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-zinc-100 bg-white p-2.5 sm:p-3 shadow-sm">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                          <s.icon className={`h-4 w-4 ${s.color}`} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-zinc-400">{s.label}</p>
                          <p className="text-sm font-bold text-zinc-900">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              {floatingCards.map((card) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: card.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute -right-3 top-[calc(${card.delay === 0.3 ? "15%" : card.delay === 0.5 ? "38%" : card.delay === 0.7 ? "58%" : "78%"})] hidden rounded-xl border border-zinc-200/60 bg-white/90 px-3.5 py-2.5 shadow-lg backdrop-blur-md lg:flex items-center gap-2.5`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-zinc-400">{card.label}</p>
                    <p className="text-xs font-bold text-zinc-900">{card.value}</p>
                  </div>
                </motion.div>
              ))}

              {/* Gradient Glow */}
              <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-transparent opacity-50 blur-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
