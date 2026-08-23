"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  applyPreset,
  setPrimaryColor, setSecondaryColor, setAccentColor,
  setBackgroundColor, setTextColor, setMutedTextColor, setBorderColor,
  setFont, setDarkMode,
  setButtonStyle, setLayoutWidth, setNavbarStyle,
  setBorderRadius, setShadowSize, setSpacing,
  setProductCardStyle, setGridColumns, setShowBadges, setShowRatings,
  setHeroHeight,
} from "@/redux/slices/theme-slice";
import { THEMES } from "@/themes/registry";
import { Sparkles, Check, Store, Cpu, Layers } from "lucide-react";
import { toast } from "sonner";

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "DM Sans", "Space Grotesk", "Clash Display"];
const BUTTON_STYLES = ["rounded-sm", "rounded", "rounded-lg", "rounded-xl", "rounded-full"];
const NAVBAR_STYLES = ["fixed", "sticky", "static"];
const LAYOUT_WIDTHS = ["100%", "1200px", "1280px", "1400px"];
const SHADOW_SIZES = ["none", "sm", "md", "lg"] as const;
const CARD_STYLES = ["default", "grocery", "electronics", "minimal", "bordered", "elevated"] as const;
const HERO_HEIGHTS = ["sm", "md", "lg"] as const;

type ColorPickerProps = { label: string; value: string; onChange: (v: string) => void };
function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0.5" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none" />
      </div>
    </div>
  );
}

type SelectControlProps = { label: string; value: string; options: readonly string[]; onChange: (v: string) => void };
function SelectControl({ label, value, options, onChange }: SelectControlProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

type RangeControlProps = { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string };
function RangeControl({ label, value, min, max, step = 1, onChange, unit = "" }: RangeControlProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
        <span className="text-[11px] text-apple-ink-muted-48">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900" />
    </div>
  );
}

type ToggleControlProps = { label: string; value: boolean; onChange: (v: boolean) => void };
function ToggleControl({ label, value, onChange }: ToggleControlProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
      <button onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-zinc-900" : "bg-zinc-200"}`}>
        <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export function ThemePanel() {
  const dispatch = useDispatch();
  const t = useSelector((s: RootState) => s.theme);
  const activeThemeId = (t as any).themeId || t.preset || "grocery";

  const handleSelectTheme = (themeId: string) => {
    const targetTheme = THEMES.find((th) => th.id === themeId);
    if (!targetTheme) return;

    dispatch(setPrimaryColor(targetTheme.tokens.colors.primary));
    dispatch(setSecondaryColor(targetTheme.tokens.colors.secondary));
    dispatch(setAccentColor(targetTheme.tokens.colors.accent || "#f59e0b"));
    dispatch(setBackgroundColor(targetTheme.tokens.colors.background || "#ffffff"));
    dispatch(setTextColor(targetTheme.tokens.colors.text || "#18181b"));
    dispatch(setMutedTextColor(targetTheme.tokens.colors.textMuted || "#71717a"));
    dispatch(setBorderColor(targetTheme.tokens.colors.border || "#e4e4e7"));
    dispatch(setBorderRadius(targetTheme.tokens.layout.borderRadius));
    dispatch(setSpacing(targetTheme.tokens.layout.spacing));
    dispatch(setProductCardStyle(targetTheme.productCardVariant as any));
    dispatch(setGridColumns(targetTheme.id === "electronics" ? 5 : 4));
    toast.success(`Theme switched to ${targetTheme.name}`);
  };

  return (
    <div className="h-full overflow-y-auto overscroll-contain p-3 space-y-5">
      {/* ── Core Theme System ── */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#e05a00]" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
            Platform Themes
          </p>
        </div>
        <p className="mb-3 text-[11px] text-zinc-500">
          Switch store theme preset without affecting your products or store data.
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {THEMES.map((theme) => {
            const isSelected = activeThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: theme.tokens.colors.background,
                    borderColor: theme.tokens.colors.border,
                  }}
                >
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: theme.tokens.colors.primary }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{theme.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight line-clamp-2 mt-0.5">
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brand Colors ── */}
      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Colors & Palette</p>
        <div className="space-y-2.5">
          <ColorPicker label="Primary Color" value={t.primaryColor} onChange={(v) => dispatch(setPrimaryColor(v))} />
          <ColorPicker label="Secondary Color" value={t.secondaryColor} onChange={(v) => dispatch(setSecondaryColor(v))} />
          <ColorPicker label="Accent Color" value={t.accentColor} onChange={(v) => dispatch(setAccentColor(v))} />
        </div>
      </div>

      {/* ── Store Surface Colors ── */}
      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Surface & Text Colors</p>
        <div className="space-y-2.5">
          <ColorPicker label="Background Color" value={t.backgroundColor} onChange={(v) => dispatch(setBackgroundColor(v))} />
          <ColorPicker label="Text Color" value={t.textColor} onChange={(v) => dispatch(setTextColor(v))} />
          <ColorPicker label="Muted Text Color" value={t.mutedTextColor} onChange={(v) => dispatch(setMutedTextColor(v))} />
          <ColorPicker label="Border Color" value={t.borderColor} onChange={(v) => dispatch(setBorderColor(v))} />
        </div>
      </div>

      {/* ── Typography & Buttons ── */}
      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Typography & Styling</p>
        <div className="space-y-2.5">
          <SelectControl label="Font Family" value={t.font} options={FONTS} onChange={(v) => dispatch(setFont(v))} />
          <SelectControl label="Button Style" value={t.buttonStyle} options={BUTTON_STYLES} onChange={(v) => dispatch(setButtonStyle(v))} />
        </div>
      </div>

      {/* ── Layout & Radii ── */}
      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Layout</p>
        <div className="space-y-2.5">
          <SelectControl label="Navbar Style" value={t.navbarStyle} options={NAVBAR_STYLES} onChange={(v) => dispatch(setNavbarStyle(v))} />
          <SelectControl label="Layout Width" value={t.layoutWidth} options={LAYOUT_WIDTHS} onChange={(v) => dispatch(setLayoutWidth(v))} />
          <RangeControl label="Border Radius" value={t.borderRadius} min={0} max={24} onChange={(v) => dispatch(setBorderRadius(v))} unit="px" />
          <RangeControl label="Spacing" value={t.spacing} min={0} max={48} step={4} onChange={(v) => dispatch(setSpacing(v))} unit="px" />
        </div>
      </div>

      {/* ── Products & Cards ── */}
      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Product Card Variants</p>
        <div className="space-y-2.5">
          <SelectControl label="Card Style" value={t.productCardStyle} options={CARD_STYLES} onChange={(v) => dispatch(setProductCardStyle(v as typeof t.productCardStyle))} />
          <RangeControl label="Grid Columns" value={t.gridColumns} min={2} max={6} onChange={(v) => dispatch(setGridColumns(v))} />
          <ToggleControl label="Show Badges" value={t.showBadges} onChange={(v) => dispatch(setShowBadges(v))} />
          <ToggleControl label="Show Ratings" value={t.showRatings} onChange={(v) => dispatch(setShowRatings(v))} />
        </div>
      </div>

      {/* ── Dark Mode ── */}
      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Mode</p>
        <ToggleControl label="Dark Mode" value={t.darkMode} onChange={(v) => dispatch(setDarkMode(v))} />
      </div>
    </div>
  );
}
