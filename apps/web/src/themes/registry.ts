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
  currentSections: BuilderSection[] = [],
): BuilderSection[] {
  const targetTheme = getThemeById(targetThemeId);
  const defaultSections = targetTheme.defaultSections;

  if (!currentSections || currentSections.length === 0) {
    return JSON.parse(JSON.stringify(defaultSections));
  }

  // Create a fast lookup of existing sections by type
  const existingByType = new Map<string, BuilderSection>();
  for (const s of currentSections) {
    if (!existingByType.has(s.type)) {
      existingByType.set(s.type, s);
    }
  }

  // Build migrated section list based on new theme default structure
  const migrated: BuilderSection[] = defaultSections.map((defaultSec) => {
    const existing = existingByType.get(defaultSec.type);
    if (!existing) {
      return {
        ...defaultSec,
        id: `${defaultSec.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
    }

    // Merge custom content from existing section into target theme section props
    const mergedProps: Record<string, string> = { ...defaultSec.props };
    const contentKeys = [
      "headline", "title", "subheadline", "subtitle", "description", "content",
      "buttonText", "buttonLink", "secondaryButtonText", "secondaryButtonLink",
      "imageUrl", "bgImage", "overlayColor", "textAlignment",
    ];

    for (const key of contentKeys) {
      const value = existing.props[key];
      if (typeof value === "string" && value.trim() !== "") {
        mergedProps[key] = value;
      }
    }

    return {
      ...defaultSec,
      id: `${defaultSec.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      visible: existing.visible !== false,
      props: mergedProps,
    };
  });

  return migrated;
}
