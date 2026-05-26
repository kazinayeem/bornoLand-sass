"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  addSection, removeSection, toggleSection, duplicateSection,
  setSelectedSection, renameSection, toggleFavoriteSection,
} from "@/redux/slices/builder-slice";
import type { SectionCategory } from "@/redux/slices/builder-slice";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, Plus, Image, Layout,
  Square, Menu, Mail, Star, Search, Clock, Sparkles, Tag, Grid3X3,
  MessageSquare, Video, HelpCircle, BarChart3, PanelBottom, Zap,
  Heart, ChevronDown, ChevronRight, PencilLine, Check, X,
} from "lucide-react";

type SectionType = {
  id: string;
  label: string;
  icon: typeof Image;
  desc: string;
  category: SectionCategory;
};

const sectionTypes: SectionType[] = [
  { id: "hero", label: "Hero Banner", icon: Image, desc: "Full-width banner with headline, CTA, and background image", category: "hero" },
  { id: "announcement", label: "Announcement Bar", icon: PanelBottom, desc: "Top bar for promos, shipping info, alerts", category: "hero" },
  { id: "image-banner", label: "Image Banner", icon: Image, desc: "Single image banner with optional overlay text", category: "hero" },
  { id: "flash-sale", label: "Flash Sale", icon: Zap, desc: "Limited-time offer with countdown timer", category: "promotion" },
  { id: "countdown", label: "Countdown Campaign", icon: Clock, desc: "Campaign timer with message and CTA", category: "promotion" },
  { id: "multi-banner", label: "Multi Banner Grid", icon: Grid3X3, desc: "Grid of promotional banner images", category: "promotion" },
  { id: "features", label: "Categories", icon: Layout, desc: "Category grid with customizable cards", category: "content" },
  { id: "products", label: "Products", icon: Square, desc: "Product grid with filtering", category: "content" },
  { id: "collection", label: "Collection Showcase", icon: Sparkles, desc: "Curated product collection with banner", category: "content" },
  { id: "video", label: "Video Section", icon: Video, desc: "Embedded video with caption and CTA", category: "content" },
  { id: "faq", label: "FAQ Accordion", icon: HelpCircle, desc: "Expandable questions and answers", category: "content" },
  { id: "feature-cards", label: "Feature Cards", icon: BarChart3, desc: "Icon-based feature highlights", category: "content" },
  { id: "stats", label: "Stats Counter", icon: BarChart3, desc: "Animated statistics counter row", category: "content" },
  { id: "brand-logos", label: "Brand Logos", icon: Tag, desc: "Logo carousel or grid of brand partners", category: "social" },
  { id: "testimonials", label: "Testimonials", icon: Star, desc: "Customer reviews with avatars", category: "social" },
  { id: "cta", label: "Newsletter", icon: Mail, desc: "Email signup with call-to-action", category: "social" },
  { id: "footer", label: "Footer", icon: Menu, desc: "Store footer with links and contact info", category: "content" },
];

const categoryLabels: Record<SectionCategory | "products", string> = {
  hero: "Hero & Banners",
  promotion: "Promotions",
  content: "Content",
  social: "Social & Engagement",
  products: "Products",
};

