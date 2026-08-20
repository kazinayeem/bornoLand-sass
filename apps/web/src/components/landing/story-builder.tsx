"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Send,
  Move,
  CheckCircle2,
  Sliders,
  Layers,
  Palette,
} from "lucide-react";

export function StoryBuilder() {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            STEP 01 · BUILD
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Build a store that feels like yours.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Start with your storefront. Drag, drop, customize brand typography and colors, and publish in one click.
          </p>
        </div>

        {/* Large Builder Studio Container */}
        <div className="max-w-6xl mx-auto rounded-3xl border border-zinc-200/90 bg-zinc-900 text-white shadow-2xl overflow-hidden">
          {/* Top Studio Toolbar */}
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 px-5 py-3 bg-zinc-950 text-xs gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-zinc-400 font-medium">Visual Storefront Studio · Home Page</span>
            </div>

            {/* Viewport Toggles */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  device === "desktop" ? "bg-zinc-700 text-white shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3 w-3" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  device === "tablet" ? "bg-zinc-700 text-white shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Tablet className="h-3 w-3" /> Tablet
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  device === "mobile" ? "bg-zinc-700 text-white shadow-xs" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3 w-3" /> Mobile
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 flex items-center gap-1.5"
              >
                <Eye className="h-3 w-3" /> Live Preview
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-bold text-white shadow-xs flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" /> Publish Live
              </button>
            </div>
          </div>

          {/* 3-Pane Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
            {/* Left: Sections List */}
            <div className="hidden md:block md:col-span-3 border-r border-zinc-800 p-5 bg-zinc-950/60 space-y-4 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                PAGE SECTIONS (DRAG & DROP)
              </span>

              <div className="space-y-2">
                {[
                  { name: "Hero Banner Slider", active: true },
                  { name: "Category Carousels", active: false },
                  { name: "Popular Products (Grid)", active: true },
                  { name: "Flash Deal of Day", active: false },
                  { name: "Customer Testimonials", active: false },
                  { name: "Footer Branding", active: true },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] cursor-grab ${
                      s.active
                        ? "bg-zinc-800/90 border-zinc-700 text-white font-semibold shadow-xs"
                        : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Move className="h-3 w-3 text-zinc-500" />
                      {s.name}
                    </span>
                    {s.active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Live Storefront Canvas */}
            <div className="md:col-span-6 p-6 bg-zinc-900/90 flex flex-col justify-center items-center">
              <div
                className={`w-full rounded-2xl border border-zinc-700/80 bg-zinc-800/90 p-5 space-y-4 shadow-xl transition-all duration-300 ${
                  device === "mobile" ? "max-w-xs" : device === "tablet" ? "max-w-md" : "max-w-xl"
                }`}
              >
                <div className="h-24 rounded-xl bg-gradient-to-r from-blue-900/60 to-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">
                  Hero Banner · 50% Off Eid Collection
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-lg bg-zinc-800 border border-zinc-700/60 p-2 space-y-1">
                    <div className="h-2 w-16 bg-zinc-600 rounded" />
                    <div className="h-2 w-10 bg-blue-500 rounded" />
                  </div>
                  <div className="h-16 rounded-lg bg-zinc-800 border border-zinc-700/60 p-2 space-y-1">
                    <div className="h-2 w-16 bg-zinc-600 rounded" />
                    <div className="h-2 w-10 bg-blue-500 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings Inspector */}
            <div className="hidden md:block md:col-span-3 border-l border-zinc-800 p-5 bg-zinc-950/60 space-y-4 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                PROPERTIES INSPECTOR
              </span>

              <div className="space-y-3.5 text-[11px]">
                <div>
                  <label className="text-zinc-400 block mb-1.5">Brand Accent Color</label>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-blue-600 border border-white/20" />
                    <span className="font-mono text-zinc-300">#2563EB</span>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5">Layout Grid</label>
                  <div className="flex gap-1">
                    <span className="px-2.5 py-1 rounded bg-zinc-800 text-white font-medium">4 Columns</span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-500">2 Columns</span>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5">Typography Style</label>
                  <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 block">
                    Inter Display / Tight
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
