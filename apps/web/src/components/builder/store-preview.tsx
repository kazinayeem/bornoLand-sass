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
import { setZoom, toggleGrid, toggleGuides } from "@/redux/slices/preview-slice";
import { Grid3X3, Map, Maximize2, Minus, Plus, Ruler } from "lucide-react";
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
  const [minimapOpen, setMinimapOpen] = useState(true);
  const [canvasMetrics, setCanvasMetrics] = useState({ scrollTop: 0, scrollHeight: 1, clientHeight: 1 });
  const canvasScrollerRef = useRef<HTMLDivElement>(null);

  const syncCanvasMetrics = useCallback(() => {
    const element = canvasScrollerRef.current;
    if (!element) return;
    const next = { scrollTop: element.scrollTop, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
    setCanvasMetrics((current) => current.scrollTop === next.scrollTop && current.scrollHeight === next.scrollHeight && current.clientHeight === next.clientHeight ? current : next);
  }, []);

  useEffect(() => {
    syncCanvasMetrics();
    const element = canvasScrollerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(syncCanvasMetrics);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sections, headerSections, footerSections, zoom, syncCanvasMetrics]);

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
        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 shadow-lg">
          <span className="text-[11px] font-medium text-blue-700">Editing Header</span>
        </div>
      );
    }
    if (editingZone === "footer") {
      return (
        <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 shadow-lg">
          <span className="text-[11px] font-medium text-purple-700">Editing Footer</span>
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
    <div ref={canvasScrollerRef} onScroll={syncCanvasMetrics} onWheel={handleCanvasWheel} onDoubleClick={(event) => { if (event.target === event.currentTarget) dispatch(setZoom(100)); }} className="relative flex items-start justify-center overflow-x-hidden overflow-y-auto p-2 sm:p-3"
      style={{ backgroundColor: theme.darkMode ? "#09090b" : "#f4f4f5", minHeight: "100%", backgroundImage: showGrid ? "linear-gradient(rgba(59,130,246,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.14) 1px, transparent 1px)" : undefined, backgroundSize: showGrid ? "20px 20px" : undefined }}>
      {showGuides && <><div className="pointer-events-none fixed inset-y-0 left-1/2 z-20 w-px bg-pink-400/60" /><div className="pointer-events-none fixed inset-x-0 top-1/2 z-20 h-px bg-pink-400/60" /></>}
      {showGuides && <div className="pointer-events-none absolute left-0 top-0 z-20 h-5 w-full border-b border-zinc-300 bg-white/80 text-[9px] text-zinc-400">0&nbsp;&nbsp;&nbsp;&nbsp;100&nbsp;&nbsp;&nbsp;&nbsp;200&nbsp;&nbsp;&nbsp;&nbsp;300&nbsp;&nbsp;&nbsp;&nbsp;400&nbsp;&nbsp;&nbsp;&nbsp;500</div>}
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_-40px_rgba(0,0,0,0.32)] transition-all duration-300"
        style={{ width: previewWidth, maxWidth: "100%", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
        {renderZoneLabel()}
        {!isZoneMode && selectedSection && quickEditFields && quickEditMode !== "text" && (
          <div className="absolute right-3 top-3 z-20 w-72 rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick Edit</p>
                <p className="text-sm font-semibold text-zinc-900">{quickEditMode === "button" ? "Button editing" : "Image editing"}</p>
              </div>
              <button onClick={() => setQuickEditMode(null)} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100">
                {quickEditMode === "button" ? <Copy className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {quickEditFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-500">{field.label}</label>
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
                      className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:bg-white"
                    />
                  )}
                </div>
              ))}
              <p className="text-[11px] leading-5 text-zinc-500">
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
      {selectedSection && <SpacingOverlay section={selectedSection} />}
      <CanvasControls zoom={zoom} showGrid={showGrid} showGuides={showGuides} onZoom={(next) => dispatch(setZoom(next))} onGrid={() => dispatch(toggleGrid())} onGuides={() => dispatch(toggleGuides())} onFit={() => dispatch(setZoom(90))} onReset={() => dispatch(setZoom(100))} onToggleMinimap={() => setMinimapOpen((open) => !open)} />
      {minimapOpen && <MiniMap sections={activeSections} metrics={canvasMetrics} onNavigate={(ratio) => canvasScrollerRef.current?.scrollTo({ top: ratio * Math.max(0, canvasMetrics.scrollHeight - canvasMetrics.clientHeight), behavior: "smooth" })} />}
    </div>
    </BuilderDeviceProvider>
  );
}