const defaultProps: Record<string, Record<string, string>> = {
  hero: {
    headline: "Welcome to Our Store", subheadline: "Discover curated products, fast checkout, and a storefront that feels alive.",
    buttonText: "Shop Now", buttonLink: "/shop", secondaryButtonText: "Watch Demo", secondaryButtonLink: "#",
    imageUrl: "", mobileImageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", overlayOpacity: "45",
    textAlignment: "left", heroHeight: "md", backgroundColor: "", backgroundGradient: "", kicker: "Welcome",
  },
  announcement: {
    text: "Free shipping on orders over $50! Use code FREESHIP", backgroundColor: "#18181b", textColor: "#ffffff",
    link: "/shop", linkText: "Shop Now", showClose: "true",
  },
  "image-banner": {
    imageUrl: "", headline: "New Collection", subtitle: "Discover our latest arrivals",
    buttonText: "Explore", buttonLink: "/shop", overlayOpacity: "30", textAlignment: "center",
  },
  "flash-sale": {
    title: "Flash Sale", subtitle: "Limited time offers", endDate: "", backgroundColor: "#fef2f2",
    textColor: "#991b1b", accentColor: "#dc2626", products: "",
  },
  countdown: {
    title: "Big Sale Coming", subtitle: "Get ready for amazing deals", targetDate: "",
    message: "Sale ends in:", buttonText: "Notify Me", buttonLink: "#", backgroundColor: "#0f172a",
    textColor: "#f8fafc", accentColor: "#f59e0b",
  },
  "multi-banner": {
    columns: "3", gap: "4", borderRadius: "12",
  },
  features: {
    title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4",
    cardStyle: "default", backgroundColor: "",
  },
  products: {
    title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4",
    layout: "grid", showBadges: "true", showRatings: "true", backgroundColor: "",
  },
  collection: {
    title: "Collection Spotlight", subtitle: "Curated just for you", imageUrl: "",
    buttonText: "View Collection", buttonLink: "/shop", layout: "left",
    backgroundColor: "", productIds: "",
  },
  video: {
    videoUrl: "", posterUrl: "", title: "Featured Video", caption: "Learn more about our story",
    buttonText: "Learn More", buttonLink: "#", autoplay: "false", backgroundColor: "",
  },
  faq: {
    title: "Frequently Asked Questions", subtitle: "Everything you need to know",
    backgroundColor: "", items: '[{"q":"How do I place an order?","a":"Simply browse our catalog, add items to your cart, and proceed to checkout."},{"q":"What payment methods do you accept?","a":"We accept Visa, Mastercard, PayPal, and more."},{"q":"How long does shipping take?","a":"Standard shipping takes 5-7 business days."}]',
  },
  "feature-cards": {
    title: "Why Choose Us", subtitle: "We deliver quality and value",
    columns: "3", cardStyle: "default", backgroundColor: "",
  },
  stats: {
    title: "Our Numbers", subtitle: "Trusted by thousands",
    stat1label: "Products", stat1value: "10K+", stat2label: "Customers", stat2value: "50K+",
    stat3label: "Reviews", stat3value: "25K+", stat4label: "Countries", stat4value: "30+",
    backgroundColor: "#18181b", textColor: "#fafafa", accentColor: "#f59e0b",
  },
  "brand-logos": {
    title: "Trusted By", subtitle: "Brands that love us",
    layout: "carousel", backgroundColor: "#fafafa",
  },
  testimonials: {
    title: "What Customers Say", subtitle: "Hear from our happy customers",
    layout: "grid", cardStyle: "default", backgroundColor: "", avatarStyle: "circle",
  },
  cta: {
    headline: "Stay in the Loop", subtitle: "Subscribe to get special offers, free giveaways, and exclusive deals.",
    buttonText: "Subscribe", buttonLink: "#", inputPlaceholder: "Enter your email",
    backgroundColor: "", backgroundImage: "",
  },
  footer: {
    copyright: "© 2026 Your Store. All rights reserved.", backgroundColor: "",
    showSocialLinks: "true", contactEmail: "hello@example.com",
    contactPhone: "+1 (555) 123-4567", contactAddress: "123 Commerce St, NY 10001",
  },
};

