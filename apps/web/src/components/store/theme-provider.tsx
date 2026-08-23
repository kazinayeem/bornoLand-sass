"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ThemeDefinition, ThemeTokens } from "@/themes/types";
import { getThemeById } from "@/themes/registry";

interface ThemeContextValue {
  theme: ThemeDefinition;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useActiveTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    const defaultTheme = getThemeById("grocery");
    return { theme: defaultTheme, tokens: defaultTheme.tokens };
  }
  return context;
}

export interface ThemeProviderProps {
  themeId?: string | null;
  children: ReactNode;
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  const tokens = theme.tokens;

  const cssVariables = useMemo(() => {
    const vars: Record<string, string> = {
      "--theme-primary": tokens.colors.primary,
      "--theme-secondary": tokens.colors.secondary,
      "--theme-background": tokens.colors.background,
      "--theme-surface": tokens.colors.surface,
      "--theme-text": tokens.colors.text,
      "--theme-text-muted": tokens.colors.textMuted,
      "--theme-border": tokens.colors.border,
      "--theme-accent": tokens.colors.accent,
      "--theme-radius": `${tokens.layout.borderRadius}px`,
      "--theme-font-family": tokens.typography.fontFamily,
      "--theme-container-width": tokens.layout.containerWidth,
    };
    return vars;
  }, [tokens]);

  return (
    <ThemeContext.Provider value={{ theme, tokens }}>
      <div
        className="w-full min-h-screen text-[var(--theme-text)] bg-[var(--theme-background)]"
        style={{
          fontFamily: tokens.typography.fontFamily,
          ...cssVariables,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
