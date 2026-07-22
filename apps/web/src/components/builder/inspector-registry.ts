import { normalizeSectionType } from "@/lib/section-registry";
import type { BuilderSection } from "@/redux/slices/builder-slice";

export const HEADER_SECTION_TYPES = new Set([
  "header-bar",
  "header-logo",
  "header-nav",
  "header-icons",
]);

export const FOOTER_SECTION_TYPES = new Set([
  "footer",
  "simple-footer",
  "ecommerce-footer",
  "mega-footer",
  "multi-column-footer",
  "footer-links",
  "footer-copyright",
  "footer-social",
]);

export type InspectorTarget =
  | { kind: "header-settings" }
  | { kind: "footer-settings" }
  | { kind: "section"; sectionId: string; sectionType: string }
  | { kind: "empty" };

/** Resolve which inspector should render for the current builder selection. */
export function resolveInspectorTarget(
  selectedId: string | null,
  section: BuilderSection | undefined,
  editingZone: "header" | "body" | "footer",
): InspectorTarget {
  if (section && selectedId === section.id) {
    const type = normalizeSectionType(section.type);
    if (HEADER_SECTION_TYPES.has(type)) return { kind: "header-settings" };
    if (FOOTER_SECTION_TYPES.has(type)) return { kind: "footer-settings" };
    return { kind: "section", sectionId: section.id, sectionType: type };
  }

  if (editingZone === "header") return { kind: "header-settings" };
  if (editingZone === "footer") return { kind: "footer-settings" };
  return { kind: "empty" };
}

/** Stable React key — forces full inspector remount when the target changes. */
export function inspectorKeyFromTarget(target: InspectorTarget): string {
  switch (target.kind) {
    case "header-settings":
      return "inspector:header-settings";
    case "footer-settings":
      return "inspector:footer-settings";
    case "section":
      return `inspector:section:${target.sectionId}`;
    case "empty":
      return "inspector:empty";
  }
}
