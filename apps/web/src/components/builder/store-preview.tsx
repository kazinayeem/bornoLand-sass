"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { StoreSettingsData, HomepageSliderData, ThemeData, StoreData, ProductData, CategoryData } from "@/providers/tenant-provider";
import { BuilderDeviceProvider } from "@/lib/device-context";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import {
  copySection,
  duplicateSection,
  openSectionLibrary,
  removeSection,
  setActiveRightTab,
  setActiveTab,
  setHoveredSection,
  setRightPanelOpen,
  setSelectedSection,
  toggleSection,
  toggleSectionLock,
  updateSectionProps,
} from "@/redux/slices/builder-slice";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { BuilderMediaField } from "@/components/builder/builder-media-field";
import {
  ContextualQuickEdit,
  type QuickEditAnchor,
  type QuickEditMode,
} from "@/components/builder/contextual-quick-edit";
import { setZoom } from "@/redux/slices/preview-slice";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { Layers, Plus } from "lucide-react";

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

  const selectedSection = useSelector((s: RootState) => {
    if (!selectedSectionId) return undefined;
    return (
      s.builder.sections.find((section) => section.id === selectedSectionId)
      ?? s.builder.headerSections.find((section) => section.id === selectedSectionId)
      ?? s.builder.footerSections.find((section) => section.id === selectedSectionId)
    );
  });
  const previewWidth = device === "mobile" ? 375 : device === "tablet" ? 768 : device === "laptop" ? 1280 : 1440;
  const [quickEditMode, setQuickEditMode] = useState<QuickEditMode | null>(null);
  const [quickEditAnchor, setQuickEditAnchor] = useState<QuickEditAnchor | null>(null);
  const canvasScrollerRef = useRef<HTMLDivElement>(null);

  const closeQuickEdit = useCallback(() => {
    setQuickEditMode(null);
    setQuickEditAnchor(null);
    document.querySelectorAll("[data-quick-edit-anchor='true']").forEach((el) => {
      el.removeAttribute("data-quick-edit-anchor");
    });
  }, []);

  const selectCanvasSection = useCallback((sectionId: string) => {
    dispatch(setSelectedSection(sectionId));
    dispatch(setActiveRightTab("content"));
    // Auto-open the right panel so properties are always visible on first selection
    dispatch(setRightPanelOpen(true));
  }, [dispatch]);

  const prevSelectedSectionIdRef = useRef<string | null>(selectedSectionId);
  useEffect(() => {
    if (prevSelectedSectionIdRef.current !== selectedSectionId) {
      if (prevSelectedSectionIdRef.current !== null) {
        closeQuickEdit();
      }
      prevSelectedSectionIdRef.current = selectedSectionId;
    }
  }, [selectedSectionId, closeQuickEdit]);

  const openQuickEdit = useCallback((payload: {
    sectionId: string;
    mode: QuickEditMode;
    anchor: QuickEditAnchor;
  }) => {
    dispatch(setSelectedSection(payload.sectionId));
    setQuickEditMode(payload.mode);
    setQuickEditAnchor(payload.anchor);
  }, [dispatch]);

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
      "logoUrl", "avatarImage", "iconImage", "mapImage",
    ];
    const videoCandidates = ["videoUrl", "videoId", "youtubeUrl", "embedUrl"];

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

    if (quickEditMode === "video") {
      const videoKey = pickFirst(videoCandidates, [...byType("video"), ...byType("url"), ...byType("text")]);
      const posterKey = pickFirst(["posterImage", "imageUrl"], byType("image"));
      const fields = [];
      if (videoKey) fields.push({ key: videoKey, label: selectedSectionDef.props[videoKey]?.label ?? "Video URL", kind: "text" as const });
      if (posterKey) fields.push({ key: posterKey, label: selectedSectionDef.props[posterKey]?.label ?? "Poster", kind: "image" as const });
      return fields.length > 0 ? fields : null;
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

  const renderZoneLabel = () => {
    if (editingZone === "header") {
      return (
        <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-[11px] font-bold text-blue-800 tracking-wide uppercase">
            Editing Global Header
          </span>
        </div>
      );
    }
    if (editingZone === "footer") {
      return (
        <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-violet-200 bg-violet-50/90 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-[11px] font-bold text-violet-800 tracking-wide uppercase">
            Editing Global Footer
          </span>
        </div>
      );
    }
    return null;
  };

  // Pure Body sections (filtering out any legacy header or footer sections)
  const bodySections = sections.filter(
    (s) =>
      !["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "header-bar", "header-logo", "header-nav", "header-icons"].includes(
        normalizeSectionType(s.type)
      )
  );

  const showEmptyState = bodySections.length === 0;

  const emptyState = (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
        <Layers className="h-5 w-5 text-zinc-400" />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-zinc-900">No body content sections</p>
        <p className="max-w-xs text-[13px] leading-5 text-zinc-500">
          Add a section to start building your page content, or browse starting templates.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => dispatch(openSectionLibrary({ insertPosition: null, targetZone: "body" }))}
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2.5 text-[13px] font-medium text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Section
        </button>
        <button
          type="button"
          onClick={() => dispatch(setActiveTab("templates"))}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Browse Templates
        </button>
      </div>
    </div>
  );

  return (
    <BuilderDeviceProvider device={device}>
      <div
        ref={canvasScrollerRef}
        onWheel={handleCanvasWheel}
        onDoubleClick={(event) => {
          if (event.target === event.currentTarget) dispatch(setZoom(100));
        }}
        className="flex min-h-full w-full items-start justify-center overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-6"
        style={{
          backgroundColor: theme.darkMode ? "#09090b" : "#ececef",
          backgroundImage: showGrid
            ? "linear-gradient(rgba(59,130,246,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.08) 1px, transparent 1px)"
            : undefined,
          backgroundSize: showGrid ? "20px 20px" : undefined,
        }}
      >
        {showGuides && (
          <>
            <div className="pointer-events-none fixed inset-y-0 left-1/2 z-20 w-px bg-pink-400/60" />
            <div className="pointer-events-none fixed inset-x-0 top-1/2 z-20 h-px bg-pink-400/60" />
          </>
        )}
        {showGuides && (
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-5 w-full border-b border-zinc-300 bg-white/80 text-[9px] text-apple-ink-muted-48">
            0&nbsp;&nbsp;&nbsp;&nbsp;100&nbsp;&nbsp;&nbsp;&nbsp;200&nbsp;&nbsp;&nbsp;&nbsp;300&nbsp;&nbsp;&nbsp;&nbsp;400&nbsp;&nbsp;&nbsp;&nbsp;500
          </div>
        )}
        <div
          className="relative shrink-0 overflow-x-clip overflow-y-visible rounded-[1.75rem] border border-white/70 bg-white shadow-[0_20px_60px_-24px_rgba(0,0,0,0.28)] transition-transform duration-300 will-change-transform motion-reduce:transition-none"
          style={{
            width: previewWidth,
            maxWidth: "calc(100% - 0px)",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
          data-builder-device-frame="true"
        >
          {renderZoneLabel()}

          <StorefrontFrame
            store={store}
            theme={theme}
            products={liveProducts}
            categories={liveCategories}
            settings={settings}
            sliders={sliders}
            pageSections={sections}
            headerSections={headerSections}
            footerSections={footerSections}
            headerSettings={headerSettings}
            footerSettings={footerSettings}
            footerSection={footerSection}
            builderMode
          >
            {showEmptyState ? (
              emptyState
            ) : (
              <StorefrontCanvas
                sections={bodySections}
                selectedSectionId={selectedSectionId}
                hoveredSectionId={hoveredSectionId}
                onSelectSection={selectCanvasSection}
                onHoverSection={(sectionId) => dispatch(setHoveredSection(sectionId))}
                onQuickEditRequest={openQuickEdit}
                onQuickEditDismiss={closeQuickEdit}
                onInlineTextChange={({ sectionId, key, value }) => {
                  const section = bodySections.find((item) => item.id === sectionId);
                  if (section)
                    dispatch(
                      updateSectionProps({
                        id: sectionId,
                        props: { ...section.props, [key]: value } as Record<string, string>,
                      })
                    );
                }}
                onSectionAction={({ sectionId, action }) => handleCanvasAction(sectionId, action)}
                onQuickInsert={onQuickInsert}
              />
            )}
          </StorefrontFrame>
        </div>

      <ContextualQuickEdit
        open={Boolean(selectedSection && quickEditFields && quickEditMode && quickEditAnchor)}
        mode={quickEditMode ?? "text"}
        anchor={quickEditAnchor}
        selectionKey={`${selectedSectionId ?? ""}:${quickEditMode ?? ""}:${Math.round(quickEditAnchor?.left ?? 0)}:${Math.round(quickEditAnchor?.top ?? 0)}`}
        onClose={closeQuickEdit}
      >
        {selectedSection && quickEditFields ? (
          <>
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
              Double-click text on the canvas to edit in place. Esc or click outside to close.
            </p>
          </>
        ) : null}
      </ContextualQuickEdit>
    </div>
    </BuilderDeviceProvider>
  );
}
