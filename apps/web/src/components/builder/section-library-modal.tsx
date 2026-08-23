"use client";

import { useCallback, useMemo, useState, useEffect, useRef, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  closeSectionLibrary,
  setSectionLibrarySearch,
  setSectionLibraryCategory,
  setFavoriteSections,
  setRecentlyUsedSections,
  toggleFavoriteSection,
  addToRecentlyUsed,
  addSection,
  setEditingZone,
  setHeaderSettings,
  setFooterSettings,
  undoBuilder,
} from "@/redux/slices/builder-slice";
import {
  applyHeaderTemplateSelection,
  applyFooterTemplateSelection,
} from "@/lib/storefront/global-navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Layout,
  Image as ImageIcon,
  ShoppingBag,
  Package,
  Grid3x3,
  Tags,
  Percent,
  MessageSquareQuote,
  FileText,
  HelpCircle,
  Users,
  Instagram,
  Megaphone,
  Zap,
  Video,
  Mail,
  Shield,
  Heart,
  Info,
  Minimize,
  Columns2,
  AtSign,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Crown,
  Grid,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LIBRARY_CATEGORIES,
  POPULAR_LIBRARY_TYPES,
  NEW_LIBRARY_TYPES,
  PRO_LIBRARY_TYPES,
  getLibraryDefaults,
  getLibrarySections,
  resolveLibraryRenderType,
  searchLibrarySections,
  type LibraryCategoryId,
  type LibrarySection,
} from "@/lib/section-library-catalog";
import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout,
  Image: ImageIcon,
  ShoppingBag,
  Package,
  Grid3x3,
  Tags,
  Percent,
  MessageSquareQuote,
  FileText,
  HelpCircle,
  Users,
  Instagram,
  Megaphone,
  Zap,
  Video,
  Mail,
  Shield,
  Heart,
  Info,
  Minimize,
  Columns2,
  AtSign,
  Star,
  Clock,
  TrendingUp,
  Plus,
};

function SectionIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] || Layout;
  return <Icon className={className} />;
}

type QuickFilter = "all" | "popular" | "favorites" | "recently-used";
type BadgeFilter = "all" | "popular" | "new" | "pro";
type ViewMode = "grid" | "compact";

const FAVORITES_STORAGE_KEY = "bornoland_builder_favorites";
const RECENTS_STORAGE_KEY = "bornoland_builder_recents";

// ─── Miniature Live Preview of a Section ─────────────────────────────────────
const SectionMiniPreview = memo(function SectionMiniPreview({
  section,
}: {
  section: LibrarySection;
}) {
  const renderType = resolveLibraryRenderType(section.type);
  const [loaded, setLoaded] = useState(false);

  const sectionData: SectionData = useMemo(() => {
    return {
      id: `preview-${section.type}`,
      type: renderType,
      visible: true,
      props: getLibraryDefaults(section.type),
      ...(renderType === "image-carousel" || section.type === "image-carousel"
        ? {
            style: {
              slides: [
                {
                  id: `preview-slide-1`,
                  image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
                  alt: "Featured banner",
                  title: "Promotional Banner",
                  subtitle: "Exclusive deals for you",
                  buttonText: "Shop Now",
                  buttonUrl: "/shop",
                },
              ],
            },
          }
        : {}),
    };
  }, [section.type, renderType]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[140px] overflow-hidden rounded-t-xl bg-zinc-50 border-b border-zinc-100 flex items-start justify-center select-none">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/60 animate-pulse">
          <SectionIcon icon={section.icon} className="h-6 w-6 text-zinc-300" />
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 w-[1140px] pointer-events-none select-none origin-top-left"
          style={{
            transform: "scale(0.24)",
            transformOrigin: "top left",
          }}
        >
          <SectionRenderer section={sectionData} />
        </div>
      )}
    </div>
  );
});

