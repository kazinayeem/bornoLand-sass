import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { darkColors } from "./dark";
import { lightColors } from "./light";
import { createShadows } from "./shadows";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";
export type AppTheme = ReturnType<typeof buildTheme>;

const THEME_MODE_KEY = "bornoland.appearance.mode";
function buildTheme(mode: ResolvedThemeMode) {
  const dark = mode === "dark";
  const colors = dark ? darkColors : lightColors;
  return { mode, dark, colors, shadows: createShadows(colors, dark) };
}

type ThemeContextValue = { mode: ThemeMode; resolvedMode: ResolvedThemeMode; theme: AppTheme; ready: boolean; setMode(mode: ThemeMode): Promise<void> };
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    void SecureStore.getItemAsync(THEME_MODE_KEY).then((stored) => {
      if (mounted && (stored === "light" || stored === "dark" || stored === "system")) setModeState(stored);
    }).finally(() => mounted && setReady(true));
    return () => { mounted = false; };
  }, []);
  const setMode = useCallback(async (nextMode: ThemeMode) => { setModeState(nextMode); await SecureStore.setItemAsync(THEME_MODE_KEY, nextMode); }, []);
  const resolvedMode: ResolvedThemeMode = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);
  const value = useMemo(() => ({ mode, resolvedMode, theme, ready, setMode }), [mode, ready, resolvedMode, setMode, theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
