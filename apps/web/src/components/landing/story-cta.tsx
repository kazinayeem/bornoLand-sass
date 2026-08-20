"use client";

import Link from "next/link";
import { landingContainer } from "./landing-ui";
import { ArrowRight, ExternalLink, CheckCircle2, ShieldCheck } from "lucide-react";

export function StoryCTA() {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className={landingContainer}>
        <div className="relative rounded-3xl bg-zinc-950 px-8 py-16 sm:px-16 sm:py-20 text-center text-white overflow-hidden shadow-2xl">
          {/* Subtle Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />

          {/* Floating UI Badges */}
          <div className="hidden lg:flex absolute top-8 left-8 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>0% Transaction Fee</span>
          </div>

          <div className="hidden lg:flex absolute bottom-8 right-8 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>SSL & Custom Domain Ready</span>
          </div>

          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your store is closer than you think.
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal">
              Build it. Launch it. Grow it. Start selling online with Bornoland today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 shadow-2xs hover:bg-zinc-800 transition-all"
              >
                Explore Demo
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            </div>

            <p className="text-xs text-zinc-500 font-medium">
              No credit card required · 7-day free trial · Instant setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
