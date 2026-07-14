"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateSectionProps, setSelectedSection, updateSectionMeta, setActiveRightTab, toggleRightPanel, setRightPanelPinned } from "@/redux/slices/builder-slice";
import type { RightTab } from "@/redux/slices/builder-slice";
import { X, Type, Layers, AlignLeft, PaintBucket, Ruler, ChevronDown, Lightbulb, Sparkles, MonitorSmartphone, Box, Globe, Eye, Pin } from "lucide-react";
import { useState } from "react";
import { getSectionDef, type SectionPropDef } from "@/lib/section-registry";
import { BuilderMediaField } from "@/components/builder/builder-media-field";
import { useRequiredStore } from "@/providers/store-context";

// ─── Control components ──────────────────────────────────────────

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-zinc-200 p-0.5" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="#000000" className="h-7 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
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
    case "toggle": {
      const isOn = value === "true";
      return <button onClick={() => onChange(isOn ? "false" : "true")}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isOn ? "bg-zinc-900" : "bg-zinc-200"}`}>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
      </button>;
    }
    case "select":
    case "grid-columns":
      return <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
        {propDef.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>;
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
  content: "Content", layout: "Layout", background: "Background", typography: "Typography", spacing: "Spacing", advanced: "Advanced",
};

const groupOrder = ["content", "layout", "background", "typography", "spacing", "advanced"];

const TABS: Array<{ key: RightTab; label: string; icon: typeof Type }> = [
  { key: "content", label: "Content", icon: Type },
  { key: "style", label: "Style", icon: PaintBucket },
  { key: "layout", label: "Layout", icon: Box },
  { key: "responsive", label: "Responsive", icon: MonitorSmartphone },
  { key: "animation", label: "Animation", icon: Sparkles },
  { key: "seo", label: "SEO", icon: Globe },
  { key: "visibility", label: "Visibility", icon: Eye },
  { key: "advanced", label: "Advanced", icon: Lightbulb },
];

// ─── Main Panel ──────────────────────────────────────────────────

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const { storeId, storeSlug } = useRequiredStore();
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const section = useSelector((s: RootState) => s.builder.sections.find((sec) => sec.id === selectedId));
  const activeRightTab = useSelector((s: RootState) => s.builder.activeRightTab);
  const rightPanelPinned = useSelector((s: RootState) => s.builder.rightPanelPinned);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (g: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  if (!section) {
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

  const tabGroups: Record<string, string[]> = {
    content: ["content"],
    style: ["background", "typography"],
    layout: ["layout", "spacing"],
    responsive: [],
    animation: [],
    seo: [],
    visibility: [],
    advanced: ["advanced"],
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
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {groupOrder.filter((g) => grouped[g]?.length && tabGroups[activeRightTab]?.includes(g)).map((group) => {
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
                      <div key={key}>
                        <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                          {propDef.label}
                          {propDef.responsive && <span className="rounded bg-blue-50 px-1 text-[8px] font-bold text-blue-500">R</span>}
                        </label>
                        <ControlRenderer propDef={propDef} propKey={key} value={val}
                          onChange={(v) => handlePropChange(key, v)}
                          onSectionPropsChange={handleSectionPropsChange}
                          sectionProps={section.props} storeId={storeId} storeSlug={storeSlug} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state for tabs without controls */}
        {(activeRightTab === "animation" || activeRightTab === "responsive" || activeRightTab === "seo" || activeRightTab === "visibility") && (
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50">
              {activeRightTab === "animation" && <Sparkles className="h-5 w-5 text-zinc-300" />}
              {activeRightTab === "responsive" && <MonitorSmartphone className="h-5 w-5 text-zinc-300" />}
              {activeRightTab === "seo" && <Globe className="h-5 w-5 text-zinc-300" />}
              {activeRightTab === "visibility" && <Eye className="h-5 w-5 text-zinc-300" />}
            </div>
            <p className="text-sm font-medium text-zinc-700">
              {activeRightTab === "animation" && "Animation Controls"}
              {activeRightTab === "responsive" && "Responsive Settings"}
              {activeRightTab === "seo" && "SEO Settings"}
              {activeRightTab === "visibility" && "Visibility Settings"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {activeRightTab === "animation" && "Select a section and open the Animation drawer for motion presets."}
              {activeRightTab === "responsive" && "Per-device overrides (desktop, tablet, mobile) will appear here for sections that support them."}
              {activeRightTab === "seo" && "Page-level SEO meta tags (title, description, OG) can be configured in Page Settings."}
              {activeRightTab === "visibility" && "Show/hide this section per device, set visibility rules, or password protect."}
            </p>
          </div>
        )}

        {controls.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-zinc-400">No editable properties for this section type</p>
          </div>
        )}
      </div>
    </div>
  );
}
