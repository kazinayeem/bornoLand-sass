"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategory,
} from "@/components/site/faq-data";
import { cn } from "@/lib/utils";

export function FaqPageContent() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | "All">("All");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "gen-1": true,
    "gs-1": true,
    "pos-1": true,
  });

  // Handle URL hash on mount or hashchange (e.g. /faq#billing)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.slice(1).toLowerCase();
        const matchedCategory = FAQ_CATEGORIES.find(
          (c) => c.toLowerCase().replace(/\s+/g, "-") === hash
        );
        if (matchedCategory) {
          setSelectedCategory(matchedCategory);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const map = Object.fromEntries(FAQ_CATEGORIES.map((c) => [c, 0])) as Record<
      FaqCategory,
      number
    >;
    for (const item of FAQ_ITEMS) {
      map[item.category] = (map[item.category] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Categorized Frequently Asked Questions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 mb-6 leading-relaxed">
            Find immediate answers about storefront commerce, offline POS registers, multi-warehouse stock, biometric payroll, accounting, and billing.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#727785]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword (e.g. POS, bKash, offline, payroll, domain, NBR)..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-[#dfe3e8] rounded-2xl text-xs sm:text-sm text-[#181c20] placeholder-[#727785] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1664d9]/20 focus:border-[#1664d9] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#181c20]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              selectedCategory === "All"
                ? "bg-[#1664d9] text-white shadow-xs"
                : "bg-white text-[#424754] hover:bg-[#f1f4fa] border border-[#dfe3e8]"
            )}
          >
            <span>All Topics</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                selectedCategory === "All"
                  ? "bg-white/20 text-white"
                  : "bg-[#ebeef4] text-[#424754]"
              )}
            >
              {FAQ_ITEMS.length}
            </span>
          </button>

          {FAQ_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const slug = cat.toLowerCase().replace(/\s+/g, "-");
            return (
              <button
                key={cat}
                id={slug}
                onClick={() => {
                  setSelectedCategory(cat);
                  window.history.replaceState(null, "", `/faq#${slug}`);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  isSelected
                    ? "bg-[#1664d9] text-white shadow-xs"
                    : "bg-white text-[#424754] hover:bg-[#f1f4fa] border border-[#dfe3e8]"
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    isSelected ? "bg-white/20 text-white" : "bg-[#ebeef4] text-[#424754]"
                  )}
                >
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Questions Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3 mb-16">
          {filteredItems.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#dfe3e8] text-center space-y-2">
              <p className="text-sm font-semibold text-[#181c20]">
                No questions found matching &quot;{query}&quot;.
              </p>
              <p className="text-xs text-[#727785]">
                Try searching for broader terms or browse the help categories.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-2 text-xs font-bold text-[#1664d9] hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = Boolean(openItems[item.id]);
              return (
                <div
                  key={item.id}
                  id={item.id}
                  className="bg-white rounded-2xl border border-[#dfe3e8] shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-[#f1f4fa]/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1664d9] bg-[#1664d9]/10 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#181c20]">
                        {item.question}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full bg-[#f1f4fa] flex items-center justify-center shrink-0 text-[#727785] transition-transform duration-200 mt-1",
                        isOpen ? "rotate-180 bg-[#1664d9] text-white" : ""
                      )}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#424754] leading-relaxed border-t border-[#f1f4fa] space-y-3">
                      <p>{item.answer}</p>
                      {item.docLink && (
                        <div className="pt-2">
                          <Link
                            href={item.docLink.href}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1664d9] hover:underline"
                          >
                            <span>{item.docLink.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="max-w-4xl mx-auto p-8 bg-[#0F172A] text-white rounded-2xl text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[#8ffa9b] mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold">Still have a question?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Our merchant onboarding specialists and technical engineers are happy to help you via live chat, email, or WhatsApp.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-2.5 bg-[#1664d9] text-white rounded-xl text-xs font-bold hover:bg-[#004caf] transition-colors shadow-xs"
            >
              Contact Support Team
            </Link>
            <Link
              href="/docs"
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Explore Full Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
