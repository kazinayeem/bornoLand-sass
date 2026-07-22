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
import { cn } from "@/lib/utils";
import {
  landingBtnPrimary,
  landingBtnSecondary,
  landingContainer,
  landingPreviewShadow,
  landingProse,
  staggerContainer,
  staggerItem,
} from "./landing-ui";

export function Hero() {
  const { t } = useLandingLocale();
  const h = t.hero;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-apple-canvas-parchment pt-[7.5rem] sm:pt-[8.5rem] lg:pt-[9rem]"
    >
      <div className={landingContainer}>
        <motion.div
          key={h.titleHighlight}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="pb-16 sm:pb-20 lg:pb-24"
        >
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div className="mx-auto w-full max-w-xl text-center md:text-left lg:mx-0">
              <motion.div
                variants={staggerItem}
                className="mb-4 inline-flex max-w-full items-center gap-1.5 rounded-pill border border-apple-hairline bg-apple-canvas px-3.5 py-1.5 text-caption-strong text-apple-primary sm:mb-5"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{h.badge}</span>
              </motion.div>

              <motion.h1
                id="hero-heading"
                variants={staggerItem}
                className="text-hero-display text-balance text-apple-ink"
              >
                {h.titleLine1}
                <br />
                <span className="text-apple-primary">{h.titleHighlight}</span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className={cn(landingProse, "mx-auto mt-4 sm:mt-5 md:mx-0")}
              >
                {h.description}
              </motion.p>

              <motion.div
                variants={staggerItem}
                className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap md:mx-0"
              >
                <Link href="/register" className={`${landingBtnPrimary} group`}>
                  {h.primaryCta}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link href="#builder" className={landingBtnSecondary}>
                  <Play className="h-4 w-4 shrink-0" aria-hidden />
                  {h.secondaryCta}
                </Link>
              </motion.div>

              <motion.ul
                variants={staggerItem}
                className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2.5 sm:gap-x-5 md:justify-start"
                aria-label="Benefits"
              >
                {h.benefits.map((b) => (
                  <li key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-apple-ink-muted-48">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50" aria-hidden>
                      <Check className="h-2.5 w-2.5 text-apple-primary" />
                    </span>
                    {b}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div variants={staggerItem} className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div
                className={`relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas ${landingPreviewShadow}`}
                role="img"
                aria-label={h.dashboard}
              >
                <div className="flex items-center justify-between border-b border-apple-divider-soft px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-apple-primary">
                      <Store className="h-3 w-3 text-white" aria-hidden />
                    </div>
                    <span className="text-xs font-semibold text-apple-ink">{h.dashboard}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    <span className="text-[11px] font-medium text-emerald-600">{h.live}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="mb-4 rounded-xl bg-apple-canvas-parchment p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-apple-ink-muted-48">{h.revenueMonth}</span>
                      <span className="text-lg font-bold tabular-nums text-apple-ink sm:text-xl">৳48,200</span>
                    </div>
                    <div className="flex h-16 items-end gap-1 sm:h-20 sm:gap-1.5" aria-hidden>
                      {[35, 45, 30, 55, 40, 60, 50, 65, 55, 70, 62, 80, 75, 90].map((bar, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${bar}%`,
                            opacity: 0.55 + (bar / 100) * 0.45,
                            backgroundColor: i === 13 ? "#0066cc" : i > 10 ? "#2997ff" : "#93c5fd",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {[
                      { icon: ShoppingCart, label: h.orders, value: "342", color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: Package, label: h.products, value: "1,247", color: "text-violet-600", bg: "bg-violet-50" },
                      { icon: Users, label: h.customers, value: "892", color: "text-amber-600", bg: "bg-amber-50" },
                      { icon: BarChart3, label: h.conversion, value: "3.2%", color: "text-emerald-600", bg: "bg-emerald-50" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex min-h-[4.5rem] items-center gap-2.5 rounded-xl border border-apple-divider-soft bg-apple-canvas p-3"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                          <s.icon className={`h-4 w-4 ${s.color}`} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-apple-ink-muted-48">{s.label}</p>
                          <p className="text-sm font-bold tabular-nums text-apple-ink">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
