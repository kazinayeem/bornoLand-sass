"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Receipt,
  Calculator,
  Users,
  UserCheck,
  Landmark,
  Target,
  CheckSquare,
  Palette,
  Settings,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  HelpCircle,
  Clock,
  Filter,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GUIDE_CATEGORIES,
  TROUBLESHOOTING_GUIDE,
  type GuideCategory,
  type GuidePageItem,
} from "@/data/guide-data";
import { LightboxModal, type LightboxImageInfo } from "./lightbox-modal";

const ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket: Sparkles,
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Receipt,
  Calculator,
  Users,
  UserCheck,
  Landmark,
  Target,
  CheckSquare,
  Palette,
  Settings,
  ShieldCheck,
};

export function HowToUseClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("getting-started");

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Flatten all pages for lightbox navigation and searching
  const allPages = useMemo(() => {
    return GUIDE_CATEGORIES.flatMap((c) => c.pages);
  }, []);

  const lightboxImages: LightboxImageInfo[] = useMemo(() => {
    return allPages.map((p) => ({
      src: p.screenshot,
      titleBn: p.titleBn,
      titleEn: p.titleEn,
      route: p.route,
      module: p.module,
      role: p.role,
    }));
  }, [allPages]);

  const openLightboxForPage = (pageId: string) => {
    const idx = allPages.findIndex((p) => p.id === pageId);
    if (idx !== -1) {
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }
  };

  // Filtered categories based on Search and Role
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return GUIDE_CATEGORIES.map((cat) => {
      const filteredPages = cat.pages.filter((page) => {
        // Role match
        if (selectedRole !== "all") {
          if (selectedRole === "merchant" && page.role !== "Merchant") return false;
          if (selectedRole === "employee" && page.role !== "Employee") return false;
          if (selectedRole === "admin" && page.role !== "Super Admin") return false;
        }

        // Search match
        if (!query) return true;

        const matchTitleEn = page.titleEn.toLowerCase().includes(query);
        const matchTitleBn = page.titleBn.toLowerCase().includes(query);
        const matchModule = page.module.toLowerCase().includes(query);
        const matchSummary = page.summaryBn.toLowerCase().includes(query);
        const matchTags = page.tags.some((t) => t.toLowerCase().includes(query));
        const matchRoute = page.route.toLowerCase().includes(query);
        const matchCallouts = page.callouts.some(
          (c) => c.label.toLowerCase().includes(query) || c.descriptionBn.toLowerCase().includes(query)
        );

        return (
          matchTitleEn ||
          matchTitleBn ||
          matchModule ||
          matchSummary ||
          matchTags ||
          matchRoute ||
          matchCallouts
        );
      });

      return {
        ...cat,
        pages: filteredPages,
      };
    }).filter((cat) => cat.pages.length > 0);
  }, [searchQuery, selectedRole]);

  // Scrollspy to highlight active TOC link
  useEffect(() => {
    const handleScroll = () => {
      const sections = GUIDE_CATEGORIES.map((c) => document.getElementById(c.id));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(GUIDE_CATEGORIES[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#181c20] dark:text-[#f4f4f5]">
      {/* ── Top Hero Section ── */}
      <header className="border-b border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#0c0c0e] sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/50">
                  <Sparkles className="h-3.5 w-3.5" />
                  BornoLand Real UI Documentation
                </span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/50">
                  লাইভ স্ক্রিনশট সহ
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#181c20] dark:text-white">
                BornoLand কীভাবে ব্যবহার করবেন
              </h1>
              <p className="mt-1 text-sm text-[#71717a] dark:text-[#a1a1aa] max-w-2xl leading-relaxed">
                এই গাইড-এ BornoLand-এর প্রতিটি ফিচার বাস্তব অ্যাপ্লিকেশনের স্ক্রিনশট এবং সহজ বাংলা ব্যাখ্যা সহ উপস্থাপন করা হয়েছে।
              </p>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/workshops"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow-xs transition-colors"
              >
                Go to Workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="মডিউল, প্রোডাক্ট, অর্ডার, পিওএস, হাজিরা, ছুটি, পে-স্লিপ বা সেটিংস খুঁজুন..."
                className="w-full rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#09090b] transition-all text-[#181c20] dark:text-white placeholder:text-[#a1a1aa]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#a1a1aa] hover:text-[#181c20] dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 rounded-xl bg-[#f4f4f5] dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a]">
              {[
                { id: "all", label: "সকল রোল" },
                { id: "merchant", label: "মার্চেন্ট (Merchant)" },
                { id: "employee", label: "কর্মী সেলফ-সার্ভিস" },
                { id: "admin", label: "সুপার অ্যাডমিন" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRole(tab.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                    selectedRole === tab.id
                      ? "bg-white dark:bg-[#27272a] text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-[#71717a] dark:text-[#a1a1aa] hover:text-[#181c20] dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile TOC Toggle */}
            <button
              type="button"
              onClick={() => setMobileTocOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#18181b] px-4 py-2.5 text-xs font-semibold text-[#181c20] dark:text-white"
            >
              <Menu className="h-4 w-4" /> সূচিপত্র (Table of Contents)
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout: Sidebar + Content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* ── Desktop Sticky Sidebar (Table of Contents) ── */}
          <aside className="hidden lg:block sticky top-32 overflow-y-auto max-h-[calc(100vh-140px)] pr-4 select-none">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] mb-3 px-2 flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
              সূচিপত্র (Documentation)
            </div>

            <nav className="space-y-1" aria-label="Table of Contents">
              {GUIDE_CATEGORIES.map((cat) => {
                const Icon = ICONS_MAP[cat.icon] || BookOpen;
                const isActive = activeSection === cat.id;

                return (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-[#71717a] dark:text-[#a1a1aa] hover:bg-[#f4f4f5] dark:hover:bg-[#18181b] hover:text-[#181c20] dark:hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-[#a1a1aa]")} />
                    <span className="truncate">{cat.titleBn}</span>
                    <span className="ml-auto text-[10px] text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity">
                      {cat.pages.length}
                    </span>
                  </a>
                );
              })}

              <div className="pt-4 border-t border-[#e4e4e7] dark:border-[#27272a] mt-4">
                <a
                  href="#troubleshooting"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40",
                    activeSection === "troubleshooting" && "bg-amber-50 dark:bg-amber-950/60 font-semibold"
                  )}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>সমস্যা ও সমাধান (Troubleshooting)</span>
                </a>
              </div>
            </nav>
          </aside>

          {/* ── Content Area ── */}
          <main className="min-w-0 space-y-16">
            {filteredCategories.length === 0 ? (
              <div className="rounded-2xl border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#121215] p-12 text-center">
                <HelpCircle className="h-10 w-10 text-[#a1a1aa] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-[#181c20] dark:text-white">কোনো ফলাফল পাওয়া যায়নি</h3>
                <p className="mt-1 text-xs text-[#71717a] dark:text-[#a1a1aa]">
                  &quot;{searchQuery}&quot; দিয়ে কোনো ফিচার বা পেজ খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
                </p>
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <section key={cat.id} id={cat.id} className="scroll-mt-32 space-y-8">
                  {/* Category Header */}
                  <div className="border-b border-[#e4e4e7] dark:border-[#27272a] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {React.createElement(ICONS_MAP[cat.icon] || BookOpen, { className: "h-5 w-5" })}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[#181c20] dark:text-white">
                          {cat.titleBn} <span className="text-[#71717a] dark:text-[#a1a1aa] text-sm font-normal">({cat.titleEn})</span>
                        </h2>
                        <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                          {cat.descriptionBn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Module Pages */}
                  <div className="space-y-12">
                    {cat.pages.map((pageItem) => (
                      <article
                        key={pageItem.id}
                        id={pageItem.id}
                        className="rounded-2xl border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#121215] p-6 shadow-xs space-y-6"
                      >
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#f4f4f5] dark:border-[#1e1e22] pb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
                                  pageItem.role === "Merchant"
                                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60"
                                    : pageItem.role === "Employee"
                                    ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60"
                                    : pageItem.role === "Super Admin"
                                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                                )}
                              >
                                {pageItem.role}
                              </span>
                              <span className="text-xs font-mono text-[#a1a1aa] bg-[#f4f4f5] dark:bg-[#18181b] px-2 py-0.5 rounded-md">
                                {pageItem.route}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#181c20] dark:text-white">
                              {pageItem.titleBn} <span className="text-[#71717a] dark:text-[#a1a1aa] text-sm font-normal">({pageItem.titleEn})</span>
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openLightboxForPage(pageItem.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4e4e7] dark:border-[#27272a] bg-[#f4f4f5] dark:bg-[#18181b] hover:bg-[#e4e4e7] dark:hover:bg-[#27272a] px-3 py-1.5 text-xs font-semibold text-[#181c20] dark:text-white transition-colors cursor-pointer"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                              স্ক্রিনশট জুম
                            </button>
                          </div>
                        </div>

                        {/* Page Summary */}
                        <p className="text-sm text-[#52525b] dark:text-[#d4d4d8] leading-relaxed">
                          {pageItem.summaryBn}
                        </p>

                        {/* ── Real Screenshot Preview Card ── */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-[#71717a] dark:text-[#a1a1aa]">
                            <span className="font-semibold flex items-center gap-1.5">
                              <LayoutDashboard className="h-3.5 w-3.5 text-blue-500" />
                              রিয়েল অ্যাপ্লিকেশন স্ক্রিনশট (Desktop 1440 × 900)
                            </span>
                            <span className="text-[11px] font-mono text-[#a1a1aa]">
                              {pageItem.screenshot.replace("/docs/screenshots/", "")}
                            </span>
                          </div>

                          <div
                            onClick={() => openLightboxForPage(pageItem.id)}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-[#09090b] shadow-md transition-all hover:border-blue-500 hover:shadow-lg"
                          >
                            {/* Browser Mockup Top Bar */}
                            <div className="flex items-center justify-between border-b border-[#27272a] bg-[#18181b] px-4 py-2 text-xs text-zinc-400 select-none">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                              </div>
                              <div className="rounded-md bg-[#09090b] px-3 py-0.5 text-[11px] font-mono text-zinc-400 truncate max-w-sm">
                                {pageItem.route}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">1440 × 900</div>
                            </div>

                            {/* Screenshot Image */}
                            <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-950">
                              <img
                                src={pageItem.screenshot}
                                alt={`BornoLand ${pageItem.titleEn} real interface`}
                                className="w-full h-auto object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
                                loading="lazy"
                              />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs">
                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-xs font-semibold shadow-lg">
                                  <Maximize2 className="h-4 w-4" /> বড় আকারে দেখতে ক্লিক করুন
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── Numbered Image Callouts ── */}
                        {pageItem.callouts.length > 0 && (
                          <div className="rounded-xl border border-[#f4f4f5] dark:border-[#1e1e22] bg-[#fafafa] dark:bg-[#18181b]/50 p-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-blue-500" />
                              স্ক্রিনশটের প্রধান অংশ ও কন্ট্রোলসমূহ (Key UI Callouts)
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {pageItem.callouts.map((c) => (
                                <div
                                  key={c.number}
                                  className="flex items-start gap-3 rounded-lg border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#121215] p-3 text-xs shadow-2xs"
                                >
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px]">
                                    {c.number}
                                  </span>
                                  <div>
                                    <div className="font-semibold text-[#181c20] dark:text-white">
                                      {c.label}
                                    </div>
                                    <div className="text-[#71717a] dark:text-[#a1a1aa] mt-0.5 leading-relaxed">
                                      {c.descriptionBn}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Step-by-Step & Available Actions ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          {/* How to open */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
                              <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                              কীভাবে এই পেজটি খুলবেন?
                            </h4>
                            <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#52525b] dark:text-[#d4d4d8] leading-relaxed">
                              {pageItem.howToOpenBn.map((step, sIdx) => (
                                <li key={sIdx} className="pl-1">
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Available actions */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              এই পেজ থেকে কী কী করতে পারবেন?
                            </h4>
                            <ul className="space-y-1.5 text-xs text-[#52525b] dark:text-[#d4d4d8] leading-relaxed">
                              {pageItem.availableActionsBn.map((act, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* ── CRUD Workflows (If Available) ── */}
                        {pageItem.crudWorkflows && pageItem.crudWorkflows.length > 0 && (
                          <div className="rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              ধাপে ধাপে কাজের নিয়ম (Step-by-Step Guide)
                            </h4>

                            <div className="space-y-3">
                              {pageItem.crudWorkflows.map((flow, fIdx) => (
                                <div key={fIdx} className="space-y-1.5">
                                  <div className="text-xs font-semibold text-[#181c20] dark:text-white flex items-center gap-2">
                                    <span className="rounded bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                                      {flow.action}
                                    </span>
                                    {flow.titleBn}
                                  </div>
                                  <ol className="list-decimal list-inside space-y-1 text-xs text-[#52525b] dark:text-[#d4d4d8] pl-2 leading-relaxed">
                                    {flow.stepsBn.map((s, stepIdx) => (
                                      <li key={stepIdx}>{s}</li>
                                    ))}
                                  </ol>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}

            {/* ── 15. Troubleshooting Section ── */}
            <section id="troubleshooting" className="scroll-mt-32 space-y-6 pt-8 border-t border-[#e4e4e7] dark:border-[#27272a]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#181c20] dark:text-white">
                    সাধারণ সমস্যা ও সমাধান (Troubleshooting)
                  </h2>
                  <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                    ব্যবহার করার সময় সম্ভাব্য সাধারণ ত্রুটি ও তা সমাধানের তাৎক্ষণিক ধাপ।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TROUBLESHOOTING_GUIDE.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#121215] p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold mt-0.5">
                        !
                      </span>
                      <h3 className="text-sm font-semibold text-[#181c20] dark:text-white">
                        {item.issueBn}
                      </h3>
                    </div>

                    <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                      <strong className="text-zinc-700 dark:text-zinc-300">কারণ:</strong> {item.causeBn}
                    </p>

                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        সমাধানের ধাপ:
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-[#52525b] dark:text-[#d4d4d8] leading-relaxed">
                        {item.solutionBn.map((sol, sIdx) => (
                          <li key={sIdx}>{sol}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ── Mobile TOC Drawer ── */}
      {mobileTocOpen && (
        <div data-testid="mobile-toc-drawer" className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileTocOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-10 w-[min(85vw,320px)] bg-white dark:bg-[#121215] p-6 shadow-2xl overflow-y-auto space-y-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-[#e4e4e7] dark:border-[#27272a] pb-3">
              <span className="text-sm font-bold text-[#181c20] dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" /> সূচিপত্র
              </span>
              <button
                type="button"
                onClick={() => setMobileTocOpen(false)}
                className="text-[#a1a1aa] hover:text-[#181c20] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav data-testid="mobile-toc-nav" className="space-y-1">
              {GUIDE_CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  onClick={() => setMobileTocOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#71717a] dark:text-[#a1a1aa] hover:bg-[#f4f4f5] dark:hover:bg-[#18181b] hover:text-[#181c20] dark:hover:text-white"
                >
                  <span className="truncate">{cat.titleBn}</span>
                </a>
              ))}
              <a
                href="#troubleshooting"
                onClick={() => setMobileTocOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400"
              >
                <span>সমস্যা ও সমাধান</span>
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* ── Lightbox Modal Component ── */}
      <LightboxModal
        isOpen={lightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
}
