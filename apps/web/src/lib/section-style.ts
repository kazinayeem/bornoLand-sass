import type { BuilderSection } from "@/redux/slices/builder-slice";
import type { SectionStyle } from "@/components/storefront/storefront-types";

/** Normalize numeric style values to valid CSS lengths (e.g. "48" → "48px"). */
export function normalizeCssLength(value?: string | number | null, unit = "px"): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const raw = String(value).trim();
  if (!raw || raw === "auto" || raw === "none" || raw === "inherit" || raw === "initial") return raw;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return `${raw}${unit}`;
  return raw;
}

const LENGTH_KEYS: Array<keyof SectionStyle> = [
  "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "marginTop", "marginBottom", "marginLeft", "marginRight",
  "borderRadius", "borderWidth", "fontSize", "letterSpacing", "gap",
  "width", "height", "minHeight", "maxHeight", "minWidth", "maxWidth",
  "top", "right", "bottom", "left", "blur", "backdropBlur",
];

export function normalizeSectionStyle(style?: SectionStyle): SectionStyle | undefined {
  if (!style) return style;
  const next: SectionStyle = { ...style };
  for (const key of LENGTH_KEYS) {
    const val = next[key];
    if (typeof val === "string") {
      (next as Record<string, string | undefined>)[key] = normalizeCssLength(val);
    }
  }
  if (next.responsive) {
    next.responsive = Object.fromEntries(
      Object.entries(next.responsive).map(([device, deviceStyle]) => [
        device,
        deviceStyle
          ? Object.fromEntries(
              Object.entries(deviceStyle).map(([k, v]) => [
                k,
                typeof v === "string" && LENGTH_KEYS.includes(k as keyof SectionStyle)
                  ? normalizeCssLength(v)
                  : v,
              ]),
            )
          : deviceStyle,
      ]),
    ) as SectionStyle["responsive"];
  }
  return next;
}

export function sectionsEqualForRender(a: BuilderSection, b: BuilderSection): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.visible === b.visible &&
    a.props === b.props &&
    a.style === b.style
  );
}
