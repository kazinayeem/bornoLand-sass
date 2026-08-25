"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  ExternalLink,
  AlertTriangle,
  Palette,
  ChevronDown,
  Check,
  ShoppingBag,
  Cpu,
  Shirt,
  Heart,
  Utensils,
  Home,
  Activity,
  BookOpen,
  Baby,
  Store,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AiShopBuilderModal } from "@/components/ai-builder/ai-shop-builder-modal";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { markSaved, setPublishing, setSaveError, loadPage } from "@/redux/slices/builder-slice";
import { setTheme } from "@/redux/slices/theme-slice";
import { usePublishStorePageMutation } from "@/redux/api/store-page-api";
import { useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { toast } from "sonner";
import { useRequiredStore } from "@/providers/store-context";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
  builderSaveStatusLabel,
  type BuilderSaveStatus,
} from "@/hooks/use-builder-auto-save";
import { cn } from "@/lib/utils";
import { THEMES, getThemeById, migrateThemeSections } from "@/themes/registry";
import { useLanguage } from "@/providers/language-provider";

type Props = {
  onBack: () => void;
  saving: boolean;
  publishing: boolean;
  isDirty: boolean;
  autoSaveStatus: BuilderSaveStatus;
  onForceSave: () => Promise<boolean>;
};

const THEME_ICONS: Record<string, typeof ShoppingBag> = {
  grocery: ShoppingBag,
  electronics: Cpu,
  fashion: Shirt,
  beauty: Heart,
  restaurant: Utensils,
  furniture: Home,
  sports: Activity,
  books: BookOpen,
  kids: Baby,
  marketplace: Store,
};

