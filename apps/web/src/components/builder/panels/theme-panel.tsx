"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  setPrimaryColor,
  setSecondaryColor,
  setAccentColor,
  setBackgroundColor,
  setTextColor,
  setMutedTextColor,
  setBorderColor,
  setFont,
  setDarkMode,
  setButtonStyle,
  setLayoutWidth,
  setNavbarStyle,
  setBorderRadius,
  setSpacing,
  setProductCardStyle,
  setGridColumns,
  setShowBadges,
  setShowRatings,
  setTheme,
} from "@/redux/slices/theme-slice";
import { loadPage } from "@/redux/slices/builder-slice";
import { useRequiredStore } from "@/providers/store-context";
import { useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";
import { THEMES, getThemeById, migrateThemeSections } from "@/themes/registry";
import { ExternalLink, Palette, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "DM Sans", "Space Grotesk", "Clash Display", "Cinzel", "Merriweather", "Quicksand", "Teko"];
const BUTTON_STYLES = ["rounded-sm", "rounded", "rounded-lg", "rounded-xl", "rounded-full"];
const NAVBAR_STYLES = ["fixed", "sticky", "static"];
const LAYOUT_WIDTHS = ["100%", "1200px", "1280px", "1400px"];
const CARD_STYLES = ["default", "grocery", "electronics", "minimal", "bordered", "elevated", "fashion-lookbook", "beauty-glow", "food-round", "furniture-box", "sports-badge", "book-spine", "kids-bubble", "market-grid"] as const;

type ColorPickerProps = { label: string; value: string; onChange: (v: string) => void };
function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

type SelectControlProps = { label: string; value: string; options: readonly string[]; onChange: (v: string) => void };
function SelectControl({ label, value, options, onChange }: SelectControlProps) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

type RangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit?: string;
};
function RangeControl({ label, value, min, max, step = 1, onChange, unit = "" }: RangeControlProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
        <span className="text-[11px] text-apple-ink-muted-48">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
      />
    </div>
  );
}

type ToggleControlProps = { label: string; value: boolean; onChange: (v: boolean) => void };
function ToggleControl({ label, value, onChange }: ToggleControlProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-medium text-apple-ink-muted-48">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-zinc-900" : "bg-zinc-200"}`}
      >
        <div
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-4" : ""}`}
        />
      </button>
    </div>
  );
}

