"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  setPrimaryColor, setSecondaryColor, setFont, setDarkMode,
  setButtonStyle, setLayoutWidth, setNavbarStyle,
  setBorderRadius, setShadowSize, setSpacing,
  setProductCardStyle, setGridColumns, setShowBadges, setShowRatings,
  setHeroHeight,
} from "@/redux/slices/theme-slice";

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "DM Sans", "Space Grotesk", "Clash Display"];
const BUTTON_STYLES = ["rounded-sm", "rounded", "rounded-lg", "rounded-xl", "rounded-full"];
const NAVBAR_STYLES = ["fixed", "sticky", "static"];
const LAYOUT_WIDTHS = ["100%", "1200px", "1280px", "1400px"];
const SHADOW_SIZES = ["none", "sm", "md", "lg"] as const;
const CARD_STYLES = ["default", "minimal", "bordered", "elevated"] as const;
const HERO_HEIGHTS = ["sm", "md", "lg"] as const;

type ColorPickerProps = { label: string; value: string; onChange: (v: string) => void };
function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0.5" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none" />
      </div>
    </div>
  );
}

type SelectControlProps = { label: string; value: string; options: readonly string[]; onChange: (v: string) => void };
function SelectControl({ label, value, options, onChange }: SelectControlProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none">
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
        <label className="text-[11px] font-medium text-zinc-500">{label}</label>
        <span className="text-[11px] text-zinc-400">{value}{unit}</span>
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
      <label className="text-[11px] font-medium text-zinc-500">{label}</label>
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

  return (
    <div className="p-3 space-y-5">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Colors</p>
        <div className="space-y-2.5">
          <ColorPicker label="Primary Color" value={t.primaryColor} onChange={(v) => dispatch(setPrimaryColor(v))} />
          <ColorPicker label="Secondary Color" value={t.secondaryColor} onChange={(v) => dispatch(setSecondaryColor(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Typography</p>
        <div className="space-y-2.5">
          <SelectControl label="Font Family" value={t.font} options={FONTS} onChange={(v) => dispatch(setFont(v))} />
          <SelectControl label="Button Style" value={t.buttonStyle} options={BUTTON_STYLES} onChange={(v) => dispatch(setButtonStyle(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Layout</p>
        <div className="space-y-2.5">
          <SelectControl label="Navbar Style" value={t.navbarStyle} options={NAVBAR_STYLES} onChange={(v) => dispatch(setNavbarStyle(v))} />
          <SelectControl label="Layout Width" value={t.layoutWidth} options={LAYOUT_WIDTHS} onChange={(v) => dispatch(setLayoutWidth(v))} />
          <SelectControl label="Hero Height" value={t.heroHeight} options={HERO_HEIGHTS} onChange={(v: string) => dispatch(setHeroHeight(v as typeof t.heroHeight))} />
          <RangeControl label="Border Radius" value={t.borderRadius} min={0} max={24} onChange={(v) => dispatch(setBorderRadius(v))} unit="px" />
          <RangeControl label="Spacing" value={t.spacing} min={0} max={48} step={4} onChange={(v) => dispatch(setSpacing(v))} unit="px" />
          <SelectControl label="Shadow Size" value={t.shadowSize} options={SHADOW_SIZES} onChange={(v: string) => dispatch(setShadowSize(v as typeof t.shadowSize))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Products</p>
        <div className="space-y-2.5">
          <SelectControl label="Card Style" value={t.productCardStyle} options={CARD_STYLES} onChange={(v: string) => dispatch(setProductCardStyle(v as typeof t.productCardStyle))} />
          <RangeControl label="Grid Columns" value={t.gridColumns} min={2} max={6} onChange={(v) => dispatch(setGridColumns(v))} />
          <ToggleControl label="Show Badges" value={t.showBadges} onChange={(v) => dispatch(setShowBadges(v))} />
          <ToggleControl label="Show Ratings" value={t.showRatings} onChange={(v) => dispatch(setShowRatings(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Mode</p>
        <ToggleControl label="Dark Mode" value={t.darkMode} onChange={(v) => dispatch(setDarkMode(v))} />
      </div>
    </div>
  );
}
