"use client";

import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, landingSection, LandingReveal } from "./landing-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "bg-primary text-primary-foreground",
  "bg-success text-success-foreground",
  "bg-secondary text-secondary-foreground",
] as const;

export function Testimonials() {
  const { t } = useLandingLocale();
  const section = t.testimonials;
  const items = section.items;

  return (
    <section id="testimonials" className={cn(landingSection, "bg-muted/30")}>
      <div className={landingContainer}>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <LandingReveal className="mt-10 sm:mt-12">
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-thin sm:-mx-6 sm:gap-5 sm:px-6 md:mx-0 md:px-0">
            {items.map((item, index) => (
              <Card
                key={item.name}
                className="w-[min(100%,20rem)] shrink-0 snap-start rounded-apple-xl border border-border bg-card p-5 shadow-sm sm:w-80 sm:p-6"
              >
                <CardContent className="relative flex h-full flex-col p-0">
                  <Quote
                    className="absolute right-0 top-0 h-8 w-8 text-primary/15"
                    aria-hidden
                  />

                  <div className="mb-3 flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-primary text-primary"
                        aria-hidden
                      />
                    ))}
                  </div>

                  <blockquote className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{item.text}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback
                        className={cn(
                          "text-sm font-bold",
                          AVATAR_TONES[index % AVATAR_TONES.length],
                        )}
                      >
                        {item.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.role} · {item.business}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
