"use client";

import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { addSection, setActiveTab } from "@/redux/slices/builder-slice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X,
  Layout, Image, Star, Mail, Menu, Columns2, Video, Timer, Zap, ShoppingBag,
  Grid3x3, Tags, Percent, ShieldCheck, MessageSquareQuote, FileText,
  HelpCircle, Users, Instagram, Megaphone, Package, Maximize, Minimize,
  GalleryHorizontal, Flame, TrendingUp, Clock, Link, Layers3, Gift,
  Calendar, Ticket, Sun, AlarmClock, Award, Heart, ListChecks, BookOpen,
  Info, Target, SplitSquareHorizontal, Music, Facebook, ImageUp, AtSign,
  SquareMousePointer, ChartNoAxesColumn, Bell, Columns3,
  PanelRight, SquareSquare, GalleryHorizontalEnd, SlidersHorizontal,
  PackagePlus, Grid2x2, Columns, ChevronDown, ChevronRight,
} from "lucide-react";
import { sectionRegistry, sectionCategories, getDefaultProps, getSectionDef, getSectionLabel, normalizeSectionType, type SectionCategory } from "@/lib/section-registry";

const iconMap: Record<string, any> = {
  Layout, Image, Star, Mail, Menu, Columns2, Video, Timer, Zap, ShoppingBag,
  Grid3x3, Tags, Percent, ShieldCheck, MessageSquareQuote, FileText,
  HelpCircle, Users, Instagram, Megaphone, Package, Maximize, Minimize,
  GalleryHorizontal, Flame, TrendingUp, Clock, Link, Layers3, Gift,
  Calendar, Ticket, Sun, AlarmClock, Award, Heart, ListChecks, BookOpen,
  Info, Target, SplitSquareHorizontal, Music, Facebook, ImageUp, AtSign,
  SquareMousePointer, ChartNoAxesColumn, Bell, Columns3,
  PanelRight, SquareSquare, GalleryHorizontalEnd, SlidersHorizontal,
  PackagePlus, Grid2x2, Columns, ChevronDown, ChevronRight,
  Tabs: Columns3,
  Columns1: Columns,
};

function SectionIcon({ icon }: { icon: string }) {
  const Icon = iconMap[icon] || Layout;
  return <Icon className="h-4 w-4" />;
}

export function SectionPanel() {
  const dispatch = useDispatch();
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<SectionCategory | "all">("all");

  const filteredSections = useMemo(() => {
    let list = sectionRegistry;
    if (activeCategory !== "all") list = list.filter((s) => s.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.label.toLowerCase().includes(q) || s.type.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, search]);

  const handleAdd = (type: string) => {
    dispatch(addSection({
      id: `${type}-${Date.now()}`,
      type, label: getSectionLabel(type), visible: true,
      props: getDefaultProps(type),
    }));
    setShowPicker(false);
    setSearch("");
  };
  const featuredSections = filteredSections.slice(0, 6);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-100 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Components</p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-900">Insert blocks without crowding the canvas</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Browse a focused set here or open the full gallery for large previews and search.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1 rounded-xl bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-3 w-3" /> Open Gallery
          </button>
          <button
            onClick={() => dispatch(setActiveTab("layers"))}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Manage Layers
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Popular blocks</p>
          <div className="mt-3 grid gap-2">
            {featuredSections.map((section) => (
              <button
                key={section.type}
                type="button"
                onClick={() => handleAdd(section.type)}
                className="flex items-center gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left transition-all hover:border-zinc-200 hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                  <SectionIcon icon={section.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{section.label}</p>
                  <p className="truncate text-[11px] text-zinc-500">{section.description}</p>
                </div>
                <Plus className="h-4 w-4 text-zinc-300" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-100 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Browse by category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sectionCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setActiveCategory(category.id);
                  setShowPicker(true);
                }}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-10 sm:pt-12"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowPicker(false); setSearch(""); setActiveCategory("all"); } }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_90px_-32px_rgba(0,0,0,0.35)]">
              <div className="w-48 shrink-0 border-r border-zinc-100 overflow-y-auto p-3 space-y-1 bg-zinc-50/60">
                <button onClick={() => setActiveCategory("all")}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition-colors ${
                    activeCategory === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:bg-white/60"
                  }`}>
                  All Sections
                </button>
                {sectionCategories.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition-colors ${
                      activeCategory === cat.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:bg-white/60"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-zinc-100 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Component Gallery</p>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-900">Insert prebuilt sections</h3>
                  <p className="mt-1 text-sm text-zinc-500">Search, preview, and add without keeping the library open all the time.</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${filteredSections.length} sections...`}
                      className="mt-4 h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none focus:border-zinc-400 focus:bg-white" />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredSections.map((st) => (
                      <button key={st.type} onClick={() => handleAdd(st.type)}
                        className="flex min-h-28 flex-col items-start gap-3 rounded-3xl border border-zinc-100 bg-zinc-50/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-200 hover:bg-white hover:shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-sm">
                          <SectionIcon icon={st.icon} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900">{st.label}</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">{st.description}</p>
                        </div>
                        <span className="mt-auto rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-500 shadow-sm">Insert</span>
                      </button>
                    ))}
                    {filteredSections.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-xs text-zinc-400">No sections found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
