"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Blocks, Monitor, Smartphone, Tablet, Eye, Check, ArrowRight,
} from "lucide-react";
import { SectionHeading } from "./section-heading";

const highlights = [
  "Drag & drop section-based builder",
  "Live preview while editing",
  "Customize colors, typography, and layout",
  "Mobile, tablet, and desktop preview modes",
  "Custom sections for banners, products, testimonials",
  "No coding required — visual editing only",
];

const devices = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export function StoreBuilder() {
  const [device, setDevice] = useState("desktop");

  return (
    <section id="builder" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Store Builder"
          title="Visual Drag & Drop Builder"
          description="Design your storefront visually with live preview. No code, no complexity."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center"
        >
          {/* Left: Feature List */}
          <div className="space-y-4">
            {highlights.map((h) => (
              <div key={h} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-3.5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Check className="h-3 w-3 text-blue-600" />
                </span>
                <span className="text-sm font-medium text-zinc-700">{h}</span>
              </div>
            ))}
            <Link
              href="/register"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
            >
              Try Store Builder <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: Preview Mockup */}
          <div className="relative">
            {/* Device Switcher */}
            <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200/60 bg-white p-1 shadow-sm">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    device === d.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  <d.icon className="h-3.5 w-3.5" />
                  {d.label}
                </button>
              ))}
            </div>

            {/* Preview Frame */}
            <div
              className={`overflow-hidden rounded-[1.75rem] border border-zinc-200/60 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all ${
                device === "mobile" ? "mx-auto max-w-[280px]" : device === "tablet" ? "mx-auto max-w-[480px]" : "w-full"
              }`}
            >
              {/* Store Preview Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                  <div className="h-2.5 w-16 rounded-full bg-zinc-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-8 rounded-full bg-zinc-100" />
                  <div className="h-2 w-6 rounded-full bg-zinc-100" />
                </div>
              </div>

              {/* Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 sm:p-6 text-white">
                <div className="mb-1 h-2 w-20 rounded-full bg-white/30" />
                <div className="mb-2 h-4 w-40 rounded-full bg-white/40" />
                <div className="mb-3 h-2 w-32 rounded-full bg-white/20" />
                <div className="inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  Shop Now →
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-3 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-zinc-100 p-2.5">
                    <div className="mb-2 aspect-square w-full rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-50" />
                    <div className="mb-1.5 h-2 w-3/4 rounded-full bg-zinc-200" />
                    <div className="h-2 w-1/3 rounded-full bg-zinc-100" />
                  </div>
                ))}
              </div>

              {/* Editor Overlay Hint */}
              <div className="flex items-center justify-center border-t border-zinc-100 bg-zinc-50 px-4 py-2.5">
                <Eye className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-500">Live Preview</span>
                <span className="mx-2 text-zinc-300">·</span>
                <Blocks className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">Edit Sections</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
