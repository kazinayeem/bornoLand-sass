"use client";

import { createContext, useContext, type ReactNode } from "react";

type BuilderModeContextValue = {
  isBuilderMode: boolean;
};

const BuilderModeContext = createContext<BuilderModeContextValue>({ isBuilderMode: false });

export function BuilderModeProvider({ children }: { children: ReactNode }) {
  return (
    <BuilderModeContext.Provider value={{ isBuilderMode: true }}>
      {children}
    </BuilderModeContext.Provider>
  );
}

export function useIsBuilderMode(): boolean {
  return useContext(BuilderModeContext).isBuilderMode;
}
