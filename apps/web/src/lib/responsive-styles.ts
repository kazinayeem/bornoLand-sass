import type { Breakpoint } from "./builder-types";
import type { SectionStyle, DeviceStyle } from "@/redux/slices/builder-slice";

/**
 * Resolves a style value for the current breakpoint.
 * Falls back through smaller breakpoints, then to the flat value.
 */
function resolveBreakpointValue(
  responsive: Partial<Record<Breakpoint, DeviceStyle>> | undefined,
  device: Breakpoint,
  key: keyof DeviceStyle,
  flatValue?: string,
): string | undefined {
  if (!responsive) return flatValue;

  const breakpointOrder: Breakpoint[] = ["desktop", "laptop", "tablet", "mobile"];
  const currentIdx = breakpointOrder.indexOf(device);

  // Walk backwards from current breakpoint to find the nearest override
  for (let i = currentIdx; i >= 0; i--) {
    const bp = breakpointOrder[i];
    const deviceStyle = responsive[bp];
    if (deviceStyle && deviceStyle[key] !== undefined) {
      return deviceStyle[key];
    }
  }

  return flatValue;
}

/**
 * Computes visibility for the current device.
 * Falls back through responsive.hidden → hideOnDesktop/Tablet/Mobile → visible.
 */
export function isSectionHidden(
  style: SectionStyle | undefined,
  device: Breakpoint,
): boolean {
  if (!style) return false;

  // Check responsive hidden
  if (style.responsive?.[device]?.hidden !== undefined) {
    return style.responsive[device]!.hidden as unknown as boolean;
  }

  // Fallback to flat hideOn flags
  if (device === "mobile" && style.hideOnMobile) return true;
  if (device === "tablet" && style.hideOnTablet) return true;
  if (device === "desktop" && style.hideOnDesktop) return true;

  return false;
}

/**
 * Computes the final style object for a section given the current breakpoint.
 * Merges flat values with resolved responsive overrides.
 */
export function computeSectionStyle(
  style: SectionStyle | undefined,
  device: Breakpoint,
): React.CSSProperties {
  if (!style) return {};

  const responsive = style.responsive;

  const resolve = (key: keyof DeviceStyle, flatKey?: keyof SectionStyle): string | undefined => {
    return resolveBreakpointValue(responsive, device, key, flatKey ? style[flatKey] as string | undefined : undefined);
  };

  return {
    paddingTop: resolve("paddingTop", "paddingTop"),
    paddingBottom: resolve("paddingBottom", "paddingBottom"),
    paddingLeft: resolve("paddingLeft", "paddingLeft"),
    paddingRight: resolve("paddingRight", "paddingRight"),
    marginTop: resolve("marginTop", "marginTop"),
    marginBottom: resolve("marginBottom", "marginBottom"),
    marginLeft: resolve("marginLeft", "marginLeft"),
    marginRight: resolve("marginRight", "marginRight"),
    borderRadius: resolve("borderRadius", "borderRadius"),
    width: resolve("width", "width"),
    maxWidth: resolve("maxWidth", "maxWidth"),
    minHeight: resolve("minHeight", "minHeight"),
    fontSize: resolve("fontSize"),
    lineHeight: resolve("lineHeight"),
    textAlign: resolve("textAlign") as React.CSSProperties["textAlign"],

    backgroundColor: style.backgroundColor,
    background: style.backgroundGradient ? style.backgroundGradient : undefined,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
    borderStyle: style.borderStyle,
    boxShadow: style.shadow,
    opacity: style.opacity ? Number(style.opacity) / 100 : undefined,
  };
}

/**
 * Applies responsive visibility as 'display: none' when hidden.
 */
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
