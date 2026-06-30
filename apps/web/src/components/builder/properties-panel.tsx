"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateSectionProps, setSelectedSection, updateSectionMeta } from "@/redux/slices/builder-slice";
import { X, Type, Layers, AlignLeft, PaintBucket, Ruler, ChevronDown, Lightbulb, Sparkles, MonitorSmartphone, Box } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { getSectionDef, type SectionPropDef } from "@/lib/section-registry";
import { MediaPicker } from "@/components/media/media-picker";
import { normalizeMediaSelection, type MediaSelection } from "@/lib/media-selection";

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

function ImageInput({ storeId, storeSlug, label, value, onChange }: { storeId?: string; storeSlug?: string; label: string; value: string; onChange: (v: string) => void }) {
  const selection = normalizeMediaSelection(value);
  if (!storeId || !storeSlug) {
    return (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none" />
    );
  }
  return (
    <MediaPicker
      storeId={storeId}
      billingHref={`/store/${storeSlug}/billing`}
      folder="builder"
      label={label}
      value={selection}
      onChange={(selected: MediaSelection) => onChange(selected.url)}
    />
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

function AlignInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { value: "left", icon: "≡" },
    { value: "center", icon: "≡" },
    { value: "right", icon: "≡" },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`flex h-7 flex-1 items-center justify-center rounded-lg border text-xs transition-colors ${
            value === o.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
          }`}
          style={{ textAlign: o.value as any }}>
          {o.value === "left" ? "≡" : o.value === "center" ? "≡" : "≡"}
        </button>
      ))}
    </div>
  );
}

function ControlRenderer({ propDef, value, onChange, storeId, storeSlug, fieldLabel }: { propDef: SectionPropDef; value: string; onChange: (v: string) => void; storeId?: string; storeSlug?: string; fieldLabel: string }) {
  switch (propDef.type) {
    case "color": return <ColorInput value={value} onChange={onChange} />;
    case "image": return <ImageInput storeId={storeId} storeSlug={storeSlug} label={fieldLabel} value={value} onChange={onChange} />;
    case "range": return <RangeInput value={value} onChange={onChange} min={propDef.min} max={propDef.max} step={propDef.step} />;
    case "align": return <AlignInput value={value} onChange={onChange} />;
    case "toggle": {
      const isOn = value === "true";
      return (
        <button onClick={() => onChange(isOn ? "false" : "true")}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${isOn ? "bg-zinc-900" : "bg-zinc-200"}`}>
          <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
        </button>
      );
    }
    case "select":
    case "grid-columns": {
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)}
          className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 focus:border-zinc-400 focus:outline-none">
          {propDef.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    case "textarea": {
      return (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={propDef.placeholder}
          className="h-auto min-h-[56px] w-full resize-none rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
      );
    }
    case "number": {
      return (
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
          className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
      );
    }
    case "video":
    case "url": {
      return (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
          className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
      );
    }
    default: {
      return (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={propDef.placeholder}
          className="h-7 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none" />
      );
    }
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
  content: "Content",
  layout: "Layout",
  background: "Background",
  typography: "Typography",
  spacing: "Spacing",
  advanced: "Advanced",
};

const groupOrder = ["content", "layout", "background", "typography", "spacing", "advanced"];

// ─── Main Panel ──────────────────────────────────────────────────

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const params = useParams();
  const storeId = typeof params.storeId === "string" ? params.storeId : undefined;
  const storeSlug = typeof params.storeSlug === "string" ? params.storeSlug : undefined;
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const section = useSelector((s: RootState) => s.builder.sections.find((sec) => sec.id === selectedId));

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"general" | "content" | "style" | "layout" | "animation" | "responsive" | "advanced">("content");

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
          <p className="text-xs text-zinc-400">Select a section to edit</p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key: string, value: string) => {
    dispatch(updateSectionProps({ id: section.id, props: { ...section.props, [key]: value } }));
  };

  const def = getSectionDef(section.type);
  const allProps = def?.props ?? {};
  const controls = Object.entries(allProps);

  // Group props
  const grouped: Record<string, [string, SectionPropDef][]> = {};
  for (const [key, propDef] of controls) {
    const group = propDef.group || "content";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push([key, propDef]);
  }

  const tabGroups: Record<typeof activeTab, string[]> = {
    general: ["content"],
    content: ["content"],
    style: ["background", "typography"],
    layout: ["layout", "spacing"],
    animation: [],
    responsive: [],
    advanced: ["advanced"],
  };

  const tabIcons = {
    general: Layers,
    content: Type,
    style: PaintBucket,
    layout: Box,
    animation: Sparkles,
    responsive: MonitorSmartphone,
    advanced: Lightbulb,
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-100">
              <Layers className="h-3 w-3 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{section.label}</p>
              <p className="text-[11px] text-zinc-400">{section.type}</p>
            </div>
          </div>
          <button onClick={() => dispatch(setSelectedSection(null))}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3">
          <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-zinc-500">Section name</label>
          <input
            type="text"
            value={section.label}
            onChange={(e) => dispatch(updateSectionMeta({ id: section.id, label: e.target.value }))}
            className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-1 rounded-2xl bg-zinc-100/80 p-1">
          {[
            { key: "general", label: "General" },
            { key: "content", label: "Content" },
            { key: "style", label: "Style" },
            { key: "layout", label: "Layout" },
            { key: "animation", label: "Animation" },
            { key: "responsive", label: "Responsive" },
            { key: "advanced", label: "Advanced" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium ${
                activeTab === tab.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              {(() => {
                const Icon = tabIcons[tab.key as keyof typeof tabIcons];
                return <Icon className="h-3 w-3" />;
              })()}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {groupOrder.filter((g) => grouped[g]?.length && tabGroups[activeTab].includes(g)).map((group) => {
          const items = grouped[group];
          const isCollapsed = collapsedGroups.has(group);
          return (
            <div key={group}>
              <button onClick={() => toggleGroup(group)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:bg-zinc-50">
                <span className="flex items-center gap-1.5">
                  <GroupIcon group={group} />
                  {groupLabels[group] || group}
                </span>
                <span className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}>
                  <ChevronDown className="h-3 w-3" />
                </span>
              </button>
              {!isCollapsed && (
                <div className="px-4 py-2 space-y-3">
                  {items.map(([key, propDef]) => {
                    const val = section.props[key] ?? "";
                    return (
                      <div key={key}>
                        <label className="mb-1 flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                          {propDef.label}
                          {propDef.responsive && <span className="rounded bg-blue-50 px-1 text-[8px] font-bold text-blue-500">R</span>}
                        </label>
                        <ControlRenderer propDef={propDef} value={val} onChange={(v) => handlePropChange(key, v)} storeId={storeId} storeSlug={storeSlug} fieldLabel={propDef.label} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {tabGroups[activeTab].length > 0 && groupOrder.filter((g) => grouped[g]?.length && tabGroups[activeTab].includes(g)).length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-zinc-700">No settings in this tab yet</p>
            <p className="mt-1 text-xs text-zinc-500">This section does not expose controls for the current category.</p>
          </div>
        )}
        {(activeTab === "animation" || activeTab === "responsive") && (
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-zinc-700">{activeTab === "animation" ? "Animation drawer" : "Responsive drawer"}</p>
            <p className="mt-1 text-xs text-zinc-500">
              Advanced {activeTab} controls are intentionally deferred so the default inspector stays focused and uncluttered.
            </p>
          </div>
        )}
        {controls.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-zinc-400">No editable properties</p>
          </div>
        )}
      </div>
    </div>
  );
}
