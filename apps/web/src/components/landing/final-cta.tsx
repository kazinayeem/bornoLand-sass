"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useLandingLocale } from "./landing-locale";
import {
  landingBtnPrimary,
  landingBtnSecondary,
  landingContainer,
  landingSection,
  LandingReveal,
} from "./landing-ui";

export function FinalCTA() {
  const { t } = useLandingLocale();
  const cta = t.finalCta;

  return (
    <section id="contact" className={landingSection}>
      <div className={landingContainer}>
        <LandingReveal>
          <div className="relative overflow-hidden rounded-lg bg-zinc-950 px-6 py-14 sm:px-12 sm:py-16 lg:py-20">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-display-lg text-balance text-white">{cta.title}</h2>
              <p className="mx-auto mt-4 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-[17px] sm:leading-[1.6]">
                {cta.description}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register"
                  className={`${landingBtnPrimary} min-w-[11rem] bg-apple-canvas text-apple-ink hover:brightness-105`}
                >
                  {cta.primary}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="#builder"
                  className={`${landingBtnSecondary} min-w-[11rem] border-zinc-600 text-zinc-200 hover:border-zinc-400 hover:bg-white/5 hover:text-white`}
                >
                  <Play className="h-4 w-4 shrink-0" aria-hidden />
                  {cta.secondary}
                </Link>
              </div>
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
