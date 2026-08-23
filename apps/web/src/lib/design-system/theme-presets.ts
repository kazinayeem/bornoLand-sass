export type PresetKey = "modern" | "minimal" | "premium" | "editorial" | "ecommerce";

export type ThemePresetConfig = {
  key: PresetKey;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  font: string;
  headingFont: string;
  bodyFont: string;
  buttonStyle: "rounded-sm" | "rounded" | "rounded-lg" | "rounded-xl" | "rounded-full";
  layoutWidth: "100%" | "1200px" | "1280px" | "1400px";
  borderRadius: number;
  shadowSize: "none" | "sm" | "md" | "lg";
  spacing: number;
  productCardStyle: "default" | "minimal" | "bordered" | "elevated";
  gridColumns: number;
  heroHeight: "sm" | "md" | "lg";
  previewAccent: string;
  previewBg: string;
};

export const THEME_PRESETS: Record<PresetKey, ThemePresetConfig> = {
  modern: {
    key: "modern",
    name: "Modern",
    description: "Balanced, clean & contemporary with smooth radius and vibrant accents.",
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#18181b",
    mutedTextColor: "#71717a",
    borderColor: "#e4e4e7",
    font: "Inter",
    headingFont: "Inter",
    bodyFont: "Inter",
    buttonStyle: "rounded-xl",
    layoutWidth: "1280px",
    borderRadius: 14,
    shadowSize: "md",
    spacing: 20,
    productCardStyle: "default",
    gridColumns: 4,
    heroHeight: "md",
    previewAccent: "#2563eb",
    previewBg: "#f8fafc",
  },
  minimal: {
    key: "minimal",
    name: "Minimal",
    description: "Ultra-clean monochrome with sharp lines, high contrast and thin borders.",
    primaryColor: "#18181b",
    secondaryColor: "#71717a",
    accentColor: "#3b82f6",
    backgroundColor: "#ffffff",
    textColor: "#09090b",
    mutedTextColor: "#a1a1aa",
    borderColor: "#e4e4e7",
    font: "Space Grotesk",
    headingFont: "Space Grotesk",
    bodyFont: "Inter",
    buttonStyle: "rounded",
    layoutWidth: "1200px",
    borderRadius: 6,
    shadowSize: "none",
    spacing: 16,
    productCardStyle: "minimal",
    gridColumns: 4,
    heroHeight: "sm",
    previewAccent: "#18181b",
    previewBg: "#ffffff",
  },
  premium: {
    key: "premium",
    name: "Premium",
    description: "Luxurious feel with generous spacing, deep tones and subtle gradients.",
    primaryColor: "#4f46e5",
    secondaryColor: "#09090b",
    accentColor: "#a78bfa",
    backgroundColor: "#ffffff",
    textColor: "#18181b",
    mutedTextColor: "#71717a",
    borderColor: "#e4e4e7",
    font: "Clash Display",
    headingFont: "Clash Display",
    bodyFont: "Inter",
    buttonStyle: "rounded-full",
    layoutWidth: "1400px",
    borderRadius: 20,
    shadowSize: "lg",
    spacing: 24,
    productCardStyle: "elevated",
    gridColumns: 4,
    heroHeight: "lg",
    previewAccent: "#6366f1",
    previewBg: "#0f172a",
  },
  editorial: {
    key: "editorial",
    name: "Editorial",
    description: "Refined serif headlines with magazine-quality typographic hierarchy.",
    primaryColor: "#881337",
    secondaryColor: "#1c1917",
    accentColor: "#f43f5e",
    backgroundColor: "#ffffff",
    textColor: "#1c1917",
    mutedTextColor: "#78716c",
    borderColor: "#e7e5e4",
    font: "Playfair Display",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    buttonStyle: "rounded-sm",
    layoutWidth: "1200px",
    borderRadius: 4,
    shadowSize: "sm",
    spacing: 20,
    productCardStyle: "bordered",
    gridColumns: 3,
    heroHeight: "lg",
    previewAccent: "#9f1239",
    previewBg: "#fafaf9",
  },
  ecommerce: {
    key: "ecommerce",
    name: "E-Commerce",
    description: "High-conversion storefront design with bold pricing and prominent CTAs.",
    primaryColor: "#059669",
    secondaryColor: "#111827",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    mutedTextColor: "#6b7280",
    borderColor: "#e5e7eb",
    font: "Poppins",
    headingFont: "Poppins",
    bodyFont: "Inter",
    buttonStyle: "rounded-lg",
    layoutWidth: "1280px",
    borderRadius: 12,
    shadowSize: "md",
    spacing: 16,
    productCardStyle: "default",
    gridColumns: 4,
    heroHeight: "md",
    previewAccent: "#10b981",
    previewBg: "#f0fdf4",
  },
};

/** Convert radius number to CSS string */
export function getRadiusValue(radius?: number): string {
  if (typeof radius !== "number") return "12px";
  return `${radius}px`;
}

/** Get shadow CSS values according to size */
export function getShadowValue(size?: "none" | "sm" | "md" | "lg"): string {
  switch (size) {
    case "none":
      return "none";
    case "sm":
      return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    case "lg":
      return "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    case "md":
    default:
      return "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)";
  }
}

/** Generate CSS variables dictionary from theme */
export function generateThemeCssVariables(theme: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  borderRadius?: number;
  shadowSize?: "none" | "sm" | "md" | "lg";
  layoutWidth?: string;
  font?: string;
  headingFont?: string;
  bodyFont?: string;
}): Record<string, string> {
  const primary = theme.primaryColor || "#2563eb";
  const secondary = theme.secondaryColor || "#0f172a";
  const accent = theme.accentColor || "#f59e0b";
  const background = theme.backgroundColor || "#ffffff";
  const text = theme.textColor || "#18181b";
  const muted = theme.mutedTextColor || "#71717a";
  const border = theme.borderColor || "#e4e4e7";
  const radius = getRadiusValue(theme.borderRadius);
  const shadow = getShadowValue(theme.shadowSize);
  const maxWidth = theme.layoutWidth || "1280px";
  const font = theme.font || "Inter, system-ui, sans-serif";
  const headingFont = theme.headingFont || font;
  const bodyFont = theme.bodyFont || font;

  return {
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--store-primary": primary,
    "--store-secondary": secondary,
    "--store-accent": accent,
    "--store-background": background,
    "--store-text": text,
    "--store-muted": muted,
    "--store-border": border,
    "--radius-theme": radius,
    "--shadow-theme": shadow,
    "--container-max-width": maxWidth,
    "--font-family-primary": font,
    "--font-family-heading": headingFont,
    "--font-family-body": bodyFont,
  };
}
