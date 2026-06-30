"use client";

import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { addSection, removeSection, toggleSection, duplicateSection, setSelectedSection, updateSectionMeta, moveSection } from "@/redux/slices/builder-slice";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, Plus, Search, X,
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
  const sections = useSelector((s: RootState) => s.builder.sections);
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const [showPicker, setShowPicker] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<SectionCategory | "all">("all");
  const [collapsedLibrary, setCollapsedLibrary] = useState(true);

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

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      dispatch(moveSection({ from: dragIdx, to: idx }));
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Sections <span className="ml-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">{sections.length}</span>
        </p>
        <button onClick={() => { setShowPicker(true); setCollapsedLibrary(false); }}
          className="flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {/* Section list */}
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {sections.map((section, idx) => (
          <div key={section.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => dispatch(setSelectedSection(section.id))}
            className={`group flex items-center gap-2 rounded-lg border p-2.5 transition-all cursor-pointer ${
              selectedId === section.id
                ? "border-zinc-900 bg-zinc-50 shadow-sm"
                : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50"
            } ${!section.visible ? "opacity-50" : ""}`}>
            <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-zinc-300" />
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
              <SectionIcon icon={getSectionDef(section.type)?.icon || "Layout"} />
            </div>
            <div className="flex-1 min-w-0">
              <input
                value={section.label}
                onChange={(e) => dispatch(updateSectionMeta({ id: section.id, label: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="w-full truncate bg-transparent text-xs font-medium text-zinc-700 outline-none"
              />
              <div className="text-[10px] text-zinc-400">{normalizeSectionType(section.type)}</div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); dispatch(duplicateSection(section.id)); }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600"><Copy className="h-3 w-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); dispatch(toggleSection(section.id)); }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600">
                {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); dispatch(removeSection(section.id)); }}
                className="rounded p-1 text-zinc-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-xs text-zinc-400">No sections yet</p>
            <button onClick={() => setShowPicker(true)}
              className="mt-2 text-xs font-medium text-zinc-900 underline underline-offset-2">
              Add your first section
            </button>
          </div>
        )}
      </div>

      {/* Section Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-12 sm:pt-16"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowPicker(false); setSearch(""); setActiveCategory("all"); } }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
              {/* Categories sidebar */}
              <div className="w-40 shrink-0 border-r border-zinc-100 overflow-y-auto p-2 space-y-0.5 bg-zinc-50/50">
                <button onClick={() => setActiveCategory("all")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-[11px] font-medium transition-colors ${
                    activeCategory === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:bg-white/60"
                  }`}>
                  All Sections
                </button>
                {sectionCategories.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-[11px] font-medium transition-colors ${
                      activeCategory === cat.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:bg-white/60"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* Section list */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${filteredSections.length} sections...`}
                      className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-zinc-400" />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-1 gap-1">
                    {filteredSections.map((st) => (
                      <button key={st.type} onClick={() => handleAdd(st.type)}
                        className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition-all hover:border-zinc-200 hover:bg-zinc-50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                          <SectionIcon icon={st.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-900">{st.label}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{st.description}</p>
                        </div>
                        <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
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
