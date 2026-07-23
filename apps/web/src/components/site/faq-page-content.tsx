"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search } from "lucide-react";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import { SiteSection } from "@/components/site/site-section";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategory,
} from "@/components/site/faq-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FaqPageContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(FAQ_CATEGORIES.map((c) => [c, 0])) as Record<
      FaqCategory,
      number
    >;
    for (const item of FAQ_ITEMS) map[item.category] += 1;
    return map;
  }, []);

  return (
    <>
      <SitePageHero
        eyebrow="Help Center"
        title="Frequently asked questions"
        description="Clear answers about BornoLand billing, accounts, security, API access, and running your ecommerce store day to day."
        primaryCta={{ label: "Contact support", href: "mailto:support@bornoland.com" }}
        secondaryCta={{ label: "Read the docs", href: "/docs", variant: "outline" }}
      >
        <div className="relative mx-auto max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search FAQ"
            className="border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />
        </div>
      </SitePageHero>

      <SiteSection
        title="Browse by topic"
        description="Filter by category or search across every FAQ. Results update instantly."
        align="left"
      >
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="FAQ categories">
          <Button
            type="button"
            size="sm"
            variant={category === "All" ? "default" : "outline"}
            className="rounded-pill"
            onClick={() => setCategory("All")}
            aria-pressed={category === "All"}
          >
            All
            <Badge
              variant={category === "All" ? "outline" : "default"}
              className="ml-1 border-primary-foreground/30"
            >
              {FAQ_ITEMS.length}
            </Badge>
          </Button>
          {FAQ_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              type="button"
              size="sm"
              variant={category === cat ? "default" : "outline"}
              className="rounded-pill"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
              <span
                className={cn(
                  "ml-1.5 text-xs tabular-nums opacity-80",
                  category === cat ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {counts[cat]}
              </span>
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${query}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.length === 0 ? (
              <Card className="rounded-apple-xl border-border">
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    No FAQs matched your filters. Try another category or clear the search.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-pill"
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                    }}
                  >
                    Reset filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-apple-xl border-border shadow-sm">
                <CardContent className="p-2 sm:p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {filtered.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="border-border px-2 sm:px-3 data-[state=open]:bg-muted/30"
                      >
                        <AccordionTrigger className="py-4 text-left text-base font-semibold text-foreground hover:no-underline hover:text-primary sm:py-5">
                          <span className="flex flex-col items-start gap-2 pr-3 sm:flex-row sm:items-center sm:gap-3">
                            <Badge variant="primary" className="shrink-0 rounded-pill">
                              {item.category}
                            </Badge>
                            <span>{item.question}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {FAQ_ITEMS.length} questions
        </p>
      </SiteSection>

      <SiteCtaBanner
        title="Still need a hand?"
        description="Our team in Dhaka helps merchants with onboarding, payments, and technical integrations. Reach out anytime."
        primaryLabel="Email support"
        primaryHref="mailto:support@bornoland.com"
        secondaryLabel="View documentation"
        secondaryHref="/docs"
      />
    </>
  );
}
