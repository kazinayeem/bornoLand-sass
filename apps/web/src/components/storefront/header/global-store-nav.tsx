"use client";

/**
 * Shared desktop + mobile navigation for ALL header templates.
 * Templates only pass visual classNames — never their own category lists.
 */

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { useTenant, type CategoryData } from "@/providers/tenant-provider";
import { getLocalizedName, t, type StoreLanguage } from "@/lib/i18n/translations";
import {
  DEFAULT_PRIMARY_NAV_DEFS,
  partitionCategories,
  type PrimaryNavDef,
} from "@/lib/storefront/global-navigation";
import { ChevronDown, ArrowRight, Flame, Layers, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorefrontMegaMenu } from "@/components/storefront/navigation/storefront-mega-menu";
import type { Category } from "@/redux/api/category-api";

export type GlobalStoreNavVariant =
  | "minimal"
  | "grocery"
  | "marketplace"
  | "fashion"
  | "electronics"
  | "default";

export interface GlobalStoreNavProps {
  maxVisibleItems?: number;
  showMoreMenu?: boolean;
  enableCategoryHover?: boolean;
  showAllCategoriesButton?: boolean;
  showPrimaryLinks?: boolean;
  primaryLinkDefs?: PrimaryNavDef[];
  themeVariant?: GlobalStoreNavVariant;
  lang?: StoreLanguage;
  onItemClick?: () => void;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  moreButtonClassName?: string;
  allCategoriesButtonClassName?: string;
  /** desktop row | mobile drawer list */
  layout?: "desktop" | "mobile";
}

function variantLinkClasses(variant: GlobalStoreNavVariant, active: boolean) {
  if (variant === "electronics") {
    return cn(
      "text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg px-2.5",
      active && "text-[#0071dc] font-bold bg-white/5",
    );
  }
  if (variant === "grocery") {
    return cn("text-zinc-700 hover:text-[var(--store-primary,#e05a00)]", active && "text-[var(--store-primary,#e05a00)] font-bold");
  }
  if (variant === "marketplace") {
    return cn("text-zinc-700 hover:text-[var(--store-primary,#f85606)]", active && "text-[var(--store-primary,#f85606)] font-bold");
  }
  if (variant === "fashion" || variant === "minimal") {
    return cn("text-zinc-700 hover:text-black", active && "text-black font-bold");
  }
  return cn("text-zinc-700 hover:text-zinc-900", active && "text-black font-bold");
}

