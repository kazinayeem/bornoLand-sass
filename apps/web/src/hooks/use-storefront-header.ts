"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResolvedHeaderConfig } from "@/lib/storefront/header-config";
import { headerShadowClass } from "@/lib/storefront/header-config";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 8;

export function useStorefrontHeader(config: ResolvedHeaderConfig) {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(config.height);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateHeight = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const next = Math.ceil(el.getBoundingClientRect().height);
    if (next > 0) {
      setMeasuredHeight(next);
      document.documentElement.style.setProperty("--store-header-height", `${next}px`);
    }
  }, []);

  useEffect(() => {
    updateHeight();
    const el = navRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateHeight, config.height, config.padding]);

  useEffect(() => {
    const needsScroll =
      config.transparent ||
      config.shadowOnScroll ||
      config.blurBackground ||
      config.autoHideOnScroll ||
      config.borderBottom;

    if (!needsScroll) {
      setScrolled(false);
      setHidden(false);
      return;
    }

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > SCROLL_THRESHOLD);

        if (config.autoHideOnScroll) {
          const delta = y - lastScrollY.current;
          if (y < config.height) {
            setHidden(false);
          } else if (delta > 6) {
            setHidden(true);
          } else if (delta < -6) {
            setHidden(false);
          }
        }

        lastScrollY.current = y;
        ticking.current = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [
    config.autoHideOnScroll,
    config.blurBackground,
    config.borderBottom,
    config.height,
    config.shadowOnScroll,
    config.transparent,
  ]);

  const isOverlay = config.position === "fixed" || config.position === "sticky";
  const isSolid = scrolled || !config.transparent;
  const showBorder = config.borderBottom && (isSolid || !config.transparent);

  const navClassName = cn(
    "top-0 z-50 w-full transition-[transform,box-shadow,background-color,border-color,backdrop-filter] duration-300 ease-out",
    config.position === "fixed" && "fixed left-0 right-0",
    config.position === "sticky" && "sticky",
    config.autoHideOnScroll && hidden && "-translate-y-full",
    !config.transparent && !config.background && "frosted-bar",
    showBorder && "border-b",
    headerShadowClass(config.shadow, scrolled, config.shadowOnScroll),
  );

  const navStyle: React.CSSProperties = {
    backgroundColor: isSolid
      ? config.background || undefined
      : config.transparent
        ? "transparent"
        : config.background || undefined,
    backdropFilter: config.blurBackground && isSolid ? "blur(12px) saturate(180%)" : undefined,
    WebkitBackdropFilter: config.blurBackground && isSolid ? "blur(12px) saturate(180%)" : undefined,
    borderColor: showBorder ? config.borderColor || undefined : undefined,
  };

  const needsContentOffset = config.position === "fixed";

  useEffect(() => {
    if (needsContentOffset) {
      document.documentElement.style.setProperty("--store-header-height", `${measuredHeight}px`);
      document.documentElement.style.setProperty("--store-header-offset", `${measuredHeight}px`);
    } else {
      document.documentElement.style.removeProperty("--store-header-offset");
    }
  }, [needsContentOffset, measuredHeight]);

  return {
    navRef,
    navClassName,
    navStyle,
    scrolled,
    measuredHeight,
    needsContentOffset,
    contentOffset: needsContentOffset ? measuredHeight : 0,
  };
}
