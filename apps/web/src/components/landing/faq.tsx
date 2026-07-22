"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, landingSectionAlt, LandingReveal } from "./landing-ui";

export function FAQ() {
  const { t } = useLandingLocale();
  const section = t.faq;
  const faqs = section.items.slice(0, 6);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className={landingSectionAlt}>
      <div className={landingContainer}>
        <div className="mx-auto w-full max-w-3xl">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />

          <LandingReveal className="mt-8 space-y-2.5 sm:mt-10 sm:space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={faq.q}
                  className={`rounded-lg border transition-colors duration-300 ${
                    isOpen ? "border-blue-200 bg-apple-canvas" : "border-apple-hairline bg-apple-canvas"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-trigger-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      className="flex w-full min-h-12 items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-apple-canvas-parchment/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary sm:gap-4 sm:px-5 sm:py-4"
                    >
                      <span className="text-[15px] font-semibold leading-snug text-apple-ink sm:text-sm">
                        {faq.q}
                      </span>
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:h-8 sm:w-8 ${
                          isOpen
                            ? "bg-blue-100 text-apple-primary"
                            : "bg-apple-canvas-parchment text-apple-ink-muted-48"
                        }`}
                        aria-hidden
                      >
                        {isOpen ? <Minus className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`px-4 pb-4 text-[15px] leading-relaxed text-apple-ink-muted-80 transition-opacity duration-300 sm:px-5 sm:text-sm ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}