export function BuilderToolbar({
  onBack,
  saving,
  publishing,
  isDirty,
  autoSaveStatus,
  onForceSave,
}: Props) {
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { store, storeId } = useRequiredStore();
  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const currentSections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const headerSettings = useSelector((s: RootState) => s.builder.headerSettings);
  const footerSettings = useSelector((s: RootState) => s.builder.footerSettings);
  const lastSaveError = useSelector((s: RootState) => s.builder.lastSaveError);

  const [publishPage] = usePublishStorePageMutation();
  const [changeTheme] = useChangeStoreThemeMutation();
  const [statusVisible, setStatusVisible] = useState(true);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [switchingTheme, setSwitchingTheme] = useState(false);
  const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentThemeId = (store.theme as any)?.themeId || "grocery";
  const activeThemeDef = getThemeById(currentThemeId);
  const ActiveIcon = THEME_ICONS[activeThemeDef.category] || Palette;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectTheme = async (targetThemeId: string) => {
    if (targetThemeId === currentThemeId) {
      setThemeDropdownOpen(false);
      return;
    }
    setSwitchingTheme(true);
    setThemeDropdownOpen(false);
    const targetTheme = getThemeById(targetThemeId);

    try {
      // 1. Migrate/generate sections for target theme
      const migrated = migrateThemeSections(targetTheme.id, currentSections);

      // 2. Persist store theme & sections in DB
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

      // 3. Update Redux theme slice tokens
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

      // 4. Update Redux page sections
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
      toast.success(isBn ? `সফলভাবে ${targetTheme.name} থিম লোড হয়েছে!` : `Switched to ${targetTheme.name}!`);
    } catch {
      toast.error(isBn ? "থিম পরিবর্তন করা যায়নি" : "Failed to switch theme");
    } finally {
      setSwitchingTheme(false);
    }
  };

  useEffect(() => {
    if (autoSaveStatus === "saved") {
      setStatusVisible(true);
      const t = setTimeout(() => setStatusVisible(false), 2000);
      return () => clearTimeout(t);
    }
    if (autoSaveStatus === "idle") {
      setStatusVisible(false);
      return;
    }
    setStatusVisible(true);
  }, [autoSaveStatus]);

  const handleBackClick = () => {
    if (isDirty) {
      setUnsavedModalOpen(true);
    } else {
      onBack();
    }
  };

  const handleConfirmDiscard = () => {
    setUnsavedModalOpen(false);
    onBack();
  };

  const handleSave = async () => {
    if (!pageId) {
      toast.error("Home page not loaded");
      return;
    }
    const ok = await onForceSave();
    if (ok) toast.success("Saved");
    else if (!isDirty) toast.message("Nothing to save");
  };

  const handlePreview = async () => {
    if (isDirty) {
      await onForceSave();
    }
    window.open(`/store/${store.slug}`, "_blank", "noopener,noreferrer");
  };

  const handlePublish = async () => {
    if (!pageId) {
      toast.error("Home page not loaded");
      return;
    }
    dispatch(setPublishing(true));
    try {
      await onForceSave();
      await publishPage({ id: pageId, storeId }).unwrap();
      await revalidateStorefrontAction({ tenantSlug: store.subdomain || store.slug, storeId, scope: "all" });
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Published!");
    } catch {
      dispatch(setSaveError("Publish failed"));
      toast.error("Publish failed");
    }
    dispatch(setPublishing(false));
  };

  const statusLabel =
    publishing
      ? "Publishing…"
      : lastSaveError && autoSaveStatus === "error"
        ? builderSaveStatusLabel("error")
        : statusVisible
          ? builderSaveStatusLabel(autoSaveStatus)
          : null;

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 py-2 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="Back to dashboard"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{store.shortName || store.name}</p>
            <p
              className={cn(
                "truncate text-xs font-medium transition-opacity duration-300",
                autoSaveStatus === "unsaved" && "text-amber-600",
                autoSaveStatus === "saving" && "text-primary",
                autoSaveStatus === "saved" && "text-emerald-600",
                autoSaveStatus === "error" && "text-destructive",
                (autoSaveStatus === "idle" || !statusLabel) && "text-muted-foreground",
              )}
              aria-live="polite"
            >
              {isBn ? "হোমপেজ" : "Homepage"}{statusLabel ? ` · ${statusLabel}` : ""}
            </p>
          </div>
        </div>

        {/* ── Theme Selector Dropdown in Toolbar ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={switchingTheme}
            onClick={() => setThemeDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100/80 text-xs font-medium text-zinc-800 transition-colors shadow-2xs"
          >
            {switchingTheme ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
            ) : (
              <ActiveIcon className="w-3.5 h-3.5 text-zinc-600" />
            )}
            <span className="hidden sm:inline font-semibold">{isBn ? "থিম:" : "Theme:"}</span>
            <span className="font-bold text-zinc-900 truncate max-w-[140px]">{activeThemeDef.name}</span>
            <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform", themeDropdownOpen && "rotate-180")} />
          </button>

          {themeDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-2xl bg-white border border-zinc-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-2.5 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {isBn ? "থিম পরিবর্তন করুন" : "Switch Active Theme"}
                </span>
                <span className="text-[10px] text-zinc-400">10 {isBn ? "উপলব্ধ" : "Ready"}</span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
                {THEMES.map((t) => {
                  const isCurrent = t.id === currentThemeId;
                  const Icon = THEME_ICONS[t.category] || Palette;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTheme(t.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors",
                        isCurrent
                          ? "bg-zinc-900 text-white font-semibold shadow-xs"
                          : "hover:bg-zinc-100 text-zinc-700 font-medium"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", isCurrent ? "text-white" : "text-zinc-500")} />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setAiBuilderOpen(true)}
            className="hidden items-center gap-1.5 rounded-full text-xs font-bold bg-linear-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-xs hover:opacity-95 md:inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            {isBn ? "AI শপ বিল্ডার" : "AI Builder"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handlePreview()}
            className="hidden items-center gap-1.5 rounded-full text-xs font-semibold text-apple-ink hover:bg-apple-canvas-parchment sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isBn ? "প্রিভিউ" : "Preview"}
          </Button>
          <LoadingButton
            type="button"
            variant="outline"
            size="sm"
            loading={saving}
            loadingKey="save"
            onClick={() => void handleSave()}
            disabled={!isDirty && !saving}
            icon={<Save className="h-3.5 w-3.5" />}
            className="rounded-full text-xs font-semibold text-apple-ink border-apple-hairline disabled:opacity-40"
          >
            Save
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="primary"
            size="sm"
            loading={publishing}
            loadingKey="publish"
            onClick={() => void handlePublish()}
            icon={<Send className="h-3.5 w-3.5" />}
            className="rounded-full bg-apple-ink text-white hover:bg-apple-ink/90 text-xs font-semibold shadow-sm"
          >
            Publish
          </LoadingButton>
        </div>
      </header>

      {/* ── Unsaved Changes Modal ── */}
      {unsavedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Unsaved changes</h3>
                <p className="text-xs text-zinc-500">You have unsaved changes.</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-600">
              Are you sure you want to leave? Any changes made since your last save will be discarded.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUnsavedModalOpen(false)}
                className="text-xs"
              >
                Stay
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmDiscard}
                className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
              >
                Discard & Go Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Shop Builder Modal ── */}
      <AiShopBuilderModal
        isOpen={aiBuilderOpen}
        onClose={() => setAiBuilderOpen(false)}
        storeId={storeId}
        storeSlug={store.slug}
        storeName={store.name}
      />
    </>
  );
}
