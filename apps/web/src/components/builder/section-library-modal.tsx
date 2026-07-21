"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  closeSectionLibrary,
  setSectionLibrarySearch,
  setSectionLibraryCategory,
  toggleFavoriteSection,
  addToRecentlyUsed,
  addSection,
  setEditingZone,
} from "@/redux/slices/builder-slice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Star, Clock, TrendingUp, Plus, Eye,
  Layout, Image as ImageIcon, ShoppingBag, Package, Grid3x3, Tags,
  Percent, MessageSquareQuote, FileText, HelpCircle, Users, Instagram,
  Megaphone, Zap, Video, Mail, Shield, Heart, Info, Minimize, Columns2,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LIBRARY_CATEGORIES,
  POPULAR_LIBRARY_TYPES,
  getLibraryDefaults,
  getLibrarySections,
  resolveLibraryRenderType,
  searchLibrarySections,
  type LibraryCategoryId,
  type LibrarySection,
} from "@/lib/section-library-catalog";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout, Image: ImageIcon, ShoppingBag, Package, Grid3x3, Tags, Percent,
  MessageSquareQuote, FileText, HelpCircle, Users, Instagram, Megaphone,
  Zap, Video, Mail, Shield, Heart, Info, Minimize, Columns2, AtSign,
  Star, Clock, TrendingUp, Plus,
};

function SectionIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] || Layout;
  return <Icon className={className} />;
}

type QuickFilter = "all" | "recently-used" | "favorites" | "popular";

const ACCENT: Record<LibraryCategoryId, string> = {
  hero: "#0066cc",
  header: "#1d1d1f",
  footer: "#333333",
  products: "#0071e3",
  category: "#2997ff",
  reviews: "#b45309",
  promotions: "#c2410c",
  gallery: "#7c3aed",
  about: "#0f766e",
  contact: "#0369a1",
  services: "#4338ca",
  newsletter: "#be185d",
  statistics: "#15803d",
  video: "#b91c1c",
  blog: "#57534e",
  faq: "#475569",
};

