"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Store, Package, ShoppingCart, Activity } from "lucide-react";

const metrics = [
  { icon: Store, value: "500+", label: "Stores Created" },
  { icon: Package, value: "10,000+", label: "Products Managed" },
  { icon: ShoppingCart, value: "50,000+", label: "Orders Processed" },
  { icon: Activity, value: "99.9%", label: "Uptime" },
];

export function FinalCTA() {
  return (
    <section id="contact" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 px-6 py-14 shadow-2xl sm:px-12 sm:py-16"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative text-center">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Start Your Online Business Today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-apple-ink-muted-48">
              Launch your store in minutes and grow your business with BornoLand. No coding, no hassle, no hidden fees.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-apple-ink shadow-lg transition-all hover:shadow-xl hover:brightness-105"
              >
                Create Free Store
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#builder"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
              >
                <Play className="h-4 w-4" />
                Book Demo
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-8 sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                    <m.icon className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white">{m.value}</p>
                  <p className="text-xs text-apple-ink-muted-48">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
