"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetStorePagesQuery, useCreateStorePageMutation, useSaveStorePageDraftMutation } from "@/redux/api/store-page-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { setTheme } from "@/redux/slices/theme-slice";
import { setStoreSettings } from "@/redux/slices/store-settings-slice";
import {
  loadPage,
  markSaved,
  setSaveError,
  setSaving,
  toggleLeftPanel,
  toggleRightPanel,
  setLeftPanelWidth,
  setRightPanelWidth,
  setFullscreen,
  copySection,
  duplicateSection,
  pasteSection,
  redoBuilder,
  removeSection,
  undoBuilder,
  openSectionLibrary,
} from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import { BuilderToolbar } from "@/components/builder/builder-toolbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { StorePreview } from "@/components/builder/store-preview";
import { PropertiesPanel } from "@/components/builder/properties-panel";
import { SectionLibraryModal } from "@/components/builder/section-library-modal";
import { BuilderFloatingToolbar } from "@/components/builder/builder-floating-toolbar";
import { BuilderCommandPalette } from "@/components/builder/builder-command-palette";
import {
  BuilderLoadingScreen,
  useMinimumLoading,
} from "@/components/builder/builder-loading-screen";
import {
  useBuilderAutoSave,
  type BuilderDraftPayload,
} from "@/hooks/use-builder-auto-save";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";
import { PanelLeftOpen, PanelRightOpen, GripVertical } from "lucide-react";

import { getThemeById } from "@/themes/registry";

