"use client";

import Link from "next/link";
import { landingContainer } from "./landing-ui";
import { Reveal } from "./motion-primitives";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useGetProfileQuery } from "@/redux/api/profile-api";

interface StoryCTAProps {
  onOpenDemo?: () => void;
}

export function StoryCTA({ onOpenDemo }: StoryCTAProps) {
  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  return (
    <section id="final-cta" className="py-20 sm:py-24 bg-white scroll-mt-20">
      <div className={landingContainer}>
        <Reveal direction="scale" delay={80}>
          <div className="relative rounded-3xl bg-zinc-950 px-8 py-16 sm:px-16 sm:py-20 text-center text-white overflow-hidden shadow-2xl border border-zinc-800">
            {/* Subtle Gradient Ambient Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,51,153,0.35),rgba(255,255,255,0))]" />

            <div className="relative max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDA1A]/10 border border-[#FFDA1A]/30 text-[10px] font-extrabold text-[#FFDA1A] uppercase tracking-wider">
                <Sparkles className="h-3 w-3 fill-amber-400" />
                <span>GET STARTED IN MINUTES</span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Ready to Run Your Entire Business from One Platform?
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
                Join forward-thinking retailers and commerce brands who replaced operational chaos with BornoLand.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#003399] text-white text-sm font-bold shadow-lg hover:bg-[#002B80] transition-all"
                >
                  <span>{isAuthenticated ? "Go to Dashboard" : "Start 7-Day Free Trial"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {onOpenDemo ? (
                  <button
                    type="button"
                    onClick={onOpenDemo}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-200 text-sm font-bold shadow-xs hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Book a Product Demo</span>
                  </button>
                ) : (
                  <Link
                    href="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-200 text-sm font-bold shadow-xs hover:bg-zinc-800 hover:text-white transition-all"
                  >
                    <span>Contact Sales</span>
                  </Link>
                )}
              </div>

              {/* Trust Strip */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0A8A00]" />
                  <span>No credit card required</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0A8A00]" />
                  <span>Instant store provisioning</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0A8A00]" />
                  <span>7-day free trial on all plans</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
