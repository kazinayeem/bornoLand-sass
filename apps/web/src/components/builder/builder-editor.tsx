"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetPagesQuery, useCreatePageMutation, useSavePageMutation } from "@/redux/api/builder-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import { setTheme } from "@/redux/slices/theme-slice";
import { setStoreSettings } from "@/redux/slices/store-settings-slice";
import {
  loadSections,
  setPageMetadata,
  markSaved,
  setSaveError,
  setSaving,
  toggleLeftPanel,
  toggleRightPanel,
  setLeftPanelWidth,
  setRightPanelWidth,
  setFullscreen,
  setPresentationMode,
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
import { FloatingSectionToolbar } from "@/components/builder/floating-section-toolbar";
import { ClearPageDialog } from "@/components/builder/clear-page-dialog";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Maximize, Minimize, GripVertical } from "lucide-react";

const defaultSections: BuilderSection[] = [
  { id: "hero-banner-1", type: "hero-banner", label: "Hero Banner", visible: true, props: { headline: "Welcome to Our Store", subheadline: "Discover amazing products curated just for you", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
  { id: "category-grid-1", type: "category-grid", label: "Categories", visible: true, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4" } },
  { id: "featured-products-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", showBadges: "true", showRatings: "true" } },
  { id: "testimonials-1", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What Customers Say", subtitle: "Hear from our happy customers", layout: "grid", cardStyle: "default", avatarStyle: "circle" } },
  { id: "newsletter-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe to get special offers, free giveaways, and exclusive deals.", buttonText: "Subscribe", placeholderText: "Enter your email" } },
  { id: "simple-footer-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocial: "true" } },
];

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
        "bg-zinc-200/50 hover:bg-zinc-400 active:bg-zinc-500"
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
  const { data: pagesData, isLoading: pagesLoading } = useGetPagesQuery(storeId, {
    skip: !storeId || !store,
  });

  // Store settings: used for preview (currency, locale). Graceful default if unavailable.
  const { data: settingsData } = useGetStoreSettingsQuery(storeId, {
    skip: !storeId || !store,
  });

  const [createPage] = useCreatePageMutation();
  const [savePage] = useSavePageMutation();

  const settings = settingsData?.data?.settings ?? defaultSettings;

  const isDirty = useSelector((s: RootState) => s.builder.isDirty);
  const saving = useSelector((s: RootState) => s.builder.saving);
  const publishing = useSelector((s: RootState) => s.builder.publishing);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);

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
  const presentationMode = useSelector((s: RootState) => s.builder.presentationMode);
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
  const [sectionLibraryOpen, setSectionLibraryOpen] = useState(false);
  const [sectionInsertIndex, setSectionInsertIndex] = useState<number | null>(null);
  const [clearPageOpen, setClearPageOpen] = useState(false);

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

  // ─── Dispatch theme from store ─────────────────────────────────────────────
  useEffect(() => {
    if (store.theme) {
      dispatch(setTheme({
        primaryColor: store.theme.primaryColor, secondaryColor: store.theme.secondaryColor,
        font: store.theme.font, buttonStyle: store.theme.buttonStyle,
        layoutWidth: store.theme.layoutWidth, darkMode: store.theme.darkMode,
        navbarStyle: store.theme.navbarStyle,
      }));
    }
  }, [store, dispatch]);

  // ─── Dispatch settings ─────────────────────────────────────────────────────
  useEffect(() => {
    if (settings) {
      dispatch(setStoreSettings({
        currencyCode: settings.currencyCode, currencySymbol: settings.currencySymbol,
        currencyPosition: settings.currencyPosition, locale: settings.locale,
        decimalPlaces: settings.decimalPlaces,
        dateFormat: settings.dateFormat, timezone: settings.timezone, language: settings.language,
      }));
    }
  }, [settings, dispatch]);

  // ─── Load / redirect to page ────────────────────────────────────────────────
  useEffect(() => {
    const pages = pagesData?.data?.pages;
    const loadKey = `${storeId}:${routePageSlug || "root"}`;
    if (!pages || loadedRef.current === loadKey) return;

    const redirectToPage = (targetSlug: string) => {
      router.replace(`/store/${storeSlug}/builder/${targetSlug}`);
    };

    const isMongoId = (value: string) => /^[a-f\d]{24}$/i.test(value);

    loadedRef.current = loadKey;

    if (pages.length > 0) {
      const matchedPage =
        pages.find((page) => page.slug === routePageSlug) ??
        (routePageSlug && isMongoId(routePageSlug) ? pages.find((page) => page._id === routePageSlug) : undefined) ??
        pages.find((page) => page.slug === "home") ??
        pages[0];

      dispatch(loadSections((matchedPage.sections?.length ? matchedPage.sections : defaultSections) as BuilderSection[]));
      dispatch(setPageMetadata({ id: matchedPage._id, title: matchedPage.title, slug: matchedPage.slug }));

      const canonicalSlug = matchedPage.slug;
      if (!routePageSlug || routePageSlug !== canonicalSlug || isMongoId(routePageSlug)) {
        redirectToPage(canonicalSlug);
      }
      return;
    }

    if (pages.length === 0) {
      createPage({ storeId, data: { title: "Home", slug: "home" } })
        .unwrap()
        .then((res) => {
          const createdPage = res.data?.page;
          if (!createdPage?.slug) return;
          dispatch(loadSections(defaultSections));
          dispatch(setPageMetadata({ id: createdPage._id, title: createdPage.title, slug: createdPage.slug }));
          redirectToPage(createdPage.slug);
        })
        .catch(() => {});
    }
  }, [pagesData, dispatch, storeId, routePageSlug, createPage, router, storeSlug]);

  // ─── Autosave every 10s ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty || !pageId) return;
    const timer = setTimeout(() => {
      dispatch(setSaving(true));
      savePage({ storeId, pageId, data: { sections, theme: currentTheme, settings } })
        .unwrap()
        .then(() => dispatch(markSaved(new Date().toISOString())))
        .catch(() => dispatch(setSaveError("Save failed — check your connection")));
    }, 10000);
    return () => clearTimeout(timer);
  }, [isDirty, pageId, sections, currentTheme, settings, storeId, dispatch, savePage]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      // Shift + A - Open Section Library
      if (event.key.toLowerCase() === "a" && event.shiftKey && !mod) {
        event.preventDefault();
        dispatch(openSectionLibrary({}));
        return;
      }

      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!pageId) return;
        dispatch(setSaving(true));
        savePage({ storeId, pageId, data: { sections, theme: currentTheme, settings } })
          .unwrap()
          .then(() => dispatch(markSaved(new Date().toISOString())))
          .catch(() => dispatch(setSaveError("Save failed")));
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

      if (event.key === "Delete" && selectedSectionId) {
        event.preventDefault();
        dispatch(removeSection(selectedSectionId));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [clipboardSection, currentTheme, dispatch, pageId, savePage, sections, selectedSectionId, settings, storeId]);

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (pagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-screen flex-col bg-zinc-50 transition-all duration-200",
        fullscreen && "fixed inset-0 z-50",
        presentationMode && "bg-black"
      )}
    >
      {!presentationMode && (
        <BuilderToolbar
          onBack={() => router.push(`/store/${storeSlug}/dashboard`)}
          saving={saving}
          publishing={publishing}
          isDirty={isDirty}
          onOpenSectionLibrary={() => {
            setSectionInsertIndex(null);
            setSectionLibraryOpen(true);
          }}
          onClearPage={() => setClearPageOpen(true)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {!presentationMode && leftPanelOpen && (
          <div
            className="flex-shrink-0 overflow-hidden border-r border-zinc-200/60 bg-white/95 backdrop-blur-sm"
            style={{ width: leftPanelWidth }}
          >
            <BuilderSidebar />
          </div>
        )}

        {!presentationMode && leftPanelOpen && (
          <ResizeHandle side="left" onMouseDown={() => setResizing("left")} />
        )}

        <div className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto bg-zinc-100 transition-all duration-200",
          presentationMode && "bg-black"
        )}>
          <StorePreview
            store={store}
            theme={currentTheme}
            sections={sections as never}
            headerSections={headerSections as never}
            footerSections={footerSections as never}
            onQuickInsert={(index) => {
              setSectionInsertIndex(index);
              setSectionLibraryOpen(true);
            }}
          />
        </div>

        {!presentationMode && rightPanelOpen && (selectedSectionId || editingZone !== "body") && (
          <ResizeHandle side="right" onMouseDown={() => setResizing("right")} />
        )}

        {!presentationMode && rightPanelOpen && (selectedSectionId || editingZone !== "body") && (
          <div
            className="flex-shrink-0 overflow-y-auto border-l border-zinc-200/60 bg-white/95 backdrop-blur-sm"
            style={{ width: rightPanelWidth }}
          >
            <PropertiesPanel />
          </div>
        )}
      </div>

      {/* Canvas toggle buttons - floating */}
      {!presentationMode && !fullscreen && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white/90 px-2.5 py-1.5 shadow-lg backdrop-blur-md">
          <button
            onClick={() => dispatch(toggleLeftPanel())}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title={leftPanelOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {leftPanelOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{leftPanelOpen ? "Hide" : "Sidebar"}</span>
          </button>
          <div className="h-4 w-px bg-zinc-200" />
          <button
            onClick={() => dispatch(setFullscreen(true))}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title="Fullscreen"
          >
            <Maximize className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            onClick={() => dispatch(setPresentationMode(true))}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title="Presentation mode"
          >
            <Maximize className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Present</span>
          </button>
          <div className="h-4 w-px bg-zinc-200" />
          <button
            onClick={() => dispatch(toggleRightPanel())}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            title={rightPanelOpen ? "Hide inspector" : "Show inspector"}
          >
            {rightPanelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{rightPanelOpen ? "Hide" : "Inspector"}</span>
          </button>
        </div>
      )}

      {/* Fullscreen exit button */}
      {fullscreen && (
        <button
          onClick={() => dispatch(setFullscreen(false))}
          className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-zinc-900 transition-colors"
        >
          <Minimize className="h-3.5 w-3.5" />
          Exit fullscreen
        </button>
      )}

      {/* Section Library Modal */}
      <SectionLibraryModal />

      {/* Floating section toolbar — shown when a section is selected */}
      {!presentationMode && <FloatingSectionToolbar />}

      <ClearPageDialog
        open={clearPageOpen}
        onClose={() => setClearPageOpen(false)}
      />

      {/* Presentation mode exit */}
      {presentationMode && (
        <button
          onClick={() => dispatch(setPresentationMode(false))}
          className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-zinc-900 shadow-lg backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Minimize className="h-3.5 w-3.5" />
          Exit presentation
        </button>
      )}
    </div>
  );
}