export function GlobalStoreNav({
  maxVisibleItems = 6,
  showMoreMenu = true,
  enableCategoryHover = true,
  showAllCategoriesButton = false,
  showPrimaryLinks = true,
  primaryLinkDefs = DEFAULT_PRIMARY_NAV_DEFS,
  themeVariant = "default",
  lang: propLang,
  onItemClick,
  className,
  itemClassName,
  activeItemClassName,
  moreButtonClassName,
  allCategoriesButtonClassName,
  layout = "desktop",
}: GlobalStoreNavProps) {
  const { store, categories: storeCategories, brands = [], settings } = useTenant();
  const pathname = usePathname() || "";
  const storeLang: StoreLanguage = propLang || (settings?.language === "bn" ? "bn" : "en");

  const categories = useMemo(() => {
    return [...(storeCategories || [])].sort(
      (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
    );
  }, [storeCategories]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Storefront Header Categories]", {
        storeId: store?._id,
        storeSlug: store?.slug,
        count: categories.length,
        categories: categories.map((c) => ({ id: c._id, name: c.name, slug: c.slug })),
      });
    }
  }, [store?._id, store?.slug, categories]);

  const { roots, visible, remaining, byParent } = useMemo(
    () => partitionCategories(categories as CategoryData[], maxVisibleItems),
    [categories, maxVisibleItems],
  );

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [selectedMegaId, setSelectedMegaId] = useState<string | null>(null);
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMenuTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearMenuTimeout(), [clearMenuTimeout]);

  const handleMouseEnter = (id: string) => {
    if (!enableCategoryHover) return;
    clearMenuTimeout();
    setMoreMenuOpen(false);
    setAllCategoriesOpen(false);
    setActiveMenuId(id);
  };

  const handleMouseLeave = () => {
    clearMenuTimeout();
    timeoutRef.current = setTimeout(() => {
      setActiveMenuId(null);
      setMoreMenuOpen(false);
    }, 150);
  };

  const megaCategory =
    roots.find((c) => c._id === selectedMegaId) || roots[0] || null;

  const isActivePath = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  // ── Mobile drawer list ──────────────────────────────────────────
  if (layout === "mobile") {
    return (
      <div className={cn("space-y-1", className)} role="navigation" aria-label="Mobile Navigation">
        {showPrimaryLinks &&
          primaryLinkDefs.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center px-2 py-2.5 rounded-lg text-sm font-semibold text-zinc-800 hover:bg-zinc-50",
                isActivePath(item.href) && "text-[var(--store-primary)]",
              )}
            >
              {item.highlight && <Flame className="w-3.5 h-3.5 mr-2 text-[var(--store-primary,#e05a00)]" />}
              {t(item.translationKey, storeLang) || item.fallbackLabel}
            </Link>
          ))}

        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 pt-3 mb-1">
          {t("categories", storeLang)}
        </p>

        {roots.length === 0 ? (
          <p className="px-2 py-3 text-xs text-zinc-400">{t("categories", storeLang)} — empty</p>
        ) : (
          roots.map((cat) => {
            const isExpanded = mobileExpandedId === cat._id;
            const subs = byParent[cat._id] || [];
            return (
              <div key={cat._id} className="border-b border-zinc-50 pb-1">
                <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-zinc-50">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onItemClick}
                    className="font-semibold text-xs text-zinc-800 flex-1 truncate"
                  >
                    {getLocalizedName(cat, storeLang)}
                  </Link>
                  {subs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMobileExpandedId(isExpanded ? null : cat._id)}
                      className="p-1 rounded-md text-zinc-400"
                      aria-label="Expand"
                    >
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  )}
                </div>
                {isExpanded && subs.length > 0 && (
                  <div className="pl-4 pr-2 py-1.5 space-y-1 bg-zinc-50 rounded-lg">
                    {subs.map((sub) => (
                      <Link
                        key={sub._id}
                        href={`/category/${cat.slug}/${sub.slug}`}
                        onClick={onItemClick}
                        className="flex items-center justify-between py-1 px-2 text-xs text-zinc-600"
                      >
                        <span>{getLocalizedName(sub, storeLang)}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ── Desktop row ─────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 max-w-full overflow-visible",
        className,
      )}
      role="navigation"
      aria-label="Store Navigation"
    >
      {showAllCategoriesButton && (
        <div
          className="relative shrink-0"
          onMouseLeave={() => setAllCategoriesOpen(false)}
        >
          <button
            type="button"
            onClick={() => {
              setAllCategoriesOpen((o) => !o);
              if (!selectedMegaId && roots[0]) setSelectedMegaId(roots[0]._id);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-semibold text-xs rounded-t-lg transition-colors text-white",
              "bg-[var(--store-primary,#e05a00)] hover:opacity-90",
              allCategoriesButtonClassName,
            )}
          >
            <Layers className="w-4 h-4" />
            <span>{t("allCategories", storeLang)}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", allCategoriesOpen && "rotate-180")} />
          </button>

          {allCategoriesOpen && megaCategory && (
            <div className="absolute left-0 top-full z-[60] pt-0 min-w-[min(100vw-2rem,64rem)]">
              <StorefrontMegaMenu
                category={megaCategory as unknown as Category}
                subcategories={(byParent[megaCategory._id] || []) as unknown as Category[]}
                brands={brands as any}
                lang={storeLang}
                themeVariant={
                  themeVariant === "electronics"
                    ? "electronics"
                    : themeVariant === "grocery"
                      ? "grocery"
                      : themeVariant === "fashion" || themeVariant === "minimal"
                        ? "fashion"
                        : "default"
                }
                onItemClick={() => {
                  setAllCategoriesOpen(false);
                  onItemClick?.();
                }}
              />
            </div>
          )}
        </div>
      )}

      {showPrimaryLinks &&
        primaryLinkDefs.map((item) => {
          const active = isActivePath(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "shrink-0 inline-flex items-center gap-1 py-2 px-1 text-xs font-semibold whitespace-nowrap transition-colors",
                variantLinkClasses(themeVariant, active),
                item.highlight && "text-[var(--store-primary,#e05a00)]",
                active && activeItemClassName,
                itemClassName,
              )}
            >
              {item.highlight && <Flame className="w-3.5 h-3.5" />}
              <span>{t(item.translationKey, storeLang) || item.fallbackLabel}</span>
            </Link>
          );
        })}

      {visible.map((cat) => {
        const subs = byParent[cat._id] || [];
        const hasChildren = subs.length > 0;
        const isOpen = activeMenuId === cat._id;
        const isActive =
          pathname === `/category/${cat.slug}` || pathname.startsWith(`/category/${cat.slug}/`);

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
                "inline-flex items-center gap-1.5 py-2 px-1 text-xs font-semibold transition-colors whitespace-nowrap",
                variantLinkClasses(themeVariant, isActive),
                isActive && activeItemClassName,
                itemClassName,
              )}
            >
              <span>{getLocalizedName(cat, storeLang)}</span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
                    isOpen && "rotate-180 opacity-100",
                  )}
                />
              )}
            </Link>

            {hasChildren && isOpen && (
              <div
                className="absolute left-0 top-full pt-1.5 z-[60]"
                onMouseEnter={() => handleMouseEnter(cat._id)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={cn(
                    "w-56 py-2 rounded-xl shadow-2xl border backdrop-blur-md",
                    themeVariant === "electronics"
                      ? "bg-[#081621]/95 text-white border-[#172b3c]"
                      : "bg-white/95 text-zinc-800 border-zinc-200",
                  )}
                >
                  <div className="px-3.5 py-1.5 border-b border-zinc-100/20 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {getLocalizedName(cat, storeLang)}
                    </span>
                  </div>
                  {subs.map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/category/${cat.slug}/${sub.slug}`}
                      onClick={() => {
                        setActiveMenuId(null);
                        onItemClick?.();
                      }}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2 text-xs transition-colors rounded-lg mx-1",
                        themeVariant === "electronics"
                          ? "hover:bg-[#0071dc]/20"
                          : "hover:bg-zinc-100",
                      )}
                    >
                      <span className="truncate">{getLocalizedName(sub, storeLang)}</span>
                      <ArrowRight className="w-3 h-3 opacity-40 shrink-0 ml-2" />
                    </Link>
                  ))}
                  <div className="mt-1 pt-1.5 border-t border-zinc-100/20 px-3.5">
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={() => {
                        setActiveMenuId(null);
                        onItemClick?.();
                      }}
                      className="text-[11px] font-bold inline-flex items-center gap-1 text-[var(--store-primary,#055c3a)] hover:underline"
                    >
                      <span>{t("viewAll", storeLang)}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showMoreMenu && remaining.length > 0 && (
        <div
          className="relative shrink-0"
          onMouseEnter={() => {
            clearMenuTimeout();
            setActiveMenuId(null);
            setMoreMenuOpen(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 py-2 px-2.5 rounded-lg transition-colors whitespace-nowrap text-xs font-semibold",
              themeVariant === "electronics"
                ? "text-zinc-300 hover:text-white hover:bg-white/5"
                : "text-zinc-700 hover:text-black hover:bg-zinc-100",
              moreMenuOpen && (themeVariant === "electronics" ? "bg-white/10 text-white" : "bg-zinc-100 text-black"),
              moreButtonClassName,
            )}
          >
            <span>{t("more", storeLang)}</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
                moreMenuOpen && "rotate-180 opacity-100",
              )}
            />
          </button>

          {moreMenuOpen && (
            <div
              className="absolute right-0 sm:left-0 top-full pt-1.5 z-[60]"
              onMouseEnter={() => {
                clearMenuTimeout();
                setMoreMenuOpen(true);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className={cn(
                  "rounded-2xl shadow-2xl border p-3 backdrop-blur-md",
                  remaining.length > 6 ? "w-80 sm:w-96" : "w-56 sm:w-64",
                  themeVariant === "electronics"
                    ? "bg-[#081621]/95 text-white border-[#172b3c]"
                    : "bg-white/95 text-zinc-800 border-zinc-200",
                )}
              >
                <div className="px-2 pb-2 mb-2 border-b border-zinc-100/20 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {t("moreCategories", storeLang)}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {remaining.length}
                  </span>
                </div>
                <div
                  className={cn(
                    "gap-1 max-h-[340px] overflow-y-auto pr-1",
                    remaining.length > 6 ? "grid grid-cols-2" : "flex flex-col",
                  )}
                >
                  {remaining.map((cat) => {
                    const subCount = (byParent[cat._id] || []).length;
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
                          themeVariant === "electronics"
                            ? "hover:bg-[#0071dc]/20"
                            : "hover:bg-zinc-100",
                        )}
                      >
                        <span className="truncate font-medium">{getLocalizedName(cat, storeLang)}</span>
                        {subCount > 0 && (
                          <span className="text-[9px] text-zinc-400 font-semibold px-1 rounded bg-black/5 shrink-0 ml-1">
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
    </div>
  );
}

/** Shared mobile menu chrome used by templates */
export function GlobalMobileDrawer({
  open,
  onClose,
  storeName,
  children,
  dark = false,
}: {
  open: boolean;
  onClose: () => void;
  storeName: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex">
      <div
        className={cn(
          "w-4/5 max-w-sm h-full overflow-y-auto p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200",
          dark ? "bg-[#081621] text-white border-r border-[#172b3c]" : "bg-white",
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100/20">
          <span
            className={cn(
              "font-extrabold text-base",
              dark ? "text-[#0071dc]" : "text-[var(--store-primary,#055c3a)]",
            )}
          >
            {storeName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-2">{children}</div>
      </div>
      <div className="flex-1" onClick={onClose} aria-hidden="true" />
    </div>
  );
}

export { Menu as MobileMenuIcon };
