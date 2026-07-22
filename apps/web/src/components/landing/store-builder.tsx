"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Blocks, Monitor, Smartphone, Tablet, Eye, Check, ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import {
  landingBtnPrimary,
  landingContainer,
  landingPreviewShadow,
  landingSectionAlt,
  LandingReveal,
} from "./landing-ui";

export function StoreBuilder() {
  const { t } = useLandingLocale();
  const b = t.builder;
  const [device, setDevice] = useState("desktop");
  const reduceMotion = useReducedMotion();

  const devices = [
    { id: "desktop", icon: Monitor, label: b.desktop },
    { id: "tablet", icon: Tablet, label: b.tablet },
    { id: "mobile", icon: Smartphone, label: b.mobile },
  ];

  return (
    <section id="builder" className={landingSectionAlt}>
      <div className={landingContainer}>
        <SectionHeading eyebrow={b.eyebrow} title={b.title} description={b.description} />

        <LandingReveal className="mt-10 grid gap-8 sm:mt-12 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="flex flex-col gap-3">
            {b.why.map((line) => (
              <div
                key={line}
                className="flex min-h-12 items-start gap-3 rounded-xl border border-apple-divider-soft bg-apple-canvas p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50" aria-hidden>
                  <Check className="h-3 w-3 text-apple-primary" />
                </span>
                <span className="text-sm font-medium leading-relaxed text-apple-ink-muted-80">{line}</span>
              </div>
            ))}
            <Link href="/register" className={`${landingBtnPrimary} mt-2 sm:w-fit`}>
              {b.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="flex min-w-0 flex-col">
            <div
              className="mb-4 flex items-center justify-center gap-1 rounded-xl border border-apple-hairline bg-apple-canvas p-1"
              role="tablist"
              aria-label="Preview device"
            >
              {devices.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={device === d.id}
                  onClick={() => setDevice(d.id)}
                  className={`inline-flex h-11 min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-apple-primary sm:h-9 sm:min-h-9 ${
                    device === d.id
                      ? "bg-zinc-900 text-white"
                      : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                  }`}
                >
                  <d.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="hidden min-[400px]:inline">{d.label}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={device}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`mx-auto w-full max-w-full overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas ${landingPreviewShadow} ${
                device === "mobile"
                  ? "max-w-[280px]"
                  : device === "tablet"
                    ? "max-w-[min(100%,480px)]"
                    : ""
              }`}
            >
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between border-b border-apple-divider-soft px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-apple-primary" aria-hidden />
                    <div className="h-2.5 w-16 rounded-full bg-zinc-200" aria-hidden />
                  </div>
                  <div className="flex items-center gap-2" aria-hidden>
                    <div className="h-2 w-8 rounded-full bg-apple-canvas-parchment" />
                    <div className="h-2 w-6 rounded-full bg-apple-canvas-parchment" />
                  </div>
                </div>

                <div className="bg-apple-primary p-6 text-white sm:p-8">
                  <div className="mb-2 h-2 w-20 rounded-full bg-white/30" aria-hidden />
                  <div className="mb-2 h-5 w-48 max-w-full rounded-full bg-white/45" aria-hidden />
                  <div className="mb-4 h-2 w-36 max-w-full rounded-full bg-white/25" aria-hidden />
                  <div className="inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                    {b.shopNow}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-apple-divider-soft p-2.5">
                      <div className="mb-2 aspect-square w-full rounded-lg bg-apple-canvas-parchment" aria-hidden />
                      <div className="mb-1.5 h-2 w-3/4 rounded-full bg-zinc-200" aria-hidden />
                      <div className="h-2 w-1/3 rounded-full bg-apple-canvas-parchment" aria-hidden />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-apple-divider-soft bg-apple-canvas-parchment px-4 py-2.5 text-center">
                  <Eye className="h-3.5 w-3.5 text-apple-ink-muted-48" aria-hidden />
                  <span className="text-xs font-medium text-apple-ink-muted-48">{b.livePreview}</span>
                  <span className="text-zinc-300" aria-hidden>
                    ·
                  </span>
                  <Blocks className="h-3.5 w-3.5 text-apple-primary" aria-hidden />
                  <span className="text-xs font-medium text-apple-primary">{b.editSections}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
