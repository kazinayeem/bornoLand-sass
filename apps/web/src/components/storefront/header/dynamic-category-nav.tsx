"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { useTenantStore, type CategoryData } from "@/providers/tenant-provider";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DynamicCategoryNavProps {
  categories?: CategoryData[];
  maxVisibleCategories?: number;
  showMoreMenu?: boolean;
  enableCategoryHover?: boolean;
  themeVariant?: "minimal" | "grocery" | "marketplace" | "fashion" | "electronics" | "default";
  lang?: StoreLanguage;
  onItemClick?: () => void;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  moreButtonClassName?: string;
  dropdownClassName?: string;
}

export function DynamicCategoryNav({
  categories: propCategories,
  maxVisibleCategories = 6,
  showMoreMenu = true,
  enableCategoryHover = true,
  themeVariant = "default",
  lang: propLang,
  onItemClick,
  className,
  itemClassName,
  activeItemClassName,
  moreButtonClassName,
  dropdownClassName,
}: DynamicCategoryNavProps) {
  const { categories: storeCategories, settings } = useTenantStore();
  const pathname = usePathname();
  const storeLang: StoreLanguage = propLang || (settings?.language === "bn" ? "bn" : "en");

  const categories = useMemo(() => {
    const list = (propCategories && propCategories.length > 0) ? propCategories : (storeCategories || []);
    return [...list].sort((a, b) => (Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)));
  }, [propCategories, storeCategories]);

  // Extract root categories and group subcategories
  const { rootCategories, subcategoriesByParent } = useMemo(() => {
    const roots: CategoryData[] = [];
    const subs: Record<string, CategoryData[]> = {};

    categories.forEach((cat) => {
      const parentId = (cat as any).parentId ? String((cat as any).parentId) : null;
      if (!parentId || parentId === "null" || parentId === "root" || parentId === "") {
        roots.push(cat);
      } else {
        if (!subs[parentId]) subs[parentId] = [];
        subs[parentId].push(cat);
      }
    });

    // If no root category detected (all have parentId or flat), treat all as root
    const resolvedRoots = roots.length > 0 ? roots : categories;
    return { rootCategories: resolvedRoots, subcategoriesByParent: subs };
  }, [categories]);

  const limit = Math.max(1, Number(maxVisibleCategories) || 6);
  const visibleCategories = useMemo(() => rootCategories.slice(0, limit), [rootCategories, limit]);
  const remainingCategories = useMemo(() => rootCategories.slice(limit), [rootCategories, limit]);
  const hasMore = showMoreMenu && remainingCategories.length > 0;

  // Active hover/dropdown states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMenuTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseEnter = (id: string) => {
    if (!enableCategoryHover) return;
    clearMenuTimeout();
    setMoreMenuOpen(false);
    setActiveMenuId(id);
  };

  const handleMouseLeave = () => {
    clearMenuTimeout();
    timeoutRef.current = setTimeout(() => {
      setActiveMenuId(null);
      setMoreMenuOpen(false);
    }, 150);
  };

  const handleMoreMouseEnter = () => {
    clearMenuTimeout();
    setActiveMenuId(null);
    setMoreMenuOpen(true);
  };

  const handleMoreMouseLeave = () => {
    clearMenuTimeout();
    timeoutRef.current = setTimeout(() => {
      setMoreMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => clearMenuTimeout();
  }, []);

  // Theme variant visual styles
  const isDark = themeVariant === "electronics";
  const isGrocery = themeVariant === "grocery";
  const isMarketplace = themeVariant === "marketplace";
  const isFashion = themeVariant === "fashion" || themeVariant === "minimal";

  return (
    <nav
      className={cn(
        "flex items-center gap-1 sm:gap-3 md:gap-4 lg:gap-5 text-xs font-semibold select-none min-w-0 max-w-full overflow-hidden",
        className,
      )}
      role="navigation"
      aria-label="Category Navigation"
    >
      {/* ── Visible Root Categories ── */}
      {visibleCategories.map((cat) => {
        const subs = subcategoriesByParent[cat._id] || [];
        const hasChildren = subs.length > 0;
        const isOpen = activeMenuId === cat._id;
        const isActive = pathname === `/category/${cat.slug}` || pathname.startsWith(`/category/${cat.slug}/`);

        return (
          <div
            key={cat._id}
            className="relative shrink-0"
            onMouseEnter={() => hasChildren && handleMouseEnter(cat._id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={`/category/${cat.slug}`}
              onClick={() => {
                setActiveMenuId(null);
                onItemClick?.();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 py-2 px-1 transition-colors whitespace-nowrap",
                isDark && "text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg px-2.5",
                isGrocery && "text-zinc-700 hover:text-[#e05a00]",
                isMarketplace && "text-zinc-700 hover:text-[#f85606]",
                isFashion && "text-zinc-700 hover:text-black",
                !isDark && !isGrocery && !isMarketplace && !isFashion && "text-zinc-700 hover:text-zinc-900",
                isActive && (
                  activeItemClassName ||
                  (isDark && "text-[#0071dc] font-bold bg-white/5") ||
                  (isGrocery && "text-[#e05a00] font-bold") ||
                  (isMarketplace && "text-[#f85606] font-bold") ||
                  "text-black font-bold"
                ),
                itemClassName
              )}
            >
              <span>{getLocalizedName(cat, storeLang)}</span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
                    isOpen && "rotate-180 opacity-100"
                  )}
                />
              )}
            </Link>

            {/* Subcategory Hover Flyout */}
            {hasChildren && isOpen && (
              <div
                className={cn(
                  "absolute left-0 top-full pt-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150",
                  dropdownClassName
                )}
                onMouseEnter={() => handleMouseEnter(cat._id)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={cn(
                    "w-56 py-2 rounded-xl shadow-2xl border backdrop-blur-md",
                    isDark
                      ? "bg-[#081621]/95 text-white border-[#172b3c] shadow-black/80"
                      : "bg-white/95 text-zinc-800 border-zinc-200 shadow-zinc-900/15"
                  )}
                >
                  <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {getLocalizedName(cat, storeLang)}
                    </span>
                  </div>
                  {subs.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/category/${sub.slug}`}
                      onClick={() => {
                        setActiveMenuId(null);
                        onItemClick?.();
                      }}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2 text-xs transition-colors rounded-lg mx-1",
                        isDark
                          ? "hover:bg-[#0071dc]/20 hover:text-white"
                          : "hover:bg-zinc-100 hover:text-zinc-900"
                      )}
                    >
                      <span className="truncate">{getLocalizedName(sub, storeLang)}</span>
                      <ArrowRight className="w-3 h-3 opacity-40 shrink-0 ml-2" />
                    </Link>
                  ))}
                  <div className="mt-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 px-3.5">
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={() => {
                        setActiveMenuId(null);
                        onItemClick?.();
                      }}
                      className={cn(
                        "text-[11px] font-bold inline-flex items-center gap-1 transition-colors",
                        isDark ? "text-[#0071dc] hover:underline" : "text-[#055c3a] hover:underline"
                      )}
                    >
                      <span>{t("allProducts", storeLang)}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── "More ▾" Dropdown for remaining categories ── */}
      {hasMore && (
        <div
          className="relative shrink-0"
          onMouseEnter={handleMoreMouseEnter}
          onMouseLeave={handleMoreMouseLeave}
        >
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 py-2 px-2.5 rounded-lg transition-colors whitespace-nowrap",
              isDark ? "text-zinc-300 hover:text-white hover:bg-white/5" : "text-zinc-700 hover:text-black hover:bg-zinc-100",
              moreMenuOpen && (isDark ? "bg-white/10 text-white" : "bg-zinc-100 text-black"),
              moreButtonClassName
            )}
          >
            <span>{t("more", storeLang) || "More"}</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
                moreMenuOpen && "rotate-180 opacity-100"
              )}
            />
          </button>

          {/* More Menu Dropdown Overlay */}
          {moreMenuOpen && (
            <div
              className={cn(
                "absolute right-0 sm:left-0 top-full pt-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150",
                dropdownClassName
              )}
              onMouseEnter={handleMoreMouseEnter}
              onMouseLeave={handleMoreMouseLeave}
            >
              <div
                className={cn(
                  "rounded-2xl shadow-2xl border p-3 backdrop-blur-md",
                  remainingCategories.length > 6 ? "w-80 sm:w-96" : "w-56 sm:w-64",
                  isDark
                    ? "bg-[#081621]/95 text-white border-[#172b3c] shadow-black/80"
                    : "bg-white/95 text-zinc-800 border-zinc-200 shadow-zinc-900/15"
                )}
              >
                <div className="px-2 pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {t("moreCategories", storeLang) || "More Categories"}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {remainingCategories.length}
                  </span>
                </div>

                <div
                  className={cn(
                    "gap-1 max-h-[340px] overflow-y-auto pr-1",
                    remainingCategories.length > 6 ? "grid grid-cols-2" : "flex flex-col"
                  )}
                >
                  {remainingCategories.map((cat) => {
                    const subCount = (subcategoriesByParent[cat._id] || []).length;
                    return (
                      <Link
                        key={cat._id}
                        href={`/category/${cat.slug}`}
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onItemClick?.();
                        }}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-2 text-xs rounded-xl transition-colors",
                          isDark
                            ? "hover:bg-[#0071dc]/20 hover:text-white"
                            : "hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                      >
                        <span className="truncate font-medium">{getLocalizedName(cat, storeLang)}</span>
                        {subCount > 0 && (
                          <span className="text-[9px] text-zinc-400 font-semibold px-1 rounded bg-black/5 dark:bg-white/10 shrink-0 ml-1">
                            +{subCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
