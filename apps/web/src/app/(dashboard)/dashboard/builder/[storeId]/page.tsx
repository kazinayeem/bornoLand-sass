"use client";

import { useEffect, useRef } from "react";
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
import { loadSections, setPageId, markSaved, setSaving } from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import { useSavePageMutation } from "@/redux/api/builder-api";
import { BuilderToolbar } from "@/components/builder/builder-toolbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { StorePreview } from "@/components/builder/store-preview";
import { PropertiesPanel } from "@/components/builder/properties-panel";

const defaultSections: BuilderSection[] = [
  { id: "announcement-1", type: "announcement", label: "Announcement Bar", visible: false, props: { text: "Free shipping on orders over $50! Use code FREESHIP", backgroundColor: "#18181b", textColor: "#ffffff", link: "/shop", linkText: "Shop Now", showClose: "true" } },
  { id: "hero-1", type: "hero", label: "Hero Banner", visible: true, props: { headline: "Welcome to Our Store", subheadline: "Discover amazing products curated just for you", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
  { id: "brand-logos-1", type: "brand-logos", label: "Brand Logos", visible: false, props: { title: "Trusted By", subtitle: "Brands that love us", layout: "carousel", backgroundColor: "#fafafa" } },
  { id: "features-1", type: "features", label: "Categories", visible: true, props: { title: "Shop by Category", subtitle: "Browse our collections", gridColumns: "4", cardStyle: "default", backgroundColor: "" } },
  { id: "flash-sale-1", type: "flash-sale", label: "Flash Sale", visible: false, props: { title: "Flash Sale", subtitle: "Limited time offers", endDate: "", backgroundColor: "#fef2f2", textColor: "#991b1b", accentColor: "#dc2626", products: "" } },
  { id: "products-1", type: "products", label: "Products", visible: true, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", layout: "grid", showBadges: "true", showRatings: "true", backgroundColor: "" } },
  { id: "image-banner-1", type: "image-banner", label: "Image Banner", visible: false, props: { imageUrl: "", headline: "New Collection", subtitle: "Discover our latest arrivals", buttonText: "Explore", buttonLink: "/shop", overlayOpacity: "30", textAlignment: "center" } },
  { id: "collection-1", type: "collection", label: "Collection Showcase", visible: false, props: { title: "Collection Spotlight", subtitle: "Curated just for you", imageUrl: "", buttonText: "View Collection", buttonLink: "/shop", layout: "left", backgroundColor: "" } },
  { id: "multi-banner-1", type: "multi-banner", label: "Multi Banner Grid", visible: false, props: { columns: "3", gap: "4", borderRadius: "12" } },
  { id: "video-1", type: "video", label: "Video Section", visible: false, props: { videoUrl: "", posterUrl: "", title: "Featured Video", caption: "Learn more about our story", buttonText: "Learn More", buttonLink: "#", autoplay: "false", backgroundColor: "" } },
  { id: "feature-cards-1", type: "feature-cards", label: "Feature Cards", visible: false, props: { title: "Why Choose Us", subtitle: "We deliver quality and value", columns: "3", cardStyle: "default", backgroundColor: "" } },
  { id: "stats-1", type: "stats", label: "Stats Counter", visible: false, props: { title: "Our Numbers", subtitle: "Trusted by thousands", stat1label: "Products", stat1value: "10K+", stat2label: "Customers", stat2value: "50K+", stat3label: "Reviews", stat3value: "25K+", stat4label: "Countries", stat4value: "30+", backgroundColor: "#18181b", textColor: "#fafafa", accentColor: "#f59e0b" } },
  { id: "faq-1", type: "faq", label: "FAQ Accordion", visible: false, props: { title: "Frequently Asked Questions", subtitle: "Everything you need to know", backgroundColor: "", items: '[{"q":"How do I place an order?","a":"Simply browse our catalog, add items to your cart, and proceed to checkout."},{"q":"What payment methods do you accept?","a":"We accept Visa, Mastercard, PayPal, and more."},{"q":"How long does shipping take?","a":"Standard shipping takes 5-7 business days."}]' } },
  { id: "countdown-1", type: "countdown", label: "Countdown Campaign", visible: false, props: { title: "Big Sale Coming", subtitle: "Get ready for amazing deals", targetDate: "", message: "Sale ends in:", buttonText: "Notify Me", buttonLink: "#", backgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#f59e0b" } },
  { id: "testimonials-1", type: "testimonials", label: "Testimonials", visible: true, props: { title: "What Customers Say", subtitle: "Hear from our happy customers", layout: "grid", cardStyle: "default", backgroundColor: "", avatarStyle: "circle" } },
  { id: "cta-1", type: "cta", label: "Newsletter", visible: true, props: { headline: "Stay in the Loop", subtitle: "Subscribe to get special offers, free giveaways, and exclusive deals.", buttonText: "Subscribe", inputPlaceholder: "Enter your email", backgroundColor: "", backgroundImage: "" } },
  { id: "footer-1", type: "footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocialLinks: "true", contactEmail: "hello@example.com", contactPhone: "+1 (555) 123-4567", contactAddress: "123 Commerce St, NY 10001" } },
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

  const loadedRef = useRef(false);

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
      const nextSections = (page.sections?.length ? page.sections : defaultSections) as BuilderSection[];
      dispatch(loadSections(nextSections));
      dispatch(setPageId(page._id));
      if (!page.sections?.length) {
        savePage({ pageId: page._id, data: { sections: nextSections, theme: currentTheme } })
          .unwrap()
          .catch(() => {});
      }
    } else {
      createPage({ storeId, data: { title: "Home", slug: "home" } })
        .unwrap()
        .then((res) => {
          dispatch(loadSections(defaultSections));
          dispatch(setPageId(res.data!.page._id));
          return savePage({ pageId: res.data!.page._id, data: { sections: defaultSections, theme: currentTheme } }).unwrap();
        })
        .catch(() => {});
    }
  }, [pagesData, dispatch, storeId, createPage, savePage, currentTheme]);

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
        <div className="w-72 flex-shrink-0 border-r border-zinc-200 overflow-hidden bg-white">
          <BuilderSidebar storeId={storeId} />
        </div>
        <div className="flex-1 overflow-y-auto bg-zinc-100">
          <StorePreview
            store={store} theme={currentTheme} products={products} categories={categories}
            settings={settings} sliders={sliders}
            sections={sections as any}
          />
        </div>
        {selectedSectionId && (
          <div className="w-72 flex-shrink-0 border-l border-zinc-200 bg-white overflow-y-auto shadow-sm">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
