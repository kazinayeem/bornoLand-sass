"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Palette,
  Loader2,
  Check,
  Eye,
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  CheckCircle2,
  Sliders,
  Layers,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useGetStoreQuery, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { canAccessThemeBuilder } from "@/lib/permissions/entitlements";
import { useAppSelector } from "@/hooks/redux";

export type CoreThemeId = "basic" | "premium" | "aurora" | "luxura" | "sellora";

interface ThemeOption {
  id: CoreThemeId;
  name: string;
  description: string;
  primaryColor: string;
  previewBg: string;
  badge?: string;
}

const CORE_THEMES: ThemeOption[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Clean, essential ecommerce layout for fast shopping.",
    primaryColor: "#18181b",
    previewBg: "from-zinc-100 to-zinc-200",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Sleek dark accents, bold product grids, luxury feel.",
    primaryColor: "#0f172a",
    previewBg: "from-slate-900 to-slate-800",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Vibrant gradient headers, modern pill tags, energetic vibe.",
    primaryColor: "#4f46e5",
    previewBg: "from-indigo-600 to-purple-600",
  },
  {
    id: "luxura",
    name: "Luxura",
    description: "Editorial elegance, refined serif headlines, slate gold accent.",
    primaryColor: "#0284c7",
    previewBg: "from-sky-900 to-indigo-950",
  },
  {
    id: "sellora",
    name: "Sellora",
    description: "High-conversion grid with flash countdowns & discount badges.",
    primaryColor: "#dc2626",
    previewBg: "from-red-600 to-amber-600",
  },
];

type ThemeTabProps = { storeId: string };

