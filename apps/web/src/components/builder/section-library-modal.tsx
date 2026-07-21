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
} from "@/redux/slices/builder-slice";
import {
  sectionRegistry,
  sectionCategories,
  getDefaultProps,
  type SectionDef,
} from "@/lib/section-registry";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Star, Clock, TrendingUp, Plus, Layout, Image as ImageIcon,
  ShoppingBag, Package, Grid3x3, Tags, Percent, MessageSquareQuote,
  FileText, HelpCircle, Users, Instagram, Megaphone, AtSign, Zap,
  Video, Mail, Shield, Heart, Info, Minimize, Columns2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Icon map ──────────────────────────────────────────────────────────────────

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

// ─── Popular section types (static list, tuned by usage) ──────────────────────

const POPULAR_TYPES = [
  "hero-banner", "featured-products", "category-grid", "testimonials",
  "newsletter", "featured-categories", "best-sellers", "discount-banner",
  "image-carousel",
];

// ─── Quick-filter type ─────────────────────────────────────────────────────────

type QuickFilter = "all" | "recently-used" | "favorites" | "popular";

// ─── Main component ────────────────────────────────────────────────────────────

type SectionLibraryModalProps = {
  onSectionAdded?: (sectionId: string) => void;
};

export function SectionLibraryModal({ onSectionAdded }: SectionLibraryModalProps) {
  const dispatch = useDispatch();
  const { isOpen, searchTerm, activeCategory, favoriteSections, recentlyUsed, insertPosition, anchorPosition, targetZone } =
    useSelector((s: RootState) => s.builder.sectionLibrary);

  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [addedSectionId, setAddedSectionId] = useState<string | null>(null);

  // Sync local search to Redux (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSectionLibrarySearch(localSearch));
    }, 150);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSearch("");
      setQuickFilter("all");
      setAddedSectionId(null);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(closeSectionLibrary());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, dispatch]);

  // ─── Derived lists ─────────────────────────────────────────────────────────

  const favoriteSectionsList = useMemo(
    () => sectionRegistry.filter((s) => favoriteSections.includes(s.type)),
    [favoriteSections],
  );

  const recentlyUsedList = useMemo(
    () =>
      recentlyUsed
        .map((type) => sectionRegistry.find((s) => s.type === type))
        .filter(Boolean) as SectionDef[],
    [recentlyUsed],
  );

  const popularSections = useMemo(
    () => sectionRegistry.filter((s) => POPULAR_TYPES.includes(s.type)),
    [],
  );

  // ─── Zone-compatible section types ───────────────────────────────────────────

  const HEADER_TYPES = new Set(["announcement-bar", "header-bar", "header-logo", "header-nav", "header-icons"]);
  const FOOTER_TYPES = new Set(["simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "footer-links", "footer-copyright", "footer-social"]);

  const isZoneCompatible = useCallback((section: SectionDef): boolean => {
    if (!targetZone) return true;
    if (targetZone === "header") return section.category === "header" || HEADER_TYPES.has(section.type);
    if (targetZone === "footer") return section.category === "footer" || FOOTER_TYPES.has(section.type);
    return true; // body shows all
  }, [targetZone]);

  // ─── Filtered sections (respects quickFilter + category + search + zone) ─────

  const filteredSections = useMemo(() => {
    let base: SectionDef[];

    switch (quickFilter) {
      case "recently-used":
        base = recentlyUsedList.filter(isZoneCompatible);
        break;
      case "favorites":
        base = favoriteSectionsList.filter(isZoneCompatible);
        break;
      case "popular":
        base = popularSections.filter(isZoneCompatible);
        break;
      default:
        base = sectionRegistry.filter(isZoneCompatible);
        // Apply category filter only when not in a quick-filter view
        if (activeCategory !== "all") {
          base = base.filter((s) => s.category === activeCategory);
        }
        break;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      base = base.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }

    return base;
  }, [quickFilter, activeCategory, searchTerm, recentlyUsedList, favoriteSectionsList, popularSections, isZoneCompatible]);

  // ─── Show grouped sections only on the "all" home view ────────────────────

  const showGrouped = quickFilter === "all" && activeCategory === "all" && !searchTerm;

  // Groups: recently used, favorites, popular → then all
  const groupedContent = useMemo(() => {
    if (!showGrouped) return null;
    return {
      recentlyUsed: recentlyUsedList.slice(0, 4),
      favorites: favoriteSectionsList,
      popular: popularSections,
    };
  }, [showGrouped, recentlyUsedList, favoriteSectionsList, popularSections]);

  // ─── Add section ───────────────────────────────────────────────────────────

  const handleAddSection = useCallback(
    (section: SectionDef) => {
      const id = `${section.type}-${Date.now()}`;
      const newSection = {
        id,
        type: section.type,
        label: section.label,
        visible: true,
        props: getDefaultProps(section.type),
        ...(section.type === "image-carousel" ? {
          style: {
            slides: [
              {
                id: `${id}-slide-1`,
                image: "",
                mobileImage: "",
                alt: "Featured slide",
                title: "Featured collection",
                subtitle: "Add your own imagery",
                description: "Use this reusable carousel for banners, galleries, and product stories.",
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
              },
            ],
          },
        } : {}),
        // Pass insertPosition so addSection reducer can splice at the right index
        ...(insertPosition != null ? { index: insertPosition + 1 } : {}),
      };

      dispatch(addToRecentlyUsed(section.type));
      dispatch(addSection(newSection));
      dispatch(closeSectionLibrary());

      onSectionAdded?.(id);
    },
    [dispatch, insertPosition, onSectionAdded],
  );

  const handleToggleFavorite = useCallback(
    (sectionType: string, e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(toggleFavoriteSection(sectionType));
    },
    [dispatch],
  );

  const handleClose = useCallback(() => {
    dispatch(closeSectionLibrary());
  }, [dispatch]);

  const handleCategoryClick = (catId: string) => {
    setQuickFilter("all");
    dispatch(setSectionLibraryCategory(catId));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[90vh] w-[90vw] max-w-[1600px] overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas"
        >
          {/* ── Left Sidebar ───────────────────────────────────────────────── */}
          <div className="flex w-64 shrink-0 flex-col border-r border-zinc-100 bg-apple-canvas-parchment/80">
            <div className="border-b border-zinc-200 p-4">
              <h3 className="text-sm font-semibold text-apple-ink">Browse</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {/* All */}
              <button
                onClick={() => { setQuickFilter("all"); dispatch(setSectionLibraryCategory("all")); }}
                className={cn(
                  "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  quickFilter === "all" && activeCategory === "all"
                    ? "bg-white text-apple-ink shadow-sm ring-1 ring-zinc-200/60"
                    : "text-apple-ink-muted-80 hover:bg-white/60 hover:text-apple-ink",
                )}
              >
                <div className="flex items-center justify-between">
                  <span>All Sections</span>
                  <span className="text-xs text-apple-ink-muted-48">{sectionRegistry.length}</span>
                </div>
              </button>

              {/* Quick Access */}
              <div className="mb-3 mt-4">
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                  Quick Access
                </p>
                {recentlyUsedList.length > 0 && (
                  <button
                    onClick={() => { setQuickFilter("recently-used"); dispatch(setSectionLibraryCategory("all")); }}
                    className={cn(
                      "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      quickFilter === "recently-used"
                        ? "bg-white text-apple-ink shadow-sm ring-1 ring-zinc-200/60"
                        : "text-apple-ink-muted-80 hover:bg-white/60 hover:text-apple-ink",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Recently Used</span>
                      <span className="ml-auto text-xs text-apple-ink-muted-48">{recentlyUsedList.length}</span>
                    </div>
                  </button>
                )}
                {favoriteSectionsList.length > 0 && (
                  <button
                    onClick={() => { setQuickFilter("favorites"); dispatch(setSectionLibraryCategory("all")); }}
                    className={cn(
                      "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      quickFilter === "favorites"
                        ? "bg-white text-apple-ink shadow-sm ring-1 ring-zinc-200/60"
                        : "text-apple-ink-muted-80 hover:bg-white/60 hover:text-apple-ink",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5" />
                      <span>Favorites</span>
                      <span className="ml-auto text-xs text-apple-ink-muted-48">{favoriteSectionsList.length}</span>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => { setQuickFilter("popular"); dispatch(setSectionLibraryCategory("all")); }}
                  className={cn(
                    "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    quickFilter === "popular"
                      ? "bg-white text-apple-ink shadow-sm ring-1 ring-zinc-200/60"
                      : "text-apple-ink-muted-80 hover:bg-white/60 hover:text-apple-ink",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Popular</span>
                    <span className="ml-auto text-xs text-apple-ink-muted-48">{popularSections.length}</span>
                  </div>
                </button>
              </div>

              {/* Categories */}
              <div>
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                  Categories
                </p>
                {sectionCategories.map((category) => {
                  const count = sectionRegistry.filter((s) => s.category === category.id).length;
                  const isActive = quickFilter === "all" && activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={cn(
                        "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white text-apple-ink shadow-sm ring-1 ring-zinc-200/60"
                          : "text-apple-ink-muted-80 hover:bg-white/60 hover:text-apple-ink",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.label}</span>
                        <span className="text-xs text-apple-ink-muted-48">{count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Main Content ─────────────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-apple-ink">Section Library</h2>
                  <p className="mt-0.5 text-sm text-apple-ink-muted-48">
                    {targetZone
                      ? `Adding to ${targetZone.charAt(0).toUpperCase() + targetZone.slice(1)} — ${filteredSections.length} compatible section${filteredSections.length !== 1 ? "s" : ""}`
                      : insertPosition != null
                      ? `Inserting after position ${insertPosition + 1}`
                      : `${sectionRegistry.length} sections across ${sectionCategories.length} categories`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {insertPosition != null && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
                      Inserting at position {insertPosition + 1}
                    </span>
                  )}
                  <button
                    onClick={handleClose}
                    className="rounded-xl p-2 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search by name, category, or description…"
                  className="h-11 w-full rounded-lg border border-apple-hairline bg-apple-canvas-parchment pl-10 pr-10 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-apple-canvas focus:ring-2 focus:ring-zinc-100"
                  autoFocus
                />
                {localSearch && (
                  <button
                    onClick={() => { setLocalSearch(""); dispatch(setSectionLibrarySearch("")); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-apple-ink-muted-48 hover:text-apple-ink-muted-80 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {groupedContent ? (
                <>
                  {/* Recently Used */}
                  {groupedContent.recentlyUsed.length > 0 && (
                    <SectionGroup
                      title="Recently Used"
                      icon={<Clock className="h-4 w-4" />}
                      sections={groupedContent.recentlyUsed}
                      favoriteSections={favoriteSections}
                      hoveredSection={hoveredSection}
                      onAdd={handleAddSection}
                      onToggleFavorite={handleToggleFavorite}
                      onHover={setHoveredSection}
                    />
                  )}

                  {/* Favorites */}
                  {groupedContent.favorites.length > 0 && (
                    <SectionGroup
                      title="Favorites"
                      icon={<Star className="h-4 w-4 text-amber-500" />}
                      sections={groupedContent.favorites}
                      favoriteSections={favoriteSections}
                      hoveredSection={hoveredSection}
                      onAdd={handleAddSection}
                      onToggleFavorite={handleToggleFavorite}
                      onHover={setHoveredSection}
                    />
                  )}

                  {/* Popular */}
                  <SectionGroup
                    title="Popular Sections"
                    icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
                    sections={groupedContent.popular}
                    favoriteSections={favoriteSections}
                    hoveredSection={hoveredSection}
                    onAdd={handleAddSection}
                    onToggleFavorite={handleToggleFavorite}
                    onHover={setHoveredSection}
                  />
                </>
              ) : (
                <>
                  {/* Quick filter / category heading */}
                  {(quickFilter !== "all" || activeCategory !== "all" || searchTerm) && (
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-apple-ink">
                        {searchTerm
                          ? `${filteredSections.length} result${filteredSections.length !== 1 ? "s" : ""} for "${searchTerm}"`
                          : quickFilter === "recently-used"
                          ? "Recently Used"
                          : quickFilter === "favorites"
                          ? "Favorites"
                          : quickFilter === "popular"
                          ? "Popular Sections"
                          : `${filteredSections.length} section${filteredSections.length !== 1 ? "s" : ""}`}
                      </h3>
                      {searchTerm && (
                        <button
                          onClick={() => { setLocalSearch(""); dispatch(setSectionLibrarySearch("")); }}
                          className="text-xs text-apple-ink-muted-48 hover:text-apple-ink-muted-80 underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}

                  {/* Empty state */}
                  {filteredSections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                        <Search className="h-5 w-5 text-apple-ink-muted-48" />
                      </div>
                      <p className="text-sm font-medium text-apple-ink-muted-80">No sections found</p>
                      <p className="mt-1 text-xs text-apple-ink-muted-48">
                        {quickFilter === "favorites"
                          ? "Star sections to add them here."
                          : quickFilter === "recently-used"
                          ? "Add sections to see them here."
                          : "Try a different search term."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => { setLocalSearch(""); dispatch(setSectionLibrarySearch("")); }}
                          className="mt-3 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}

                  {/* Flat grid */}
                  {filteredSections.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}>
                      {filteredSections.map((section) => (
                        <SectionCard
                          key={section.type}
                          section={section}
                          onAdd={handleAddSection}
                          onToggleFavorite={handleToggleFavorite}
                          isFavorite={favoriteSections.includes(section.type)}
                          isHovered={hoveredSection === section.type}
                          onHover={setHoveredSection}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── SectionGroup helper ───────────────────────────────────────────────────────

function SectionGroup({
  title,
  icon,
  sections,
  favoriteSections,
  hoveredSection,
  onAdd,
  onToggleFavorite,
  onHover,
}: {
  title: string;
  icon: React.ReactNode;
  sections: SectionDef[];
  favoriteSections: string[];
  hoveredSection: string | null;
  onAdd: (s: SectionDef) => void;
  onToggleFavorite: (type: string, e: React.MouseEvent) => void;
  onHover: (type: string | null) => void;
}) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-apple-ink">
        {icon}
        {title}
        <span className="ml-1 text-xs font-normal text-apple-ink-muted-48">({sections.length})</span>
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}>
        {sections.map((section) => (
          <SectionCard
            key={section.type}
            section={section}
            onAdd={onAdd}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favoriteSections.includes(section.type)}
            isHovered={hoveredSection === section.type}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SectionCard ───────────────────────────────────────────────────────────────

function SectionCard({
  section,
  onAdd,
  onToggleFavorite,
  isFavorite,
  isHovered,
  onHover,
}: {
  section: SectionDef;
  onAdd: (s: SectionDef) => void;
  onToggleFavorite: (type: string, e: React.MouseEvent) => void;
  isFavorite: boolean;
  isHovered: boolean;
  onHover: (type: string | null) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-apple-canvas transition-colors duration-150",
        isHovered
          ? "border-zinc-300 ring-1 ring-zinc-200"
          : "border-apple-divider-soft hover:border-apple-hairline",
      )}
      onMouseEnter={() => onHover(section.type)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onAdd(section)}
    >
      {/* Preview area */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-apple-canvas-parchment">
        <div className="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <SectionIcon icon={section.icon} className="h-8 w-8 text-apple-ink-muted-48" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-apple-ink-muted-48">
            {section.category}
          </span>
        </div>

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-zinc-900/80 transition-opacity duration-150",
          isHovered ? "opacity-100" : "opacity-0",
        )}>
          <div className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 shadow-lg">
            <Plus className="h-3.5 w-3.5 text-apple-ink-muted-80" />
            <span className="text-xs font-semibold text-apple-ink">Add Section</span>
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => onToggleFavorite(section.type, e)}
          className={cn(
            "absolute right-2 top-2 rounded-lg p-1.5 transition-all",
            isFavorite
              ? "text-amber-500 opacity-100"
              : "text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-amber-400",
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium leading-tight text-apple-ink">{section.label}</p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-apple-ink-muted-48">
          {section.description}
        </p>
      </div>
    </div>
  );
}
