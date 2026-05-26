"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  addSection, removeSection, toggleSection, duplicateSection,
  setSelectedSection,
} from "@/redux/slices/builder-slice";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, Plus, Image, Layout, Square, Menu, Mail, Star,
} from "lucide-react";

const sectionTypes = [
  { id: "hero", label: "Hero Banner", icon: Image, desc: "Full-width banner with headline, CTA, and background image" },
  { id: "features", label: "Categories", icon: Layout, desc: "Category grid with customizable cards" },
  { id: "products", label: "Products", icon: Square, desc: "Product grid with filtering" },
  { id: "testimonials", label: "Testimonials", icon: Star, desc: "Customer reviews with avatars" },
  { id: "cta", label: "Newsletter", icon: Mail, desc: "Email signup with call-to-action" },
  { id: "footer", label: "Footer", icon: Menu, desc: "Store footer with links and contact info" },
];

const defaultProps: Record<string, Record<string, string>> = {
  hero: {
    headline: "Welcome to Our Store",
    subheadline: "Discover curated products, fast checkout, and a storefront that feels alive.",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    secondaryButtonText: "Watch Demo",
    secondaryButtonLink: "#",
    imageUrl: "",
    mobileImageUrl: "",
    overlayColor: "rgba(15, 23, 42, 0.45)",
    overlayOpacity: "45",
    textAlignment: "left",
    heroHeight: "md",
    backgroundColor: "",
    backgroundGradient: "",
    kicker: "Welcome",
  },
  features: {
    title: "Shop by Category",
    subtitle: "Browse our collections",
    gridColumns: "4",
    cardStyle: "default",
    backgroundColor: "",
  },
  products: {
    title: "Featured Products",
    subtitle: "Our best selling items",
    gridColumns: "4",
    layout: "grid",
    showBadges: "true",
    showRatings: "true",
    backgroundColor: "",
  },
  testimonials: {
    title: "What Customers Say",
    subtitle: "Hear from our happy customers",
    layout: "grid",
    cardStyle: "default",
    backgroundColor: "",
    avatarStyle: "circle",
  },
  cta: {
    headline: "Stay in the Loop",
    subtitle: "Subscribe to get special offers, free giveaways, and exclusive deals.",
    buttonText: "Subscribe",
    buttonLink: "#",
    inputPlaceholder: "Enter your email",
    backgroundColor: "",
    backgroundImage: "",
  },
  footer: {
    copyright: "© 2026 Your Store. All rights reserved.",
    backgroundColor: "",
    showSocialLinks: "true",
    contactEmail: "hello@example.com",
    contactPhone: "+1 (555) 123-4567",
    contactAddress: "123 Commerce St, NY 10001",
  },
};

export function SectionPanel() {
  const dispatch = useDispatch();
  const sections = useSelector((s: RootState) => s.builder.sections);
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const [showPicker, setShowPicker] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleAdd = (type: string) => {
    const def = sectionTypes.find((s) => s.id === type);
    if (!def) return;
    dispatch(addSection({
      id: `${type}-${Date.now()}`,
      type, label: def.label, visible: true,
      props: { ...(defaultProps[type] ?? {}) },
    }));
    setShowPicker(false);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      dispatch({ type: "builder/moveSection", payload: { from: dragIdx, to: idx } });
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Sections <span className="ml-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">{sections.length}</span>
        </p>
        <button onClick={() => setShowPicker(true)}
          className="flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

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
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-medium text-zinc-700">{section.label}</div>
              <div className="text-[10px] text-zinc-400">{section.type}</div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); dispatch(duplicateSection(section.id)); }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600">
                <Copy className="h-3 w-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); dispatch(toggleSection(section.id)); }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600">
                {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); dispatch(removeSection(section.id)); }}
                className="rounded p-1 text-zinc-400 hover:text-red-500">
                <Trash2 className="h-3 w-3" />
              </button>
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

      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPicker(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
              <h3 className="text-base font-semibold text-zinc-900">Add Section</h3>
              <div className="mt-3 grid gap-1.5">
                {sectionTypes.map((st) => (
                  <button key={st.id} onClick={() => handleAdd(st.id)}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 text-left transition-all hover:border-zinc-200 hover:bg-zinc-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                      <st.icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{st.label}</p>
                      <p className="text-xs text-zinc-400">{st.desc}</p>
                    </div>
                    <Plus className="ml-auto h-4 w-4 text-zinc-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
