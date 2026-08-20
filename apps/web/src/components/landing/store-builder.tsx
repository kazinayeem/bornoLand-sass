"use client";

import Link from "next/link";
import { landingContainer } from "./landing-ui";
import {
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  Eye,
  Sliders,
  Move,
  ArrowRight,
  Palette,
  LayoutGrid,
} from "lucide-react";

export function StoreBuilder() {
  return (
    <section id="builder" className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            VISUAL STOREFRONT BUILDER
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Build your store your way.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Drag, drop, customize, publish. An intuitive visual editor that produces high-converting, responsive storefronts automatically.
          </p>
        </div>

        {/* Builder Studio Visual Representation */}
        <div className="max-w-5xl mx-auto relative">
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-900 text-white shadow-2xl overflow-hidden">
            {/* Top Editor Toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-zinc-950 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-zinc-400 font-medium">Storefront Builder · Home Page</span>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 rounded-lg bg-zinc-800 p-0.5">
                <button className="px-2.5 py-1 rounded bg-zinc-700 text-[11px] font-semibold text-white flex items-center gap-1">
                  <Monitor className="h-3 w-3" /> Desktop
                </button>
                <button className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> Mobile
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  SAVED
                </span>
              </div>
            </div>

            {/* Builder 3-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
              {/* Left Column: Components Library */}
              <div className="hidden md:block md:col-span-3 border-r border-zinc-800 p-4 bg-zinc-950/60 space-y-3 text-xs">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  AVAILABLE SECTIONS
                </span>
                <div className="space-y-1.5">
                  {[
                    { name: "Hero Banner", active: true },
                    { name: "Categories Slider", active: false },
                    { name: "Popular Products", active: true },
                    { name: "Flash Deal of Day", active: false },
                    { name: "Testimonials", active: false },
                    { name: "Footer Branding", active: true },
                  ].map((sec, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg border text-[11px] cursor-grab ${
                        sec.active
                          ? "bg-zinc-800/90 border-zinc-700 text-white font-semibold"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Move className="h-3 w-3 text-zinc-500" />
                        {sec.name}
                      </span>
                      {sec.active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Canvas: Live Storefront Canvas */}
              <div className="md:col-span-6 p-5 bg-zinc-900/90 flex flex-col justify-center space-y-4">
                <div className="rounded-xl border border-zinc-700/80 bg-zinc-800/80 p-4 space-y-3 relative group">
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-blue-600 text-[9px] font-bold text-white uppercase tracking-wider">
                    Selected Section
                  </div>
                  <div className="h-20 rounded-lg bg-gradient-to-r from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                    Hero Slider — 50% Off Eid Collection
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded bg-zinc-700/60 flex items-center justify-center text-[10px] text-zinc-400">
                      Product Card 1
                    </div>
                    <div className="h-12 rounded bg-zinc-700/60 flex items-center justify-center text-[10px] text-zinc-400">
                      Product Card 2
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Properties & Design Inspector */}
              <div className="hidden md:block md:col-span-3 border-l border-zinc-800 p-4 bg-zinc-950/60 space-y-3 text-xs">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  PROPERTIES INSPECTOR
                </span>
                <div className="space-y-3 text-[11px]">
                  <div>
                    <label className="text-zinc-400 block mb-1">Layout Grid</label>
                    <div className="flex gap-1">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-white font-medium">4 Columns</span>
                      <span className="px-2 py-1 rounded bg-zinc-900 text-zinc-500">2 Columns</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-600 border border-white/20" />
                      <span className="font-mono text-zinc-300">#2563EB</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Button Style</label>
                    <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-200 block text-center">
                      Rounded Pill
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Feature Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-zinc-700">
            <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center gap-1.5">
              <Move className="h-3.5 w-3.5 text-zinc-500" /> Drag & Drop
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-zinc-500" /> 100% Responsive
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-zinc-500" /> Instant Live Preview
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" /> Reusable Section Blocks
            </span>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-950 hover:text-zinc-700 transition-colors"
            >
              Explore the Visual Builder
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
