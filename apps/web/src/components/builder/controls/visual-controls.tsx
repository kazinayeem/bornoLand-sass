"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  ChevronDown, Minus, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants (DESIGN.md aligned) ─────────────────────────────────

export const FONT_FAMILIES = [
  { label: "System", value: "system-ui, -apple-system, sans-serif" },
  { label: "SF Pro", value: "SF Pro Display, system-ui, -apple-system, sans-serif" },
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Poppins", value: "Poppins, system-ui, sans-serif" },
  { label: "DM Sans", value: "DM Sans, system-ui, sans-serif" },
  { label: "Roboto", value: "Roboto, system-ui, sans-serif" },
  { label: "Space Grotesk", value: "Space Grotesk, system-ui, sans-serif" },
  { label: "Playfair", value: "Playfair Display, Georgia, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
] as const;

export const FONT_SIZE_PRESETS = [
  { label: "XS", value: "12px" },
  { label: "SM", value: "14px" },
  { label: "MD", value: "16px" },
  { label: "LG", value: "18px" },
  { label: "XL", value: "20px" },
  { label: "2XL", value: "24px" },
  { label: "3XL", value: "30px" },
  { label: "4XL", value: "36px" },
  { label: "5XL", value: "48px" },
] as const;

export const FONT_WEIGHTS = [
  { label: "Thin", value: "100" },
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "SemiBold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "ExtraBold", value: "800" },
  { label: "Black", value: "900" },
] as const;

export const LINE_HEIGHT_PRESETS = [
  { label: "Tight", value: "1.1" },
  { label: "Snug", value: "1.25" },
  { label: "Normal", value: "1.5" },
  { label: "Relaxed", value: "1.625" },
  { label: "Loose", value: "2" },
] as const;

export const LETTER_SPACING_PRESETS = [
  { label: "Tighter", value: "-0.05em" },
  { label: "Tight", value: "-0.025em" },
  { label: "Normal", value: "0" },
  { label: "Wide", value: "0.025em" },
  { label: "Wider", value: "0.05em" },
  { label: "Widest", value: "0.1em" },
] as const;

export const RADIUS_PRESETS = [
  { label: "None", value: "0" },
  { label: "XS", value: "5" },
  { label: "SM", value: "8" },
  { label: "MD", value: "11" },
  { label: "LG", value: "18" },
  { label: "Pill", value: "9999" },
] as const;

export const SHADOW_PRESETS = [
  { label: "None", value: "none" },
  { label: "SM", value: "0 1px 3px rgba(0,0,0,0.08)" },
  { label: "MD", value: "0 4px 12px rgba(0,0,0,0.1)" },
  { label: "LG", value: "0 8px 30px rgba(0,0,0,0.12)" },
  { label: "XL", value: "0 20px 60px rgba(0,0,0,0.15)" },
] as const;

export const TEXT_SHADOW_PRESETS = [
  { label: "None", value: "none" },
  { label: "Soft", value: "0 1px 2px rgba(0,0,0,0.15)" },
  { label: "Medium", value: "0 2px 8px rgba(0,0,0,0.25)" },
  { label: "Strong", value: "0 4px 16px rgba(0,0,0,0.35)" },
  { label: "Glow", value: "0 0 12px rgba(0,102,204,0.45)" },
] as const;

export const BUTTON_STYLE_PRESETS = [
  { label: "Primary", value: "primary", hint: "Solid brand" },
  { label: "Secondary", value: "secondary", hint: "Soft fill" },
  { label: "Outline", value: "outline", hint: "Border only" },
  { label: "Ghost", value: "ghost", hint: "Minimal" },
  { label: "Rounded", value: "rounded", hint: "Soft corners" },
  { label: "Pill", value: "pill", hint: "Full round" },
  { label: "Apple", value: "apple", hint: "Action blue" },
  { label: "Minimal", value: "minimal", hint: "Text link" },
] as const;

export const GRADIENT_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft dusk", value: "linear-gradient(135deg, #1d1d1f 0%, #333333 100%)" },
  { label: "Ocean", value: "linear-gradient(135deg, #0066cc 0%, #2997ff 100%)" },
  { label: "Pearl", value: "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)" },
  { label: "Warm", value: "linear-gradient(135deg, #f5f5f7 0%, #e0e0e0 100%)" },
  { label: "Midnight", value: "linear-gradient(160deg, #000000 0%, #272729 100%)" },
] as const;

export const BRAND_PALETTE = [
  "#0066cc", "#0071e3", "#2997ff", "#1d1d1f", "#333333",
  "#7a7a7a", "#ffffff", "#f5f5f7", "#fafafc", "#e0e0e0",
  "#000000", "#272729",
];

const RECENT_COLORS_KEY = "bornoland.builder.recentColors";

function parsePx(value?: string): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/px$/i, ""));
  return Number.isFinite(n) ? n : 0;
}

function toPx(n: number): string {
  return `${Math.round(n)}px`;
}

// ─── Segmented control ─────────────────────────────────────────────

