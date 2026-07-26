"use client";

import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, landingSection, LandingReveal } from "./landing-ui";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export function FAQ() {
  const { t } = useLandingLocale();
  const section = t.faq;
  const faqs = section.items;

  return (
    <section id="faq" className={landingSection}>
      <div className={landingContainer}>
        <div className="mx-auto w-full max-w-3xl">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />

          <LandingReveal className="mt-8 sm:mt-10">
            <Card className="rounded-apple-xl border-0 bg-transparent p-0 shadow-none">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={faq.q}
                      value={`item-${i}`}
                      className="border-border"
                    >
                      <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline hover:text-primary">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}
