"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { StoreSettingsData, HomepageSliderData, ThemeData, StoreData, ProductData, CategoryData } from "@/providers/tenant-provider";
import { BuilderDeviceProvider } from "@/lib/device-context";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import { copySection, duplicateSection, moveSection, removeSection, setHoveredSection, setSelectedSection, toggleSection, toggleSectionLock, updateSectionProps } from "@/redux/slices/builder-slice";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { Copy, Eye, EyeOff, ImagePlus, Lock, LockOpen, MoveDown, MoveUp, Pencil, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { BuilderMediaField } from "@/components/builder/builder-media-field";
import { setZoom } from "@/redux/slices/preview-slice";
import { cn } from "@/lib/utils";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";

type StorePreviewProps = {
  store: StoreData;
  theme: ThemeData;
  products?: ProductData[];
  categories?: CategoryData[];
  settings?: StoreSettingsData;
  sliders?: HomepageSliderData[];
  sections: StorefrontSectionLike[];
  headerSections?: StorefrontSectionLike[];
  footerSections?: StorefrontSectionLike[];
};

export function StorePreview({ store, theme, products = [], categories = [], settings = {} as StoreSettingsData, sliders = [], sections, headerSections = [], footerSections = [], onQuickInsert }: StorePreviewProps & { onQuickInsert?: (index: number, event: React.MouseEvent) => void }) {
  const dispatch = useDispatch();
  const { data: productData } = useGetProductsQuery(store._id, { skip: !store._id || products.length > 0 });
  const { data: categoryData } = useGetCategoriesQuery(store._id, { skip: !store._id || categories.length > 0 });
  const liveProducts = products.length > 0 ? products : (productData?.data?.products ?? []);
  const liveCategories = categories.length > 0 ? categories : (categoryData?.data?.categories ?? []);
  const device = useSelector((s: RootState) => s.preview.device);
  const zoom = useSelector((s: RootState) => s.preview.zoom);
  const showGrid = useSelector((s: RootState) => s.preview.showGrid);
  const showGuides = useSelector((s: RootState) => s.preview.showGuides);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const hoveredSectionId = useSelector((s: RootState) => s.builder.hoveredSectionId);
  const headerSettings = useSelector((s: RootState) => s.builder.headerSettings);
  const footerSettings = useSelector((s: RootState) => s.builder.footerSettings);
  const allSections = sections;
  const activeZoneSections = editingZone === "header" ? headerSections
    : editingZone === "footer" ? footerSections
    : sections;

  const selectedSection = useSelector((s: RootState) => {
    const zone = s.builder.editingZone;
    const list = zone === "header" ? s.builder.headerSections : zone === "footer" ? s.builder.footerSections : s.builder.sections;
    return list.find((section) => section.id === selectedSectionId);
  });
  const selectedSectionIndex = useSelector((s: RootState) => {
    const zone = s.builder.editingZone;
    const list = zone === "header" ? s.builder.headerSections : zone === "footer" ? s.builder.footerSections : s.builder.sections;
    return list.findIndex((section) => section.id === selectedSectionId);
  });
  const totalSections = useSelector((s: RootState) => {
    const zone = s.builder.editingZone;
    const list = zone === "header" ? s.builder.headerSections : zone === "footer" ? s.builder.footerSections : s.builder.sections;
    return list.length;
  });
  const previewWidth = device === "mobile" ? 390 : device === "tablet" ? 820 : device === "laptop" ? 1024 : 1280;
  const [quickEditMode, setQuickEditMode] = useState<"text" | "image" | "button" | null>(null);
  const canvasScrollerRef = useRef<HTMLDivElement>(null);

  const handleCanvasWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    dispatch(setZoom(zoom + (event.deltaY < 0 ? 10 : -10)));
  };

  // Footer from footerSections when editing footer, or from body sections as fallback
  const footerSection = editingZone === "footer"
    ? (footerSections.find((s) => ["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type))) ?? null)
    : (footerSections.find((s) => ["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type)))
        ?? sections.find((s) => ["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type)))
        ?? null);
  const navSections = sections.filter((s) => !["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type)));
  const selectedSectionDef = selectedSection ? getSectionDef(selectedSection.type) : null;

  const quickEditFields = useMemo(() => {
    if (!selectedSection || !selectedSectionDef || !quickEditMode) return null;

    const entries = Object.entries(selectedSectionDef.props);
    const byType = (propType: string) => entries.filter(([, def]) => def.type === propType).map(([key]) => key);
    const textCandidates = ["headline", "title", "productName", "text", "kicker", "subheadline", "subtitle", "description", "content"];
    const buttonCandidates = ["buttonText", "secondaryButtonText", "linkText"];
    const imageCandidates = [
      "imageUrl", "bgImage", "productImage", "posterImage", "mobileImageUrl",
      "slide1Image", "slide2Image", "slide3Image", "beforeImage", "afterImage",
    ];

    const pickFirst = (candidates: string[], fallbackKeys: string[]) =>
      candidates.find((key) => selectedSection.props[key] !== undefined) ?? fallbackKeys[0] ?? null;

    if (quickEditMode === "text") {
      const textKey = pickFirst(textCandidates, [...byType("text"), ...byType("textarea")]);
      return textKey ? [{ key: textKey, label: selectedSectionDef.props[textKey]?.label ?? "Text", kind: "text" as const }] : null;
    }

    if (quickEditMode === "button") {
      const buttonTextKey = pickFirst(buttonCandidates, byType("text"));
      const buttonLinkKey =
        ["buttonLink", "secondaryButtonLink", "link"].find((key) => selectedSection.props[key] !== undefined) ??
        byType("url")[0] ??
        null;
      const fields = [];
      if (buttonTextKey) fields.push({ key: buttonTextKey, label: selectedSectionDef.props[buttonTextKey]?.label ?? "Button text", kind: "text" as const });
      if (buttonLinkKey) fields.push({ key: buttonLinkKey, label: selectedSectionDef.props[buttonLinkKey]?.label ?? "Button link", kind: "text" as const });
      return fields.length > 0 ? fields : null;
    }

    if (quickEditMode === "image") {
      const imageKey = pickFirst(imageCandidates, byType("image"));
      return imageKey ? [{ key: imageKey, label: selectedSectionDef.props[imageKey]?.label ?? "Image", kind: "image" as const }] : null;
    }

    return null;
  }, [quickEditMode, selectedSection, selectedSectionDef]);

  const updateQuickEditField = (key: string, value: string) => {
    if (!selectedSection) return;
    dispatch(updateSectionProps({ id: selectedSection.id, props: { ...selectedSection.props, [key]: value } }));
  };

  const handleCanvasAction = (sectionId: string, action: "duplicate" | "delete" | "hide" | "lock" | "copy") => {
    if (action === "duplicate") dispatch(duplicateSection(sectionId));
    if (action === "delete") dispatch(removeSection(sectionId));
    if (action === "hide") dispatch(toggleSection(sectionId));
    if (action === "lock") dispatch(toggleSectionLock(sectionId));
    if (action === "copy") dispatch(copySection(sectionId));
  };

  const selectedSectionName = selectedSection ? (getSectionDef(selectedSection.type)?.label ?? selectedSection.label ?? selectedSection.type) : null;

  const renderZoneLabel = () => {
    if (editingZone === "header") {
      return (
        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-apple-pill border border-apple-primary/20 bg-apple-primary/5 px-4 py-2 shadow-lg backdrop-blur-sm">
          <span className="text-caption font-medium text-apple-primary">Editing top bar</span>
        </div>
      );
    }
    if (editingZone === "footer") {
      return (
        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-apple-pill border border-violet-200 bg-violet-50 px-4 py-2 shadow-lg backdrop-blur-sm">
          <span className="text-caption font-medium text-violet-700">Editing bottom</span>
        </div>
      );
    }
    return null;
  };

  const activeSections = editingZone === "header" ? headerSections
    : editingZone === "footer" ? footerSections
    : sections;

  const activeNavSections = editingZone === "footer"
    ? []
    : editingZone === "header"
    ? []
    : activeSections.filter((s) => !["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "header-bar", "header-logo", "header-nav", "header-icons"].includes(normalizeSectionType(s.type)));

  // When editing header or footer, render only the zone's sections directly
  const isZoneMode = editingZone === "header" || editingZone === "footer";
  const zoneSections = editingZone === "header" ? headerSections : footerSections;

  return (
    <BuilderDeviceProvider device={device}>
    <div ref={canvasScrollerRef} onWheel={handleCanvasWheel} onDoubleClick={(event) => { if (event.target === event.currentTarget) dispatch(setZoom(100)); }} className="flex min-h-full w-full items-start justify-center overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-6"
      style={{ backgroundColor: theme.darkMode ? "#09090b" : "#ececef", backgroundImage: showGrid ? "linear-gradient(rgba(59,130,246,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.08) 1px, transparent 1px)" : undefined, backgroundSize: showGrid ? "20px 20px" : undefined }}>
      {showGuides && <><div className="pointer-events-none fixed inset-y-0 left-1/2 z-20 w-px bg-pink-400/60" /><div className="pointer-events-none fixed inset-x-0 top-1/2 z-20 h-px bg-pink-400/60" /></>}
      {showGuides && <div className="pointer-events-none absolute left-0 top-0 z-20 h-5 w-full border-b border-zinc-300 bg-white/80 text-[9px] text-apple-ink-muted-48">0&nbsp;&nbsp;&nbsp;&nbsp;100&nbsp;&nbsp;&nbsp;&nbsp;200&nbsp;&nbsp;&nbsp;&nbsp;300&nbsp;&nbsp;&nbsp;&nbsp;400&nbsp;&nbsp;&nbsp;&nbsp;500</div>}
      <div
        className="relative shrink-0 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_20px_60px_-24px_rgba(0,0,0,0.28)] transition-transform duration-300 will-change-transform motion-reduce:transition-none"
        style={{ width: previewWidth, maxWidth: "calc(100vw - 2rem)", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
        {renderZoneLabel()}
        {!isZoneMode && selectedSection && quickEditFields && quickEditMode !== "text" && (
          <div className="absolute right-3 top-3 z-20 w-72 rounded-2xl border border-apple-hairline bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">Quick Edit</p>
                <p className="text-sm font-semibold text-apple-ink">{quickEditMode === "button" ? "Button editing" : "Image editing"}</p>
              </div>
              <button onClick={() => setQuickEditMode(null)} className="rounded-full p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment">
                {quickEditMode === "button" ? <Copy className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {quickEditFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-[11px] font-medium text-apple-ink-muted-48">{field.label}</label>
                  {field.kind === "image" ? (
                    <BuilderMediaField
                      storeId={store._id}
                      storeSlug={store.slug}
                      propKey={field.key}
                      sectionProps={selectedSection.props}
                      onPropsChange={(nextProps) => {
                        dispatch(updateSectionProps({
                          id: selectedSection.id,
                          props: nextProps as typeof selectedSection.props,
                        }));
                      }}
                    />
                  ) : (
                    <input
                      value={selectedSection.props[field.key] ?? ""}
                      onChange={(event) => updateQuickEditField(field.key, event.target.value)}
                      className="h-10 w-full rounded-2xl border border-zinc-200 bg-apple-canvas-parchment px-3 text-sm text-apple-ink outline-none transition-colors focus:border-zinc-400 focus:bg-white"
                    />
                  )}
                </div>
              ))}
              <p className="text-[11px] leading-5 text-apple-ink-muted-48">
                Double-click text in the canvas to edit copy directly. Click images or buttons in the preview to jump into focused quick edits instead of opening the full inspector.
              </p>
            </div>
          </div>
        )}
        {isZoneMode ? (
          /* Zone editing mode: render header or footer sections directly */
          <div className="min-h-[200px] p-4">
            <StorefrontCanvas
              sections={zoneSections}
              selectedSectionId={selectedSectionId}
              hoveredSectionId={hoveredSectionId}
              onSelectSection={(sectionId) => dispatch(setSelectedSection(sectionId))}
              onHoverSection={(sectionId) => dispatch(setHoveredSection(sectionId))}
              onQuickEditRequest={({ sectionId, mode }) => {
                dispatch(setSelectedSection(sectionId));
                setQuickEditMode(mode);
              }}
              onInlineTextChange={({ sectionId, key, value }) => {
                const section = zoneSections.find((item) => item.id === sectionId);
                if (section) dispatch(updateSectionProps({ id: sectionId, props: { ...section.props, [key]: value } as Record<string, string> }));
              }}
              onSectionAction={({ sectionId, action }) => handleCanvasAction(sectionId, action)}
              onQuickInsert={onQuickInsert}
            />
          </div>
        ) : (
        <StorefrontFrame
          store={store}
          theme={theme}
          products={liveProducts}
          categories={liveCategories}
          settings={settings}
          sliders={sliders}
          pageSections={activeSections}
          headerSections={headerSections}
          footerSections={footerSections}
          headerSettings={headerSettings}
          footerSettings={footerSettings}
          footerSection={footerSection}
          builderMode
        >
          <StorefrontCanvas
            sections={activeNavSections}
            selectedSectionId={selectedSectionId}
            hoveredSectionId={hoveredSectionId}
            onSelectSection={(sectionId) => dispatch(setSelectedSection(sectionId))}
            onHoverSection={(sectionId) => dispatch(setHoveredSection(sectionId))}
            onQuickEditRequest={({ sectionId, mode }) => {
              dispatch(setSelectedSection(sectionId));
              setQuickEditMode(mode);
            }}
            onInlineTextChange={({ sectionId, key, value }) => {
              const section = activeNavSections.find((item) => item.id === sectionId);
              if (section) dispatch(updateSectionProps({ id: sectionId, props: { ...section.props, [key]: value } as Record<string, string> }));
            }}
            onSectionAction={({ sectionId, action }) => handleCanvasAction(sectionId, action)}
            onQuickInsert={onQuickInsert}
          />
        </StorefrontFrame>
        )}
      </div>
    </div>
    </BuilderDeviceProvider>
  );
}
