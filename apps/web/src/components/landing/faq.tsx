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
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />

          <LandingReveal className="mt-10 space-y-2">
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
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-apple-canvas-parchment/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary"
                    >
                      <span className="text-sm font-semibold text-apple-ink">{faq.q}</span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          isOpen
                            ? "bg-blue-100 text-apple-primary"
                            : "bg-apple-canvas-parchment text-apple-ink-muted-48"
                        }`}
                        aria-hidden
                      >
                        {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
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
                        className={`px-5 pb-4 text-sm leading-relaxed text-apple-ink-muted-80 transition-opacity duration-300 ${
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
