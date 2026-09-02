"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useActiveTheme } from "@/components/store/theme-provider";
import { useTenant } from "@/providers/tenant-provider";
import { useRegisterStorefrontHeaderOffset } from "@/components/storefront/storefront-header-offset";
import {
  isGlobalHeaderEnabled,
  normalizeHeaderSettings,
  resolveHeaderLogoUrl,
  resolveHeaderTemplateId,
  type HeaderTemplateId,
} from "@/lib/storefront/global-navigation";
import { resolveHeaderTemplateComponent } from "./header-template-registry";
import { cn } from "@/lib/utils";

export interface StorefrontHeaderRendererProps {
  headerSettings?: Record<string, unknown>;
}

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node) {
    const style = getComputedStyle(node);
    const oy = style.overflowY;
    if (oy === "auto" || oy === "scroll" || oy === "overlay") return node;
    node = node.parentElement;
  }
  return window;
}

function readScrollY(target: HTMLElement | Window): number {
  return target === window ? window.scrollY : (target as HTMLElement).scrollTop;
}

export function StorefrontHeaderRenderer({ headerSettings = {} }: StorefrontHeaderRendererProps) {
  const { theme } = useActiveTheme();
  const { store } = useTenant();
  const themeId = theme.id || "grocery";
  const headerRef = useRef<HTMLDivElement>(null);
  const registerContentOffset = useRegisterStorefrontHeaderOffset();
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const config = useMemo(
    () =>
      normalizeHeaderSettings(headerSettings, {
        themeId,
        themeColors: {
          primary: (theme as any).primaryColor,
          secondary: (theme as any).secondaryColor,
          accent: (theme as any).accentColor,
          background: (theme as any).backgroundColor,
          text: (theme as any).textColor,
        },
      }),
    [headerSettings, themeId, theme],
  );

  const disabled = !config.enabled || !isGlobalHeaderEnabled(headerSettings);
  const template = config.templateId as HeaderTemplateId;
  const position = config.position;
  const autoHideOnScroll = config.autoHideOnScroll;
  const shadow = config.shadow;
  const transparent = config.transparent;

  const resolvedLogoUrl = useMemo(
    () => resolveHeaderLogoUrl(headerSettings, store),
    [headerSettings, store],
  );

  const templateSettings = useMemo(
    () => ({
      ...headerSettings,
      template,
      templateId: template,
      headerTemplate: template,
      maxVisibleCategories: config.maxVisibleItems,
      maxVisibleNavigationItems: config.maxVisibleItems,
      showMoreMenu: config.showMoreMenu,
      enableCategoryHover: config.enableCategoryHover,
      showAllCategoriesButton: config.showAllCategoriesButton,
      showSearch: config.showSearch,
      showWishlist: config.showWishlist,
      showCart: config.showCart,
      showProfile: config.showProfile,
      showAnnouncement: config.showAnnouncement,
      announcementText: config.announcementText,
      logoUrl: resolvedLogoUrl,
      primaryColor: config.colors.primary,
      secondaryColor: config.colors.secondary,
      accentColor: config.colors.accent,
    }),
    [headerSettings, template, config, resolvedLogoUrl],
  );

  const TemplateComponent = useMemo(
    () => resolveHeaderTemplateComponent(template),
    [template],
  );

  const publishMetrics = useCallback(
    (height: number) => {
      const roundedHeight = Math.max(0, Math.round(height));
      setHeaderHeight(roundedHeight);
      const offset = position === "fixed" && !transparent ? roundedHeight : 0;
      registerContentOffset(roundedHeight, offset);
    },
    [position, transparent, registerContentOffset],
  );

  const setHeaderNode = useCallback(
    (node: HTMLDivElement | null) => {
      (headerRef as any).current = node;
      if (node && !disabled) {
        publishMetrics(node.offsetHeight);
      }
    },
    [disabled, publishMetrics],
  );

  useEffect(() => {
    if (disabled || !headerRef.current) {
      registerContentOffset(0, 0);
      return;
    }
    const updateHeight = () => {
      if (headerRef.current) publishMetrics(headerRef.current.offsetHeight);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [disabled, template, headerSettings, publishMetrics, registerContentOffset]);

  useEffect(() => {
    if (disabled) return;
    if (!autoHideOnScroll && position !== "sticky" && position !== "fixed") return;

    const scrollTarget = getScrollParent(headerRef.current);
    const handleScroll = () => {
      const currentScrollY = readScrollY(scrollTarget);
      setIsScrolled(currentScrollY > 20);
      if (autoHideOnScroll) {
        if (currentScrollY > lastScrollYRef.current && currentScrollY > 120) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      lastScrollYRef.current = currentScrollY;
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => scrollTarget.removeEventListener("scroll", handleScroll);
  }, [disabled, autoHideOnScroll, position, template]);

  if (disabled) {
    return null;
  }

  const colorStyle = {
    ["--store-header-height" as string]: headerHeight > 0 ? `${headerHeight}px` : "72px",
    ...(config.colors.primary ? { ["--store-primary" as string]: config.colors.primary } : {}),
    ...(config.colors.secondary ? { ["--store-secondary" as string]: config.colors.secondary } : {}),
    ...(config.colors.accent ? { ["--store-accent" as string]: config.colors.accent } : {}),
  } as React.CSSProperties;

  return (
    <header
      key={`global-header-${template}-${position}`}
      data-global-header={template}
      data-header-position={position}
      className="relative z-50 w-full max-w-full min-w-0"
      style={colorStyle}
    >
      <div
        ref={setHeaderNode}
        className={cn(
          "w-full max-w-full min-w-0 transition-transform duration-300 z-50",
          position === "sticky" && "sticky top-0",
          position === "fixed" && "fixed top-0 left-0 right-0 w-full max-w-full",
          autoHideOnScroll && !isVisible && "-translate-y-full",
          shadow === "sm" && "shadow-xs",
          shadow === "md" && "shadow-md",
          shadow === "lg" && "shadow-lg",
          isScrolled && "shadow-md",
          transparent && "bg-transparent backdrop-blur-md",
        )}
      >
        <TemplateComponent key={`header-${template}`} headerSettings={templateSettings} />
      </div>

      {position === "fixed" && !transparent && (
        <div
          style={{ height: headerHeight > 0 ? `${headerHeight}px` : "var(--store-header-height, 72px)" }}
          aria-hidden="true"
          className="w-full shrink-0 pointer-events-none"
          data-header-spacer="true"
        />
      )}
    </header>
  );
}

export { resolveHeaderTemplateId };
