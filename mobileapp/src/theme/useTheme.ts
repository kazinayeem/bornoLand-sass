import { useContext, useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { ThemeContext, type AppTheme } from "./theme-provider";

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(factory: (theme: AppTheme) => T) {
  const { theme } = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
}