export function ThemePanel() {
  const dispatch = useDispatch();
  const t = useSelector((s: RootState) => s.theme);
  const { store, storeId, storeSlug } = useRequiredStore();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const currentSections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const headerSettings = useSelector((s: RootState) => s.builder.headerSettings);
  const footerSettings = useSelector((s: RootState) => s.builder.footerSettings);

  const [changeTheme] = useChangeStoreThemeMutation();
  const [switchingThemeId, setSwitchingThemeId] = useState<string | null>(null);

  const currentThemeId = (store.theme as any)?.themeId || "grocery";

  const handleApplyTheme = async (targetThemeId: string) => {
    if (targetThemeId === currentThemeId) return;
    setSwitchingThemeId(targetThemeId);
    const targetTheme = getThemeById(targetThemeId);

    try {
      const migrated = migrateThemeSections(targetTheme.id, currentSections);

      await changeTheme({
        id: storeId,
        data: {
          theme: {
            themeId: targetTheme.id,
            primaryColor: targetTheme.tokens.colors.primary,
            secondaryColor: targetTheme.tokens.colors.secondary,
            font: targetTheme.tokens.typography.fontFamily,
            darkMode: false,
          },
          sections: migrated,
        },
      }).unwrap();

      dispatch(setTheme({
        primaryColor: targetTheme.tokens.colors.primary,
        secondaryColor: targetTheme.tokens.colors.secondary,
        accentColor: targetTheme.tokens.colors.accent,
        backgroundColor: targetTheme.tokens.colors.background,
        textColor: targetTheme.tokens.colors.text,
        mutedTextColor: targetTheme.tokens.colors.textMuted,
        borderColor: targetTheme.tokens.colors.border,
        font: targetTheme.tokens.typography.fontFamily,
        borderRadius: targetTheme.tokens.layout.borderRadius,
        shadowSize: targetTheme.tokens.layout.shadowSize,
      }));

      dispatch(loadPage({
        page: {
          id: pageId,
          title: "Home",
          slug: "/",
          pageType: "home" as any,
          isSystem: true,
          description: "",
          status: "draft" as any,
        },
        sections: migrated,
        headerSections,
        footerSections,
        headerSettings,
        footerSettings,
      }));

      await revalidateStorefrontAction({ tenantSlug: store.subdomain || store.slug, storeId, scope: "all" });
      toast.success(isBn ? `${targetTheme.name} থিম সক্রিয় করা হয়েছে!` : `${targetTheme.name} theme activated!`);
    } catch {
      toast.error(isBn ? "থিম পরিবর্তন ব্যর্থ হয়েছে" : "Failed to switch theme");
    } finally {
      setSwitchingThemeId(null);
    }
  };

  return (
    <div className="h-full space-y-5 overflow-y-auto overscroll-contain p-3">
      {/* ── 10 Built-In Themes Selection ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-apple-ink-muted-48">
              {isBn ? "স্টোর থিম নির্বাচন" : "Select Store Theme"}
            </p>
          </div>
          <Link
            href={`/store/${storeSlug}/design`}
            className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
          >
            {isBn ? "সকল থিম" : "All Themes"}
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((item) => {
            const isSelected = item.id === currentThemeId;
            const isSwitching = switchingThemeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={Boolean(switchingThemeId)}
                onClick={() => handleApplyTheme(item.id)}
                className={cn(
                  "group relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 text-zinc-800"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: item.tokens.colors.primary }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: item.tokens.colors.secondary }}
                    />
                  </div>
                  {isSwitching ? (
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                  ) : isSelected ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : null}
                </div>
                <p className="text-[11px] font-bold truncate max-w-full leading-tight">{item.name}</p>
                <p className={cn("text-[9px] truncate max-w-full mt-0.5", isSelected ? "text-zinc-300" : "text-zinc-400")}>
                  {item.category}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
          Colors & Palette
        </p>
        <div className="space-y-2.5">
          <ColorPicker label="Primary Color" value={t.primaryColor} onChange={(v) => dispatch(setPrimaryColor(v))} />
          <ColorPicker label="Secondary Color" value={t.secondaryColor} onChange={(v) => dispatch(setSecondaryColor(v))} />
          <ColorPicker label="Accent Color" value={t.accentColor} onChange={(v) => dispatch(setAccentColor(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
          Surface & Text Colors
        </p>
        <div className="space-y-2.5">
          <ColorPicker label="Background Color" value={t.backgroundColor} onChange={(v) => dispatch(setBackgroundColor(v))} />
          <ColorPicker label="Text Color" value={t.textColor} onChange={(v) => dispatch(setTextColor(v))} />
          <ColorPicker label="Muted Text Color" value={t.mutedTextColor} onChange={(v) => dispatch(setMutedTextColor(v))} />
          <ColorPicker label="Border Color" value={t.borderColor} onChange={(v) => dispatch(setBorderColor(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
          Typography & Styling
        </p>
        <div className="space-y-2.5">
          <SelectControl label="Font Family" value={t.font} options={FONTS} onChange={(v) => dispatch(setFont(v))} />
          <SelectControl label="Button Style" value={t.buttonStyle} options={BUTTON_STYLES} onChange={(v) => dispatch(setButtonStyle(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Layout</p>
        <div className="space-y-2.5">
          <SelectControl label="Navbar Style" value={t.navbarStyle} options={NAVBAR_STYLES} onChange={(v) => dispatch(setNavbarStyle(v))} />
          <SelectControl label="Layout Width" value={t.layoutWidth} options={LAYOUT_WIDTHS} onChange={(v) => dispatch(setLayoutWidth(v))} />
          <RangeControl label="Border Radius" value={t.borderRadius} min={0} max={24} onChange={(v) => dispatch(setBorderRadius(v))} unit="px" />
          <RangeControl label="Spacing" value={t.spacing} min={0} max={48} step={4} onChange={(v) => dispatch(setSpacing(v))} unit="px" />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
          Product Card Variants
        </p>
        <div className="space-y-2.5">
          <SelectControl
            label="Card Style"
            value={t.productCardStyle}
            options={CARD_STYLES}
            onChange={(v) => dispatch(setProductCardStyle(v as typeof t.productCardStyle))}
          />
          <RangeControl label="Grid Columns" value={t.gridColumns} min={2} max={6} onChange={(v) => dispatch(setGridColumns(v))} />
          <ToggleControl label="Show Badges" value={t.showBadges} onChange={(v) => dispatch(setShowBadges(v))} />
          <ToggleControl label="Show Ratings" value={t.showRatings} onChange={(v) => dispatch(setShowRatings(v))} />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Mode</p>
        <ToggleControl label="Dark Mode" value={t.darkMode} onChange={(v) => dispatch(setDarkMode(v))} />
      </div>
    </div>
  );
}
