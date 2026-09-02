"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

type StorefrontHeaderOffsetContextValue = {
  headerHeight: number;
  contentOffset: number;
  /** @param height Actual rendered header height. @param offset Space reserved in document flow (fixed headers only). */
  registerContentOffset: (height: number, offset?: number) => void;
};

const StorefrontHeaderOffsetContext = createContext<StorefrontHeaderOffsetContextValue>({
  headerHeight: 72,
  contentOffset: 0,
  registerContentOffset: () => {},
});

const StorefrontHeaderSettingsContext = createContext<Record<string, unknown>>({});

export function StorefrontHeaderOffsetProvider({ children }: { children: ReactNode }) {
  const [headerHeight, setHeaderHeight] = useState(72);
  const [contentOffset, setContentOffset] = useState(0);

  const registerContentOffset = useCallback((height: number, offset?: number) => {
    const nextHeight = Math.max(0, Math.round(height));
    const nextOffset = Math.max(0, Math.round(offset ?? height));
    setHeaderHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    setContentOffset((prev) => (prev === nextOffset ? prev : nextOffset));

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--store-header-height", `${nextHeight > 0 ? nextHeight : 72}px`);
      if (nextOffset > 0) {
        document.documentElement.style.setProperty("--store-header-offset", `${nextOffset}px`);
      } else {
        document.documentElement.style.removeProperty("--store-header-offset");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--store-header-height",
        `${headerHeight > 0 ? headerHeight : 72}px`
      );
    }
  }, [headerHeight]);

  const value = useMemo(
    () => ({ headerHeight, contentOffset, registerContentOffset }),
    [headerHeight, contentOffset, registerContentOffset],
  );

  return (
    <StorefrontHeaderOffsetContext.Provider value={value}>
      <div
        data-storefront-root
        className="w-full max-w-full min-w-0"
        style={{
          ["--store-header-height" as string]: `${headerHeight > 0 ? headerHeight : 72}px`,
          ["--store-header-offset" as string]: `${contentOffset}px`,
          scrollPaddingTop: `${headerHeight > 0 ? headerHeight : 72}px`,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </StorefrontHeaderOffsetContext.Provider>
  );
}

export function StorefrontHeaderSettingsProvider({
  settings,
  children,
}: {
  settings?: Record<string, unknown>;
  children: ReactNode;
}) {
  const value = useMemo(() => settings ?? {}, [settings]);
  return (
    <StorefrontHeaderSettingsContext.Provider value={value}>
      {children}
    </StorefrontHeaderSettingsContext.Provider>
  );
}

export function useStorefrontHeaderOffset() {
  return useContext(StorefrontHeaderOffsetContext).contentOffset;
}

export function useStorefrontHeaderHeight() {
  return useContext(StorefrontHeaderOffsetContext).headerHeight;
}

export function useRegisterStorefrontHeaderOffset() {
  return useContext(StorefrontHeaderOffsetContext).registerContentOffset;
}

export function useStorefrontHeaderSettings() {
  return useContext(StorefrontHeaderSettingsContext);
}
