"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Layers,
  Wand2,
  RotateCcw,
  ShoppingBag,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useGetStoreQuery, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { canAccessThemeBuilder } from "@/lib/permissions/entitlements";
import { useAppSelector } from "@/hooks/redux";
import { THEMES, getThemeById, migrateThemeSections } from "@/themes/registry";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ThemeTabProps = { storeId: string };

export function ThemeTab({ storeId }: ThemeTabProps) {
  const router = useRouter();
  const { store: storeContext } = useStorePage();
  const user = useAppSelector((s) => s.user.profile);

  const { data, isLoading } = useGetStoreQuery(storeId);
  const [changeTheme] = useChangeStoreThemeMutation();
  const store = data?.data?.store;

  const [activeThemeId, setActiveThemeId] = useState<string>("grocery");
  const [previewThemeId, setPreviewThemeId] = useState<string>("grocery");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    if (store?.theme) {
      const current = (store.theme.themeId as string) || "grocery";
      setActiveThemeId(current);
      setPreviewThemeId(current);
    }
  }, [store]);

  const permission = canAccessThemeBuilder(user?.role, store?.plan);
  const activeDef = getThemeById(activeThemeId);
  const previewDef = getThemeById(previewThemeId);

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

  const handleApplyTheme = async (themeIdToApply: string) => {
    setSaving(true);
    const targetTheme = getThemeById(themeIdToApply);
    try {
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
        },
      }).unwrap();

      setActiveThemeId(targetTheme.id);
      setPreviewThemeId(targetTheme.id);

      if (storeContext) {
        await revalidateStorefrontForStore(storeContext, { scope: "theme" });
      }
      toast.success(`Theme updated to ${targetTheme.name}!`);
    } catch {
      toast.error("Failed to update theme");
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = async () => {
    setSaving(true);
    setResetDialogOpen(false);
    const targetTheme = getThemeById(activeThemeId);
    try {
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
        },
      }).unwrap();

      if (storeContext) {
        await revalidateStorefrontForStore(storeContext, { scope: "theme" });
      }
      toast.success("Theme configuration has been reset to defaults.");
    } catch {
      toast.error("Failed to reset theme");
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
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900">Store Themes</h2>
            <Badge variant="outline" className="text-xs bg-zinc-50">
              {THEMES.length} Available
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Choose a theme architecture suited for your catalog. Switching themes safely preserves all products, categories, orders, and customer data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetDialogOpen(true)}
            className="text-zinc-600 hover:text-zinc-900 border-zinc-200 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>

          <Button
            type="button"
            onClick={handleOpenBuilder}
            className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Customize in Builder
          </Button>
        </div>
      </div>

      {/* ── Active Theme Banner ── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: activeDef.tokens.colors.primary }}
          >
            {activeDef.category === "grocery" ? (
              <ShoppingBag className="w-6 h-6" />
            ) : (
              <Cpu className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Storefront Theme
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-900">{activeDef.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{activeDef.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <Button
            type="button"
            onClick={handleOpenBuilder}
            className="w-full md:w-auto text-xs bg-zinc-900 hover:bg-black"
          >
            Customize
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* ── Theme Grid & Live Preview Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Theme Selector Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Available Themes
          </h3>

          <div className="space-y-4">
            {THEMES.map((theme) => {
              const isActive = activeThemeId === theme.id;
              const isPreviewed = previewThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setPreviewThemeId(theme.id)}
                  className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                    isPreviewed
                      ? "border-zinc-900 bg-white shadow-md ring-2 ring-zinc-900/10"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-20 w-28 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                      <SmartImage
                        src={theme.previewImage}
                        alt={theme.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 truncate">
                          {theme.name}
                        </h4>
                        {isActive && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0">
                            Current Active
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.tokens.colors.primary }}
                          title="Primary Color"
                        />
                        <span
                          className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.tokens.colors.secondary }}
                          title="Secondary Color"
                        />
                        <span className="text-[11px] font-medium text-zinc-400 ml-1">
                          {theme.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside card */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-zinc-400">
                      Version {theme.version}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={saving}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTheme(theme.id);
                          }}
                          className="h-8 text-xs bg-zinc-900 hover:bg-black text-white"
                        >
                          {saving && previewThemeId === theme.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Check className="w-3.5 h-3.5 mr-1" />
                          )}
                          Use This Theme
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBuilder();
                          }}
                          className="h-8 text-xs text-zinc-700"
                        >
                          Customize
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Theme Preview Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Theme Preview: <span className="text-zinc-900">{previewDef.name}</span>
            </h3>

            {/* Viewport Toggles */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  previewViewport === "desktop"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                aria-label="Desktop Preview"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  previewViewport === "mobile"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                aria-label="Mobile Preview"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-4 flex items-center justify-center min-h-[480px]">
            <div
              className={`bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden transition-all duration-300 ${
                previewViewport === "mobile"
                  ? "w-[360px] h-[520px]"
                  : "w-full h-[520px]"
              }`}
            >
              {/* Fake Browser Bar */}
              <div className="h-7 bg-zinc-100 border-b border-zinc-200 px-3 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-rose-400" />
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-zinc-400 ml-2 font-mono truncate">
                  {store?.slug}.bornoland.com
                </span>
              </div>

              {/* Theme Preview Image / Visual Mock */}
              <div className="relative h-[calc(100%-28px)] overflow-y-auto bg-zinc-50 p-4 space-y-4">
                <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-sm">
                  <SmartImage
                    src={previewDef.previewImage}
                    alt={previewDef.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      {previewDef.category.toUpperCase()} THEME
                    </span>
                    <h4 className="text-base font-bold">{previewDef.name}</h4>
                    <p className="text-xs text-zinc-200 line-clamp-1">{previewDef.description}</p>
                  </div>
                </div>

                {/* Default Sections Summary */}
                <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Included Homepage Sections
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewDef.defaultSections.map((sec) => (
                      <span
                        key={sec.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] font-medium text-zinc-700"
                      >
                        {sec.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700">
                    {activeThemeId === previewDef.id ? "Currently applied" : "Ready to apply"}
                  </span>
                  {activeThemeId !== previewDef.id && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApplyTheme(previewDef.id)}
                      className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
                    >
                      Apply {previewDef.name}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reset Theme Dialog ── */}
      {resetDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900">Reset Theme Configuration?</h3>
                <p className="text-xs text-zinc-500">Restore theme settings to factory defaults</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              This will reset the visual styling and homepage section composition for <strong>{activeDef.name}</strong>.
              <br /><br />
              <span className="font-bold text-zinc-800">Your products, categories, orders, customers, and inventory will NOT be affected.</span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleResetTheme}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Reset Theme
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
