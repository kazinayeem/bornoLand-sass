import type { Breakpoint } from "./builder-types";
import type { SectionStyle, DeviceStyle } from "@/redux/slices/builder-slice";
import { normalizeCssLength } from "@/lib/section-style";

function resolveBreakpointValue(
  responsive: Partial<Record<Breakpoint, DeviceStyle>> | undefined,
  device: Breakpoint,
  key: keyof DeviceStyle,
  flatValue?: string,
): string | undefined {
  if (!responsive) return flatValue;

  const breakpointOrder: Breakpoint[] = ["desktop", "laptop", "tablet", "mobile"];
  const currentIdx = breakpointOrder.indexOf(device);

  for (let i = currentIdx; i >= 0; i--) {
    const bp = breakpointOrder[i];
    const deviceStyle = responsive[bp];
    if (deviceStyle && deviceStyle[key] !== undefined) {
      const val = deviceStyle[key];
      if (typeof val === "string") return val;
    }
  }

  return flatValue;
}

export function isSectionHidden(
  style: SectionStyle | undefined,
  device: Breakpoint,
): boolean {
  if (!style) return false;

  if (style.responsive?.[device]?.hidden !== undefined) {
    return style.responsive[device]!.hidden as unknown as boolean;
  }

  if (device === "mobile" && style.hideOnMobile) return true;
  if (device === "tablet" && style.hideOnTablet) return true;
  if (device === "desktop" && style.hideOnDesktop) return true;

  return false;
}

const BP_ORDER: Breakpoint[] = ["desktop", "laptop", "tablet", "mobile"];

function resolve<T>(
  responsive: Partial<Record<Breakpoint, DeviceStyle>> | undefined,
  device: Breakpoint,
  key: keyof DeviceStyle,
  flat?: T,
): T | string | undefined {
  if (!responsive) return flat as any;
  const idx = BP_ORDER.indexOf(device);
  for (let i = idx; i >= 0; i--) {
    const ds = responsive[BP_ORDER[i]];
    if (ds && (ds as any)[key] !== undefined) {
      return (ds as any)[key] as string;
    }
  }
  return flat as any;
}

export function computeSectionStyle(
  style: SectionStyle | undefined,
  device: Breakpoint,
): React.CSSProperties {
  if (!style) return {};

  const r = style.responsive;
  const res = (key: keyof DeviceStyle, fallback?: string) =>
    normalizeCssLength(resolve(r, device, key, fallback ?? (style as Record<string, string | undefined>)[key]));

  const shadowValue = style.shadow && !["none", "sm", "md", "lg"].includes(style.shadow)
    ? style.shadow
    : undefined;

  return {
    paddingTop: res("paddingTop"),
    paddingBottom: res("paddingBottom"),
    paddingLeft: res("paddingLeft"),
    paddingRight: res("paddingRight"),
    marginTop: res("marginTop"),
    marginBottom: res("marginBottom"),
    marginLeft: res("marginLeft"),
    marginRight: res("marginRight"),
    borderRadius: res("borderRadius"),
    width: res("width"),
    maxWidth: res("maxWidth"),
    minHeight: res("minHeight"),
    height: res("height"),
    maxHeight: res("maxHeight"),
    minWidth: res("minWidth"),
    fontSize: res("fontSize"),
    lineHeight: res("lineHeight"),
    textAlign: res("textAlign") as React.CSSProperties["textAlign"],
    gap: res("gap"),
    flexDirection: res("flexDirection") as React.CSSProperties["flexDirection"],
    alignItems: res("alignItems") as React.CSSProperties["alignItems"],
    justifyContent: res("justifyContent") as React.CSSProperties["justifyContent"],
    top: res("top"),
    right: res("right"),
    bottom: res("bottom"),
    left: res("left"),

    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: normalizeCssLength(style.borderWidth),
    borderStyle: style.borderStyle,
    boxShadow: shadowValue,
    opacity: style.opacity !== undefined && style.opacity !== ""
      ? Number(style.opacity) / 100
      : undefined,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    letterSpacing: normalizeCssLength(style.letterSpacing),
    textTransform: style.textTransform as React.CSSProperties["textTransform"],
    textDecoration: style.textDecoration as React.CSSProperties["textDecoration"],
    textShadow: style.textShadow && style.textShadow !== "none" ? style.textShadow : undefined,
    color: style.color,
    display: style.display as React.CSSProperties["display"],
    flexWrap: style.flexWrap as React.CSSProperties["flexWrap"],
    order: style.order ? Number(style.order) : undefined,
    position: style.position as React.CSSProperties["position"],
    zIndex: style.zIndex ? Number(style.zIndex) : undefined,
    transform: style.transform,
    transformOrigin: style.transformOrigin,
    backdropFilter: style.backdropBlur ? `blur(${normalizeCssLength(style.backdropBlur)})` : undefined,
  };
}

export function applyResponsiveVisibility(
  baseStyle: React.CSSProperties,
  style: SectionStyle | undefined,
  device: Breakpoint,
): React.CSSProperties {
  if (isSectionHidden(style, device)) {
    return { ...baseStyle, display: "none" };
  }
  return baseStyle;
}
