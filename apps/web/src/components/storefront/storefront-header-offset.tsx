"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type StorefrontHeaderOffsetContextValue = {
  contentOffset: number;
  registerContentOffset: (offset: number) => void;
};

const StorefrontHeaderOffsetContext = createContext<StorefrontHeaderOffsetContextValue>({
  contentOffset: 0,
  registerContentOffset: () => {},
});

const StorefrontHeaderSettingsContext = createContext<Record<string, unknown>>({});

export function StorefrontHeaderOffsetProvider({ children }: { children: ReactNode }) {
  const [contentOffset, setContentOffset] = useState(0);
  const registerContentOffset = useCallback((offset: number) => {
    setContentOffset((prev) => (prev === offset ? prev : offset));
  }, []);

  const value = useMemo(
    () => ({ contentOffset, registerContentOffset }),
    [contentOffset, registerContentOffset],
  );

  return (
    <StorefrontHeaderOffsetContext.Provider value={value}>
      <div
        style={{
          ["--store-header-height" as string]: `${contentOffset}px`,
          ["--store-header-offset" as string]: `${contentOffset}px`,
        }}
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

export function useRegisterStorefrontHeaderOffset() {
  return useContext(StorefrontHeaderOffsetContext).registerContentOffset;
}

export function useStorefrontHeaderSettings() {
  return useContext(StorefrontHeaderSettingsContext);
}