export function SegmentedControl({
  value,
  onChange,
  options,
  size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1 rounded-md font-medium transition-all",
            size === "sm" ? "min-w-0 px-1.5 py-1 text-[9px]" : "px-2 py-1.5 text-[10px]",
            value === opt.value
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-apple-ink-muted-48 hover:bg-white hover:text-apple-ink-muted-80",
          )}
        >
          {opt.icon}
          {!opt.icon && opt.label}
          {opt.icon && <span className="sr-only">{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Slider with +/- ───────────────────────────────────────────────

export function VisualSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
  showValue = true,
}: {
  value: string | number;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  showValue?: boolean;
}) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value)) || 0;
  const clamped = Math.min(max, Math.max(min, num));

  const bump = (dir: -1 | 1) => {
    const next = Math.min(max, Math.max(min, clamped + dir * step));
    onChange(String(next));
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => bump(-1)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
        aria-label="Decrease"
      >
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => onChange(e.target.value)}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
      />
      <button
        type="button"
        onClick={() => bump(1)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
        aria-label="Increase"
      >
        <Plus className="h-3 w-3" />
      </button>
      {showValue && (
        <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-apple-ink-muted-48">
          {Math.round(clamped)}{suffix}
        </span>
      )}
    </div>
  );
}

// ─── Font size (presets + slider) ──────────────────────────────────

export function FontSizeControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const px = parsePx(value) || 16;
  const matched = FONT_SIZE_PRESETS.find((p) => parsePx(p.value) === px);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {FONT_SIZE_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "rounded-md border px-1.5 py-1 text-[9px] font-semibold transition-all",
              matched?.label === p.label
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <VisualSlider
        value={px}
        onChange={(v) => onChange(toPx(Number(v)))}
        min={10}
        max={96}
        step={1}
        suffix="px"
      />
    </div>
  );
}

// ─── Font family dropdown ──────────────────────────────────────────

export function FontFamilyControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = FONT_FAMILIES.find((f) => f.value === value)?.value
    ?? (value ? value : FONT_FAMILIES[0].value);

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none"
      style={{ fontFamily: current }}
    >
      {FONT_FAMILIES.map((f) => (
        <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
          {f.label}
        </option>
      ))}
      {value && !FONT_FAMILIES.some((f) => f.value === value) && (
        <option value={value}>{value}</option>
      )}
    </select>
  );
}

// ─── Font weight dropdown ──────────────────────────────────────────

export function FontWeightControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value || "400"}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none"
    >
      {FONT_WEIGHTS.map((w) => (
        <option key={w.value} value={w.value}>{w.label}</option>
      ))}
    </select>
  );
}

// ─── Text alignment icons ─────────────────────────────────────────

export function TextAlignControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SegmentedControl
      value={value || "left"}
      onChange={onChange}
      options={[
        { label: "Left", value: "left", icon: <AlignLeft className="h-3.5 w-3.5" /> },
        { label: "Center", value: "center", icon: <AlignCenter className="h-3.5 w-3.5" /> },
        { label: "Right", value: "right", icon: <AlignRight className="h-3.5 w-3.5" /> },
        { label: "Justify", value: "justify", icon: <AlignJustify className="h-3.5 w-3.5" /> },
      ]}
    />
  );
}

// ─── Text transform buttons ───────────────────────────────────────

export function TextTransformControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SegmentedControl
      value={value || "none"}
      onChange={onChange}
      options={[
        { label: "Normal", value: "none" },
        { label: "ABC", value: "uppercase" },
        { label: "abc", value: "lowercase" },
        { label: "Abc", value: "capitalize" },
      ]}
    />
  );
}

// ─── Preset chip row ───────────────────────────────────────────────

export function PresetChips({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md border px-2 py-1 text-[9px] font-medium transition-all",
            value === opt.value
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Spacing slider (padding/margin/gap/radius) ────────────────────

export function SpacingSlider({
  value,
  onChange,
  min = 0,
  max = 200,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  const px = parsePx(value);
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-apple-ink-muted-48">{label}</span>
        </div>
      )}
      <VisualSlider
        value={px}
        onChange={(v) => onChange(v)}
        min={min}
        max={max}
        step={1}
        suffix="px"
      />
    </div>
  );
}

export function RadiusControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const px = String(parsePx(value));
  return (
    <div className="space-y-2">
      <PresetChips value={px} onChange={onChange} options={RADIUS_PRESETS} />
      <VisualSlider value={parsePx(value)} onChange={onChange} min={0} max={64} suffix="px" />
    </div>
  );
}

export function OpacityControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <VisualSlider
      value={value === "" || value === undefined ? 100 : Number(value) || 0}
      onChange={onChange}
      min={0}
      max={100}
      suffix="%"
    />
  );
}

export function MaxWidthControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presets = [
    { label: "SM", value: "640px" },
    { label: "MD", value: "768px" },
    { label: "LG", value: "1024px" },
    { label: "XL", value: "1200px" },
    { label: "Full", value: "100%" },
  ];
  return (
    <div className="space-y-2">
      <PresetChips value={value || ""} onChange={onChange} options={presets} />
      {value && value !== "100%" && (
        <VisualSlider
          value={parsePx(value) || 1200}
          onChange={(v) => onChange(toPx(Number(v)))}
          min={320}
          max={1600}
          step={8}
          suffix="px"
        />
      )}
    </div>
  );
}

