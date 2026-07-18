"use client";

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
} from "lucide-react";
import { useState } from "react";
import { getSectionDef, type SectionPropDef } from "@/lib/section-registry";
import { BuilderMediaField } from "@/components/builder/builder-media-field";
import { HeaderBuilderSettings } from "@/components/builder/header-builder-settings";
import { FooterBuilderSettings } from "@/components/builder/footer-builder-settings";
import { useRequiredStore } from "@/providers/store-context";

// ─── Shared Controls ──────────────────────────────────────────────

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-zinc-200 p-0.5" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={label ?? "#000000"} className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
    </div>
  );
}

function RangeInput({ value, onChange, min, max, step }: { value: string; onChange: (v: string) => void; min?: number; max?: number; step?: number }) {
  const num = Number(value) || 0;
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={min ?? 0} max={max ?? 100} step={step ?? 1} value={num}
        onChange={(e) => onChange(e.target.value)}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900" />
      <input type="number" value={num} onChange={(e) => onChange(e.target.value)}
        min={min} max={max} step={step}
        className="h-7 w-14 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 text-center focus:border-zinc-400 focus:outline-none" />
    </div>
  );
}

function SpacingInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const num = Number(value) || 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-12 text-[10px] font-medium text-zinc-500">{label}</span>
      <input type="range" min={0} max={200} step={1} value={num}
        onChange={(e) => onChange(e.target.value)}
        className="h-1 flex-1 appearance-none rounded-full bg-zinc-200 accent-zinc-900" />
      <input type="number" value={num} onChange={(e) => onChange(e.target.value)}
        className="h-6 w-12 rounded border border-zinc-200 bg-transparent px-1 text-[10px] text-zinc-700 text-center focus:border-zinc-400 focus:outline-none" />
      <span className="text-[9px] text-zinc-400">px</span>
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
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

// ─── Section-defined property controls ────────────────────────────

function ControlRenderer({
  propDef, propKey, value, onChange, onSectionPropsChange, sectionProps, storeId, storeSlug,
}: {
  propDef: SectionPropDef; propKey: string; value: string; onChange: (v: string) => void;
  onSectionPropsChange: (props: Record<string, string | undefined>) => void;
  sectionProps: Record<string, string | undefined>; storeId: string; storeSlug: string;
}) {
  switch (propDef.type) {
    case "color": return <ColorInput value={value} onChange={onChange} />;
    case "image": return <BuilderMediaField storeId={storeId} storeSlug={storeSlug} propKey={propKey} sectionProps={sectionProps} onPropsChange={onSectionPropsChange} />;
    case "range": return <RangeInput value={value} onChange={onChange} min={propDef.min} max={propDef.max} step={propDef.step} />;
    case "toggle": return <ToggleInput value={value} onChange={onChange} />;
    case "select":
    case "grid-columns":
      return <SelectInput value={value || ""} onChange={onChange} options={propDef.options ?? []} />;
    case "textarea": return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={propDef.placeholder}
      className="h-auto min-h-[56px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />;
    case "number": return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />;
    case "video":
    case "url": return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />;
    default: return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
      className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />;
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
    default: return null;
  }
}

const groupLabels: Record<string, string> = {
  content: "Content", layout: "Layout", background: "Background",
  typography: "Typography", spacing: "Spacing", advanced: "Advanced",
};

const groupOrder = ["content", "layout", "background", "typography", "spacing", "advanced"];

