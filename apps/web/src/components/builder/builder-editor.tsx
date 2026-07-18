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
  loadPage,
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

function getDefaultSectionsForPageType(pageType: string): BuilderSection[] {
  const id = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const shared = { visible: true };
  const home: BuilderSection[] = [
    { id: id("hero-banner"), type: "hero-banner", label: "Hero Banner", ...shared, props: { headline: "Welcome to Our Store", subheadline: "Discover amazing products curated just for you", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
    { id: id("category-grid"), type: "category-grid", label: "Categories", ...shared, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4" } },
    { id: id("featured-products"), type: "featured-products", label: "Featured Products", ...shared, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", showBadges: "true", showRatings: "true" } },
    { id: id("testimonials"), type: "testimonials", label: "Testimonials", ...shared, props: { title: "What Customers Say", subtitle: "Hear from our happy customers", layout: "grid", cardStyle: "default", avatarStyle: "circle" } },
    { id: id("newsletter"), type: "newsletter", label: "Newsletter", ...shared, props: { headline: "Stay in the Loop", subheadline: "Subscribe to get special offers, free giveaways, and exclusive deals.", buttonText: "Subscribe", placeholderText: "Enter your email" } },
  ];
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
  const presentationMode = useSelector((s: RootState) => s.builder.presentationMode);
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
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

  // ─── Derive pageType from slug when backend doesn't provide it ────────────
  const derivePageType = useCallback((page: { slug: string; pageType?: string }): string => {
    if (page.pageType) return page.pageType;
    const slugToType: Record<string, string> = {
      home: "home", shop: "shop", cart: "cart", checkout: "checkout",
      about: "about", contact: "contact", faq: "faq", blog: "blog",
      login: "login", register: "register", account: "account",
      wishlist: "wishlist", search: "search", "privacy-policy": "privacy_policy",
      "terms-conditions": "terms_conditions", "shipping-policy": "shipping_policy",
      "returns-policy": "returns_policy", product: "product", category: "category",
      collection: "collection",
    };
    return slugToType[page.slug.replace(/^\/+/, "")] || "custom";
  }, []);

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

      const resolvedPageType = derivePageType(matchedPage);
      const pageDefaults = getDefaultSectionsForPageType(resolvedPageType);
      const bodySections = (matchedPage.sections?.length ? matchedPage.sections : pageDefaults) as BuilderSection[];
      const headerSections = (matchedPage.headerSections?.length ? matchedPage.headerSections : getDefaultHeaderSections()) as BuilderSection[];
      const footerSections = (matchedPage.footerSections?.length ? matchedPage.footerSections : getDefaultFooterSections()) as BuilderSection[];
      dispatch(loadPage({
        page: { id: matchedPage._id, title: matchedPage.title, slug: matchedPage.slug, pageType: resolvedPageType as any, isSystem: false, description: "", status: (matchedPage.status || "draft") as any },
        sections: bodySections,
        headerSections,
        footerSections,
      }));

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
          const bodySections = getDefaultSectionsForPageType("home");
          const headerSections = getDefaultHeaderSections();
          const footerSections = getDefaultFooterSections();
          dispatch(loadPage({
            page: { id: createdPage._id, title: createdPage.title, slug: createdPage.slug, pageType: "home" as any, isSystem: false, description: "", status: "draft" as any },
            sections: bodySections,
            headerSections,
            footerSections,
          }));
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
      savePage({ storeId, pageId, data: { sections, headerSections, footerSections, headerSettings, footerSettings, theme: currentTheme, settings } })
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
        savePage({ storeId, pageId, data: { sections, headerSections, footerSections, headerSettings, footerSettings, theme: currentTheme, settings } })
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
            dispatch(openSectionLibrary({ insertPosition: null }));
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
            onQuickInsert={(index, event) => {
              // Calculate anchor position from click event
              const rect = event.currentTarget.getBoundingClientRect();
              const anchorPosition = {
                top: rect.top + window.scrollY,
                left: rect.left + rect.width / 2,
              };
              
              dispatch(openSectionLibrary({ 
                insertPosition: index,
                anchorPosition 
              }));
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
