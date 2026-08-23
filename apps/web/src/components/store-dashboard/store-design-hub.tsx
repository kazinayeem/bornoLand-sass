"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Sliders,
  Type,
  Layout,
  Square,
  Package,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PanelTop,
  PanelBottom,
} from "lucide-react";
import { toast } from "sonner";
import { useGetStoreQuery, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { useGetStorePagesQuery, useUpdateStorePageMutation } from "@/redux/api/store-page-api";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { canAccessThemeBuilder } from "@/lib/permissions/entitlements";
import { useAppSelector } from "@/hooks/redux";
import { THEMES, getThemeById, migrateThemeSections } from "@/themes/registry";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NavigationManager } from "@/components/store-dashboard/navigation-manager/navigation-manager";

type TabMode = "themes" | "navigation" | "builder" | "styles" | "reset";

type StoreDesignHubProps = {
  storeId: string;
};

function logThemeFlowError(label: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  const rtkError = error as { data?: { message?: string }; status?: number | string };
  console.error(`[theme-switch] ${label}`, {
    message: rtkError?.data?.message ?? (error instanceof Error ? error.message : error),
    status: rtkError?.status,
    error,
  });
}

export function StoreDesignHub({ storeId }: StoreDesignHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { store: storeContext } = useStorePage();
  const user = useAppSelector((s) => s.user.profile);

  const initialTab = (searchParams.get("tab") as TabMode) || "themes";
  const [activeTab, setActiveTab] = useState<TabMode>(initialTab);

  const { data, isLoading } = useGetStoreQuery(storeId);
  const { data: pagesData, refetch: refetchPages } = useGetStorePagesQuery(storeId);
  const [changeTheme] = useChangeStoreThemeMutation();
  const [updatePage] = useUpdateStorePageMutation();

  const store = data?.data?.store;

  const [activeThemeId, setActiveThemeId] = useState<string>("grocery");
  const [previewThemeId, setPreviewThemeId] = useState<string>("grocery");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);

  // Global Style States
  const [primaryColor, setPrimaryColor] = useState("#055c3a");
  const [secondaryColor, setSecondaryColor] = useState("#e05a00");
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [buttonRadius, setButtonRadius] = useState("12");
  const [productCardVariant, setProductCardVariant] = useState("grocery");

  // Modals
  const [switchThemeModal, setSwitchThemeModal] = useState<{ open: boolean; targetThemeId: string }>({
    open: false,
    targetThemeId: "",
  });
  const [resetWebsiteModal, setResetWebsiteModal] = useState(false);

  useEffect(() => {
    if (store?.theme) {
      const current = (store.theme.themeId as string) || "grocery";
      setActiveThemeId(current);
      setPreviewThemeId(current);
      if (store.theme.primaryColor) setPrimaryColor(store.theme.primaryColor);
      if (store.theme.secondaryColor) setSecondaryColor(store.theme.secondaryColor);
      if (store.theme.font) setFontFamily(store.theme.font);
    }
  }, [store]);

  const permission = canAccessThemeBuilder(user?.role, store?.plan);
  const activeDef = useMemo(() => getThemeById(activeThemeId), [activeThemeId]);
  const previewDef = useMemo(() => getThemeById(previewThemeId), [previewThemeId]);

  const homePage = useMemo(() => {
    const pages = pagesData?.data?.pages || [];
    return pages.find((p) => p.isHomePage || p.slug === "/" || p.slug === "home" || (p as any).pageType === "home");
  }, [pagesData]);

  const handleOpenBuilder = () => {
    if (!permission.allowed) {
      toast.error(permission.reason || "Theme Builder is not enabled on your plan");
      return;
    }
    const slug = storeContext?.slug || store?.slug;
    if (slug) {
      router.push(`/store/${slug}/builder/home`);
    } else {
      toast.error("Store slug not found");
    }
  };

  const handleRequestSwitchTheme = (themeId: string) => {
    if (themeId === activeThemeId) {
      handleOpenBuilder();
      return;
    }
    setSwitchThemeModal({ open: true, targetThemeId: themeId });
  };

  const handleConfirmSwitchTheme = async () => {
    const targetThemeId = switchThemeModal.targetThemeId;
    if (!targetThemeId) return;

    setSaving(true);
    setSwitchThemeModal({ open: false, targetThemeId: "" });
    const targetTheme = getThemeById(targetThemeId);

    try {
      // 1. Update Store Theme Presentation Layer
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

      // 2. Migrate homepage sections — preserve compatible user content
      if (homePage?._id) {
        const migratedSections = migrateThemeSections(
          targetTheme.id,
          (homePage.sections as BuilderSection[] | undefined) ?? [],
        );

        await updatePage({
          id: homePage._id,
          storeId,
          data: {
            sections: migratedSections,
            headerSettings: targetTheme.header?.announcementText
              ? { announcementText: targetTheme.header.announcementText }
              : {},
            footerSettings: {
              copyright: `© ${new Date().getFullYear()} ${store?.name || "Store"}. All rights reserved.`,
            },
          },
        }).unwrap();
      }

      setActiveThemeId(targetTheme.id);
      setPreviewThemeId(targetTheme.id);
      setPrimaryColor(targetTheme.tokens.colors.primary);
      setSecondaryColor(targetTheme.tokens.colors.secondary);
      setFontFamily(targetTheme.tokens.typography.fontFamily);
      setProductCardVariant(targetTheme.productCardVariant);

      if (storeContext) {
        try {
          await revalidateStorefrontForStore(storeContext, { scope: "all" });
        } catch (revalidateError) {
          logThemeFlowError("Storefront revalidation failed after theme switch", revalidateError);
        }
      }
      await refetchPages();
      toast.success(`Switched to ${targetTheme.name}! Opening builder…`);

      const slug = storeContext?.slug || store?.slug;
      if (slug && permission.allowed) {
        router.push(`/store/${slug}/builder/home`);
      }
    } catch (error) {
      logThemeFlowError("Failed to switch theme", error);
      const apiMessage =
        error && typeof error === "object" && "data" in error
          ? (error as FetchBaseQueryError).data &&
            typeof (error as FetchBaseQueryError).data === "object" &&
            "message" in ((error as FetchBaseQueryError).data as object)
            ? String(((error as FetchBaseQueryError).data as { message?: string }).message)
            : undefined
          : undefined;
      toast.error(
        process.env.NODE_ENV === "development" && apiMessage
          ? `Failed to switch theme: ${apiMessage}`
          : "Failed to switch theme. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobalStyles = async () => {
    setSaving(true);
    try {
      await changeTheme({
        id: storeId,
        data: {
          theme: {
            themeId: activeThemeId,
            primaryColor,
            secondaryColor,
            font: fontFamily,
            buttonStyle: `rounded-${buttonRadius}px`,
          },
        },
      }).unwrap();

      if (storeContext) {
        try {
          await revalidateStorefrontForStore(storeContext, { scope: "theme" });
        } catch (revalidateError) {
          logThemeFlowError("Storefront revalidation failed after global styles save", revalidateError);
        }
      }
      toast.success("Global styles updated successfully!");
    } catch (error) {
      logThemeFlowError("Failed to save global styles", error);
      toast.error("Failed to save global styles");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmResetWebsite = async () => {
    setSaving(true);
    setResetWebsiteModal(false);
    const targetTheme = getThemeById(activeThemeId || "grocery");

    try {
      // 1. Reset Theme Settings
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

      // 2. Reset Homepage Layout cleanly to theme factory defaults
      if (homePage?._id) {
        const cleanSections = targetTheme.defaultSections.map((s) => ({
          ...s,
          id: `${s.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        }));

        await updatePage({
          id: homePage._id,
          storeId,
          data: {
            sections: cleanSections,
            headerSettings: targetTheme.header?.announcementText ? { announcementText: targetTheme.header.announcementText } : {},
            footerSettings: { copyright: `© ${new Date().getFullYear()} ${store?.name || "Store"}. All rights reserved.` },
          },
        }).unwrap();
      }

      setActiveThemeId(targetTheme.id);
      setPreviewThemeId(targetTheme.id);
      setPrimaryColor(targetTheme.tokens.colors.primary);
      setSecondaryColor(targetTheme.tokens.colors.secondary);

      if (storeContext) {
        try {
          await revalidateStorefrontForStore(storeContext, { scope: "all" });
        } catch (revalidateError) {
          logThemeFlowError("Storefront revalidation failed after website reset", revalidateError);
        }
      }
      refetchPages();
      toast.success("Website design has been reset to clean defaults. Products & data are safe.");
    } catch (error) {
      logThemeFlowError("Failed to reset website", error);
      toast.error("Failed to reset website");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* ── Top Header Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Design</h1>
            <Badge variant="outline" className="text-xs bg-zinc-50 border-zinc-200">
              Active: {activeDef.name}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your storefront themes, visual section composition, and global design styles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetWebsiteModal(true)}
            className="text-xs text-zinc-600 border-zinc-200 hover:text-rose-600 hover:border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Website
          </Button>

          <Button
            type="button"
            onClick={handleOpenBuilder}
            className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Open Builder
          </Button>
        </div>
      </div>

      {/* ── Tab Selector ── */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab("themes")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "themes"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Themes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("navigation")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "navigation"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Layout className="w-4 h-4" />
          Navigation
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("builder")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "builder"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Visual Builder
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("styles")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "styles"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Global Styles
        </button>
      </div>

      {/* ── TAB: NAVIGATION ── */}
      {activeTab === "navigation" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <NavigationManager storeId={storeId} />
        </div>
      )}

      {/* ── TAB 1: THEMES ── */}
      {activeTab === "themes" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Active Banner */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
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
                <p className="text-xs text-zinc-500 mt-0.5">{activeDef.description}</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleOpenBuilder}
              className="w-full md:w-auto text-xs bg-zinc-900 hover:bg-black text-white"
            >
              Customize in Builder
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          {/* Theme Gallery & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Theme List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Choose Theme
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
                        <div className="relative h-20 w-28 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                          <SmartImage
                            src={theme.previewImage}
                            alt={theme.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-zinc-900 truncate">
                              {theme.name}
                            </h4>
                            {isActive && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0">
                                Active
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
                            />
                            <span
                              className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: theme.tokens.colors.secondary }}
                            />
                            <span className="text-[11px] font-medium text-zinc-400 ml-1">
                              {theme.category.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

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
                                handleRequestSwitchTheme(theme.id);
                              }}
                              className="h-8 text-xs bg-zinc-900 hover:bg-black text-white"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
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

            {/* Preview Pane */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Theme Preview: <span className="text-zinc-900">{previewDef.name}</span>
                </h3>

                <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("desktop")}
                    className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                      previewViewport === "desktop"
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
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
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-4 flex items-center justify-center min-h-[480px]">
                <div
                  className={`bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden transition-all duration-300 ${
                    previewViewport === "mobile"
                      ? "w-[360px] h-[520px]"
                      : "w-full h-[520px]"
                  }`}
                >
                  <div className="h-7 bg-zinc-100 border-b border-zinc-200 px-3 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-zinc-400 ml-2 font-mono truncate">
                      {store?.slug}.bornoland.com
                    </span>
                  </div>

                  <div className="relative h-[calc(100%-28px)] overflow-y-auto bg-zinc-50 p-4 space-y-4">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-sm">
                      <SmartImage
                        src={previewDef.previewImage}
                        alt={previewDef.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          {previewDef.category.toUpperCase()} THEME
                        </span>
                        <h4 className="text-base font-bold">{previewDef.name}</h4>
                        <p className="text-xs text-zinc-200 line-clamp-1">{previewDef.description}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Default Sections
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

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700">
                        {activeThemeId === previewDef.id ? "Currently active" : "Ready to apply"}
                      </span>
                      {activeThemeId !== previewDef.id && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleRequestSwitchTheme(previewDef.id)}
                          className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
                        >
                          Use {previewDef.name}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BUILDER ENTRY & QUICK ACTIONS ── */}
      {activeTab === "builder" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Visual Website Builder</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Edit sections, rearrange layouts, change images, and preview live on Desktop, Tablet, and Mobile.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/store/${store?.slug}`, "_blank")}
                  className="text-xs text-zinc-700 border-zinc-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  View Live Store
                </Button>

                <Button
                  type="button"
                  onClick={handleOpenBuilder}
                  className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  Launch Visual Builder
                </Button>
              </div>
            </div>

            {/* Quick Section Breakdown */}
            <div className="border-t border-zinc-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Current Homepage Sections ({homePage?.sections?.length || activeDef.defaultSections.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {((homePage?.sections?.length ? homePage.sections : activeDef.defaultSections) as any[]).map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 text-xs"
                  >
                    <span className="font-semibold text-zinc-800 truncate">
                      {idx + 1}. {sec.label || sec.type}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">
                      {sec.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: GLOBAL STYLES ── */}
      {activeTab === "styles" && (
        <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Global Design Styles</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Customize palette, typography, button radii, and product card styles applied across your storefront.
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-4 border-t border-zinc-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Brand Palette
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border border-zinc-200 p-0.5 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="text-xs font-mono h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border border-zinc-200 p-0.5 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="text-xs font-mono h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4 border-t border-zinc-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Typography & Font Family
              </h4>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Storefront Font
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="Inter, sans-serif">Inter (Modern & Clean)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Crisp & Geometric)</option>
                  <option value="Poppins, sans-serif">Poppins (Friendly & Rounded)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Luxury & Editorial)</option>
                  <option value="system-ui, sans-serif">System Native</option>
                </select>
              </div>
            </div>

            {/* Buttons & Cards */}
            <div className="space-y-4 border-t border-zinc-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Component Styling
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Button Radius (px)
                  </label>
                  <select
                    value={buttonRadius}
                    onChange={(e) => setButtonRadius(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="4">Slight (4px)</option>
                    <option value="8">Medium (8px)</option>
                    <option value="12">Rounded (12px)</option>
                    <option value="9999">Pill (Fully Rounded)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Product Card Variant
                  </label>
                  <select
                    value={productCardVariant}
                    onChange={(e) => setProductCardVariant(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="grocery">Grocery & Organic Card</option>
                    <option value="electronics">Electronics & Tech Card</option>
                    <option value="default">Modern Minimal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                disabled={saving}
                onClick={handleSaveGlobalStyles}
                className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Save Global Styles
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Switch Theme Confirmation Modal ── */}
      {switchThemeModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-zinc-200">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h3 className="font-bold text-base">Use this theme?</h3>
                <p className="text-xs text-zinc-500">Switching to {getThemeById(switchThemeModal.targetThemeId).name}</p>
              </div>
            </div>

            <div className="space-y-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 text-xs text-emerald-900">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Store Data 100% Protected
              </p>
              <p className="text-emerald-800/80">
                Your products, inventory, orders, customers, and payment settings will remain completely safe. The homepage layout will adapt to the new theme structure.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSwitchThemeModal({ open: false, targetThemeId: "" })}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSwitchTheme}
                className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Use Theme
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Website Confirmation Modal ── */}
      {resetWebsiteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-zinc-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900">Reset your website?</h3>
                <p className="text-xs text-zinc-500">Reset design & presentation layer</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
              This will reset your theme, homepage layout, header, footer, and design settings to clean factory defaults.
              <br /><br />
              <strong className="text-zinc-900">
                Your products, categories, orders, customers, coupons, and store data will NOT be deleted.
              </strong>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetWebsiteModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmResetWebsite}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Reset Website
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
