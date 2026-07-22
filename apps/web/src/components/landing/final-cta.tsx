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
          <div className="relative overflow-hidden rounded-lg bg-zinc-950 px-4 py-12 min-[390px]:px-6 sm:px-10 sm:py-16 md:px-12 lg:py-20">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-display-lg text-balance text-white">{cta.title}</h2>
              <p className="mx-auto mt-4 max-w-prose text-[15px] leading-relaxed text-zinc-400 sm:text-base sm:leading-relaxed md:text-[17px] md:leading-[1.6]">
                {cta.description}
              </p>

              <div className="mx-auto mt-7 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/register"
                  className={`${landingBtnPrimary} bg-apple-canvas text-apple-ink hover:brightness-105 sm:min-w-[11rem]`}
                >
                  {cta.primary}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="#builder"
                  className={`${landingBtnSecondary} border-zinc-600 text-zinc-200 hover:border-zinc-400 hover:bg-white/5 hover:text-white sm:min-w-[11rem]`}
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