function SpacingOverlay({ section }: { section: { id: string; style?: { paddingTop?: string; paddingRight?: string; paddingBottom?: string; paddingLeft?: string; marginTop?: string; marginRight?: string; marginBottom?: string; marginLeft?: string; gap?: string } } }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    const element = document.querySelector(`[data-builder-section-id="${section.id}"]`) as HTMLElement | null;
    if (!element) return;
    const update = () => setRect(element.getBoundingClientRect());
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("scroll", update, true);
    return () => { observer.disconnect(); window.removeEventListener("scroll", update, true); };
  }, [section.id]);
  if (!rect) return null;
  const style = section.style ?? {};
  const padding = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].filter(Boolean).join(" / ") || "0px";
  const margin = [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].filter(Boolean).join(" / ") || "0px";
  const gap = String(style.gap ?? "0px");
  return <>
    <div className="pointer-events-none fixed z-[55] border-2 border-orange-400/80 bg-orange-400/5" style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }} />
    <div className="pointer-events-none fixed z-[56] border-2 border-emerald-400/80" style={{ top: rect.top + 4, left: rect.left + 4, width: Math.max(0, rect.width - 8), height: Math.max(0, rect.height - 8) }} />
    <div className="pointer-events-none fixed z-[60] flex max-w-[calc(100vw-16px)] flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white/95 p-1.5 text-[10px] font-medium shadow-lg backdrop-blur" style={{ top: Math.max(6, rect.bottom + 8), left: Math.max(8, rect.left) }}>
      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">Margin {margin}</span>
      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">Padding {padding}</span>
      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">Gap {gap}</span>
      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">{Math.round(rect.width)} × {Math.round(rect.height)}</span>
    </div>
  </>;
}

function CanvasControls({ zoom, showGrid, showGuides, onZoom, onGrid, onGuides, onFit, onReset, onToggleMinimap }: { zoom: number; showGrid: boolean; showGuides: boolean; onZoom: (value: number) => void; onGrid: () => void; onGuides: () => void; onFit: () => void; onReset: () => void; onToggleMinimap: () => void }) {
  const button = "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900";
  return <div className="sticky bottom-4 z-40 ml-auto mt-auto flex w-fit items-center gap-1 rounded-xl border border-zinc-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur">
    <button type="button" className={button} title="Zoom out" onClick={() => onZoom(zoom - 25)}><Minus className="h-3.5 w-3.5" /></button>
    <button type="button" className="min-w-12 rounded-lg px-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100" title="Reset zoom" onClick={onReset}>{zoom}%</button>
    <button type="button" className={button} title="Zoom in" onClick={() => onZoom(zoom + 25)}><Plus className="h-3.5 w-3.5" /></button>
    <i className="mx-0.5 h-5 w-px bg-zinc-200" />
    <button type="button" className={button} title="Fit canvas" onClick={onFit}><Maximize2 className="h-3.5 w-3.5" /></button>
    <button type="button" className={cn(button, showGrid && "bg-blue-50 text-blue-600")} title="Toggle grid" onClick={onGrid}><Grid3X3 className="h-3.5 w-3.5" /></button>
    <button type="button" className={cn(button, showGuides && "bg-blue-50 text-blue-600")} title="Toggle guides" onClick={onGuides}><Ruler className="h-3.5 w-3.5" /></button>
    <button type="button" className={button} title="Toggle mini map" onClick={onToggleMinimap}><Map className="h-3.5 w-3.5" /></button>
  </div>;
}

function MiniMap({ sections, metrics, onNavigate }: { sections: StorefrontSectionLike[]; metrics: { scrollTop: number; scrollHeight: number; clientHeight: number }; onNavigate: (ratio: number) => void }) {
  const height = Math.max(36, Math.min(112, (metrics.clientHeight / metrics.scrollHeight) * 112));
  const top = Math.min(112 - height, (metrics.scrollTop / Math.max(1, metrics.scrollHeight - metrics.clientHeight)) * (112 - height));
  return <button type="button" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); onNavigate(Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))); }} className="sticky bottom-4 right-0 z-40 ml-4 mt-auto block h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white/95 p-2 text-left shadow-xl backdrop-blur" title="Navigate page">
    <div className="mb-1 flex items-center gap-1 text-[9px] font-semibold text-zinc-500"><Map className="h-3 w-3" /> MAP</div>
    <div className="relative h-28 overflow-hidden rounded bg-zinc-100 p-1">
      <div className="space-y-1">{sections.map((section, index) => <div key={section.id} className="h-2 rounded bg-zinc-300" style={{ width: `${55 + ((index * 19) % 42)}%` }} />)}</div>
      <div className="absolute left-0 right-0 border border-blue-500 bg-blue-400/15" style={{ top, height }} />
    </div>
  </button>;
}
