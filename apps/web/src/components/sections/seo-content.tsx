"use client";

import { useState } from "react";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

export function SeoContentSection({ section }: { section: SectionData }) {
  const p = section.props;
  const [expanded, setExpanded] = useState(p.showFullContent === "true");

  const title = p.title || "Leading Computer, Laptop & Gaming PC Retail & Online Shop in Bangladesh";
  const defaultSnippet = p.contentSnippet || "Technology has become an essential part of modern life. Whether you are seeking a high-performance gaming PC, lightweight business laptop, or original computer accessories, BornoLand brings you 100% genuine products with manufacturer warranty and dedicated after-sales support across Bangladesh.";

  return (
    <SectionWrapper section={section}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              {title}
            </h2>
          </div>

          <div className="prose prose-sm max-w-none text-xs text-zinc-600 leading-relaxed space-y-3">
            <p>{defaultSnippet}</p>

            {expanded && (
              <div className="space-y-4 pt-2 border-t border-zinc-100 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-bold text-sm text-zinc-800 mb-1">
                    Best Laptop Shop in Bangladesh
                  </h3>
                  <p>
                    Explore a wide range of laptops from top global brands such as Apple MacBook, ASUS ROG & ZenBook, HP Spectre & Pavilion, Dell XPS & Inspiron, Lenovo ThinkPad & IdeaPad, Acer Swift & Predator, and MSI Gaming laptops. Whether for students, programmers, or content creators, find the exact specifications suited for your budget.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-800 mb-1">
                    Custom PC Building & Genuine Components
                  </h3>
                  <p>
                    Build your dream desktop PC with Intel Core i3, i5, i7, i9 or AMD Ryzen 5000/7000 series processors. Pair with NVIDIA GeForce RTX or AMD Radeon graphics cards, high-speed NVMe SSD storage, and liquid cooling systems designed for peak overclocking and uninterrupted gaming sessions.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-800 mb-1">
                    Fast Nationwide Delivery & Store Experience
                  </h3>
                  <p>
                    Enjoy home delivery across all 64 districts in Bangladesh with cash on delivery, online card payment, and 0% EMI financing on leading credit cards. Visit our physical outlets in major tech hubs to test and demo products prior to purchase.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>{expanded ? "Show Less" : "Read More"}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
