"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Blocks, Monitor, Smartphone, Tablet, Eye, Check, ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";

export function StoreBuilder() {
  const { t } = useLandingLocale();
  const b = t.builder;
  const [device, setDevice] = useState("desktop");

  const devices = [
    { id: "desktop", icon: Monitor, label: b.desktop },
    { id: "tablet", icon: Tablet, label: b.tablet },
    { id: "mobile", icon: Smartphone, label: b.mobile },
  ];

  return (
    <section id="builder" className="relative bg-apple-canvas-parchment px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={b.eyebrow} title={b.title} description={b.description} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
        >
          <div className="space-y-3">
            {b.why.map((line) => (
              <div
                key={line}
                className="flex items-start gap-3 rounded-xl border border-apple-divider-soft bg-apple-canvas p-3.5"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Check className="h-3 w-3 text-apple-primary" />
                </span>
                <span className="text-sm font-medium text-apple-ink-muted-80">{line}</span>
              </div>
            ))}
            <Link
              href="/register"
              className="mt-3 inline-flex items-center gap-2 rounded-pill bg-apple-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
            >
              {b.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl border border-apple-hairline bg-apple-canvas p-1">
              {devices.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    device === d.id ? "bg-zinc-900 text-white" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                  }`}
                >
                  <d.icon className="h-3.5 w-3.5" />
                  {d.label}
                </button>
              ))}
            </div>

            <div
              className={`overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas shadow-[0_28px_80px_-40px_rgba(0,0,0,0.4)] transition-all ${
                device === "mobile"
                  ? "mx-auto max-w-[280px]"
                  : device === "tablet"
                    ? "mx-auto max-w-[480px]"
                    : "w-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-apple-divider-soft px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-apple-primary" />
                  <div className="h-2.5 w-16 rounded-full bg-zinc-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-8 rounded-full bg-apple-canvas-parchment" />
                  <div className="h-2 w-6 rounded-full bg-apple-canvas-parchment" />
                </div>
              </div>

              <div className="bg-apple-primary p-6 text-white sm:p-8">
                <div className="mb-2 h-2 w-20 rounded-full bg-white/30" />
                <div className="mb-2 h-5 w-48 rounded-full bg-white/45" />
                <div className="mb-4 h-2 w-36 rounded-full bg-white/25" />
                <div className="inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  {b.shopNow}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-apple-divider-soft p-2.5">
                    <div className="mb-2 aspect-square w-full rounded-lg bg-apple-canvas-parchment" />
                    <div className="mb-1.5 h-2 w-3/4 rounded-full bg-zinc-200" />
                    <div className="h-2 w-1/3 rounded-full bg-apple-canvas-parchment" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center border-t border-apple-divider-soft bg-apple-canvas-parchment px-4 py-2.5">
                <Eye className="mr-1.5 h-3.5 w-3.5 text-apple-ink-muted-48" />
                <span className="text-xs font-medium text-apple-ink-muted-48">{b.livePreview}</span>
                <span className="mx-2 text-zinc-300">·</span>
                <Blocks className="mr-1.5 h-3.5 w-3.5 text-apple-primary" />
                <span className="text-xs font-medium text-apple-primary">{b.editSections}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
