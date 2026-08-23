import type { Category } from "@/redux/api/category-api";
import { normalizeCategoryParentId } from "@/lib/storefront/global-navigation";

function parseCategoryIds(raw?: string): string[] {
  if (!raw) return [];
  try {
    if (raw.startsWith("[")) return JSON.parse(raw) as string[];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export type CategorySectionSource = "all" | "selected" | "featured" | "popular" | "latest";

export function resolveCategorySectionSource(
  sectionType: string,
  categorySource?: string,
): CategorySectionSource {
  if (sectionType === "featured-categories") return "featured";
  const source = categorySource || "all";
  if (
    source === "selected" ||
    source === "featured" ||
    source === "popular" ||
    source === "latest"
  ) {
    return source;
  }
  return "all";
}

/**
 * Build category lists for section components from flat API categories.
 * Never falls back to demo/hardcoded data — empty array when nothing matches.
 */
export function resolveCategorySectionDisplay(
  categories: Category[],
  options: {
    sectionType: string;
    categorySource?: string;
    categoryIds?: string;
    limit?: number;
  },
): Category[] {
  const limit = Math.min(Math.max(options.limit ?? 6, 1), 12);
  const source = resolveCategorySectionSource(options.sectionType, options.categorySource);
  const active = categories.filter((c) => c.active === true);

  if (source === "selected") {
    const selectedIds = parseCategoryIds(options.categoryIds);
    if (selectedIds.length === 0) return [];
    const ordered = selectedIds
      .map((id) => active.find((c) => c._id === id || c.slug === id))
      .filter((c): c is Category => Boolean(c));
    return ordered.slice(0, limit);
  }

  if (source === "featured") {
    return active.filter((c) => c.featured === true).slice(0, limit);
  }

  if (source === "popular" || source === "latest") {
    return [...active]
      .sort((a, b) => Number(b.sortOrder ?? 0) - Number(a.sortOrder ?? 0))
      .slice(0, limit);
  }

  // "all" — top-level root categories only (parentId === null)
  return active
    .filter((c) => normalizeCategoryParentId(c.parentId) === null)
    .slice(0, limit);
}