export function ButtonPresetControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {BUTTON_STYLE_PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "rounded-lg border px-2 py-2 text-left transition-all",
            value === p.value
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 hover:bg-apple-canvas-parchment",
          )}
        >
          <span className={cn("block text-[10px] font-semibold", value === p.value ? "text-white" : "text-apple-ink")}>
            {p.label}
          </span>
          <span className={cn("block text-[8px]", value === p.value ? "text-white/70" : "text-apple-ink-muted-48")}>
            {p.hint}
          </span>
        </button>
      ))}
    </div>
  );
}

export function GradientPresetControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        {GRADIENT_PRESETS.map((g) => (
          <button
            key={g.label}
            type="button"
            onClick={() => onChange(g.value)}
            title={g.label}
            className={cn(
              "h-8 overflow-hidden rounded-md border-2 transition-all",
              (value || "") === g.value ? "border-zinc-900" : "border-transparent ring-1 ring-zinc-200",
            )}
            style={{ background: g.value || "#f5f5f7" }}
          >
            {!g.value && (
              <span className="flex h-full items-center justify-center text-[8px] font-medium text-apple-ink-muted-48">
                None
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Color picker (visual + brand + recent + hex advanced) ─────────

function readRecentColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((c) => typeof c === "string").slice(0, 12) : [];
  } catch {
    return [];
  }
}

function pushRecentColor(color: string) {
  if (typeof window === "undefined" || !color) return;
  const next = [color, ...readRecentColors().filter((c) => c.toLowerCase() !== color.toLowerCase())].slice(0, 12);
  localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
}

function normalizeHex(value: string): string {
  if (!value) return "#000000";
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, a, b, c] = value;
    return `#${a}${a}${b}${b}${c}${c}`;
  }
  return "#000000";
}

export function BuilderColorPicker({
  value,
  onChange,
  brandColors = [],
  allowClear = true,
}: {
  value: string;
  onChange: (v: string) => void;
  brandColors?: string[];
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const swatch = value ? normalizeHex(value) : "#ffffff";

  useEffect(() => {
    setRecent(readRecentColors());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const commit = useCallback((color: string) => {
    onChange(color);
    if (color) {
      pushRecentColor(color);
      setRecent(readRecentColors());
    }
  }, [onChange]);

  const themeColors = useMemo(() => {
    const merged = [...brandColors, ...BRAND_PALETTE];
    return merged.filter((c, i, arr) => arr.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i);
  }, [brandColors]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-full items-center gap-2 rounded-lg border border-zinc-200 px-2 hover:bg-apple-canvas-parchment"
      >
        {value ? (
          <span
            className="h-5 w-5 shrink-0 rounded-md border border-zinc-200 shadow-inner"
            style={{ backgroundColor: value }}
          />
        ) : (
          <span
            className="h-5 w-5 shrink-0 rounded-md border border-zinc-200 shadow-inner"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%)",
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0, 3px 3px",
            }}
          />
        )}
        <span className="flex-1 truncate text-left text-[11px] text-apple-ink-muted-80">
          {value || "None"}
        </span>
        <ChevronDown className={cn("h-3 w-3 text-apple-ink-muted-48 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center gap-2">
            <input
              type="color"
              value={swatch}
              onChange={(e) => commit(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200 p-0.5"
            />
          </div>

          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Theme</p>
          <div className="mb-2.5 grid grid-cols-6 gap-1.5">
            {themeColors.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => commit(c)}
                className={cn(
                  "h-6 rounded-md border-2 transition-transform hover:scale-105",
                  value?.toLowerCase() === c.toLowerCase() ? "border-zinc-900" : "border-transparent ring-1 ring-zinc-200",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {recent.length > 0 && (
            <>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Recent</p>
              <div className="mb-2.5 grid grid-cols-6 gap-1.5">
                {recent.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => commit(c)}
                    className={cn(
                      "h-6 rounded-md border-2",
                      value?.toLowerCase() === c.toLowerCase() ? "border-zinc-900" : "border-transparent ring-1 ring-zinc-200",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={() => setShowHex((v) => !v)}
              className="text-[9px] font-medium text-apple-ink-muted-48 hover:text-apple-ink"
            >
              {showHex ? "Hide HEX" : "Advanced HEX"}
            </button>
            {allowClear && value && (
              <button
                type="button"
                onClick={() => commit("")}
                className="text-[9px] font-medium text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          {showHex && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => {
                if (value) commit(normalizeHex(value));
              }}
              placeholder="#0066cc"
              className="mt-2 h-7 w-full rounded-lg border border-zinc-200 px-2 font-mono text-[10px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none"
            />
          )}
        </div>
      )}
    </div>
  );
}

export function AdvancedDetails({
  title = "Advanced",
  children,
  defaultOpen = false,
}: {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-dashed border-zinc-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
      >
        {title}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-2.5 border-t border-zinc-100 px-2.5 py-2.5">{children}</div>}
    </div>
  );
}