function getDefaultSectionsForPageType(pageType: string, themeId?: string): BuilderSection[] {
  const id = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const shared = { visible: true };
  const theme = getThemeById(themeId);
  const home: BuilderSection[] = theme.defaultSections.map((s) => ({
    ...s,
    id: `${s.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }));

  const productPage: BuilderSection[] = [
    { id: id("category-banner"), type: "category-banner", label: "Category Banner", ...shared, props: { title: "Shop Our Collection", subtitle: "Find the perfect item for you", bgImage: "", height: "300px", overlayColor: "rgba(15, 23, 42, 0.4)" } },
    { id: id("product-grid"), type: "product-grid", label: "Product Grid", ...shared, props: { title: "All Products", subtitle: "Browse our full catalog", gridColumns: "4", showBadges: "true", showRatings: "true" } },
  ];
  const minimal: BuilderSection[] = [
    { id: id("rich-text"), type: "rich-text", label: "Content", ...shared, props: { content: "<h2>Page Content</h2><p>Edit this content in the builder.</p>", alignment: "left" } },
  ];
  const faq: BuilderSection[] = [
    { id: id("faq"), type: "faq", label: "FAQ", ...shared, props: { title: "Frequently Asked Questions", subtitle: "Find answers to common questions", layout: "accordion", columns: "1" } },
  ];
  const contact: BuilderSection[] = [
    { id: id("contact-form"), type: "feature-list", label: "Contact", ...shared, props: { title: "Get in Touch", subtitle: "We'd love to hear from you", columns: "2", headline: "Contact Us", description: "Reach out to our team" } },
  ];
  const form: BuilderSection[] = [
    { id: id("one-column"), type: "one-column", label: "Form Container", ...shared, props: { maxWidth: "480px", alignment: "center", padding: "40px 24px", bgColor: "#ffffff", borderRadius: "16px", shadow: "0 4px 24px rgba(0,0,0,0.08)" } },
  ];
  const blog: BuilderSection[] = [
    { id: id("blog-grid"), type: "blog", label: "Blog Posts", ...shared, props: { title: "Latest Posts", subtitle: "Read our latest articles", layout: "grid", columns: "3", showExcerpt: "true", showDate: "true", showAuthor: "true" } },
  ];
  const checkout: BuilderSection[] = [
    { id: id("one-column"), type: "one-column", label: "Checkout Container", ...shared, props: { maxWidth: "800px", alignment: "center", padding: "40px 24px" } },
  ];

  switch (pageType) {
    case "home": return home;
    case "shop": case "category": case "collection": return productPage;
    case "product": case "product-details": return productPage;
    case "cart": return checkout;
    case "checkout": return checkout;
    case "wishlist": return checkout;
    case "search": return productPage;
    case "about": return [
      { id: id("hero-banner"), type: "hero-banner", label: "About Hero", ...shared, props: { headline: "About Us", subheadline: "Our story and mission", buttonText: "Learn More", buttonLink: "#story", heroHeight: "sm", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.4)", textAlignment: "center" } },
      { id: id("company-story"), type: "company-story", label: "Our Story", ...shared, props: { title: "Our Journey", description: "Edit this section to tell your brand story.", imageUrl: "", layout: "alternating" } },
      { id: id("team-members"), type: "team-members", label: "Team", ...shared, props: { title: "Meet the Team", subtitle: "The people behind the brand", columns: "4", showSocial: "true" } },
    ];
    case "contact": return contact;
    case "faq": return faq;
    case "blog": case "blog-details": return blog;
    case "privacy_policy": case "terms_conditions": case "shipping_policy": case "returns_policy": return [
      { id: id("rich-text"), type: "rich-text", label: "Policy Content", ...shared, props: { content: "<h1>Policy Page</h1><p>Edit this content in the builder.</p>", alignment: "left" } },
    ];
    case "login": case "register": case "forgot_password": case "account": return form;
    default: return minimal;
  }
}

const defaultSections: BuilderSection[] = getDefaultSectionsForPageType("home");

function getDefaultHeaderSections(): BuilderSection[] {
  const id = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const shared = { visible: true };
  return [
    { id: id("header-bar"), type: "header-bar", label: "Header Bar", ...shared, props: { logoUrl: "", storeName: "My Store", showName: "true", layout: "logo-nav-icons", navPosition: "center", showSearch: "true", showWishlist: "true", showCart: "true", showAccount: "true", sticky: "true", transparent: "false", headerBg: "#ffffff", headerHeight: "64", link1Text: "Home", link1Url: "/", link2Text: "Shop", link2Url: "/shop", link3Text: "About", link3Url: "/about", link4Text: "Contact", link4Url: "/contact", font: "Inter" } },
  ];
}

function getDefaultFooterSections(): BuilderSection[] {
  const id = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const shared = { visible: true };
  return [
    { id: id("simple-footer"), type: "simple-footer", label: "Footer", ...shared, props: { copyright: `© ${new Date().getFullYear()} Your Store. All rights reserved.`, showSocial: "true", bgColor: "#09090b", textColor: "#fafafa", layout: "split" } },
  ];
}

const defaultSettings = {
  currencyCode: "USD" as const, currencySymbol: "$", currencyPosition: "before" as const,
  locale: "en-US", decimalPlaces: 2, taxRate: 0,
  dateFormat: "MM/DD/YYYY", timezone: "UTC", language: "en",
};

const ResizeHandle = memo(function ResizeHandle({
  side,
  onMouseDown,
}: {
  side: "left" | "right";
  onMouseDown: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      className={cn(
        "group relative flex w-[5px] shrink-0 cursor-col-resize items-center justify-center transition-colors",
        "bg-zinc-200/50 hover:bg-zinc-400 active:bg-apple-canvas-parchment"
      )}
      aria-label={`Resize ${side} panel`}
    >
      <div className="flex h-8 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-4 w-0.5 rounded bg-zinc-400" />
        <div className="h-4 w-0.5 rounded bg-zinc-400" />
      </div>
    </button>
  );
});

export function BuilderEditor() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { store, storeId, storeSlug } = useRequiredStore();
  const routePageSlug = typeof params.pageSlug === "string" ? params.pageSlug : "";
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Only fetch what the builder needs ─────────────────────────────────────
  // Pages: essential for loading/managing builder pages
  const { data: pagesData, isLoading: pagesLoading } = useGetStorePagesQuery(storeId, {
    skip: !storeId || !store,
  });
  const { show: showPagesLoading, exiting: pagesLoadingExit } = useMinimumLoading(pagesLoading);

  // Store settings: used for preview (currency, locale). Graceful default if unavailable.
  const { data: settingsData } = useGetStoreSettingsQuery(storeId, {
    skip: !storeId || !store,
  });

  const [createPage] = useCreateStorePageMutation();
  const [savePageDraft] = useSaveStorePageDraftMutation();

  const settings = settingsData?.data?.settings ?? defaultSettings;

  const isDirty = useSelector((s: RootState) => s.builder.isDirty);
  const saving = useSelector((s: RootState) => s.builder.saving);
  const publishing = useSelector((s: RootState) => s.builder.publishing);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const headerSettings = useSelector((s: RootState) => s.builder.headerSettings);
  const footerSettings = useSelector((s: RootState) => s.builder.footerSettings);

  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const currentTheme = useSelector((s: RootState) => s.theme);
  const clipboardSection = useSelector((s: RootState) => s.builder.clipboardSection);
  const leftPanelOpen = useSelector((s: RootState) => s.builder.leftPanelOpen);
  const rightPanelOpen = useSelector((s: RootState) => s.builder.rightPanelOpen);
  const leftPanelWidth = useSelector((s: RootState) => s.builder.leftPanelWidth);
  const rightPanelWidth = useSelector((s: RootState) => s.builder.rightPanelWidth);
  const fullscreen = useSelector((s: RootState) => s.builder.fullscreen);
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
  const [contentRevision, setContentRevision] = useState(0);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Bump revision on every meaningful edit so idle timer resets and concurrent saves stay safe.
  // NOTE: `settings` is intentionally excluded — it never changes inside the builder and
  // including it caused spurious revision bumps that triggered unnecessary autosaves.
  useEffect(() => {
    if (!isDirty) return;
    setContentRevision((n) => n + 1);
  }, [
    isDirty,
    sections,
    headerSections,
    footerSections,
    headerSettings,
    footerSettings,
    currentTheme,
  ]);

  const getDraftPayload = useCallback((): BuilderDraftPayload | null => {
    if (!pageId) return null;
    return {
      id: pageId,
      storeId,
      sections,
      headerSections,
      footerSections,
      headerSettings: headerSettings as Record<string, unknown>,
      footerSettings: footerSettings as Record<string, unknown>,
      theme: currentTheme as unknown as Record<string, unknown>,
      settings: settings as unknown as Record<string, unknown>,
    };
  }, [
    pageId,
    storeId,
    sections,
    headerSections,
    footerSections,
    headerSettings,
    footerSettings,
    currentTheme,
    settings,
  ]);

  const persistDraft = useCallback(async (payload: BuilderDraftPayload) => {
    await savePageDraft(payload).unwrap();
  }, [savePageDraft]);

  const { status: autoSaveStatus, saveNow } = useBuilderAutoSave({
    isDirty,
    revision: contentRevision,
    getPayload: getDraftPayload,
    saveDraft: persistDraft,
    onSaved: (iso) => dispatch(markSaved(iso)),
    onError: (message) => dispatch(setSaveError(message)),
    onSavingChange: (next) => dispatch(setSaving(next)),
    idleMs: 30_000,
  });

  const handleQuickInsert = useCallback((index: number, event: ReactMouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    dispatch(openSectionLibrary({
      insertPosition: index,
      anchorPosition: { top: rect.top + window.scrollY, left: rect.left + rect.width / 2 },
    }));
  }, [dispatch]);

  const loadedRef = useRef<string>("");

  // ─── Restore saved panel widths ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const left = window.localStorage.getItem("builder.leftPanelWidth");
    const right = window.localStorage.getItem("builder.rightPanelWidth");
    if (left) dispatch(setLeftPanelWidth(Number(left)));
    if (right) dispatch(setRightPanelWidth(Number(right)));
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("builder.leftPanelWidth", String(leftPanelWidth));
    window.localStorage.setItem("builder.rightPanelWidth", String(rightPanelWidth));
  }, [leftPanelWidth, rightPanelWidth]);

  // ─── Panel resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!resizing) return;
    const handleMove = (event: MouseEvent) => {
      if (resizing === "left") {
        dispatch(setLeftPanelWidth(event.clientX));
      } else {
        dispatch(setRightPanelWidth(window.innerWidth - event.clientX));
      }
    };
    const handleUp = () => setResizing(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dispatch, resizing]);

  // ─── Escape fullscreen ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreen) {
        dispatch(setFullscreen(false));
      }
      if (e.key === "F" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        dispatch(setFullscreen(!fullscreen));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, fullscreen]);

  // ─── Dispatch theme from store (once per actual theme identity) ────────────
  const themeRef = useRef<string>("");
  useEffect(() => {
    if (!store.theme) return;
    const signature = JSON.stringify(store.theme);
    if (signature === themeRef.current) return;
    themeRef.current = signature;
    dispatch(setTheme({
      primaryColor: store.theme.primaryColor, secondaryColor: store.theme.secondaryColor,
      font: store.theme.font, buttonStyle: store.theme.buttonStyle,
      layoutWidth: store.theme.layoutWidth, darkMode: store.theme.darkMode,
      navbarStyle: store.theme.navbarStyle,
    }));
  }, [store.theme, dispatch]);

  // ─── Dispatch settings (once per actual settings identity) ──────────────────
  const settingsRef = useRef<string>("");
  useEffect(() => {
    if (!settings) return;
    const signature = JSON.stringify(settings);
    if (signature === settingsRef.current) return;
    settingsRef.current = signature;
    dispatch(setStoreSettings({
      currencyCode: settings.currencyCode, currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition, locale: settings.locale,
      decimalPlaces: settings.decimalPlaces,
      dateFormat: settings.dateFormat, timezone: settings.timezone, language: settings.language,
    }));
  }, [settings, dispatch]);

  // ─── Home-only builder routing ─────────────────────────────────────────────
  useEffect(() => {
    if (!routePageSlug || routePageSlug === "home") return;
    router.replace(`/store/${storeSlug}/builder/home`);
  }, [routePageSlug, router, storeSlug]);

  // ─── Load home page only ───────────────────────────────────────────────────
  useEffect(() => {
    const pages = pagesData?.data?.pages;
    if (!pages) return;
    if (routePageSlug && routePageSlug !== "home") return;

    const homePage =
      pages.find((page) => page.slug === "/" || page.slug === "home" || page.isHomePage) ??
      pages[0];

    if (!homePage) {
      if (loadedRef.current === `create:${storeId}`) return;
      loadedRef.current = `create:${storeId}`;
      createPage({ storeId, title: "Home", slug: "/" })
        .unwrap()
        .then((res) => {
          const createdPage = res.data?.page;
          if (!createdPage?._id) return;
          dispatch(loadPage({
            page: { id: createdPage._id, title: createdPage.title, slug: createdPage.slug, pageType: "home" as any, isSystem: false, description: "", status: "draft" as any },
            sections: getDefaultSectionsForPageType("home", (store.theme as any)?.themeId),
            headerSections: getDefaultHeaderSections(),
            footerSections: getDefaultFooterSections(),
          }));
          router.replace(`/store/${storeSlug}/builder/home`);
        })
        .catch(() => {
          loadedRef.current = "";
        });
      return;
    }

    const loadKey = `${storeId}:${homePage._id}`;
    if (loadedRef.current === loadKey) return;
    loadedRef.current = loadKey;

    dispatch(loadPage({
      page: {
        id: homePage._id,
        title: homePage.title,
        slug: homePage.slug,
        pageType: "home" as any,
        isSystem: homePage.isSystem ?? false,
        description: homePage.description ?? "",
        status: (homePage.status || "draft") as any,
      },
      sections: (homePage.sections?.length ? homePage.sections : getDefaultSectionsForPageType("home", (store.theme as any)?.themeId)) as BuilderSection[],
      headerSections: (homePage.headerSections?.length ? homePage.headerSections : getDefaultHeaderSections()) as BuilderSection[],
      footerSections: (homePage.footerSections?.length ? homePage.footerSections : getDefaultFooterSections()) as BuilderSection[],
      headerSettings: (homePage.headerSettings as any) ?? {},
      footerSettings: (homePage.footerSettings as any) ?? {},
    }));

  }, [pagesData, dispatch, storeId, routePageSlug, createPage, router, storeSlug]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement;
      // Detect whether the user is actively typing in an editable field
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      // ⌘K / Ctrl+K → Command palette (always)
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((o) => !o);
        return;
      }

      // Shortcuts that should work even while editing
      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow();
        return;
      }

      // Shortcuts below must NOT fire while user is typing in an editable field
      if (isEditing) return;

      // Shift + A - Open Section Library
      if (event.key.toLowerCase() === "a" && event.shiftKey && !mod) {
        event.preventDefault();
        dispatch(openSectionLibrary({}));
        return;
      }

      if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        dispatch(undoBuilder());
        return;
      }

      if (mod && ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y")) {
        event.preventDefault();
        dispatch(redoBuilder());
        return;
      }

      if (mod && event.key.toLowerCase() === "d" && selectedSectionId) {
        event.preventDefault();
        dispatch(duplicateSection(selectedSectionId));
        return;
      }

      if (mod && event.key.toLowerCase() === "c" && selectedSectionId) {
        event.preventDefault();
        dispatch(copySection(selectedSectionId));
        return;
      }

      if (mod && event.key.toLowerCase() === "v" && clipboardSection) {
        event.preventDefault();
        dispatch(pasteSection(selectedSectionId));
        return;
      }

      // Delete/Backspace — guarded: only fires when no text input is focused
      if ((event.key === "Delete" || event.key === "Backspace") && selectedSectionId) {
        event.preventDefault();
        dispatch(removeSection(selectedSectionId));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    clipboardSection,
    dispatch,
    saveNow,
    selectedSectionId,
  ]);

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (showPagesLoading) {
    return <BuilderLoadingScreen exiting={pagesLoadingExit} message="Restoring your latest edits…" />;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-dvh min-h-0 flex-col overflow-hidden bg-[#ececef] transition-all duration-200",
        fullscreen && "fixed inset-0 z-50"
      )}
    >
      {!fullscreen && (
        <BuilderToolbar
          onBack={() => router.push(`/store/${storeSlug}/dashboard`)}
          saving={saving}
          publishing={publishing}
          isDirty={isDirty}
          autoSaveStatus={autoSaveStatus}
          onForceSave={saveNow}
        />
      )}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {leftPanelOpen && (
          <div
            className="min-h-0 flex-shrink-0 overflow-hidden border-r border-apple-hairline/60 bg-apple-canvas/95 backdrop-blur-xl"
            style={{ width: leftPanelWidth }}
          >
            <BuilderSidebar />
          </div>
        )}

        {leftPanelOpen && <ResizeHandle side="left" onMouseDown={() => setResizing("left")} />}

        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="absolute left-3 top-3 z-30 flex gap-1">
            <button
              type="button"
              onClick={() => dispatch(toggleLeftPanel())}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-apple-hairline/80 bg-apple-canvas/90 text-apple-ink-muted-48 shadow-sm backdrop-blur hover:text-apple-ink"
              title={leftPanelOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => dispatch(toggleRightPanel())}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-apple-hairline/80 bg-apple-canvas/90 text-apple-ink-muted-48 shadow-sm backdrop-blur hover:text-apple-ink"
              title={rightPanelOpen ? "Hide inspector" : "Show inspector"}
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          </div>

          <div className="h-full overflow-x-hidden overflow-y-auto overscroll-contain">
            <StorePreview
              store={store}
              theme={currentTheme}
              sections={sections as never}
              headerSections={headerSections as never}
              footerSections={footerSections as never}
              onQuickInsert={handleQuickInsert}
            />
          </div>

          <BuilderFloatingToolbar />
        </div>

        {rightPanelOpen && (selectedSectionId || editingZone !== "body") && (
          <ResizeHandle side="right" onMouseDown={() => setResizing("right")} />
        )}

        {rightPanelOpen && (selectedSectionId || editingZone !== "body") && (
          <div
            className="min-h-0 flex-shrink-0 overflow-hidden border-l border-apple-hairline/60 bg-apple-canvas/95 backdrop-blur-xl"
            style={{ width: rightPanelWidth }}
          >
            <PropertiesPanel />
          </div>
        )}
      </div>

      <SectionLibraryModal />
      <BuilderCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