export function SectionLibraryModal({ onSectionAdded }: { onSectionAdded?: (sectionId: string) => void }) {
  const dispatch = useDispatch();
  const { isOpen, searchTerm, activeCategory, favoriteSections, recentlyUsed, insertPosition, targetZone } =
    useSelector((s: RootState) => s.builder.sectionLibrary);

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [previewType, setPreviewType] = useState<string | null>(null);

  const allSections = useMemo(() => getLibrarySections(), []);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(setSectionLibrarySearch(localSearch)), 150);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setLocalSearch("");
      setQuickFilter("all");
      setPreviewType(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(closeSectionLibrary());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, dispatch]);

  const HEADER_TYPES = useMemo(
    () => new Set(allSections.filter((s) => s.libraryCategory === "header").map((s) => s.type)),
    [allSections],
  );
  const FOOTER_TYPES = useMemo(
    () => new Set(allSections.filter((s) => s.libraryCategory === "footer").map((s) => s.type)),
    [allSections],
  );

  const isZoneCompatible = useCallback((section: LibrarySection) => {
    if (!targetZone) return true;
    if (targetZone === "header") return section.libraryCategory === "header" || HEADER_TYPES.has(section.type) || section.type === "announcement-bar";
    if (targetZone === "footer") return section.libraryCategory === "footer" || FOOTER_TYPES.has(section.type);
    // Body: hide header/footer shells
    return section.libraryCategory !== "header" && section.libraryCategory !== "footer";
  }, [targetZone, HEADER_TYPES, FOOTER_TYPES]);

  const filteredSections = useMemo(() => {
    let base = allSections.filter(isZoneCompatible);

    if (quickFilter === "recently-used") {
      base = recentlyUsed
        .map((type) => allSections.find((s) => s.type === type))
        .filter((s): s is LibrarySection => Boolean(s && isZoneCompatible(s)));
    } else if (quickFilter === "favorites") {
      base = base.filter((s) => favoriteSections.includes(s.type));
    } else if (quickFilter === "popular") {
      base = base.filter((s) => POPULAR_LIBRARY_TYPES.includes(s.type));
    } else if (activeCategory !== "all") {
      base = base.filter((s) => s.libraryCategory === activeCategory);
    }

    if (searchTerm) base = searchLibrarySections(searchTerm, base);
    return base;
  }, [allSections, isZoneCompatible, quickFilter, recentlyUsed, favoriteSections, activeCategory, searchTerm]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of allSections.filter(isZoneCompatible)) {
      counts[s.libraryCategory] = (counts[s.libraryCategory] ?? 0) + 1;
    }
    return counts;
  }, [allSections, isZoneCompatible]);

  const handleAddSection = useCallback((section: LibrarySection) => {
    const renderType = resolveLibraryRenderType(section.type);
    const id = `${section.type}-${Date.now()}`;
    const zone =
      section.libraryCategory === "header" ? "header"
      : section.libraryCategory === "footer" ? "footer"
      : "body";

    if (targetZone !== zone) {
      dispatch(setEditingZone(zone));
    }

    const newSection = {
      id,
      type: section.type,
      label: section.label,
      visible: true,
      props: getLibraryDefaults(section.type),
      ...(renderType === "image-carousel" || section.type === "image-carousel" ? {
        style: {
          slides: [{
            id: `${id}-slide-1`,
            image: "",
            mobileImage: "",
            alt: "Featured slide",
            title: "Featured collection",
            subtitle: "Add your own imagery",
            description: "Showcase your best visuals.",
            buttonText: "Shop now",
            buttonUrl: "/shop",
            badge: "New",
            imageFit: "cover",
            imagePosition: "center",
            textAlignment: "left",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,0.15)",
            backgroundOverlay: "rgba(0,0,0,0.15)",
            gradientOverlay: "linear-gradient(180deg, rgba(15,23,42,0.15), rgba(15,23,42,0.7))",
          }],
        },
      } : {}),
      ...(insertPosition != null ? { index: insertPosition + 1 } : {}),
    };

    dispatch(addToRecentlyUsed(section.type));
    dispatch(addSection(newSection));
    dispatch(closeSectionLibrary());
    onSectionAdded?.(id);
  }, [dispatch, insertPosition, onSectionAdded, targetZone]);

  const handleToggleFavorite = useCallback((sectionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavoriteSection(sectionType));
  }, [dispatch]);

  if (!isOpen) return null;

  const previewSection = previewType ? allSections.find((s) => s.type === previewType) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-6"
        onClick={() => dispatch(closeSectionLibrary())}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[92vh] w-full max-w-[1280px] overflow-hidden rounded-apple-lg border border-apple-hairline bg-apple-canvas shadow-2xl"
        >
          {/* Categories */}
          <aside className="flex w-[220px] shrink-0 flex-col border-r border-apple-hairline bg-apple-canvas-parchment/80 sm:w-[240px]">
            <div className="border-b border-apple-hairline px-4 py-4">
              <p className="text-body-strong text-apple-ink">Add a section</p>
              <p className="mt-0.5 text-fine-print text-apple-ink-muted-48">Pick what your page needs</p>
            </div>
            <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
              <NavButton
                active={quickFilter === "all" && activeCategory === "all"}
                onClick={() => { setQuickFilter("all"); dispatch(setSectionLibraryCategory("all")); }}
                label="All sections"
                count={allSections.filter(isZoneCompatible).length}
              />
              <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Quick</p>
              <NavButton active={quickFilter === "popular"} onClick={() => setQuickFilter("popular")} label="Popular" icon={<TrendingUp className="h-3.5 w-3.5" />} />
              <NavButton active={quickFilter === "favorites"} onClick={() => setQuickFilter("favorites")} label="Favorites" icon={<Star className="h-3.5 w-3.5" />} />
              {recentlyUsed.length > 0 && (
                <NavButton active={quickFilter === "recently-used"} onClick={() => setQuickFilter("recently-used")} label="Recently used" icon={<Clock className="h-3.5 w-3.5" />} />
              )}
              <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Categories</p>
              {LIBRARY_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0;
                if (targetZone === "body" && (cat.id === "header" || cat.id === "footer") && count === 0) return null;
                if (targetZone === "header" && cat.id !== "header" && cat.id !== "promotions") return null;
                if (targetZone === "footer" && cat.id !== "footer") return null;
                return (
                  <NavButton
                    key={cat.id}
                    active={quickFilter === "all" && activeCategory === cat.id}
                    onClick={() => { setQuickFilter("all"); dispatch(setSectionLibraryCategory(cat.id)); }}
                    label={`${cat.emoji} ${cat.label}`}
                    count={count}
                  />
                );
              })}
            </div>
          </aside>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-apple-hairline px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-tagline text-apple-ink">Section Library</h2>
                  <p className="mt-0.5 text-caption text-apple-ink-muted-48">
                    {filteredSections.length} option{filteredSections.length === 1 ? "" : "s"}
                    {targetZone ? ` for your ${targetZone === "body" ? "page" : targetZone}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(closeSectionLibrary())}
                  className="rounded-apple-md p-2 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
                <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder='Try “sale”, “reviews”, or “header”…'
                  className="h-11 w-full rounded-apple-pill border border-apple-hairline bg-apple-canvas-parchment pl-10 pr-10 text-caption text-apple-ink outline-none placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:bg-apple-canvas focus:ring-2 focus:ring-apple-primary/15"
                  autoFocus
                />
                {localSearch ? (
                  <button
                    type="button"
                    onClick={() => { setLocalSearch(""); dispatch(setSectionLibrarySearch("")); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-apple-ink-muted-48"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {filteredSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="mb-3 h-8 w-8 text-apple-ink-muted-48 opacity-40" />
                  <p className="text-body-strong text-apple-ink">No matching sections</p>
                  <p className="mt-1 text-caption text-apple-ink-muted-48">Try another keyword like “products” or “footer”</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredSections.map((section) => (
                    <SectionCard
                      key={section.type}
                      section={section}
                      isFavorite={favoriteSections.includes(section.type)}
                      onAdd={() => handleAddSection(section)}
                      onPreview={() => setPreviewType(section.type)}
                      onToggleFavorite={(e) => handleToggleFavorite(section.type, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview drawer */}
          <AnimatePresence>
            {previewSection ? (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden shrink-0 overflow-hidden border-l border-apple-hairline bg-apple-canvas lg:block"
              >
                <div className="flex h-full w-[320px] flex-col p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-caption-strong text-apple-ink">Preview</p>
                    <button type="button" onClick={() => setPreviewType(null)} className="rounded-apple-md p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div
                    className="mt-4 flex aspect-[4/3] items-center justify-center rounded-apple-lg"
                    style={{ background: `linear-gradient(145deg, ${ACCENT[previewSection.libraryCategory]}14, #f5f5f7)` }}
                  >
                    <SectionIcon icon={previewSection.icon} className="h-12 w-12 text-apple-ink-muted-48" />
                  </div>
                  <h3 className="mt-4 text-tagline text-apple-ink">{previewSection.label}</h3>
                  <p className="mt-2 text-caption text-apple-ink-muted-48">{previewSection.description}</p>
                  <p className="mt-3 text-fine-print text-apple-ink-muted-48">
                    {LIBRARY_CATEGORIES.find((c) => c.id === previewSection.libraryCategory)?.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddSection(previewSection)}
                    className="btn-press mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-apple-pill bg-apple-primary text-body font-medium text-apple-on-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Add section
                  </button>
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function NavButton({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-apple-md px-3 py-2.5 text-left text-caption font-medium transition-colors",
        active
          ? "bg-apple-canvas text-apple-ink shadow-sm ring-1 ring-apple-hairline"
          : "text-apple-ink-muted-80 hover:bg-apple-canvas/70 hover:text-apple-ink",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span className="text-fine-print text-apple-ink-muted-48">{count}</span>
      ) : null}
    </button>
  );
}