export function ThemeTab({ storeId }: ThemeTabProps) {
  const router = useRouter();
  const { store: storeContext } = useStorePage();
  const user = useAppSelector((s) => s.user.profile);

  const { data, isLoading } = useGetStoreQuery(storeId);
  const [changeTheme] = useChangeStoreThemeMutation();
  const store = data?.data?.store;

  const [selectedTheme, setSelectedTheme] = useState<CoreThemeId>("basic");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [darkMode, setDarkMode] = useState(false);
  const [enableBuyNow, setEnableBuyNow] = useState(true);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store?.theme) {
      setSelectedTheme((store.theme.themeId as CoreThemeId) || "basic");
      setPrimaryColor(store.theme.primaryColor || "#2563eb");
      setDarkMode(store.theme.darkMode || false);
      setEnableBuyNow(store.theme.enableBuyNow !== false);
    }
  }, [store]);

  const permission = canAccessThemeBuilder(user?.role, store?.plan);

  const handleOpenBuilder = () => {
    if (!permission.allowed) {
      toast.error(permission.reason || "Theme Builder is not enabled on your plan");
      return;
    }
    const slug = storeContext?.slug || store?.slug;
    if (slug) {
      router.push(`/store/${slug}/builder`);
    } else {
      toast.error("Store slug not found");
    }
  };

  const handleApplyTheme = async () => {
    setSaving(true);
    try {
      await changeTheme({
        id: storeId,
        data: {
          theme: {
            themeId: selectedTheme,
            primaryColor,
            darkMode,
            enableBuyNow,
          },
        },
      }).unwrap();

      if (storeContext) {
        await revalidateStorefrontForStore(storeContext, { scope: "theme" });
      }
      toast.success(`Theme updated to ${CORE_THEMES.find((t) => t.id === selectedTheme)?.name || selectedTheme}`);
    } catch {
      toast.error("Failed to update theme");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Theme Builder Banner (Zatiq-style) ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                <Wand2 className="h-3 w-3" /> Theme Builder <span className="rounded bg-amber-400 px-1 py-0.2 text-[9px] text-zinc-900">NEW</span>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Create your own unique shop design with drag-and-drop builder</h2>
            <p className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/90">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Drag & drop sections</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Custom layouts</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Real-time preview</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> No coding required</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenBuilder}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-apple-pill bg-white px-5 py-3 text-xs font-bold text-violet-900 shadow-md transition-all hover:bg-zinc-100 active:scale-[0.98]"
          >
            Open Theme Builder <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* ── Section Title ────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold tracking-tight text-apple-ink">Static Themes</h3>
        <p className="text-xs text-apple-ink-muted-48">Select a pre-designed theme to instantly transform your storefront.</p>
      </div>

      {/* ── Theme Selection Cards Grid ───────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {CORE_THEMES.map((t) => {
          const isSelected = selectedTheme === t.id;
          return (
            <motion.div
              key={t.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedTheme(t.id)}
              className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 transition-all ${
                isSelected
                  ? "border-violet-600 bg-violet-50/20 shadow-md ring-2 ring-violet-600/20"
                  : "border-apple-hairline bg-white hover:border-zinc-300"
              }`}
            >
              {/* Preview Thumbnail */}
              <div className={`relative h-28 w-full bg-gradient-to-br ${t.previewBg} p-3 flex flex-col justify-between overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                    {t.name}
                  </span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white shadow">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="rounded bg-white/95 p-1.5 shadow-sm text-[8px] font-semibold text-zinc-800">
                  <div className="h-1.5 w-12 rounded bg-zinc-300 mb-1" />
                  <div className="h-1 w-full rounded bg-zinc-200" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3">
                <p className="text-xs font-bold text-apple-ink">{t.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-apple-ink-muted-48">{t.description}</p>
              </div>
            </motion.div>
          );
        })}

        {/* More Themes Coming card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-300 bg-teal-500/10 p-4 text-center">
          <Sparkles className="h-6 w-6 text-teal-600 mb-1" />
          <p className="text-xs font-bold text-teal-800">More themes coming</p>
          <p className="text-[10px] text-teal-600">New designs added monthly</p>
        </div>
      </div>

      {/* ── Theme Options + Live Preview split ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Theme Controls */}
        <div className="space-y-4 lg:col-span-7">
          {/* Shop Theme Color */}
          <div className="rounded-2xl border border-apple-hairline bg-white p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Shop Theme Color</h4>
            <div className="flex flex-wrap items-center gap-2">
              {["#2563eb", "#4f46e5", "#0f172a", "#dc2626", "#059669", "#d97706", "#7c3aed"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPrimaryColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    primaryColor === c ? "scale-110 border-zinc-900 ring-2 ring-zinc-900/20" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-lg border border-apple-hairline p-0.5"
                />
                <span className="text-xs font-mono text-apple-ink-muted-80">{primaryColor}</span>
              </div>
            </div>
          </div>

          {/* Shop Theme Mode */}
          <div className="rounded-2xl border border-apple-hairline bg-white p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Shop Theme Mode</h4>
            <div className="inline-flex rounded-apple-pill border border-apple-hairline bg-apple-canvas-parchment p-1">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex items-center gap-1.5 rounded-apple-pill px-4 py-1.5 text-xs font-semibold transition-all ${
                  !darkMode ? "bg-violet-600 text-white shadow-sm" : "text-apple-ink-muted-80 hover:text-apple-ink"
                }`}
              >
                {!darkMode && <Check className="h-3 w-3" />} Light
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex items-center gap-1.5 rounded-apple-pill px-4 py-1.5 text-xs font-semibold transition-all ${
                  darkMode ? "bg-violet-600 text-white shadow-sm" : "text-apple-ink-muted-80 hover:text-apple-ink"
                }`}
              >
                {darkMode && <Check className="h-3 w-3" />} Dark
              </button>
            </div>
          </div>

          {/* Enable Buy Now Button */}
          <div className="rounded-2xl border border-apple-hairline bg-white p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Enable Buy Now Button</h4>
            <div className="inline-flex rounded-apple-pill border border-apple-hairline bg-apple-canvas-parchment p-1">
              <button
                type="button"
                onClick={() => setEnableBuyNow(true)}
                className={`flex items-center gap-1.5 rounded-apple-pill px-4 py-1.5 text-xs font-semibold transition-all ${
                  enableBuyNow ? "bg-violet-600 text-white shadow-sm" : "text-apple-ink-muted-80 hover:text-apple-ink"
                }`}
              >
                {enableBuyNow && <Check className="h-3 w-3" />} Yes
              </button>
              <button
                type="button"
                onClick={() => setEnableBuyNow(false)}
                className={`flex items-center gap-1.5 rounded-apple-pill px-4 py-1.5 text-xs font-semibold transition-all ${
                  !enableBuyNow ? "bg-violet-600 text-white shadow-sm" : "text-apple-ink-muted-80 hover:text-apple-ink"
                }`}
              >
                {!enableBuyNow && <Check className="h-3 w-3" />} No
              </button>
            </div>
          </div>

          {/* Apply Theme CTA */}
          <div className="rounded-2xl border border-apple-hairline bg-apple-canvas-parchment p-5 flex items-center justify-between">
            <span className="text-xs font-medium text-apple-ink-muted-80">
              Selected: <strong className="text-apple-ink">{CORE_THEMES.find((t) => t.id === selectedTheme)?.name}</strong>
            </span>
            <button
              type="button"
              onClick={handleApplyTheme}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-apple-pill bg-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Apply Theme
            </button>
          </div>
        </div>

        {/* Right Column: Live Store Preview Frame */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-apple-ink-muted-48">Preview Your Shop</h4>
            <div className="flex items-center gap-1 rounded-lg border border-apple-hairline bg-white p-1">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`p-1.5 rounded ${previewViewport === "desktop" ? "bg-violet-100 text-violet-700" : "text-apple-ink-muted-48"}`}
                title="Desktop viewport"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`p-1.5 rounded ${previewViewport === "mobile" ? "bg-violet-100 text-violet-700" : "text-apple-ink-muted-48"}`}
                title="Mobile viewport"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Simulated Shop Preview Frame */}
          <div
            className={`mx-auto overflow-hidden rounded-2xl border border-apple-hairline bg-white shadow-lg transition-all duration-300 ${
              previewViewport === "mobile" ? "max-w-[320px]" : "w-full"
            } ${darkMode ? "dark bg-zinc-950 text-white" : ""}`}
          >
            {/* Storefront Header */}
            <div className="flex items-center justify-between border-b border-apple-hairline p-3">
              <span className="text-xs font-bold truncate">{store?.name || "ABC Shop"}</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] text-apple-ink-muted-48">EN</span>
              </div>
            </div>

            {/* Storefront Search Bar */}
            <div className="p-3">
              <div className="flex items-center rounded-xl border border-apple-hairline bg-apple-canvas-parchment px-3 py-1.5">
                <input
                  type="text"
                  placeholder="Search your desired product"
                  disabled
                  className="w-full bg-transparent text-[10px] text-apple-ink placeholder:text-apple-ink-muted-48 focus:outline-none"
                />
                <button type="button" className="rounded-lg p-1 text-white" style={{ backgroundColor: primaryColor }}>
                  <Eye className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Category / Product Area */}
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">All Products</span>
                <span className="text-[9px] text-apple-ink-muted-48">Sort: Default</span>
              </div>

              {/* Sample Product Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-apple-hairline p-2 text-center space-y-1.5">
                    <div className="h-16 w-full rounded-lg bg-apple-canvas-parchment flex items-center justify-center">
                      <Layers className="h-4 w-4 text-apple-ink-muted-48" />
                    </div>
                    <p className="text-[10px] font-semibold truncate">Sample Product {i}</p>
                    <p className="text-[10px] font-bold" style={{ color: primaryColor }}>BDT {i * 450}</p>
                    {enableBuyNow && (
                      <button
                        type="button"
                        className="w-full rounded-lg py-1 text-[9px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-apple-hairline p-3 text-center text-[9px] text-apple-ink-muted-48">
              © 2026 - {store?.name || "BornoLand Store"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