export function SectionPanel() {
  const dispatch = useDispatch();
  const sections = useSelector((s: RootState) => s.builder.sections);
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const favoriteTypes = useSelector((s: RootState) => s.builder.favoriteSectionTypes);
  const [showPicker, setShowPicker] = useState(false);
  const [pickSearch, setPickSearch] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.focus();
  }, [renamingId]);

  const filteredTypes = useMemo(() => {
    if (!pickSearch) return sectionTypes;
    const q = pickSearch.toLowerCase();
    return sectionTypes.filter((t) =>
      t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.id.includes(q)
    );
  }, [pickSearch]);

  const groupedTypes = useMemo(() => {
    const map: Record<string, SectionType[]> = {};
    const favs = filteredTypes.filter((t) => favoriteTypes.includes(t.id));
    if (favs.length > 0) map["_favorites"] = favs;
    for (const t of filteredTypes) {
      if (favoriteTypes.includes(t.id)) continue;
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    }
    return map;
  }, [filteredTypes, favoriteTypes]);

  const handleAdd = (type: string) => {
    const def = sectionTypes.find((s) => s.id === type);
    if (!def) return;
    dispatch(addSection({
      id: `${type}-${Date.now()}`,
      type, label: def.label, visible: true,
      props: { ...(defaultProps[type] ?? {}) },
    }));
    setShowPicker(false);
    setPickSearch("");
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

  const startRename = (id: string, currentLabel: string) => {
    setRenamingId(id);
    setRenameValue(currentLabel);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      dispatch(renameSection({ id: renamingId, label: renameValue.trim() }));
    }
    setRenamingId(null);
  };

  const catOrder: (SectionCategory | "_favorites")[] = ["_favorites", "hero", "promotion", "content", "social"];

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
            onClick={() => { if (renamingId !== section.id) dispatch(setSelectedSection(section.id)); }}
            className={`group flex items-center gap-2 rounded-lg border p-2.5 transition-all cursor-pointer ${
              selectedId === section.id
                ? "border-zinc-900 bg-zinc-50 shadow-sm"
                : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50"
            } ${!section.visible ? "opacity-50" : ""}`}>
            <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-zinc-300" />
            <div className="flex-1 min-w-0">
              {renamingId === section.id ? (
                <div className="flex items-center gap-1">
                  <input ref={renameRef} value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-full rounded border border-zinc-300 bg-white px-1.5 text-xs text-zinc-900 outline-none" />
                  <button onClick={(e) => { e.stopPropagation(); commitRename(); }}
                    className="rounded p-0.5 text-green-600 hover:text-green-700"><Check className="h-3 w-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}
                    className="rounded p-0.5 text-zinc-400 hover:text-zinc-600"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className="truncate text-xs font-medium text-zinc-700">{section.label}</div>
              )}
              <div className="text-[10px] text-zinc-400">{section.type}</div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); startRename(section.id, section.label); }}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600">
                <PencilLine className="h-3 w-3" />
              </button>
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
              className="flex w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl max-h-[80vh]">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <h3 className="text-base font-semibold text-zinc-900">Add Section</h3>
                <button onClick={() => { setShowPicker(false); setPickSearch(""); }}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input value={pickSearch} onChange={(e) => setPickSearch(e.target.value)}
                    placeholder="Search sections..."
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none" />
                </div>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto px-5 pb-5">
                {pickSearch && filteredTypes.length === 0 && (
                  <p className="py-8 text-center text-xs text-zinc-400">No sections match your search</p>
                )}
                {catOrder.map((cat) => {
                  const items = groupedTypes[cat] ?? [];
                  if (items.length === 0) return null;
                  const isCollapsed = collapsedCats[cat];
                  const isFav = cat === "_favorites";
                  return (
                    <div key={cat}>
                      <button onClick={() => setCollapsedCats((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                        className="flex w-full items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        {isFav ? <Heart className="h-3 w-3 fill-pink-400 text-pink-400" /> : (
                          isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                        {isFav ? "Favorites" : categoryLabels[cat as SectionCategory]}
                        <span className="ml-1 rounded bg-zinc-100 px-1 py-0.5 text-[9px] font-medium text-zinc-500">{items.length}</span>
                      </button>
                      {!isCollapsed && items.map((st) => {
                        const isFavorited = favoriteTypes.includes(st.id);
                        return (
                          <button key={st.id} onClick={() => handleAdd(st.id)}
                            className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-all hover:bg-zinc-50">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                              <st.icon className="h-3.5 w-3.5 text-zinc-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-zinc-900">{st.label}</p>
                              <p className="truncate text-[10px] text-zinc-400">{st.desc}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); dispatch(toggleFavoriteSection(st.id)); }}
                              className="shrink-0 rounded p-1 text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-pink-500">
                              <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-pink-400 text-pink-400 opacity-100" : ""}`} />
                            </button>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
