"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import { updateSectionProps, setSelectedSection, setEditingSection } from "@/redux/slices/builder-slice";
import { X } from "lucide-react";

export function PropertiesPanel() {
  const dispatch = useDispatch();
  const selectedId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const section = useSelector((s: RootState) =>
    s.builder.sections.find((sec) => sec.id === selectedId)
  );

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

  const sectionLabels: Record<string, Record<string, string>> = {
    hero: { headline: "Headline", subheadline: "Subheadline", buttonText: "Button Text" },
    features: { title: "Section Title" },
    products: { title: "Section Title" },
    testimonials: { title: "Section Title" },
    cta: { headline: "Headline", buttonText: "Button Text" },
    footer: { copyright: "Copyright Text" },
  };

  const labels = sectionLabels[section.type] ?? {};

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {section.label}
        </p>
        <button onClick={() => dispatch(setSelectedSection(null))}
          className="rounded p-0.5 text-zinc-400 hover:text-zinc-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(section.props).map(([key, value]) => (
          <div key={key}>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500">
              {labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            </label>
            <input type="text" value={value}
              onChange={(e) => handlePropChange(key, e.target.value)}
              className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
          </div>
        ))}
      </div>

      {Object.keys(section.props).length === 0 && (
        <p className="text-xs text-zinc-400">No editable properties</p>
      )}
    </div>
  );
}
