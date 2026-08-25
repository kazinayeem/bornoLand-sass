"use client";

import { landingContainer } from "./landing-ui";
import { LandingButton } from "./landing-button";
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
            <span>০% অতিরিক্ত চার্জ</span>
          </div>

          <div className="hidden lg:flex absolute bottom-8 right-8 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>SSL ও কাস্টম ডোমেইন রেডি</span>
          </div>

          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              আপনার অনলাইন দোকান শুরু করতে আর কতক্ষণ?
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal">
              আজই শুরু করুন এবং আপনার ব্যবসাকে আরও সহজভাবে অনলাইনে নিয়ে আসুন।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <LandingButton
                variant="primary"
                size="hero"
                href="/register"
                className="w-full sm:w-auto text-base font-semibold"
              >
                ফ্রি শুরু করুন
                <ArrowRight className="h-4 w-4 ml-1" />
              </LandingButton>

              <LandingButton
                variant="secondary"
                size="hero"
                href="#how-it-works"
                className="w-full sm:w-auto text-base font-semibold"
              >
                ডেমো দেখুন
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400 ml-1" />
              </LandingButton>
            </div>

            <p className="text-xs text-zinc-500 font-medium pt-1">
              কোডিং লাগবে না · ১ মিনিটে ফ্রি সাইন আপ · ক্রেডিট কার্ড লাগবে না
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