function SectionCard({
  section,
  isFavorite,
  onAdd,
  onPreview,
  onToggleFavorite,
}: {
  section: LibrarySection;
  isFavorite: boolean;
  onAdd: () => void;
  onPreview: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  const accent = ACCENT[section.libraryCategory];
  return (
    <article className="group flex flex-col overflow-hidden rounded-apple-lg border border-apple-hairline bg-apple-canvas transition-all duration-200 hover:border-apple-primary/30 hover:shadow-[0_8px_30px_-18px_rgba(0,0,0,0.2)]">
      <div
        className="relative flex aspect-[16/10] items-center justify-center"
        style={{ background: `linear-gradient(145deg, ${accent}18 0%, #f5f5f7 55%, #ffffff 100%)` }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-apple-lg bg-white/90 shadow-sm ring-1 ring-apple-hairline">
          <SectionIcon icon={section.icon} className="h-6 w-6" />
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            "absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 shadow-sm transition-colors",
            isFavorite ? "text-amber-500" : "text-apple-ink-muted-48 hover:text-amber-500",
          )}
          aria-label={isFavorite ? "Remove favorite" : "Favorite"}
        >
          <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-body-strong text-apple-ink">{section.label}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-caption leading-snug text-apple-ink-muted-48">
          {section.description}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="btn-press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-apple-pill border border-apple-hairline text-caption font-medium text-apple-ink hover:bg-apple-canvas-parchment"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="btn-press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-apple-pill bg-apple-primary text-caption font-medium text-apple-on-primary hover:bg-apple-primary-focus"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
