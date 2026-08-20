"use client";

import Link from "next/link";
import { landingContainer } from "./landing-ui";
import { ArrowRight, ExternalLink } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className={landingContainer}>
        <div className="relative rounded-3xl bg-zinc-950 px-8 py-16 sm:px-16 sm:py-20 text-center text-white overflow-hidden shadow-2xl">
          {/* Subtle Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Ready to build your store?
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal">
              Start free today and launch your commerce business without technical overhead.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-md hover:bg-zinc-100 hover:shadow-lg transition-all"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-200 shadow-2xs hover:bg-zinc-800 transition-all"
              >
                Explore demo
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            </div>

            <p className="text-xs text-zinc-500 font-medium">
              No credit card required · 7-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
