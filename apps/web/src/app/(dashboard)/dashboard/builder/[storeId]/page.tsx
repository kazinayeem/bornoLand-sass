"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGetStoreQuery } from "@/redux/api/store-api";
import { toast } from "sonner";
import {
  ArrowLeft, GripVertical, Plus, Eye, Smartphone, Tablet, Monitor,
  Save, Check, X, Layout, Type, Image, Square, Menu, Mail
} from "lucide-react";

const sectionTypes = [
  { id: "hero", label: "Hero Banner", icon: Image, description: "Full-width banner with headline" },
  { id: "features", label: "Features", icon: Layout, description: "Showcase features or categories" },
  { id: "products", label: "Products", icon: Square, description: "Product grid display" },
  { id: "testimonials", label: "Testimonials", icon: Type, description: "Customer reviews" },
  { id: "cta", label: "Call to Action", icon: Menu, description: "Newsletter or CTA banner" },
  { id: "footer", label: "Footer", icon: Mail, description: "Store footer" }
];

type Section = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  props: Record<string, string>;
};

const defaultSectionProps: Record<string, Record<string, string>> = {
  hero: { headline: "Welcome to Our Store", subheadline: "Discover amazing products", buttonText: "Shop Now", buttonUrl: "#" },
  features: { title: "Shop by Category", description: "Browse our collections" },
  products: { title: "Featured Products" },
  testimonials: { title: "What Customers Say" },
  cta: { headline: "Stay in the Loop", buttonText: "Subscribe" },
  footer: { copyright: "© 2026 Your Store. All rights reserved." }
};

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const { data: storeData } = useGetStoreQuery(storeId);
  const store = storeData?.data?.store;

  const [sections, setSections] = useState<Section[]>([
    { id: "hero", type: "hero", label: "Hero Banner", visible: true, props: { ...defaultSectionProps.hero } },
    { id: "features", type: "features", label: "Features", visible: true, props: { ...defaultSectionProps.features } },
    { id: "products", type: "products", label: "Products", visible: true, props: { ...defaultSectionProps.products } },
    { id: "testimonials", type: "testimonials", label: "Testimonials", visible: true, props: { ...defaultSectionProps.testimonials } },
    { id: "cta", type: "cta", label: "Call to Action", visible: true, props: { ...defaultSectionProps.cta } },
    { id: "footer", type: "footer", label: "Footer", visible: true, props: { ...defaultSectionProps.footer } }
  ]);

  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editProps, setEditProps] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const moveSection = useCallback((from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }, [sections.length]);

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const addSection = (type: string) => {
    const sectionDef = sectionTypes.find((s) => s.id === type);
    if (!sectionDef) return;
    const newId = `${type}-${Date.now()}`;
    setSections((prev) => [...prev, {
      id: newId, type, label: sectionDef.label, visible: true,
      props: { ...(defaultSectionProps[type] ?? {}) }
    }]);
    setShowSectionPicker(false);
  };

  const openEditSection = (section: Section) => {
    setEditingSection(section.id);
    setEditProps({ ...section.props });
  };

  const saveEditSection = () => {
    if (!editingSection) return;
    setSections((prev) => prev.map((s) => s.id === editingSection ? { ...s, props: editProps } : s));
    setEditingSection(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Storefront layout saved!");
    setSaving(false);
  };

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const previewWidth = previewMode === "mobile" ? "w-[375px]" : previewMode === "tablet" ? "w-[768px]" : "w-full";

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900">Storefront Editor</h1>
            <p className="text-xs text-zinc-400">{store.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
            {[
              { mode: "desktop" as const, icon: Monitor },
              { mode: "tablet" as const, icon: Tablet },
              { mode: "mobile" as const, icon: Smartphone }
            ].map(({ mode, icon: Icon }) => (
              <button key={mode} onClick={() => setPreviewMode(mode)}
                className={`rounded-md p-1.5 ${previewMode === mode ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <button onClick={() => setShowSectionPicker(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
            <Plus className="h-3.5 w-3.5" /> Add Section
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-zinc-400">Sections</p>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div key={section.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={() => { if (dragIndex !== null && dragIndex !== index) { moveSection(dragIndex, index); setDragIndex(null); } }}
                onDragEnd={() => setDragIndex(null)}
                className={`rounded-xl border p-3 transition-all ${section.visible ? "border-zinc-200 bg-white" : "border-dashed border-zinc-300 bg-zinc-50 opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-zinc-300" />
                    <span className="truncate text-sm font-medium text-zinc-700">{section.label}</span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => openEditSection(section)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                      <Type className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggleSection(section.id)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                      {section.visible ? <Eye className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => removeSection(section.id)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-zinc-100 p-8">
          <div className={`${previewWidth} space-y-0 rounded-2xl bg-white shadow-lg`}
            style={{ fontFamily: store.theme?.font ?? "Inter" }}>
            {sections.filter((s) => s.visible).map((section) => (
              <div key={section.id} className="p-8 text-center border-b border-zinc-100 last:border-b-0"
                style={{ backgroundColor: store.theme?.darkMode ? "#09090b" : "#ffffff" }}>
                {section.type === "hero" && (
                  <div>
                    <h1 className="text-3xl font-bold" style={{ color: store.theme?.darkMode ? "#fafafa" : "#18181b" }}>
                      {section.props.headline || "Welcome"}
                    </h1>
                    <p className="mt-3 text-sm" style={{ color: store.theme?.darkMode ? "#a1a1aa" : "#71717a" }}>
                      {section.props.subheadline || ""}
                    </p>
                    <button className="mt-4 px-6 py-2.5 text-sm font-medium text-white"
                      style={{ borderRadius: store.theme?.buttonStyle ?? "rounded-lg", backgroundColor: store.theme?.primaryColor ?? "#2563eb" }}>
                      {section.props.buttonText || "Shop Now"}
                    </button>
                  </div>
                )}
                {section.type === "features" && (
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: store.theme?.darkMode ? "#fafafa" : "#18181b" }}>
                      {section.props.title || "Features"}
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: store.theme?.darkMode ? "#a1a1aa" : "#71717a" }}>
                      {section.props.description || ""}
                    </p>
                  </div>
                )}
                {section.type === "products" && (
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: store.theme?.darkMode ? "#fafafa" : "#18181b" }}>
                      {section.props.title || "Products"}
                    </h2>
                  </div>
                )}
                {section.type === "testimonials" && (
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: store.theme?.darkMode ? "#fafafa" : "#18181b" }}>
                      {section.props.title || "Testimonials"}
                    </h2>
                  </div>
                )}
                {section.type === "cta" && (
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: store.theme?.darkMode ? "#fafafa" : "#18181b" }}>
                      {section.props.headline || "Subscribe"}
                    </h2>
                    <button className="mt-4 px-6 py-2.5 text-sm font-medium text-white"
                      style={{ borderRadius: store.theme?.buttonStyle ?? "rounded-lg", backgroundColor: store.theme?.primaryColor ?? "#2563eb" }}>
                      {section.props.buttonText || "Subscribe"}
                    </button>
                  </div>
                )}
                {section.type === "footer" && (
                  <div>
                    <p className="text-xs" style={{ color: store.theme?.darkMode ? "#a1a1aa" : "#71717a" }}>
                      {section.props.copyright || "© Your Store"}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSectionPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowSectionPicker(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-zinc-900">Add Section</h3>
              <p className="mt-1 text-sm text-zinc-500">Choose a section type to add to your storefront.</p>
              <div className="mt-4 grid gap-2">
                {sectionTypes.map((st) => (
                  <button key={st.id} onClick={() => addSection(st.id)}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                      <st.icon className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{st.label}</p>
                      <p className="text-xs text-zinc-500">{st.description}</p>
                    </div>
                    <Plus className="ml-auto h-4 w-4 text-zinc-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingSection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditingSection(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-zinc-900">Edit Section</h3>
              <div className="mt-4 space-y-3">
                {Object.entries(editProps).map(([key, value]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium capitalize text-zinc-500">{key.replace(/([A-Z])/g, " $1").trim()}</label>
                    <input type="text" value={value} onChange={(e) => setEditProps((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setEditingSection(null)} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button onClick={saveEditSection} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