// ─── Section Card Component ──────────────────────────────────────────────────
const SectionCard = memo(function SectionCard({
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
  const isPopular = POPULAR_LIBRARY_TYPES.includes(section.type);
  const isNew = NEW_LIBRARY_TYPES.includes(section.type);
  const isPro = PRO_LIBRARY_TYPES.includes(section.type);

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onAdd();
        }
      }}
      className="group relative flex flex-col rounded-xl border border-zinc-200/80 bg-white shadow-xs transition-all duration-200 hover:border-zinc-400 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 overflow-hidden"
    >
      {/* Miniature Rendered Preview */}
      <div className="relative">
        <SectionMiniPreview section={section} />

        {/* Badges on preview */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          {isPopular && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-white font-bold text-[9px] shadow-xs backdrop-blur-xs">
              <Flame className="w-2.5 h-2.5" /> Popular
            </span>
          )}
          {isNew && !isPopular && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white font-bold text-[9px] shadow-xs backdrop-blur-xs">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
          {isPro && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-600/90 text-white font-bold text-[9px] shadow-xs backdrop-blur-xs">
              <Crown className="w-2.5 h-2.5" /> Pro
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            "absolute top-2 right-2 z-10 h-7 w-7 rounded-full flex items-center justify-center transition-all bg-white/90 shadow-xs backdrop-blur-xs hover:scale-110",
            isFavorite ? "text-amber-500 fill-amber-500" : "text-zinc-400 hover:text-amber-500"
          )}
          aria-label={isFavorite ? "Remove favorite" : "Favorite"}
        >
          <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 z-10 bg-zinc-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-3">
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-zinc-900 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-700" />
            Preview
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="flex flex-1 flex-col p-3.5 bg-white">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-bold text-xs text-zinc-900 truncate">{section.label}</h4>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider shrink-0 bg-zinc-100 px-1.5 py-0.5 rounded">
            {section.libraryCategory}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-2 flex-1">
          {section.description}
        </p>

        {/* Card Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <Eye className="w-3 h-3 text-zinc-400" />
            Quick View
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-900 text-zinc-800 hover:text-white font-bold text-[11px] transition-all"
          >
            <Plus className="w-3 h-3" />
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── Large Interactive Responsive Preview Modal ──────────────────────────────
function SectionExpandedPreviewModal({
  section,
  onClose,
  onAdd,
}: {
  section: LibrarySection;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const renderType = resolveLibraryRenderType(section.type);

  const sectionData: SectionData = useMemo(() => {
    return {
      id: `full-preview-${section.type}`,
      type: renderType,
      visible: true,
      props: getLibraryDefaults(section.type),
    };
  }, [section.type, renderType]);

  const viewportWidth =
    viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%";

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-6xl h-[90vh] bg-zinc-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{section.label}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                  {section.libraryCategory}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{section.description}</p>
            </div>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 bg-zinc-800/80 border border-zinc-700/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewport === "desktop"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewport === "tablet"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewport === "mobile"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Canvas Container */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 flex justify-center items-start">
          <div
            className="transition-all duration-300 rounded-xl overflow-hidden shadow-2xl bg-white text-zinc-900 border border-zinc-200"
            style={{ width: viewportWidth, maxWidth: "100%" }}
          >
            <div className="h-6 bg-zinc-100 border-b border-zinc-200 px-3 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-400" />
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-zinc-400 ml-2 font-mono">
                {viewport.toUpperCase()} PREVIEW
              </span>
            </div>
            <div className="p-0 select-none">
              <SectionRenderer section={sectionData} />
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-950 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Rendered with responsive store preset styling
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Back to Catalog
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add This Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section Library Modal ──────────────────────────────────────────────
export function SectionLibraryModal({
  onSectionAdded,
}: {
  onSectionAdded?: (sectionId: string) => void;
}) {
  const dispatch = useDispatch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    searchTerm,
    activeCategory,
    favoriteSections,
    recentlyUsed,
    insertPosition,
    targetZone,
  } = useSelector((s: RootState) => s.builder.sectionLibrary);

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [previewSection, setPreviewSection] = useState<LibrarySection | null>(null);

  const allSections = useMemo(() => getLibrarySections(), []);

  // ── Load / Hydrate Favorites & Recents from localStorage ──────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedFavs = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) dispatch(setFavoriteSections(parsed));
      }
      const savedRecents = window.localStorage.getItem(RECENTS_STORAGE_KEY);
      if (savedRecents) {
        const parsed = JSON.parse(savedRecents);
        if (Array.isArray(parsed)) dispatch(setRecentlyUsedSections(parsed));
      }
    } catch {
      // Ignore parsing errors
    }
  }, [dispatch]);

  // Sync Favorites to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteSections));
    } catch {
      // Ignore storage errors
    }
  }, [favoriteSections]);

  // Sync Recents to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(recentlyUsed));
    } catch {
      // Ignore storage errors
    }
  }, [recentlyUsed]);

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => dispatch(setSectionLibrarySearch(localSearch)), 150);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setLocalSearch("");
      setQuickFilter("all");
      setBadgeFilter("all");
      setPreviewSection(null);
    }
  }, [isOpen]);

  // ── Global Keyboard Shortcuts (Escape, /, Enter) ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewSection) {
          setPreviewSection(null);
        } else {
          dispatch(closeSectionLibrary());
        }
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, previewSection, dispatch]);

  const HEADER_TYPES = useMemo(
    () => new Set(allSections.filter((s) => s.libraryCategory === "header").map((s) => s.type)),
    [allSections]
  );
  const FOOTER_TYPES = useMemo(
    () => new Set(allSections.filter((s) => s.libraryCategory === "footer").map((s) => s.type)),
    [allSections]
  );

  const isZoneCompatible = useCallback(
    (section: LibrarySection) => {
      if (!targetZone) return true;
      if (targetZone === "header") {
        return (
          section.libraryCategory === "header" ||
          HEADER_TYPES.has(section.type) ||
          section.type === "announcement-bar"
        );
      }
      if (targetZone === "footer") {
        return section.libraryCategory === "footer" || FOOTER_TYPES.has(section.type);
      }
      // Body: hide header/footer shells
      return section.libraryCategory !== "header" && section.libraryCategory !== "footer";
    },
    [targetZone, HEADER_TYPES, FOOTER_TYPES]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of allSections.filter(isZoneCompatible)) {
      counts[s.libraryCategory] = (counts[s.libraryCategory] ?? 0) + 1;
    }
    return counts;
  }, [allSections, isZoneCompatible]);

  const filteredSections = useMemo(() => {
    let base = allSections.filter(isZoneCompatible);

    if (quickFilter === "popular") {
      base = base.filter((s) => POPULAR_LIBRARY_TYPES.includes(s.type));
    } else if (quickFilter === "favorites") {
      base = base.filter((s) => favoriteSections.includes(s.type));
    } else if (quickFilter === "recently-used") {
      base = recentlyUsed
        .map((type) => allSections.find((s) => s.type === type))
        .filter((s): s is LibrarySection => Boolean(s && isZoneCompatible(s)));
    } else if (activeCategory !== "all") {
      base = base.filter((s) => s.libraryCategory === activeCategory);
    }

    if (badgeFilter === "popular") {
      base = base.filter((s) => POPULAR_LIBRARY_TYPES.includes(s.type));
    } else if (badgeFilter === "new") {
      base = base.filter((s) => NEW_LIBRARY_TYPES.includes(s.type));
    } else if (badgeFilter === "pro") {
      base = base.filter((s) => PRO_LIBRARY_TYPES.includes(s.type));
    }

    if (searchTerm) {
      base = searchLibrarySections(searchTerm, base);
    }

    return base;
  }, [
    allSections,
    isZoneCompatible,
    quickFilter,
    badgeFilter,
    activeCategory,
    searchTerm,
    favoriteSections,
    recentlyUsed,
  ]);

  const headerSettings = useSelector((state: RootState) => state.builder.headerSettings);
  const footerSettings = useSelector((state: RootState) => state.builder.footerSettings);

  const handleAddSection = useCallback(
    (section: LibrarySection) => {
      // ── Handle Global Header selection ──
      if (section.libraryCategory === "header") {
        const defaults = getLibraryDefaults(section.type);
        const tplId = (defaults.template as string) || section.type.replace("header-", "");
        dispatch(
          setHeaderSettings(
            applyHeaderTemplateSelection(
              { ...(headerSettings as Record<string, unknown>), ...defaults },
              tplId,
            ) as any,
          ),
        );
        dispatch(addToRecentlyUsed(section.type));
        dispatch(closeSectionLibrary());
        setPreviewSection(null);
        toast.success(`Active Header updated to "${section.label}"`, {
          description: "Global header template applied.",
        });
        return;
      }

      // ── Handle Global Footer selection ──
      if (section.libraryCategory === "footer") {
        const defaults = getLibraryDefaults(section.type);
        const tplId = (defaults.template as string) || section.type.replace("footer-", "");
        dispatch(
          setFooterSettings(
            applyFooterTemplateSelection(
              { ...(footerSettings as Record<string, unknown>), ...defaults },
              tplId,
            ) as any,
          ),
        );
        dispatch(addToRecentlyUsed(section.type));
        dispatch(closeSectionLibrary());
        setPreviewSection(null);
        toast.success(`Active Footer updated to "${section.label}"`, {
          description: "Global footer template applied.",
        });
        return;
      }

      // ── Handle Body Content Sections ──
      const renderType = resolveLibraryRenderType(section.type);
      const id = `${section.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      dispatch(setEditingZone("body"));

      const newSection = {
        id,
        type: section.type,
        label: section.label,
        visible: true,
        props: getLibraryDefaults(section.type),
        ...(renderType === "image-carousel" || section.type === "image-carousel"
          ? {
              style: {
                slides: [
                  {
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
                    gradientOverlay:
                      "linear-gradient(180deg, rgba(15,23,42,0.15), rgba(15,23,42,0.7))",
                  },
                ],
              },
            }
          : {}),
        ...(insertPosition != null ? { index: insertPosition + 1 } : {}),
      };

      dispatch(addToRecentlyUsed(section.type));
      dispatch(addSection(newSection));
      dispatch(closeSectionLibrary());
      setPreviewSection(null);
      onSectionAdded?.(id);

      toast.success(`Added "${section.label}" to page`, {
        description: "Section inserted into builder canvas.",
        action: {
          label: "Undo",
          onClick: () => dispatch(undoBuilder()),
        },
      });
    },
    [dispatch, headerSettings, footerSettings, insertPosition, onSectionAdded]
  );

  const handleToggleFavorite = useCallback(
    (sectionType: string, e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(toggleFavoriteSection(sectionType));
    },
    [dispatch]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 md:p-6 backdrop-blur-md"
        onClick={() => dispatch(closeSectionLibrary())}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[92vh] max-h-[880px] w-full max-w-[1360px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        >
          {/* ── Left Category Navigation Sidebar ── */}
          <aside className="flex w-[240px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80">
            {/* Sidebar Title */}
            <div className="border-b border-zinc-200 px-4 py-4 bg-white/70">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-zinc-900">Section Library</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">BornoLand Marketplace</p>
                </div>
              </div>
            </div>

            {/* Nav Filters & Categories */}
            <div className="flex-1 space-y-1 overflow-y-auto p-2.5">
              {/* Quick Filters */}
              <div className="space-y-0.5 mb-3">
                <NavButton
                  active={quickFilter === "all" && activeCategory === "all"}
                  onClick={() => {
                    setQuickFilter("all");
                    dispatch(setSectionLibraryCategory("all"));
                  }}
                  label="All Sections"
                  icon={<Grid className="w-3.5 h-3.5" />}
                  count={allSections.filter(isZoneCompatible).length}
                />
                <NavButton
                  active={quickFilter === "popular"}
                  onClick={() => setQuickFilter("popular")}
                  label="Popular Sections"
                  icon={<Flame className="w-3.5 h-3.5 text-amber-500" />}
                  count={allSections.filter((s) => isZoneCompatible(s) && POPULAR_LIBRARY_TYPES.includes(s.type)).length}
                />
                <NavButton
                  active={quickFilter === "favorites"}
                  onClick={() => setQuickFilter("favorites")}
                  label="Favorites"
                  icon={<Star className="w-3.5 h-3.5 text-amber-400" />}
                  count={favoriteSections.length}
                />
                <NavButton
                  active={quickFilter === "recently-used"}
                  onClick={() => setQuickFilter("recently-used")}
                  label="Recently Used"
                  icon={<Clock className="w-3.5 h-3.5 text-blue-500" />}
                  count={recentlyUsed.length}
                />
              </div>

              <div className="px-3 pt-2 pb-1 border-t border-zinc-200/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Categories
                </p>
              </div>

              {LIBRARY_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0;
                if (
                  targetZone === "body" &&
                  (cat.id === "header" || cat.id === "footer") &&
                  count === 0
                )
                  return null;
                if (
                  targetZone === "header" &&
                  cat.id !== "header" &&
                  cat.id !== "promotions"
                )
                  return null;
                if (targetZone === "footer" && cat.id !== "footer") return null;

                return (
                  <NavButton
                    key={cat.id}
                    active={quickFilter === "all" && activeCategory === cat.id}
                    onClick={() => {
                      setQuickFilter("all");
                      dispatch(setSectionLibraryCategory(cat.id));
                    }}
                    label={`${cat.emoji} ${cat.label}`}
                    count={count}
                  />
                );
              })}
            </div>
          </aside>

          {/* ── Main Marketplace Body ── */}
          <div className="flex min-w-0 flex-1 flex-col bg-zinc-50/30">
            {/* Header: Title, Search, Filters, View Modes */}
            <div className="border-b border-zinc-200 bg-white px-6 py-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-zinc-900">
                    {quickFilter === "favorites"
                      ? "Favorite Sections"
                      : quickFilter === "recently-used"
                      ? "Recently Used Sections"
                      : quickFilter === "popular"
                      ? "Popular Sections"
                      : activeCategory !== "all"
                      ? `${LIBRARY_CATEGORIES.find((c) => c.id === activeCategory)?.emoji || ""} ${LIBRARY_CATEGORIES.find((c) => c.id === activeCategory)?.label || "Category"} Sections`
                      : "Explore All Sections"}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Showing {filteredSections.length} available section{filteredSections.length === 1 ? "" : "s"}
                    {targetZone ? ` for ${targetZone}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(closeSectionLibrary())}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar & Tag Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search sections by name, keyword, or tag... (Press /)"
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 pl-9 pr-14 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-all shadow-inner"
                  />
                  {localSearch ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch("");
                        dispatch(setSectionLibrarySearch(""));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:text-zinc-700"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-200/80 px-1.5 py-0.5 rounded border border-zinc-300/60">
                      /
                    </span>
                  )}
                </div>

                {/* Filter Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      badgeFilter === "all"
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("popular")}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      badgeFilter === "popular"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <Flame className="w-3 h-3 text-amber-500" /> Popular
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("new")}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      badgeFilter === "new"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" /> New
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeFilter("pro")}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      badgeFilter === "pro"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <Crown className="w-3 h-3 text-indigo-500" /> Pro
                  </button>
                </div>
              </div>
            </div>

            {/* ── Section Cards Grid ── */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  {quickFilter === "favorites" ? (
                    <>
                      <Star className="mb-3 h-10 w-10 text-amber-400 opacity-60" />
                      <p className="text-sm font-bold text-zinc-800">No favorite sections yet</p>
                      <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                        Click the star icon on any section card to save your favorite sections here for fast access.
                      </p>
                    </>
                  ) : quickFilter === "recently-used" ? (
                    <>
                      <Clock className="mb-3 h-10 w-10 text-blue-400 opacity-60" />
                      <p className="text-sm font-bold text-zinc-800">No recently used sections</p>
                      <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                        Sections you add to your pages will automatically appear here.
                      </p>
                    </>
                  ) : (
                    <>
                      <Search className="mb-3 h-10 w-10 text-zinc-300" />
                      <p className="text-sm font-bold text-zinc-800">No matching sections found</p>
                      <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                        Try searching with different terms like &ldquo;hero&rdquo;, &ldquo;products&rdquo;, &ldquo;banner&rdquo;, or browse by category.
                      </p>
                      {localSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocalSearch("");
                            setBadgeFilter("all");
                            setQuickFilter("all");
                          }}
                          className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-xs"
                        >
                          Clear Filters
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {filteredSections.map((section) => (
                    <SectionCard
                      key={section.type}
                      section={section}
                      isFavorite={favoriteSections.includes(section.type)}
                      onAdd={() => handleAddSection(section)}
                      onPreview={() => setPreviewSection(section)}
                      onToggleFavorite={(e) => handleToggleFavorite(section.type, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Expanded Viewport Preview Modal ── */}
      {previewSection && (
        <SectionExpandedPreviewModal
          section={previewSection}
          onClose={() => setPreviewSection(null)}
          onAdd={() => handleAddSection(previewSection)}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Sidebar Navigation Item ─────────────────────────────────────────────────
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
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all",
        active
          ? "bg-zinc-900 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded-md",
            active ? "bg-white/20 text-white" : "bg-zinc-200/80 text-zinc-500"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
