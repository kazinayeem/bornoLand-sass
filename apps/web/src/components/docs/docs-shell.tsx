"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  DOCS_REGISTRY,
  DOC_CATEGORIES,
  type DocTopic,
  type DocCategory,
} from "@/lib/docs-data";
import { cn } from "@/lib/utils";

interface DocsShellProps {
  currentTopic?: DocTopic;
}

export function DocsShell({ currentTopic = DOCS_REGISTRY[0] }: DocsShellProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeTocId, setActiveTocId] = useState<string>("");

  // Search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return DOCS_REGISTRY.filter(
      (doc) =>
        doc.title.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.sections.some((s) => s.title.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Group topics by category
  const categorizedDocs = useMemo(() => {
    const map = new Map<DocCategory, DocTopic[]>();
    for (const cat of DOC_CATEGORIES) {
      map.set(cat, []);
    }
    for (const doc of DOCS_REGISTRY) {
      const list = map.get(doc.category as DocCategory) || [];
      list.push(doc);
      map.set(doc.category as DocCategory, list);
    }
    return Array.from(map.entries());
  }, []);

  // Compute Next & Previous Doc Topics
  const currentIndex = DOCS_REGISTRY.findIndex((d) => d.slug === currentTopic.slug);
  const prevDoc = currentIndex > 0 ? DOCS_REGISTRY[currentIndex - 1] : null;
  const nextDoc =
    currentIndex >= 0 && currentIndex < DOCS_REGISTRY.length - 1
      ? DOCS_REGISTRY[currentIndex + 1]
      : null;

  // Handle TOC active observer
  useEffect(() => {
    const handleScroll = () => {
      const headings = currentTopic.sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean) as HTMLElement[];

      const scrollPos = window.scrollY + 120;
      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].offsetTop <= scrollPos) {
          setActiveTocId(headings[i].id);
          return;
        }
      }
      if (headings[0]) setActiveTocId(headings[0].id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentTopic]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased">
      {/* ── Subheader / Search & Mobile Toggle Bar ─────────────────── */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-[#dfe3e8] px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs text-[#424754] overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/docs" className="hover:text-[#1664d9] font-medium flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#1664d9]" />
              <span>Documentation</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#c2c6d6] shrink-0" />
            <span className="text-[#727785]">{currentTopic.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#c2c6d6] shrink-0" />
            <span className="font-bold text-[#181c20]">{currentTopic.title}</span>
          </div>

          {/* Search Input & Mobile Drawer Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#727785]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#f1f4fa] border border-[#dfe3e8] rounded-lg text-xs text-[#181c20] placeholder-[#727785] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/20 focus:border-[#1664d9] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#181c20]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Nav Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 text-[#424754] hover:bg-[#f1f4fa] rounded-lg border border-[#dfe3e8]"
              aria-label="Toggle Docs Navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Overlay Flyout ─────────────────────────────────── */}
      {searchQuery.trim() && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <div className="bg-white rounded-xl shadow-lg border border-[#dfe3e8] p-4 max-h-96 overflow-y-auto">
            <div className="text-xs font-bold text-[#727785] uppercase tracking-wider mb-2">
              Search Results ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-[#424754] py-4 text-center">
                No documentation matching &quot;{searchQuery}&quot;. Try terms like POS, inventory, or payroll.
              </p>
            ) : (
              <div className="divide-y divide-[#f1f4fa]">
                {searchResults.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    onClick={() => setSearchQuery("")}
                    className="block py-2.5 px-2 hover:bg-[#f1f4fa] rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#181c20] group-hover:text-[#1664d9]">
                        {doc.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#ebeef4] rounded text-[#424754]">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#727785] line-clamp-1 mt-0.5">{doc.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main 3-Column Docs Grid ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Column 1: Left Navigation Sidebar ──────────────────── */}
          <aside
            className={cn(
              "lg:col-span-3 lg:block",
              mobileNavOpen
                ? "fixed inset-0 z-40 bg-white p-6 overflow-y-auto"
                : "hidden"
            )}
          >
            {mobileNavOpen && (
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#dfe3e8] lg:hidden">
                <span className="text-sm font-bold text-[#181c20]">Documentation Index</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-[#424754] hover:bg-[#f1f4fa] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="space-y-6 sticky top-36">
              {/* Quick Links Header */}
              <div className="space-y-1">
                <Link
                  href="/how-to-use"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-[#1664d9] bg-[#1664d9]/5 hover:bg-[#1664d9]/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Beginner Setup Guide</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/faq"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#424754] hover:bg-[#f1f4fa] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#727785]" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#c2c6d6]" />
                </Link>
              </div>

              {/* Categorized Doc Topics */}
              <div className="space-y-5">
                {categorizedDocs.map(([category, topics]) => {
                  if (topics.length === 0) return null;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#727785] px-3">
                        {category}
                      </div>
                      <ul className="space-y-0.5">
                        {topics.map((doc) => {
                          const isActive = currentTopic.slug === doc.slug;
                          return (
                            <li key={doc.slug}>
                              <Link
                                href={`/docs/${doc.slug}`}
                                onClick={() => setMobileNavOpen(false)}
                                className={cn(
                                  "flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors",
                                  isActive
                                    ? "bg-[#1664d9] text-white font-bold shadow-2xs"
                                    : "text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa] font-medium"
                                )}
                              >
                                <span className="truncate">{doc.title}</span>
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Column 2: Center Documentation Content ──────────────── */}
          <main className="lg:col-span-6 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-[#dfe3e8]">
            {/* Header / Meta */}
            <div className="pb-6 border-b border-[#dfe3e8] mb-8">
              <div className="flex items-center gap-2 text-xs text-[#727785] mb-2 font-medium">
                <span className="px-2.5 py-0.5 bg-[#ebeef4] rounded-md text-[#424754] font-semibold">
                  {currentTopic.category}
                </span>
                <span>•</span>
                <span>{currentTopic.readTime}</span>
                <span>•</span>
                <span>Updated {currentTopic.lastUpdated}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#181c20] tracking-tight">
                {currentTopic.title}
              </h1>
              <p className="text-sm text-[#424754] mt-3 leading-relaxed">
                {currentTopic.summary}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {currentTopic.sections.map((sec) => (
                <section key={sec.id} id={sec.id} className="scroll-mt-32 space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#181c20] tracking-tight flex items-center gap-2">
                    <span className="text-[#1664d9]">#</span>
                    <span>{sec.title}</span>
                  </h2>

                  {/* Paragraphs */}
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm text-[#424754] leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {/* Bullet Points */}
                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <ul className="space-y-2 bg-[#f7f9ff] p-4 rounded-xl border border-[#dfe3e8]/70">
                      {sec.bulletPoints.map((bp, bpIdx) => (
                        <li key={bpIdx} className="text-xs text-[#181c20] flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#006e2a] shrink-0 mt-0.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Code Snippet Box */}
                  {sec.codeBlock && (
                    <div className="rounded-xl overflow-hidden border border-[#dfe3e8] bg-[#0F172A] text-white">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
                        <span className="font-mono text-slate-400">
                          {sec.codeBlock.filename || sec.codeBlock.language}
                        </span>
                        <button
                          onClick={() => handleCopy(sec.codeBlock!.code, sec.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedCodeId === sec.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-200 leading-relaxed">
                        <code>{sec.codeBlock.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Callout Alert */}
                  {sec.callout && (
                    <div
                      className={cn(
                        "p-4 rounded-xl border flex items-start gap-3",
                        sec.callout.type === "tip" && "bg-emerald-50/70 border-emerald-200 text-emerald-950",
                        sec.callout.type === "info" && "bg-blue-50/70 border-blue-200 text-blue-950",
                        sec.callout.type === "warning" && "bg-amber-50/70 border-amber-200 text-amber-950",
                        sec.callout.type === "success" && "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      )}
                    >
                      {sec.callout.type === "tip" && <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                      {sec.callout.type === "info" && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                      {sec.callout.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                      {sec.callout.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                      <div>
                        <strong className="text-xs font-bold block mb-0.5">{sec.callout.title}</strong>
                        <p className="text-xs leading-relaxed opacity-90">{sec.callout.text}</p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Related Topics & Pagination */}
            <div className="mt-12 pt-8 border-t border-[#dfe3e8] space-y-6">
              {/* Previous / Next Card Pagination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevDoc ? (
                  <Link
                    href={`/docs/${prevDoc.slug}`}
                    className="p-4 rounded-xl border border-[#dfe3e8] hover:border-[#1664d9] hover:bg-[#f1f4fa] transition-all flex flex-col group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#727785] flex items-center gap-1 mb-1">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                      <span>Previous Guide</span>
                    </span>
                    <span className="text-xs font-bold text-[#181c20] group-hover:text-[#1664d9]">
                      {prevDoc.title}
                    </span>
                  </Link>
                ) : <div />}

                {nextDoc ? (
                  <Link
                    href={`/docs/${nextDoc.slug}`}
                    className="p-4 rounded-xl border border-[#dfe3e8] hover:border-[#1664d9] hover:bg-[#f1f4fa] transition-all flex flex-col text-right group sm:items-end"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#727785] flex items-center gap-1 mb-1 justify-end">
                      <span>Next Guide</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-xs font-bold text-[#181c20] group-hover:text-[#1664d9]">
                      {nextDoc.title}
                    </span>
                  </Link>
                ) : <div />}
              </div>
            </div>
          </main>

          {/* ── Column 3: Right "On this page" TOC ───────────────────── */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-36 space-y-4 p-4 rounded-2xl bg-white border border-[#dfe3e8] shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-[#727785] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1664d9]" />
                <span>On this page</span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {currentTopic.toc.map((toc) => {
                  const isActive = activeTocId === toc.id;
                  return (
                    <li key={toc.id}>
                      <a
                        href={`#${toc.id}`}
                        className={cn(
                          "block py-1 px-2 rounded-md transition-colors",
                          isActive
                            ? "bg-[#1664d9]/10 text-[#1664d9] font-bold"
                            : "text-[#424754] hover:text-[#181c20] hover:bg-[#f1f4fa]"
                        )}
                      >
                        {toc.label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* Help & Support Box */}
              <div className="pt-4 border-t border-[#dfe3e8] space-y-2">
                <div className="text-xs font-bold text-[#181c20]">Need assistance?</div>
                <p className="text-[11px] text-[#424754] leading-relaxed">
                  Our engineering and merchant success team is available to assist with custom setup.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1664d9] hover:underline"
                >
                  <span>Contact Merchant Support</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
