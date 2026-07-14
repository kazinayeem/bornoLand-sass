"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { StoreSettingsData, HomepageSliderData, ThemeData, StoreData, ProductData, CategoryData } from "@/providers/tenant-provider";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import { duplicateSection, moveSection, removeSection, setHoveredSection, setSelectedSection, toggleSection, toggleSectionLock, updateSectionProps } from "@/redux/slices/builder-slice";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { Copy, Eye, EyeOff, ImagePlus, Lock, LockOpen, MoveDown, MoveUp, Pencil, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { BuilderMediaField } from "@/components/builder/builder-media-field";

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

export function StorePreview({ store, theme, products = [], categories = [], settings = {} as StoreSettingsData, sliders = [], sections, headerSections = [], footerSections = [], onQuickInsert }: StorePreviewProps & { onQuickInsert?: (index: number) => void }) {
  const dispatch = useDispatch();
  const device = useSelector((s: RootState) => s.preview.device);
  const zoom = useSelector((s: RootState) => s.preview.zoom);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const hoveredSectionId = useSelector((s: RootState) => s.builder.hoveredSectionId);
  const selectedSection = useSelector((s: RootState) => s.builder.sections.find((section) => section.id === selectedSectionId));
  const selectedSectionIndex = useSelector((s: RootState) => s.builder.sections.findIndex((section) => section.id === selectedSectionId));
  const totalSections = useSelector((s: RootState) => s.builder.sections.length);
  const previewWidth = device === "mobile" ? 390 : device === "tablet" ? 820 : 1280;
  const [quickEditMode, setQuickEditMode] = useState<"text" | "image" | "button" | null>(null);

  const footerSection = sections.find((s) => ["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type))) ?? null;
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
    : activeSections.filter((s) => !["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer"].includes(normalizeSectionType(s.type)));

  return (
    <div className="flex items-start justify-center overflow-x-hidden overflow-y-auto p-6 sm:p-8"
      style={{ backgroundColor: theme.darkMode ? "#09090b" : "#f4f4f5", minHeight: "100%" }}>
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_-40px_rgba(0,0,0,0.32)] transition-all duration-300"
        style={{ width: previewWidth, maxWidth: "100%", transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
        {renderZoneLabel()}
        {selectedSection && (
          <div className="sticky top-4 z-30 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-zinc-200/80 bg-white/95 px-2 py-1 shadow-lg backdrop-blur overflow-x-auto">
            <span className="shrink-0 px-2 text-[11px] font-medium text-zinc-700 truncate max-w-[100px]">{selectedSection.label}</span>
            <button onClick={() => dispatch(duplicateSection(selectedSection.id))} className="shrink-0 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"><Copy className="h-3.5 w-3.5" /></button>
            <button onClick={() => dispatch(toggleSection(selectedSection.id))} className="shrink-0 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100">
              {selectedSection.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => dispatch(toggleSectionLock(selectedSection.id))} className="shrink-0 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100">
              {selectedSection.locked ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => selectedSectionIndex > 0 && dispatch(moveSection({ from: selectedSectionIndex, to: selectedSectionIndex - 1 }))}
              className="shrink-0 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
              disabled={selectedSectionIndex <= 0}
            >
              <MoveUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => selectedSectionIndex < totalSections - 1 && dispatch(moveSection({ from: selectedSectionIndex, to: selectedSectionIndex + 1 }))}
              className="shrink-0 rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
              disabled={selectedSectionIndex >= totalSections - 1}
            >
              <MoveDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => dispatch(removeSection(selectedSection.id))} className="shrink-0 rounded-full p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        )}
        {selectedSection && quickEditFields && (
          <div className="sticky top-16 z-20 mx-4 mb-4 w-auto sm:w-80 rounded-3xl border border-zinc-200/80 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick Edit</p>
                <p className="text-sm font-semibold text-zinc-900">{quickEditMode === "text" ? "Inline text editing" : quickEditMode === "button" ? "Button editing" : "Image editing"}</p>
              </div>
              <button onClick={() => setQuickEditMode(null)} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100">
                {quickEditMode === "text" ? <Pencil className="h-3.5 w-3.5" /> : quickEditMode === "button" ? <Copy className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
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
        <StorefrontFrame
          store={store}
          theme={theme}
          products={products}
          categories={categories}
          settings={settings}
          sliders={sliders}
          pageSections={activeSections}
          footerSection={editingZone !== "footer" ? footerSection : null}
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
            onQuickInsert={onQuickInsert}
          />
        </StorefrontFrame>
      </div>
    </div>
  );
}
