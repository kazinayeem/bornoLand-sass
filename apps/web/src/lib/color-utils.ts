const APPLE_INK = "#1d1d1f";

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean) && !/^[0-9a-fA-F]{3}$/.test(clean)) return null;
  const full = clean.length === 3 ? clean.replace(/./g, "$&$&") : clean;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastColor(hex: string): "#ffffff" | "#1d1d1f" {
  const rgb = hexToRgb(hex);
  if (!rgb) return APPLE_INK;
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? APPLE_INK : "#ffffff";
}

export function getContrastTextClass(hex: string): string {
  return getContrastColor(hex) === "#ffffff" ? "text-white" : "text-apple-ink";
}
