"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Store,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { useLandingLocale } from "./landing-locale";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function Hero() {
  const { t } = useLandingLocale();
  const h = t.hero;

  return (
    <section className="relative overflow-hidden bg-apple-canvas-parchment px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
      <motion.div
        key={h.titleHighlight}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <motion.div
              variants={itemVariants}
              className="mb-5 inline-flex items-center gap-1.5 rounded-pill border border-apple-hairline bg-apple-canvas px-3.5 py-1.5 text-caption-strong text-apple-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {h.badge}
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-hero-display text-apple-ink">
              {h.titleLine1}
              <br />
              <span className="text-apple-primary">{h.titleHighlight}</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-5 max-w-lg text-lead text-apple-ink-muted-80">
              {h.description}
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="btn-press group inline-flex items-center gap-2 rounded-pill bg-apple-primary px-7 py-[14px] text-[18px] font-light text-apple-on-primary"
              >
                {h.primaryCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#builder"
                className="btn-press inline-flex items-center gap-2 rounded-pill border border-apple-primary bg-transparent px-[22px] py-[11px] text-body text-apple-primary"
              >
                <Play className="h-4 w-4" />
                {h.secondaryCta}
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {h.benefits.map((b) => (
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
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)] lg:max-w-none">
              <div className="flex items-center justify-between border-b border-apple-divider-soft px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-apple-primary">
                    <Store className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-800">{h.dashboard}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-medium text-emerald-600">{h.live}</span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-4 rounded-xl bg-apple-canvas-parchment p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-apple-ink-muted-48">{h.revenueMonth}</span>
                    <span className="text-lg font-bold text-apple-ink">৳48,200</span>
                  </div>
                  <div className="flex h-20 items-end gap-1.5">
                    {[35, 45, 30, 55, 40, 60, 50, 65, 55, 70, 62, 80, 75, 90].map((bar, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-blue-500"
                        style={{
                          height: `${bar}%`,
                          opacity: 0.55 + (bar / 100) * 0.45,
                          backgroundColor: i === 13 ? "#0066cc" : i > 10 ? "#2997ff" : "#93c5fd",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: ShoppingCart, label: h.orders, value: "342", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: Package, label: h.products, value: "1,247", color: "text-violet-600", bg: "bg-violet-50" },
                    { icon: Users, label: h.customers, value: "892", color: "text-amber-600", bg: "bg-amber-50" },
                    { icon: BarChart3, label: h.conversion, value: "3.2%", color: "text-emerald-600", bg: "bg-emerald-50" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2.5 rounded-xl border border-apple-divider-soft bg-apple-canvas p-3"
                    >
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
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
