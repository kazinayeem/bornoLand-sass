"use client";

import { useCallback, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  updateSectionProps, updateSectionStyle, updateSectionResponsive,
  setSelectedSection, updateSectionMeta, setActiveRightTab,
  toggleRightPanel, setRightPanelPinned,
} from "@/redux/slices/builder-slice";
import type { RightTab, SectionStyle } from "@/redux/slices/builder-slice";
import {
  X, Type, Layers, AlignLeft, PaintBucket, Ruler, ChevronDown,
  Lightbulb, Sparkles, MonitorSmartphone, Box, Globe, Eye, Pin,
  Smartphone, Tablet, Monitor, Square, Maximize2, Minus, Plus,
  Image, RefreshCw, GripVertical,
  ArrowUp, ArrowDown, Copy, Settings2,
} from "lucide-react";
import { getSectionDef, type SectionPropDef } from "@/lib/section-registry";
import { getSectionEditor } from "@/components/builder/section-editors";
import { BuilderMediaField } from "@/components/builder/builder-media-field";
import { MediaPicker } from "@/components/media/media-picker";
import { RepeaterEditor, type RepeaterField } from "@/components/builder/repeater-editor";
import { HeaderBuilderSettings } from "@/components/builder/header-builder-settings";
import { FooterBuilderSettings } from "@/components/builder/footer-builder-settings";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";
import { normalizeCssLength } from "@/lib/section-style";
import { styleChangesToProps } from "@/lib/resolve-section-visuals";
import type { MediaSelection } from "@/lib/media-selection";
import { isVideoUrl } from "@/lib/builder-media-urls";
import {
  AdvancedDetails,
  BuilderColorPicker,
  ButtonPresetControl,
  FontFamilyControl,
  FontSizeControl,
  FontWeightControl,
  GradientPresetControl,
  LINE_HEIGHT_PRESETS,
  LETTER_SPACING_PRESETS,
  MaxWidthControl,
  OpacityControl,
  PresetChips,
  RadiusControl,
  SHADOW_PRESETS,
  SpacingSlider,
  TEXT_SHADOW_PRESETS,
  TextAlignControl,
  TextTransformControl,
  VisualSlider,
} from "@/components/builder/controls/visual-controls";

function ColorInput({ value, onChange, brandColors }: { value: string; onChange: (v: string) => void; brandColors?: string[] }) {
  return <BuilderColorPicker value={value} onChange={onChange} brandColors={brandColors} />;
}

function RangeInput({ value, onChange, min, max, step, suffix }: { value: string; onChange: (v: string) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <VisualSlider
      value={value}
      onChange={onChange}
      min={min ?? 0}
      max={max ?? 100}
      step={step ?? 1}
      suffix={suffix}
    />
  );
}

function SpacingInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <SpacingSlider value={value} onChange={onChange} label={label} />;
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none">
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function ToggleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isOn = value === "true";
  return (
    <button onClick={() => onChange(isOn ? "false" : "true")}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isOn ? "bg-zinc-900" : "bg-zinc-200"}`}>
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
  );
}

// ─── Section-defined property controls ────────────────────────────

function ControlRenderer({
  propDef, propKey, value, onChange, onSectionPropsChange, sectionProps, storeId, storeSlug, brandColors,
}: {
  propDef: SectionPropDef; propKey: string; value: string; onChange: (v: string) => void;
  onSectionPropsChange: (props: Record<string, string | undefined>) => void;
  sectionProps: Record<string, string | undefined>; storeId: string; storeSlug: string;
  brandColors?: string[];
}) {
  switch (propDef.type) {
    case "color": return <ColorInput value={value} onChange={onChange} brandColors={brandColors} />;
    case "image": return <BuilderMediaField storeId={storeId} storeSlug={storeSlug} propKey={propKey} sectionProps={sectionProps} onPropsChange={onSectionPropsChange} />;
    case "range": return <RangeInput value={value} onChange={onChange} min={propDef.min} max={propDef.max} step={propDef.step} />;
    case "toggle": return <ToggleInput value={value} onChange={onChange} />;
    case "select":
    case "grid-columns":
      return <SelectInput value={value || ""} onChange={onChange} options={propDef.options ?? []} />;
    case "textarea": return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={propDef.placeholder}
      className="h-auto min-h-[56px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />;
    case "number": return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />;
    case "video":
      return (
        <div className="space-y-1.5">
          <TextInput value={value} onChange={onChange} placeholder={propDef.placeholder || "https://youtube.com/... or .mp4"} />
          {value && !isVideoUrl(value) ? (
            <p className="text-[10px] text-red-600">Enter a valid YouTube, Vimeo, or MP4 URL</p>
          ) : null}
          <BuilderMediaField
            storeId={storeId}
            storeSlug={storeSlug}
            propKey={propKey}
            sectionProps={sectionProps}
            onPropsChange={onSectionPropsChange}
          />
        </div>
      );
    case "url": return <TextInput value={value} onChange={onChange} placeholder={propDef.placeholder} />;
    default: return <TextInput value={value} onChange={onChange} placeholder={propDef.placeholder} />;
  }
}

// ─── Tab icons & labels ───────────────────────────────────────────

function GroupIcon({ group }: { group?: string }) {
  switch (group) {
    case "content": return <Type className="h-3 w-3" />;
    case "layout": return <Layers className="h-3 w-3" />;
    case "background": return <PaintBucket className="h-3 w-3" />;
    case "typography": return <AlignLeft className="h-3 w-3" />;
    case "spacing": return <Ruler className="h-3 w-3" />;
    case "advanced": return <Lightbulb className="h-3 w-3" />;
    case "border": return <Square className="h-3 w-3" />;
    case "shadow": return <Maximize2 className="h-3 w-3" />;
    default: return null;
  }
}

const groupLabels: Record<string, string> = {
  content: "Content", layout: "Layout", background: "Background",
  typography: "Typography", spacing: "Spacing", advanced: "Advanced",
};

const groupOrder = ["content", "layout", "background", "typography", "spacing", "advanced"];

const PRIMARY_TABS: Array<{ key: RightTab; label: string; icon: typeof Type }> = [
  { key: "content", label: "Content", icon: Type },
  { key: "style", label: "Style", icon: PaintBucket },
  { key: "layout", label: "Layout", icon: Box },
];

const ADVANCED_TABS: Array<{ key: RightTab; label: string; icon: typeof Type }> = [
  { key: "responsive", label: "Responsive", icon: MonitorSmartphone },
  { key: "animation", label: "Animation", icon: Sparkles },
  { key: "seo", label: "SEO", icon: Globe },
  { key: "advanced", label: "Advanced", icon: Lightbulb },
];

// ─── Collapsible group wrapper ────────────────────────────────────

function CollapsibleGroup({
  label, icon, children, collapsed, onToggle,
}: {
  label: string; icon?: React.ReactNode; children: React.ReactNode;
  collapsed: boolean; onToggle: () => void;
}) {
  return (
    <div>
      <button onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48 hover:bg-apple-canvas-parchment">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className={`transition-transform ${collapsed ? "" : "rotate-180"}`}>
          <ChevronDown className="h-3 w-3" />
        </span>
      </button>
      {!collapsed && <div className="px-3 py-2 space-y-2.5">{children}</div>}
    </div>
  );
}

function ControlRow({ label, children, responsive }: { label: string; children: React.ReactNode; responsive?: boolean }) {
  return (
    <div>
      <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-apple-ink-muted-48">
        {label}
        {responsive && <span className="rounded bg-blue-50 px-1 text-[8px] font-bold text-blue-500">R</span>}
      </label>
      {children}
    </div>
  );
}

function StyleBackgroundInput({
  value,
  mediaId,
  onChange,
}: {
  value: string;
  mediaId?: string;
  onChange: (selection: MediaSelection) => void;
}) {
  const { storeId, storeSlug } = useRequiredStore();
  const selection: MediaSelection = mediaId ? { url: value, mediaId } : { url: value };

  return (
    <MediaPicker
      storeId={storeId}
      billingHref={`/store/${storeSlug}/billing`}
      value={selection}
      onChange={onChange}
      compact
      hideLabel
      allowUrlPaste
    />
  );
}

// ─── Main Panel ──────────────────────────────────────────────────

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const { storeId, storeSlug, store } = useRequiredStore();
  const brandColors = useMemo(() => {
    const theme = store?.theme;
    return [theme?.primaryColor, theme?.secondaryColor, store?.brandColor, store?.accentColor]
      .filter((c): c is string => Boolean(c && typeof c === "string"));
  }, [store]);
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const section = useSelector((s: RootState) => {
    if (!selectedId) return undefined;
    return (
      s.builder.sections.find((sec) => sec.id === selectedId)
      ?? s.builder.headerSections.find((sec) => sec.id === selectedId)
      ?? s.builder.footerSections.find((sec) => sec.id === selectedId)
    );
  });
  const activeRightTab = useSelector((s: RootState) => s.builder.activeRightTab);
  const rightPanelPinned = useSelector((s: RootState) => s.builder.rightPanelPinned);
  const device = useSelector((s: RootState) => s.preview.device);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(["bg", "border", "shadow", "opacity", "btnStyle", "entrance", "motion", "gapRadius", "sizing"]));
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ─── Repeater configs (static, defined outside conditional) ─────────────────
  const repeaterConfigs: Record<string, { field: keyof SectionStyle; title: string; addLabel: string; fields: RepeaterField[] }> = {
    faq: {
      field: "faqItems", title: "FAQ Items", addLabel: "Add Question",
      fields: [
        { key: "question", label: "Question", type: "text", placeholder: "Enter question..." },
        { key: "answer", label: "Answer", type: "textarea", placeholder: "Enter answer..." },
      ],
    },
    accordion: {
      field: "accordionItems", title: "Accordion Items", addLabel: "Add Item",
      fields: [
        { key: "title", label: "Title", type: "text", placeholder: "Section title..." },
        { key: "content", label: "Content", type: "textarea", placeholder: "Section content..." },
      ],
    },
    "team-members": {
      field: "teamMembers", title: "Team Members", addLabel: "Add Member",
      fields: [
        { key: "name", label: "Name", type: "text", placeholder: "Full name..." },
        { key: "role", label: "Role", type: "text", placeholder: "Job title..." },
        { key: "bio", label: "Bio", type: "textarea", placeholder: "Short bio..." },
        { key: "image", label: "Image", type: "image" },
        { key: "twitter", label: "Twitter URL", type: "url", placeholder: "https://twitter.com/..." },
        { key: "linkedin", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/..." },
      ],
    },
    "trust-badges": {
      field: "trustBadgeItems", title: "Trust Badges", addLabel: "Add Badge",
      fields: [
        { key: "title", label: "Title", type: "text", placeholder: "Badge title..." },
        { key: "description", label: "Description", type: "text", placeholder: "Badge description..." },
        { key: "icon", label: "Icon (emoji)", type: "text", placeholder: "🔒" },
      ],
    },
    testimonials: {
      field: "testimonialItems", title: "Testimonials", addLabel: "Add Testimonial",
      fields: [
        { key: "name", label: "Name", type: "text", placeholder: "Customer name..." },
        { key: "role", label: "Role", type: "text", placeholder: "Verified Buyer" },
        { key: "text", label: "Review Text", type: "textarea", placeholder: "Customer review..." },
        { key: "rating", label: "Rating (1-5)", type: "number", placeholder: "5" },
        { key: "avatar", label: "Avatar", type: "image" },
        { key: "badge", label: "Badge", type: "text", placeholder: "Verified Purchase" },
      ],
    },
    "image-carousel": {
      field: "slides", title: "Carousel Slides", addLabel: "Add Slide",
      fields: [
        { key: "image", label: "Image", type: "image" },
        { key: "mobileImage", label: "Mobile Image", type: "image" },
        { key: "alt", label: "Alt Text", type: "text", placeholder: "Describe the image..." },
        { key: "badge", label: "Badge", type: "text", placeholder: "New" },
        { key: "title", label: "Title", type: "text", placeholder: "Slide title..." },
        { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Slide subtitle..." },
        { key: "description", label: "Description", type: "textarea", placeholder: "Slide description..." },
        { key: "buttonText", label: "Button Text", type: "text", placeholder: "Shop Now" },
        { key: "buttonUrl", label: "Button URL", type: "url", placeholder: "/shop" },
        { key: "textAlignment", label: "Text Alignment", type: "text", placeholder: "left" },
        { key: "textColor", label: "Text Color", type: "text", placeholder: "#ffffff" },
        { key: "imageFit", label: "Image Fit", type: "text", placeholder: "cover" },
        { key: "imagePosition", label: "Image Position", type: "text", placeholder: "center" },
        { key: "overlay", label: "Overlay", type: "text", placeholder: "rgba(0,0,0,0.35)" },
        { key: "backgroundOverlay", label: "Background Overlay", type: "text", placeholder: "rgba(0,0,0,0.35)" },
        { key: "gradientOverlay", label: "Gradient Overlay", type: "text", placeholder: "linear-gradient(...)" },
      ],
    },
    gallery: {
      field: "galleryItems", title: "Gallery Images", addLabel: "Add Image",
      fields: [
        { key: "image", label: "Image", type: "image" },
        { key: "title", label: "Title", type: "text", placeholder: "Image title..." },
        { key: "alt", label: "Alt Text", type: "text", placeholder: "Image description..." },
        { key: "link", label: "Link URL", type: "url", placeholder: "https://..." },
      ],
    },
  };

  const toggleGroup = (g: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  // ─── Stable callback for repeater updates (must be before any early return) ─
  const handleRepeaterUpdate = useCallback((items: Record<string, string>[]) => {
    if (!section) return;
    const activeRepeater = repeaterConfigs[section.type];
    if (!activeRepeater) return;
    dispatch(updateSectionStyle({ id: section.id, style: { [activeRepeater.field]: items } as Partial<SectionStyle> }));
  }, [dispatch, section]);

  if (!section) {
    if (editingZone === "header") return <HeaderBuilderSettings />;
    if (editingZone === "footer") return <FooterBuilderSettings />;
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100">
            <Layers className="h-5 w-5 text-apple-ink-muted-48" />
          </div>
          <p className="text-sm font-medium text-apple-ink-muted-80">Select a section</p>
          <p className="mt-1 text-xs text-apple-ink-muted-48">Click on any section in the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    dispatch(updateSectionProps({ id: section.id, props: { ...section.props, [key]: value } }));
  };

  const LENGTH_STYLE_KEYS = new Set<keyof SectionStyle>([
    "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
    "marginTop", "marginBottom", "marginLeft", "marginRight",
    "borderRadius", "borderWidth", "fontSize", "letterSpacing", "gap",
    "width", "height", "minHeight", "maxHeight", "minWidth", "maxWidth",
    "top", "right", "bottom", "left", "blur", "backdropBlur",
  ]);

  const handleStyleChange = (key: keyof SectionStyle, value: string | boolean) => {
    const nextValue = typeof value === "string" && LENGTH_STYLE_KEYS.has(key)
      ? (normalizeCssLength(value) ?? value)
      : value;
    const stylePatch = { [key]: nextValue } as Partial<SectionStyle>;
    dispatch(updateSectionStyle({ id: section.id, style: stylePatch }));

    if (typeof nextValue === "string") {
      const propSync = styleChangesToProps(stylePatch);
      if (Object.keys(propSync).length > 0) {
        dispatch(updateSectionProps({ id: section.id, props: { ...section.props, ...propSync } }));
      }
    }
  };

  const handleSectionPropsChange = (props: Record<string, string | undefined>) => {
    dispatch(updateSectionProps({ id: section.id, props: props as typeof section.props }));
  };

  const def = getSectionDef(section.type);
  const allProps = def?.props ?? {};
  const controls = Object.entries(allProps);

  const grouped: Record<string, [string, SectionPropDef][]> = {};
  for (const [key, propDef] of controls) {
    const group = propDef.group || "content";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push([key, propDef]);
  }

  const style = section.style ?? {};

  const tabGroups: Record<string, string[]> = {
    content: ["content"],
    style: ["background", "typography", "border", "shadow"],
    layout: ["layout", "spacing"],
    responsive: [],
    animation: [],
    seo: [],
    advanced: ["advanced"],
  };

  const activeRepeater = repeaterConfigs[section.type];
  const repeaterItems = activeRepeater ? (section.style?.[activeRepeater.field] as Record<string, string>[] | undefined) ?? [] : [];
  const customEditor = getSectionEditor(section.type);
  const EditorComponent = customEditor?.Component;

  const visiblePrimaryTabs = PRIMARY_TABS.filter((tab) => {
    if (tab.key === "content") return true;
    if (!customEditor?.tabs) return true;
    return customEditor.tabs.includes(tab.key as "style" | "layout");
  });

  const visibleAdvancedTabs = ADVANCED_TABS.filter((tab) => {
    if (!customEditor?.tabs) return true;
    return customEditor.tabs.includes(tab.key as "responsive" | "animation" | "seo" | "advanced");
  });

  const renderContentTab = () => {
    if (EditorComponent) {
      return (
        <EditorComponent
          section={section}
          storeId={storeId}
          storeSlug={storeSlug}
          brandColors={brandColors}
          onPropChange={handlePropChange}
          onPropsChange={handleSectionPropsChange}
          onStyleChange={(stylePatch) => dispatch(updateSectionStyle({ id: section.id, style: stylePatch }))}
        />
      );
    }

    return (
    <div className="divide-y divide-zinc-100">
      {groupOrder.filter((g) => grouped[g]?.length && tabGroups.content?.includes(g)).map((group) => {
        const items = grouped[group];
        const isCollapsed = collapsedGroups.has(group);
        return (
          <div key={group}>
            <button onClick={() => toggleGroup(group)}
              className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48 hover:bg-apple-canvas-parchment">
              <span className="flex items-center gap-1.5">
                <GroupIcon group={group} />
                {groupLabels[group] || group}
              </span>
              <span className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}>
                <ChevronDown className="h-3 w-3" />
              </span>
            </button>
            {!isCollapsed && (
              <div className="px-3 py-2 space-y-2.5">
                {items.map(([key, propDef]) => {
                  const val = section.props[key] ?? "";
                  return (
                    <ControlRow key={key} label={propDef.label} responsive={propDef.responsive}>
                      <ControlRenderer propDef={propDef} propKey={key} value={val}
                        onChange={(v) => handlePropChange(key, v)}
                        onSectionPropsChange={handleSectionPropsChange}
                        sectionProps={section.props} storeId={storeId} storeSlug={storeSlug}
                        brandColors={brandColors} />
                    </ControlRow>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {activeRepeater && (
        <div className="px-3 py-2">
          <RepeaterEditor
            items={repeaterItems}
            fields={activeRepeater.fields}
            title={activeRepeater.title}
            addLabel={activeRepeater.addLabel}
            onUpdate={handleRepeaterUpdate}
            storeId={storeId}
            storeSlug={storeSlug}
          />
        </div>
      )}
    </div>
    );
  };

  // ─── Style Tab ──────────────────────────────────────────────────

  const renderStyleTab = () => {
    const s = style;
    const isHero = section.type.includes("hero") || section.type.includes("banner");

    return (
      <div className="divide-y divide-zinc-100">
        {/* Typography — primary for beginners */}
        <CollapsibleGroup label="Typography" icon={<AlignLeft className="h-3 w-3" />}
          collapsed={collapsedGroups.has("typo")} onToggle={() => toggleGroup("typo")}>
          <ControlRow label="Font Family">
            <FontFamilyControl value={s.fontFamily ?? ""} onChange={(v) => handleStyleChange("fontFamily", v)} />
          </ControlRow>
          <ControlRow label="Font Size">
            <FontSizeControl value={s.fontSize ?? "16px"} onChange={(v) => handleStyleChange("fontSize", v)} />
          </ControlRow>
          <ControlRow label="Font Weight">
            <FontWeightControl value={s.fontWeight ?? "400"} onChange={(v) => handleStyleChange("fontWeight", v)} />
          </ControlRow>
          <ControlRow label="Text Color">
            <ColorInput value={s.color ?? ""} onChange={(v) => handleStyleChange("color", v)} brandColors={brandColors} />
          </ControlRow>
          <ControlRow label="Alignment">
            <TextAlignControl value={s.textAlign ?? "left"} onChange={(v) => handleStyleChange("textAlign", v)} />
          </ControlRow>
          <ControlRow label="Transform">
            <TextTransformControl value={s.textTransform ?? "none"} onChange={(v) => handleStyleChange("textTransform", v)} />
          </ControlRow>
          <ControlRow label="Line Height">
            <PresetChips value={s.lineHeight ?? "1.5"} onChange={(v) => handleStyleChange("lineHeight", v)} options={LINE_HEIGHT_PRESETS} />
          </ControlRow>
          <ControlRow label="Letter Spacing">
            <PresetChips value={s.letterSpacing ?? "0"} onChange={(v) => handleStyleChange("letterSpacing", v)} options={LETTER_SPACING_PRESETS} />
          </ControlRow>
          <ControlRow label="Text Shadow">
            <PresetChips
              value={s.textShadow ?? "none"}
              onChange={(v) => handleStyleChange("textShadow", v)}
              options={TEXT_SHADOW_PRESETS}
            />
          </ControlRow>
          <ControlRow label="Max Width">
            <MaxWidthControl value={s.maxWidth ?? ""} onChange={(v) => handleStyleChange("maxWidth", v)} />
          </ControlRow>
        </CollapsibleGroup>

        {/* Background */}
        <CollapsibleGroup label="Background" icon={<PaintBucket className="h-3 w-3" />}
          collapsed={collapsedGroups.has("bg")} onToggle={() => toggleGroup("bg")}>
          <ControlRow label="Color">
            <ColorInput value={s.backgroundColor ?? ""} onChange={(v) => handleStyleChange("backgroundColor", v)} brandColors={brandColors} />
          </ControlRow>
          <ControlRow label="Gradient">
            <GradientPresetControl value={s.backgroundGradient ?? ""} onChange={(v) => handleStyleChange("backgroundGradient", v)} />
          </ControlRow>
          <ControlRow label="Image">
            <StyleBackgroundInput
              value={s.backgroundImage ?? ""}
              mediaId={s.backgroundImageMediaId}
              onChange={(selection) => {
                handleStyleChange("backgroundImage", selection.url);
                dispatch(updateSectionStyle({
                  id: section.id,
                  style: { backgroundImageMediaId: selection.mediaId ?? "" },
                }));
              }}
            />
          </ControlRow>
          <ControlRow label="Image Fit">
            <SelectInput
              value={s.backgroundSize ?? "cover"}
              onChange={(v) => handleStyleChange("backgroundSize", v)}
              options={[
                { label: "Cover", value: "cover" },
                { label: "Contain", value: "contain" },
                { label: "Auto", value: "auto" },
              ]}
            />
          </ControlRow>
          <ControlRow label="Image Position">
            <SelectInput
              value={s.backgroundPosition ?? "center"}
              onChange={(v) => handleStyleChange("backgroundPosition", v)}
              options={[
                { label: "Center", value: "center" },
                { label: "Top", value: "top" },
                { label: "Bottom", value: "bottom" },
                { label: "Left", value: "left" },
                { label: "Right", value: "right" },
              ]}
            />
          </ControlRow>
          <ControlRow label="Overlay Color">
            <ColorInput value={s.overlayColor ?? ""} onChange={(v) => handleStyleChange("overlayColor", v)} brandColors={brandColors} />
          </ControlRow>
          <ControlRow label="Overlay Opacity">
            <OpacityControl value={s.overlayOpacity ?? "40"} onChange={(v) => handleStyleChange("overlayOpacity", v)} />
          </ControlRow>
          <ControlRow label="Blur">
            <VisualSlider value={s.blur ?? "0"} onChange={(v) => handleStyleChange("blur", v)} max={50} suffix="px" />
          </ControlRow>
        </CollapsibleGroup>

        {/* Border & Radius */}
        <CollapsibleGroup label="Border & Radius" icon={<Square className="h-3 w-3" />}
          collapsed={collapsedGroups.has("border")} onToggle={() => toggleGroup("border")}>
          <ControlRow label="Color">
            <ColorInput value={s.borderColor ?? ""} onChange={(v) => handleStyleChange("borderColor", v)} brandColors={brandColors} />
          </ControlRow>
          <ControlRow label="Width">
            <VisualSlider value={s.borderWidth ?? "0"} onChange={(v) => handleStyleChange("borderWidth", v)} max={20} suffix="px" />
          </ControlRow>
          <ControlRow label="Radius">
            <RadiusControl value={s.borderRadius ?? "0"} onChange={(v) => handleStyleChange("borderRadius", v)} />
          </ControlRow>
          <ControlRow label="Style">
            <SelectInput
              value={s.borderStyle ?? "solid"}
              onChange={(v) => handleStyleChange("borderStyle", v)}
              options={[
                { label: "Solid", value: "solid" },
                { label: "Dashed", value: "dashed" },
                { label: "Dotted", value: "dotted" },
                { label: "None", value: "none" },
              ]}
            />
          </ControlRow>
        </CollapsibleGroup>

        {/* Shadow */}
        <CollapsibleGroup label="Shadow" icon={<Maximize2 className="h-3 w-3" />}
          collapsed={collapsedGroups.has("shadow")} onToggle={() => toggleGroup("shadow")}>
          <ControlRow label="Preset">
            <PresetChips value={s.shadow ?? "none"} onChange={(v) => handleStyleChange("shadow", v)} options={SHADOW_PRESETS} />
          </ControlRow>
        </CollapsibleGroup>

        {/* Opacity */}
        <CollapsibleGroup label="Opacity" icon={<Eye className="h-3 w-3" />}
          collapsed={collapsedGroups.has("opacity")} onToggle={() => toggleGroup("opacity")}>
          <ControlRow label="Opacity">
            <OpacityControl value={s.opacity ?? "100"} onChange={(v) => handleStyleChange("opacity", v)} />
          </ControlRow>
        </CollapsibleGroup>

        {/* Button presets for hero / CTA-heavy sections */}
        {isHero && (
          <CollapsibleGroup label="Button Style" icon={<Sparkles className="h-3 w-3" />}
            collapsed={collapsedGroups.has("btnStyle")} onToggle={() => toggleGroup("btnStyle")}>
            <ControlRow label="Preset">
              <ButtonPresetControl
                value={section.props.buttonStyle ?? "primary"}
                onChange={(v) => handlePropChange("buttonStyle", v)}
              />
            </ControlRow>
          </CollapsibleGroup>
        )}

        {/* Advanced — free-text / CSS only here */}
        <div className="px-3 py-3">
          <AdvancedDetails title="Advanced (CSS & pixels)">
            <ControlRow label="Custom Gradient CSS">
              <TextInput value={s.backgroundGradient ?? ""} onChange={(v) => handleStyleChange("backgroundGradient", v)} placeholder="linear-gradient(...)" />
            </ControlRow>
            <ControlRow label="Custom Shadow CSS">
              <TextInput value={s.shadow ?? ""} onChange={(v) => handleStyleChange("shadow", v)} placeholder="0 2px 8px rgba(0,0,0,0.1)" />
            </ControlRow>
            <ControlRow label="Font Size (exact)">
              <TextInput value={s.fontSize ?? ""} onChange={(v) => handleStyleChange("fontSize", v)} placeholder="16px" />
            </ControlRow>
            <ControlRow label="Letter Spacing (exact)">
              <TextInput value={s.letterSpacing ?? ""} onChange={(v) => handleStyleChange("letterSpacing", v)} placeholder="0.5px" />
            </ControlRow>
            <ControlRow label="Display">
              <SelectInput value={s.display ?? ""} onChange={(v) => handleStyleChange("display", v)}
                options={[
                  { label: "Default", value: "" },
                  { label: "Flex", value: "flex" },
                  { label: "Grid", value: "grid" },
                  { label: "Block", value: "block" },
                ]} />
            </ControlRow>
            {s.display === "flex" && (
              <>
                <ControlRow label="Direction">
                  <SelectInput value={s.flexDirection ?? "row"} onChange={(v) => handleStyleChange("flexDirection", v)}
                    options={[
                      { label: "Row", value: "row" },
                      { label: "Column", value: "column" },
                    ]} />
                </ControlRow>
                <ControlRow label="Gap">
                  <SpacingSlider value={s.gap ?? "0"} onChange={(v) => handleStyleChange("gap", v)} max={80} />
                </ControlRow>
              </>
            )}
            <ControlRow label="Position">
              <SelectInput value={s.position ?? ""} onChange={(v) => handleStyleChange("position", v)}
                options={[
                  { label: "Default", value: "" },
                  { label: "Relative", value: "relative" },
                  { label: "Absolute", value: "absolute" },
                  { label: "Sticky", value: "sticky" },
                ]} />
            </ControlRow>
            <ControlRow label="Z-Index">
              <TextInput value={s.zIndex ?? ""} onChange={(v) => handleStyleChange("zIndex", v)} placeholder="auto" />
            </ControlRow>
            <ControlRow label="Transform">
              <TextInput value={s.transform ?? ""} onChange={(v) => handleStyleChange("transform", v)} placeholder="scale(1.05)" />
            </ControlRow>
          </AdvancedDetails>
        </div>
      </div>
    );
  };

  const renderLayoutTab = () => {
    const spacingFields: Array<{ key: keyof SectionStyle; label: string }> = [
      { key: "paddingTop", label: "Top" },
      { key: "paddingBottom", label: "Bottom" },
      { key: "paddingLeft", label: "Left" },
      { key: "paddingRight", label: "Right" },
    ];
    const marginFields: Array<{ key: keyof SectionStyle; label: string }> = [
      { key: "marginTop", label: "Top" },
      { key: "marginBottom", label: "Bottom" },
      { key: "marginLeft", label: "Left" },
      { key: "marginRight", label: "Right" },
    ];

    return (
      <div className="divide-y divide-zinc-100">
        <CollapsibleGroup label="Padding" icon={<Plus className="h-3 w-3" />}
          collapsed={collapsedGroups.has("padding")} onToggle={() => toggleGroup("padding")}>
          {spacingFields.map((field) => (
            <ControlRow key={field.key} label={field.label}>
              <SpacingSlider value={String(style[field.key] ?? "0")} onChange={(v) => handleStyleChange(field.key, v)} />
            </ControlRow>
          ))}
        </CollapsibleGroup>

        <CollapsibleGroup label="Margin" icon={<Minus className="h-3 w-3" />}
          collapsed={collapsedGroups.has("margin")} onToggle={() => toggleGroup("margin")}>
          {marginFields.map((field) => (
            <ControlRow key={field.key} label={field.label}>
              <SpacingSlider value={String(style[field.key] ?? "0")} onChange={(v) => handleStyleChange(field.key, v)} />
            </ControlRow>
          ))}
        </CollapsibleGroup>

        <CollapsibleGroup label="Gap & Radius" icon={<Ruler className="h-3 w-3" />}
          collapsed={collapsedGroups.has("gapRadius")} onToggle={() => toggleGroup("gapRadius")}>
          <ControlRow label="Gap">
            <SpacingSlider value={style.gap ?? "0"} onChange={(v) => handleStyleChange("gap", v)} max={80} />
          </ControlRow>
          <ControlRow label="Border Radius">
            <RadiusControl value={style.borderRadius ?? "0"} onChange={(v) => handleStyleChange("borderRadius", v)} />
          </ControlRow>
          <ControlRow label="Opacity">
            <OpacityControl value={style.opacity ?? "100"} onChange={(v) => handleStyleChange("opacity", v)} />
          </ControlRow>
        </CollapsibleGroup>

        <CollapsibleGroup label="Sizing" icon={<Maximize2 className="h-3 w-3" />}
          collapsed={collapsedGroups.has("sizing")} onToggle={() => toggleGroup("sizing")}>
          <ControlRow label="Max Width">
            <MaxWidthControl value={style.maxWidth ?? ""} onChange={(v) => handleStyleChange("maxWidth", v)} />
          </ControlRow>
          <ControlRow label="Min Height">
            <SpacingSlider value={style.minHeight ?? "0"} onChange={(v) => handleStyleChange("minHeight", v)} max={900} />
          </ControlRow>
          <div className="pt-1">
            <AdvancedDetails title="Exact size values">
              <ControlRow label="Width">
                <TextInput value={style.width ?? ""} onChange={(v) => handleStyleChange("width", v)} placeholder="100%" />
              </ControlRow>
              <ControlRow label="Height">
                <TextInput value={style.height ?? ""} onChange={(v) => handleStyleChange("height", v)} placeholder="auto" />
              </ControlRow>
              <ControlRow label="Min Width">
                <TextInput value={style.minWidth ?? ""} onChange={(v) => handleStyleChange("minWidth", v)} placeholder="auto" />
              </ControlRow>
              <ControlRow label="Max Height">
                <TextInput value={style.maxHeight ?? ""} onChange={(v) => handleStyleChange("maxHeight", v)} placeholder="none" />
              </ControlRow>
            </AdvancedDetails>
          </div>
        </CollapsibleGroup>
      </div>
    );
  };

  const renderResponsiveTab = () => {
    const devices: Array<{ key: "desktop" | "tablet" | "mobile"; icon: typeof Monitor; label: string }> = [
      { key: "desktop", icon: Monitor, label: "Desktop" },
      { key: "tablet", icon: Tablet, label: "Tablet" },
      { key: "mobile", icon: Smartphone, label: "Mobile" },
    ];

    return (
      <div className="divide-y divide-zinc-100">
        <div className="px-3 py-3">
          <p className="text-[11px] text-apple-ink-muted-48 mb-3">Control visibility and layout per device</p>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Visibility</p>
            {devices.map((dev) => {
              const isHidden = dev.key === "desktop" ? style.hideOnDesktop
                : dev.key === "tablet" ? style.hideOnTablet
                : style.hideOnMobile;
              const isActive = device === dev.key;
              const Icon = dev.icon;

              return (
                <div key={dev.key} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-apple-ink-muted-48"}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium text-apple-ink-muted-80">{dev.label}</span>
                  </div>
                  <button
                    onClick={() => dispatch(updateSectionResponsive({ id: section.id, device: dev.key, hide: !isHidden }))}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isHidden ? "bg-red-200" : "bg-emerald-200"}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isHidden ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg bg-apple-canvas-parchment p-3">
            <div className="flex items-center gap-2">
              {device === "mobile" && <Smartphone className="h-4 w-4 text-blue-500" />}
              {device === "tablet" && <Tablet className="h-4 w-4 text-blue-500" />}
              {device === "desktop" && <Monitor className="h-4 w-4 text-blue-500" />}
              <span className="text-xs font-medium text-apple-ink-muted-80">
                Editing for {device === "desktop" ? "Desktop" : device === "tablet" ? "Tablet" : "Mobile"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-apple-ink-muted-48">
              Switch device view in the toolbar to see per-device changes
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAnimationTab = () => {
    const animOptions = [
      { label: "None", value: "none" },
      { label: "Fade In", value: "fade-in" },
      { label: "Fade Up", value: "fade-up" },
      { label: "Fade Down", value: "fade-down" },
      { label: "Slide Up", value: "slide-up" },
      { label: "Slide Down", value: "slide-down" },
      { label: "Slide Left", value: "slide-left" },
      { label: "Slide Right", value: "slide-right" },
      { label: "Zoom In", value: "zoom-in" },
      { label: "Zoom Out", value: "zoom-out" },
      { label: "Flip", value: "flip" },
      { label: "Bounce", value: "bounce" },
    ];
    return (
      <div className="divide-y divide-zinc-100">
        <CollapsibleGroup label="Entrance" icon={<Sparkles className="h-3 w-3" />}
          collapsed={collapsedGroups.has("entrance")} onToggle={() => toggleGroup("entrance")}>
          <ControlRow label="Animation">
            <select value={style.animation ?? "none"}
              onChange={(e) => handleStyleChange("animation", e.target.value)}
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none">
              {animOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </ControlRow>
          {style.animation && style.animation !== "none" && (
            <>
              <ControlRow label="Duration (ms)">
                <RangeInput value={style.animationDuration ?? "500"} onChange={(v) => handleStyleChange("animationDuration", v)} min={100} max={5000} step={100} />
              </ControlRow>
              <ControlRow label="Delay (ms)">
                <RangeInput value={style.animationDelay ?? "0"} onChange={(v) => handleStyleChange("animationDelay", v)} min={0} max={5000} step={100} />
              </ControlRow>
              <ControlRow label="Trigger">
                <select value={style.animationTrigger ?? "on-scroll"}
                  onChange={(e) => handleStyleChange("animationTrigger", e.target.value)}
                  className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-apple-ink-muted-80 focus:border-zinc-400 focus:outline-none">
                  <option value="on-load">On Load</option>
                  <option value="on-scroll">On Scroll</option>
                  <option value="on-hover">On Hover</option>
                </select>
              </ControlRow>
            </>
          )}
        </CollapsibleGroup>
        <CollapsibleGroup label="Motion" icon={<Maximize2 className="h-3 w-3" />}
          collapsed={collapsedGroups.has("motion")} onToggle={() => toggleGroup("motion")}>
          <ControlRow label="Parallax speed">
            <RangeInput value={style.parallaxSpeed ?? "0"} onChange={(v) => handleStyleChange("parallaxSpeed", v)} min={-100} max={100} step={10} />
          </ControlRow>
          <ControlRow label="Sticky">
            <ToggleInput value={style.sticky ? "true" : "false"} onChange={(v) => handleStyleChange("sticky", v === "true")} />
          </ControlRow>
        </CollapsibleGroup>
      </div>
    );
  };

  const renderSeoTab = () => {
    const seo = section.props;
    return (
      <div className="divide-y divide-zinc-100">
        <div className="px-3 py-3 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Section SEO</p>
          <ControlRow label="HTML ID">
            <TextInput value={seo["htmlId"] ?? ""} onChange={(v) => handlePropChange("htmlId", v)} placeholder="section-id" />
          </ControlRow>
          <ControlRow label="CSS Class">
            <TextInput value={seo["cssClass"] ?? ""} onChange={(v) => handlePropChange("cssClass", v)} placeholder="custom-class" />
          </ControlRow>
          <ControlRow label="ARIA Label">
            <TextInput value={seo["ariaLabel"] ?? ""} onChange={(v) => handlePropChange("ariaLabel", v)} placeholder="Section description" />
          </ControlRow>
        </div>
      </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="divide-y divide-zinc-100">
      <div className="px-3 py-3 space-y-2.5">
        <ControlRow label="Custom CSS">
          <textarea value={style.customCss ?? ""}
            onChange={(e) => handleStyleChange("customCss", e.target.value)}
            rows={4}
            placeholder=".my-class { color: red; }"
            className="h-auto min-h-[80px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] font-mono text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </ControlRow>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeRightTab) {
      case "content": return renderContentTab();
      case "style": return renderStyleTab();
      case "layout": return renderLayoutTab();
      case "responsive": return renderResponsiveTab();
      case "animation": return renderAnimationTab();
      case "seo": return renderSeoTab();
      case "advanced": return renderAdvancedTab();
      default: return renderContentTab();
    }
  };

  const isPrimaryTab = PRIMARY_TABS.some((tab) => tab.key === activeRightTab);
  const isAdvancedTab = ADVANCED_TABS.some((tab) => tab.key === activeRightTab);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-apple-canvas">
      <div className="sticky top-0 z-10 border-b border-apple-hairline bg-apple-canvas/95 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-strong text-apple-ink">{section.label}</p>
            <p className="truncate text-caption text-apple-ink-muted-48">{def?.label ?? "Section"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => dispatch(setRightPanelPinned(!rightPanelPinned))}
              className={cn(
                "rounded-apple-md p-1.5 transition-colors",
                rightPanelPinned ? "text-apple-primary" : "text-apple-ink-muted-48 hover:text-apple-ink"
              )}
              title={rightPanelPinned ? "Unpin panel" : "Pin panel"}
            >
              <Pin className={cn("h-4 w-4", rightPanelPinned && "rotate-45")} />
            </button>
            <button
              type="button"
              onClick={() => dispatch(toggleRightPanel())}
              className="rounded-apple-md p-1.5 text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-1 rounded-apple-pill bg-apple-canvas-parchment p-1">
          {visiblePrimaryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => dispatch(setActiveRightTab(tab.key))}
                className={cn(
                  "btn-press flex flex-1 items-center justify-center gap-1.5 rounded-apple-pill px-3 py-2 text-caption font-medium transition-all",
                  activeRightTab === tab.key
                    ? "bg-apple-canvas text-apple-ink shadow-sm"
                    : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isPrimaryTab ? renderTabContent() : (
          <div className="flex h-40 items-center justify-center p-6 text-center">
            <p className="text-caption text-apple-ink-muted-48">Open <span className="font-medium text-apple-ink">More options</span> below for mobile, motion, and other settings.</p>
          </div>
        )}

        {controls.length === 0 && !customEditor && activeRightTab === "content" && isPrimaryTab && (
          <div className="p-6 text-center">
            <p className="text-caption text-apple-ink-muted-48">Nothing to edit here — try another tab.</p>
          </div>
        )}

        {visibleAdvancedTabs.length > 0 ? (
        <div className="border-t border-apple-hairline">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-caption font-medium text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" />
              More options
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showAdvanced && "rotate-180")} />
          </button>

          {showAdvanced && (
            <div className="space-y-3 border-t border-apple-hairline bg-apple-canvas-parchment/40 px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {visibleAdvancedTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        dispatch(setActiveRightTab(tab.key));
                        setShowAdvanced(true);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-apple-pill border px-3 py-1.5 text-fine-print font-medium transition-all",
                        activeRightTab === tab.key
                          ? "border-apple-primary bg-apple-primary/5 text-apple-primary"
                          : "border-apple-hairline bg-apple-canvas text-apple-ink-muted-48 hover:border-apple-primary/30"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {isAdvancedTab && (
                <div className="rounded-apple-lg border border-apple-hairline bg-apple-canvas">
                  {renderTabContent()}
                </div>
              )}
            </div>
          )}
        </div>
        ) : null}
      </div>
    </div>
  );
}
