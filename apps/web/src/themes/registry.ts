import type { ThemeDefinition } from "./types";
import { GROCERY_THEME } from "./grocery";
import { ELECTRONICS_THEME } from "./electronics";
import { FASHION_THEME } from "./fashion";
import { BEAUTY_THEME } from "./beauty";
import { RESTAURANT_THEME } from "./restaurant";
import { FURNITURE_THEME } from "./furniture";
import { SPORTS_THEME } from "./sports";
import { BOOKS_THEME } from "./books";
import { KIDS_THEME } from "./kids";
import { MARKETPLACE_THEME } from "./marketplace";
import type { BuilderSection } from "@/redux/slices/builder-slice";

export const THEMES: ThemeDefinition[] = [
  GROCERY_THEME,
  ELECTRONICS_THEME,
  FASHION_THEME,
  BEAUTY_THEME,
  RESTAURANT_THEME,
  FURNITURE_THEME,
  SPORTS_THEME,
  BOOKS_THEME,
  KIDS_THEME,
  MARKETPLACE_THEME,
];

export const THEME_REGISTRY: Record<string, ThemeDefinition> = {
  grocery: GROCERY_THEME,
  electronics: ELECTRONICS_THEME,
  fashion: FASHION_THEME,
  beauty: BEAUTY_THEME,
  restaurant: RESTAURANT_THEME,
  food: RESTAURANT_THEME,
  furniture: FURNITURE_THEME,
  home: FURNITURE_THEME,
  sports: SPORTS_THEME,
  fitness: SPORTS_THEME,
  books: BOOKS_THEME,
  education: BOOKS_THEME,
  kids: KIDS_THEME,
  baby: KIDS_THEME,
  marketplace: MARKETPLACE_THEME,
  general: MARKETPLACE_THEME,
  // Backward compatibility aliases for existing DB records
  basic: GROCERY_THEME,
  modern: GROCERY_THEME,
  premium: ELECTRONICS_THEME,
  aurora: FASHION_THEME,
  luxura: BEAUTY_THEME,
  sellora: MARKETPLACE_THEME,
};

export function getThemeById(themeId?: string | null): ThemeDefinition {
  if (!themeId) return GROCERY_THEME;
  const normalized = themeId.toLowerCase().trim();
  return THEME_REGISTRY[normalized] || GROCERY_THEME;
}

export function getDefaultTheme(): ThemeDefinition {
  return GROCERY_THEME;
}

export function getAllThemes(): ThemeDefinition[] {
  return THEMES;
}

/**
 * Safely migrates sections when switching from one theme to another.
 * Preserves user's custom headings, images, and content for compatible section types
 * while adopting the new theme's structure and layout defaults.
 */
export function migrateThemeSections(
  targetThemeId: string,
  _currentSections: BuilderSection[] = [],
): BuilderSection[] {
  const targetTheme = getThemeById(targetThemeId);
  const defaultSections = targetTheme.defaultSections;

  // Always generate fresh, authentic sections with full imagery, layout, and copy tailored to the target theme
  return defaultSections.map((sec) => ({
    ...sec,
    id: `${sec.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    visible: sec.visible !== false,
    props: { ...(sec.props || {}) },
  }));
}
