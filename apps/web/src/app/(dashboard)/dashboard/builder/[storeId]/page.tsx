"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetStoreQuery } from "@/redux/api/store-api";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { useGetPagesQuery, useCreatePageMutation } from "@/redux/api/builder-api";
import { useGetStoreSettingsQuery, useGetHomepageSlidersQuery } from "@/redux/api/store-settings-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { setTheme } from "@/redux/slices/theme-slice";
import { setStoreSettings } from "@/redux/slices/store-settings-slice";
import { loadSections, setPageId, markSaved, setSaving, setLeftPanelWidth, setRightPanelWidth } from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import { useSavePageMutation } from "@/redux/api/builder-api";
import { BuilderToolbar } from "@/components/builder/builder-toolbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { StorePreview } from "@/components/builder/store-preview";
import { PropertiesPanel } from "@/components/builder/properties-panel";

const defaultSections: BuilderSection[] = [
  { id: "hero-banner-1", type: "hero-banner", label: "Hero Banner", visible: true, props: { headline: "Welcome to Our Store", subheadline: "Discover amazing products curated just for you", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
  { id: "category-grid-1", type: "category-grid", label: "Categories", visible: true, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4" } },
  { id: "featured-products-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", showBadges: "true", showRatings: "true" } },
  { id: "testimonials-1", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What Customers Say", subtitle: "Hear from our happy customers", layout: "grid", cardStyle: "default", avatarStyle: "circle" } },
  { id: "newsletter-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe to get special offers, free giveaways, and exclusive deals.", buttonText: "Subscribe", placeholderText: "Enter your email" } },
  { id: "simple-footer-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocial: "true" } },
];

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const storeId = params.storeId as string;

  const { data: storeData, isLoading: storeLoading } = useGetStoreQuery(storeId);
  const { data: productsData } = useGetProductsQuery(storeId);
  const { data: pagesData, isLoading: pagesLoading } = useGetPagesQuery(storeId);
  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const { data: slidersData } = useGetHomepageSlidersQuery(storeId);
  const { data: categoriesData } = useGetCategoriesQuery(storeId);
  const [createPage] = useCreatePageMutation();
  const [savePage] = useSavePageMutation();

  const store = storeData?.data?.store;
  const products = productsData?.data?.products ?? [];
  const settings = settingsData?.data?.settings ?? {
    currencyCode: "USD", currencySymbol: "$", currencyPosition: "before",
    locale: "en-US", decimalPlaces: 2, taxRate: 0,
    dateFormat: "MM/DD/YYYY", timezone: "UTC", language: "en",
  };
  const sliders = slidersData?.data?.sliders ?? [];
  const categories = categoriesData?.data?.categories ?? [];

  const isDirty = useSelector((s: RootState) => s.builder.isDirty);
  const saving = useSelector((s: RootState) => s.builder.saving);
  const publishing = useSelector((s: RootState) => s.builder.publishing);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const pageId = useSelector((s: RootState) => s.builder.pageId);
  const currentTheme = useSelector((s: RootState) => s.theme);
  const leftPanelWidth = useSelector((s: RootState) => s.builder.leftPanelWidth);
  const rightPanelWidth = useSelector((s: RootState) => s.builder.rightPanelWidth);
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);

  const loadedRef = useRef(false);

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

  useEffect(() => {
    if (store?.theme) {
      dispatch(setTheme({
        primaryColor: store.theme.primaryColor, secondaryColor: store.theme.secondaryColor,
        font: store.theme.font, buttonStyle: store.theme.buttonStyle,
        layoutWidth: store.theme.layoutWidth, darkMode: store.theme.darkMode,
        navbarStyle: store.theme.navbarStyle,
      }));
    }
  }, [store, dispatch]);

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

  useEffect(() => {
    if (!pagesData?.data?.pages || loadedRef.current) return;
    loadedRef.current = true;
    const pages = pagesData.data.pages;
    if (pages.length > 0) {
      const page = pages[0];
      dispatch(loadSections((page.sections?.length ? page.sections : defaultSections) as BuilderSection[]));
      dispatch(setPageId(page._id));
    } else {
      createPage({ storeId, data: { title: "Home", slug: "home" } })
        .unwrap()
        .then((res) => {
          dispatch(loadSections(defaultSections));
          dispatch(setPageId(res.data!.page._id));
        })
        .catch(() => {});
    }
  }, [pagesData, dispatch, storeId, createPage]);

  useEffect(() => {
    if (!isDirty || !pageId) return;
    const timer = setTimeout(() => {
      dispatch(setSaving(true));
      savePage({ pageId, data: { sections, theme: currentTheme } })
        .unwrap()
        .then(() => dispatch(markSaved(new Date().toISOString())))
        .catch(() => dispatch(setSaving(false)));
    }, 4000);
    return () => clearTimeout(timer);
  }, [isDirty, pageId, sections, currentTheme, dispatch, savePage]);

  if (storeLoading || pagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-zinc-50">
        <p className="text-sm font-medium text-zinc-900">Store not found</p>
        <button onClick={() => router.push("/dashboard/stores")}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white">
          Back to Stores
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <BuilderToolbar
        storeId={storeId} storeName={store.name}
        onBack={() => router.push("/dashboard/stores")}
        saving={saving} publishing={publishing} isDirty={isDirty}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0 border-r border-zinc-200 overflow-hidden bg-white" style={{ width: leftPanelWidth }}>
          <BuilderSidebar storeId={storeId} />
        </div>
        <button
          type="button"
          onMouseDown={() => setResizing("left")}
          className="w-1.5 flex-shrink-0 cursor-col-resize bg-zinc-200/80 transition-colors hover:bg-zinc-400"
          aria-label="Resize left panel"
        />
        <div className="flex-1 overflow-y-auto bg-zinc-100">
          <StorePreview
            store={store} theme={currentTheme} products={products} categories={categories}
            settings={settings} sliders={sliders}
            sections={sections as any}
          />
        </div>
        {selectedSectionId && (
          <>
            <button
              type="button"
              onMouseDown={() => setResizing("right")}
              className="w-1.5 flex-shrink-0 cursor-col-resize bg-zinc-200/80 transition-colors hover:bg-zinc-400"
              aria-label="Resize right panel"
            />
            <div className="flex-shrink-0 border-l border-zinc-200 bg-white overflow-y-auto shadow-sm" style={{ width: rightPanelWidth }}>
            <PropertiesPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
