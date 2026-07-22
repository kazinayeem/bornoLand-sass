import type { CSSProperties } from "react";
import type { SectionData } from "@/components/sections/section-renderer";
import type { SectionStyle } from "@/redux/slices/builder-slice";
import type { Breakpoint } from "@/lib/builder-types";
import { normalizeCssLength } from "@/lib/section-style";

/** Maps Look-tab style keys to section prop keys used by section components. */
export const STYLE_TO_PROP: Partial<Record<keyof SectionStyle, string>> = {
  color: "textColor",
  backgroundColor: "bgColor",
  backgroundGradient: "bgGradient",
  backgroundImage: "bgImage",
  textAlign: "textAlignment",
  fontFamily: "font",
  borderRadius: "borderRadius",
  borderWidth: "borderWidth",
  borderColor: "borderColor",
  shadow: "shadow",
  overlayColor: "bgOverlayColor",
  overlayOpacity: "bgOverlayOpacity",
};

export function styleChangesToProps(
  styleChanges: Partial<SectionStyle>,
): Record<string, string> {
  const props: Record<string, string> = {};
  for (const [styleKey, propKey] of Object.entries(STYLE_TO_PROP)) {
    const value = styleChanges[styleKey as keyof SectionStyle];
    if (typeof value === "string") {
      props[propKey] = value;
    }
  }
  return props;
}

export function isValidBackgroundImage(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:") || trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveTextColor(section: SectionData, fallback?: string): string | undefined {
  return section.style?.color || section.props.textColor || fallback;
}

export function resolveTextAlignment(section: SectionData): string | undefined {
  return section.style?.textAlign || section.props.textAlignment;
}

export function resolveFontFamily(section: SectionData): string | undefined {
  return section.style?.fontFamily || section.props.font;
}

export function resolveFontSize(section: SectionData): string | undefined {
  const fromStyle = section.style?.fontSize;
  if (fromStyle) return normalizeCssLength(fromStyle);
  const fromProp = section.props.fontSize;
  if (!fromProp) return undefined;
  const sizeMap: Record<string, string> = {
    sm: "14px",
    md: "16px",
    lg: "20px",
    xl: "24px",
  };
  return sizeMap[fromProp] ?? normalizeCssLength(fromProp);
}

export function resolveBackgroundColor(section: SectionData): string {
  return section.style?.backgroundColor || section.props.bgColor || "";
}

export function resolveBackgroundImage(section: SectionData, device?: Breakpoint): string {
  const mobileUrl = section.props.mobileImageUrl?.trim();
  if (device === "mobile" && mobileUrl) return mobileUrl;
  return (section.style?.backgroundImage || section.props.bgImage || section.props.imageUrl || "").trim();
}

export function resolveBackgroundGradient(section: SectionData): string {
  return section.style?.backgroundGradient || section.props.bgGradient || "";
}

export function resolveOpacity(section: SectionData): number | undefined {
  const raw = section.style?.opacity;
  if (raw === undefined || raw === "") return undefined;
  const num = Number(raw);
  return Number.isFinite(num) ? num / 100 : undefined;
}

export function resolveSectionCssVars(section: SectionData): CSSProperties {
  const textColor = resolveTextColor(section);
  const fontFamily = resolveFontFamily(section);
  const fontSize = resolveFontSize(section);
  const textShadow = section.style?.textShadow && section.style.textShadow !== "none"
    ? section.style.textShadow
    : undefined;

  return {
    ...(textColor ? { color: textColor, ["--section-text-color" as string]: textColor } : {}),
    ...(fontFamily ? { fontFamily, ["--section-font-family" as string]: fontFamily } : {}),
    ...(fontSize ? { fontSize, ["--section-font-size" as string]: fontSize } : {}),
    ...(section.style?.fontWeight ? { fontWeight: section.style.fontWeight } : {}),
    ...(section.style?.lineHeight ? { lineHeight: section.style.lineHeight } : {}),
    ...(section.style?.letterSpacing
      ? { letterSpacing: normalizeCssLength(section.style.letterSpacing) }
      : {}),
    ...(section.style?.textTransform
      ? { textTransform: section.style.textTransform as CSSProperties["textTransform"] }
      : {}),
    ...(textShadow ? { textShadow } : {}),
    ...(resolveTextAlignment(section)
      ? { textAlign: resolveTextAlignment(section) as CSSProperties["textAlign"] }
      : {}),
  };
}