const TABS: Array<{ key: RightTab; label: string; icon: typeof Type }> = [
  { key: "content", label: "Content", icon: Type },
  { key: "style", label: "Style", icon: PaintBucket },
  { key: "layout", label: "Layout", icon: Box },
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
        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:bg-zinc-50">
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
      <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-zinc-500">
        {label}
        {responsive && <span className="rounded bg-blue-50 px-1 text-[8px] font-bold text-blue-500">R</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const { storeId, storeSlug } = useRequiredStore();
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const section = useSelector((s: RootState) => s.builder.sections.find((sec) => sec.id === selectedId));
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const activeRightTab = useSelector((s: RootState) => s.builder.activeRightTab);
  const rightPanelPinned = useSelector((s: RootState) => s.builder.rightPanelPinned);
  const device = useSelector((s: RootState) => s.preview.device);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (g: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  // ─── Section-selection empty state ─────────────────────────
  if (!section) {
    if (editingZone === "header") return <HeaderBuilderSettings />;
    if (editingZone === "footer") return <FooterBuilderSettings />;
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100">
            <Layers className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600">Select a section</p>
          <p className="mt-1 text-xs text-zinc-400">Click on any section in the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    dispatch(updateSectionProps({ id: section.id, props: { ...section.props, [key]: value } }));
  };

  const handleStyleChange = (key: keyof SectionStyle, value: string | boolean) => {
    dispatch(updateSectionStyle({ id: section.id, style: { [key]: value } as Partial<SectionStyle> }));
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
    style: ["background", "typography"],
    layout: ["layout", "spacing"],
    responsive: [],
    animation: [],
    seo: [],
    advanced: ["advanced"],
  };

  const renderContentTab = () => (
    <div className="divide-y divide-zinc-100">
      {groupOrder.filter((g) => grouped[g]?.length && tabGroups.content?.includes(g)).map((group) => {
        const items = grouped[group];
        const isCollapsed = collapsedGroups.has(group);
        return (
          <div key={group}>
            <button onClick={() => toggleGroup(group)}
              className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:bg-zinc-50">
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
                        sectionProps={section.props} storeId={storeId} storeSlug={storeSlug} />
                    </ControlRow>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStyleTab = () => (
    <div className="divide-y divide-zinc-100">
      {/* Background */}
      <CollapsibleGroup label="Background" icon={<PaintBucket className="h-3 w-3" />}
        collapsed={collapsedGroups.has("bg")} onToggle={() => toggleGroup("bg")}>
        <ControlRow label="Background color">
          <ColorInput value={style.backgroundColor ?? ""} onChange={(v) => handleStyleChange("backgroundColor", v)} />
        </ControlRow>
        <ControlRow label="Gradient (CSS)">
          <input type="text" value={style.backgroundGradient ?? ""}
            onChange={(e) => handleStyleChange("backgroundGradient", e.target.value)}
            placeholder="linear-gradient(...)"
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </ControlRow>
      </CollapsibleGroup>

      {/* Border */}
      <CollapsibleGroup label="Border" icon={<Square className="h-3 w-3" />}
        collapsed={collapsedGroups.has("border")} onToggle={() => toggleGroup("border")}>
        <ControlRow label="Color">
          <ColorInput value={style.borderColor ?? ""} onChange={(v) => handleStyleChange("borderColor", v)} />
        </ControlRow>
        <ControlRow label="Width">
          <RangeInput value={style.borderWidth ?? "0"} onChange={(v) => handleStyleChange("borderWidth", v)} max={20} />
        </ControlRow>
        <ControlRow label="Radius">
          <RangeInput value={style.borderRadius ?? "0"} onChange={(v) => handleStyleChange("borderRadius", v)} max={50} />
        </ControlRow>
        <ControlRow label="Style">
          <select value={style.borderStyle ?? "solid"} onChange={(e) => handleStyleChange("borderStyle", e.target.value)}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="none">None</option>
          </select>
        </ControlRow>
      </CollapsibleGroup>

      {/* Shadow */}
      <CollapsibleGroup label="Shadow" icon={<Maximize2 className="h-3 w-3" />}
        collapsed={collapsedGroups.has("shadow")} onToggle={() => toggleGroup("shadow")}>
        <ControlRow label="Shadow (CSS)">
          <input type="text" value={style.shadow ?? ""}
            onChange={(e) => handleStyleChange("shadow", e.target.value)}
            placeholder="0 2px 8px rgba(0,0,0,0.1)"
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
        </ControlRow>
        <ControlRow label="Presets">
          <div className="flex gap-1">
            {[
              { label: "None", value: "none" },
              { label: "Sm", value: "0 1px 3px rgba(0,0,0,0.1)" },
              { label: "Md", value: "0 4px 12px rgba(0,0,0,0.1)" },
              { label: "Lg", value: "0 8px 30px rgba(0,0,0,0.12)" },
              { label: "Xl", value: "0 20px 60px rgba(0,0,0,0.15)" },
            ].map((opt) => (
              <button key={opt.label} onClick={() => handleStyleChange("shadow", opt.value)}
                className={`flex-1 rounded-lg border px-2 py-1 text-[9px] font-medium transition-all ${
                  style.shadow === opt.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </ControlRow>
      </CollapsibleGroup>

      {/* Opacity */}
      <CollapsibleGroup label="Opacity" icon={<Eye className="h-3 w-3" />}
        collapsed={collapsedGroups.has("opacity")} onToggle={() => toggleGroup("opacity")}>
        <ControlRow label="Opacity">
          <RangeInput value={style.opacity ?? "100"} onChange={(v) => handleStyleChange("opacity", v)} max={100} />
        </ControlRow>
      </CollapsibleGroup>
    </div>
  );

  const renderLayoutTab = () => {
    // Spacing helpers
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
        {/* Padding */}
        <CollapsibleGroup label="Padding" icon={<Plus className="h-3 w-3" />}
          collapsed={collapsedGroups.has("padding")} onToggle={() => toggleGroup("padding")}>
          {spacingFields.map((field) => (
            <ControlRow key={field.key} label={field.label}>
              <SpacingInput value={String(style[field.key] ?? "0")} onChange={(v) => handleStyleChange(field.key, v)} label={field.label} />
            </ControlRow>
          ))}
        </CollapsibleGroup>

        {/* Margin */}
        <CollapsibleGroup label="Margin" icon={<Minus className="h-3 w-3" />}
          collapsed={collapsedGroups.has("margin")} onToggle={() => toggleGroup("margin")}>
          {marginFields.map((field) => (
            <ControlRow key={field.key} label={field.label}>
              <SpacingInput value={String(style[field.key] ?? "0")} onChange={(v) => handleStyleChange(field.key, v)} label={field.label} />
            </ControlRow>
          ))}
        </CollapsibleGroup>

        {/* Sizing */}
        <CollapsibleGroup label="Sizing" icon={<Maximize2 className="h-3 w-3" />}
          collapsed={collapsedGroups.has("sizing")} onToggle={() => toggleGroup("sizing")}>
          <ControlRow label="Width">
            <input type="text" value={style.width ?? ""}
              onChange={(e) => handleStyleChange("width", e.target.value)}
              placeholder="100%"
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
          </ControlRow>
          <ControlRow label="Max width">
            <input type="text" value={style.maxWidth ?? ""}
              onChange={(e) => handleStyleChange("maxWidth", e.target.value)}
              placeholder="1200px"
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
          </ControlRow>
          <ControlRow label="Min height">
            <input type="text" value={style.minHeight ?? ""}
              onChange={(e) => handleStyleChange("minHeight", e.target.value)}
              placeholder="auto"
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
          </ControlRow>
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
          <p className="text-[11px] text-zinc-500 mb-3">Control visibility and layout per device</p>

          {/* Device visibility */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Visibility</p>
            {devices.map((dev) => {
              const isHidden = dev.key === "desktop" ? style.hideOnDesktop
                : dev.key === "tablet" ? style.hideOnTablet
                : style.hideOnMobile;
              const isActive = device === dev.key;
              const Icon = dev.icon;

              return (
                <div key={dev.key} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium text-zinc-700">{dev.label}</span>
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

          {/* Current device indicator */}
          <div className="mt-4 rounded-lg bg-zinc-50 p-3">
            <div className="flex items-center gap-2">
              {device === "mobile" && <Smartphone className="h-4 w-4 text-blue-500" />}
              {device === "tablet" && <Tablet className="h-4 w-4 text-blue-500" />}
              {device === "desktop" && <Monitor className="h-4 w-4 text-blue-500" />}
              <span className="text-xs font-medium text-zinc-700">
                Editing for {device === "desktop" ? "Desktop" : device === "tablet" ? "Tablet" : "Mobile"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-zinc-400">
              Switch device view in the toolbar to see per-device changes
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAnimationTab = () => {
    const animStyle = style;
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
            <select value={animStyle.animation ?? "none"}
              onChange={(e) => handleStyleChange("animation", e.target.value)}
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
              {animOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </ControlRow>
          {animStyle.animation && animStyle.animation !== "none" && (
            <>
              <ControlRow label="Duration (ms)">
                <RangeInput value={animStyle.animationDuration ?? "500"} onChange={(v) => handleStyleChange("animationDuration", v)} min={100} max={5000} step={100} />
              </ControlRow>
              <ControlRow label="Delay (ms)">
                <RangeInput value={animStyle.animationDelay ?? "0"} onChange={(v) => handleStyleChange("animationDelay", v)} min={0} max={5000} step={100} />
              </ControlRow>
              <ControlRow label="Trigger">
                <select value={animStyle.animationTrigger ?? "on-scroll"}
                  onChange={(e) => handleStyleChange("animationTrigger", e.target.value)}
                  className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
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
            <RangeInput value={animStyle.parallaxSpeed ?? "0"} onChange={(v) => handleStyleChange("parallaxSpeed", v)} min={-100} max={100} step={10} />
          </ControlRow>
          <ControlRow label="Sticky">
            <ToggleInput value={animStyle.sticky ? "true" : "false"} onChange={(v) => handleStyleChange("sticky", v === "true")} />
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
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Section SEO</p>
          <ControlRow label="HTML ID">
            <input type="text" value={seo["htmlId"] ?? ""}
              onChange={(e) => handlePropChange("htmlId", e.target.value)}
              placeholder="section-id"
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
          </ControlRow>
          <ControlRow label="CSS Class">
            <input type="text" value={seo["cssClass"] ?? ""}
              onChange={(e) => handlePropChange("cssClass", e.target.value)}
              placeholder="custom-class"
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
          </ControlRow>
          <ControlRow label="ARIA Label">
            <input type="text" value={seo["ariaLabel"] ?? ""}
              onChange={(e) => handlePropChange("ariaLabel", e.target.value)}
              placeholder="Section description"
              className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
          </ControlRow>
          <p className="text-[10px] text-zinc-400 mt-3">
            Page-level SEO (title, description, OG tags) can be configured in Page Settings.
          </p>
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
            className="h-auto min-h-[80px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] font-mono text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white/95 px-3 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
              <Layers className="h-3 w-3 text-zinc-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">{section.label}</p>
              <p className="truncate text-[10px] text-zinc-400">{section.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => dispatch(setRightPanelPinned(!rightPanelPinned))}
              className={`rounded p-1 transition-colors ${rightPanelPinned ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
              title={rightPanelPinned ? "Unpin" : "Pin"}>
              <Pin className={`h-3.5 w-3.5 ${rightPanelPinned ? "rotate-45" : ""}`} />
            </button>
            <button onClick={() => dispatch(toggleRightPanel())}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Section name inline */}
        <div className="mt-2">
          <input type="text" value={section.label}
            onChange={(e) => dispatch(updateSectionMeta({ id: section.id, label: e.target.value }))}
            className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none" />
        </div>

        {/* Tab bar */}
        <div className="mt-3 flex flex-wrap gap-0.5 rounded-xl bg-zinc-100/80 p-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} type="button" onClick={() => dispatch(setActiveRightTab(tab.key))}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-medium transition-all ${
                  activeRightTab === tab.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}>
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}

        {controls.length === 0 && activeRightTab === "content" && (
          <div className="p-4 text-center">
            <p className="text-xs text-zinc-400">No editable properties for this section type</p>
          </div>
        )}
      </div>
    </div>
  );
}
