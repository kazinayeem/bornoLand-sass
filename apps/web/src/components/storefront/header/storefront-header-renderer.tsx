"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useActiveTheme } from "@/components/store/theme-provider";
import { GroceryHeader } from "@/themes/grocery/components/grocery-header";
import { TechMegaHeader } from "./templates/tech-mega-header";
import { MarketplaceHeader } from "./templates/marketplace-header";
import { MinimalFashionHeader } from "./templates/minimal-fashion-header";
import { ModernGeneralHeader } from "./templates/modern-general-header";
import { useRegisterStorefrontHeaderOffset } from "@/components/storefront/storefront-header-offset";
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

function isHeaderDisabled(headerSettings: Record<string, unknown>): boolean {
  return (
    headerSettings.enabled === false ||
    headerSettings.visible === false ||
    headerSettings.show === false ||
    headerSettings.enabled === "false" ||
    headerSettings.visible === "false" ||
    headerSettings.template === "none" ||
    headerSettings.template === null ||
    headerSettings.templateId === null
  );
}

export function StorefrontHeaderRenderer({ headerSettings = {} }: StorefrontHeaderRendererProps) {
  const { theme } = useActiveTheme();
  const themeId = theme.id || "grocery";
  const headerRef = useRef<HTMLDivElement>(null);
  const registerContentOffset = useRegisterStorefrontHeaderOffset();
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const disabled = isHeaderDisabled(headerSettings);

  const template = useMemo(() => {
    return (
      (headerSettings.template as string) ||
      (headerSettings.headerTemplate as string) ||
      (headerSettings.templateId as string) ||
      (headerSettings.layout as string) ||
      (themeId === "electronics" ? "compact-professional" : "modern-ecommerce")
    );
  }, [headerSettings.template, headerSettings.headerTemplate, headerSettings.templateId, headerSettings.layout, themeId]);

  const position =
    (headerSettings.position as string) || (headerSettings.sticky === false ? "static" : "sticky");
  const autoHideOnScroll =
    headerSettings.autoHideOnScroll === true || headerSettings.autoHideOnScroll === "true";
  const shadow = (headerSettings.shadow as string) || "none";
  const transparent =
    headerSettings.transparent === true || headerSettings.transparent === "true";

  const publishMetrics = useCallback(
    (height: number) => {
      setHeaderHeight(height);
      // Content offset only when fixed removes flow space — never double-offset sticky
      const offset = position === "fixed" && !transparent ? height : 0;
      registerContentOffset(height, offset);
    },
    [position, transparent, registerContentOffset],
  );

  useEffect(() => {
    if (disabled || !headerRef.current) {
      registerContentOffset(0, 0);
      return;
    }
    const updateHeight = () => {
      if (headerRef.current) {
        publishMetrics(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    return () => {
      observer.disconnect();
      registerContentOffset(0, 0);
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

  const renderHeaderContent = () => {
    switch (template) {
      case "minimal-clean":
      case "minimal":
      case "minimal-fashion":
      case "clean":
        return <MinimalFashionHeader key="header-minimal-clean" headerSettings={headerSettings} />;

      case "modern-ecommerce":
      case "grocery":
      case "organic":
      case "ecommerce":
        return <GroceryHeader key="header-modern-ecommerce" headerSettings={headerSettings} />;

      case "marketplace":
      case "daraz":
      case "multivendor":
        return <MarketplaceHeader key="header-marketplace" headerSettings={headerSettings} />;

      case "premium-luxury":
      case "premium":
      case "luxury":
      case "fashion":
      case "modern-general":
        return <ModernGeneralHeader key="header-premium-luxury" headerSettings={headerSettings} />;

      case "compact-professional":
      case "compact":
      case "professional":
      case "tech-mega":
      case "electronics":
      case "computer":
        return <TechMegaHeader key="header-compact-professional" headerSettings={headerSettings} />;

      default:
        return <GroceryHeader key="header-default-modern" headerSettings={headerSettings} />;
    }
  };

  return (
    <header
      key={`global-header-${template}-${position}`}
      data-global-header={template}
      data-header-position={position}
      className="relative z-50 w-full max-w-full min-w-0"
      style={
        {
          ["--store-header-height" as string]: `${headerHeight}px`,
        } as React.CSSProperties
      }
    >
      <div
        ref={headerRef}
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
        {renderHeaderContent()}
      </div>

      {position === "fixed" && !transparent && headerHeight > 0 && (
        <div
          style={{ height: headerHeight }}
          aria-hidden="true"
          className="w-full shrink-0 pointer-events-none"
          data-header-spacer="true"
        />
      )}
    </header>
  );
}
