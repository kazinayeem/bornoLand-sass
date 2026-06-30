"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  copySection,
  duplicateSection,
  moveSection,
  pasteSection,
  removeSection,
  setSelectedSection,
  toggleSectionFavorite,
  toggleSectionLock,
  toggleSection,
  updateSectionMeta,
} from "@/redux/slices/builder-slice";
import { Copy, Eye, EyeOff, Lock, LockOpen, MoreHorizontal, MoveDown, MoveUp, PanelLeft, Star, Trash2 } from "lucide-react";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";

function getLayerChildren(type: string, props: Record<string, string>) {
  const normalized = normalizeSectionType(type);
  const children: string[] = [];
  if (normalized.includes("hero")) {
    if (props.kicker) children.push("Badge");
    if (props.headline) children.push("Heading");
    if (props.subheadline) children.push("Description");
    if (props.buttonText) children.push("Button 1");
    if (props.secondaryButtonText) children.push("Button 2");
    if (props.imageUrl || props.bgImage) children.push("Background Image");
  }
  if (normalized.includes("footer")) children.push("Footer Links");
  if (normalized.includes("product")) children.push("Product Grid");
  if (normalized.includes("category")) children.push("Category Items");
  if (normalized === "newsletter") children.push("Form");
  if (normalized === "faq") children.push("Accordion Items");
  return children;
}

export function LayersPanel() {
  const dispatch = useDispatch();
  const sections = useSelector((s: RootState) => s.builder.sections);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const clipboardSection = useSelector((s: RootState) => s.builder.clipboardSection);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)));
  }, [sections]);

  return (
    <aside className="flex h-full flex-col bg-white">
      <div className="border-b border-zinc-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
            <PanelLeft className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Layers</p>
            <p className="text-sm font-semibold text-zinc-900">Page Structure</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sortedSections.map((section, index) => {
          const def = getSectionDef(section.type);
          const children = getLayerChildren(section.type, section.props);
          const selected = selectedSectionId === section.id;
          const currentIndex = sections.findIndex((s) => s.id === section.id);
          return (
            <div
              key={section.id}
              className={`group mb-2 rounded-2xl border p-3 transition-all ${
                selected ? "border-zinc-900/80 bg-zinc-50" : "border-transparent bg-zinc-50/70 hover:border-zinc-200 hover:bg-white"
              }`}
              onClick={() => dispatch(setSelectedSection(section.id))}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(toggleSectionFavorite(section.id));
                  }}
                  className={`mt-0.5 text-zinc-300 hover:text-amber-500 ${section.favorite ? "text-amber-500" : ""}`}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <input
                    value={section.label}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => dispatch(updateSectionMeta({ id: section.id, label: event.target.value }))}
                    className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                  />
                  <p className="mt-0.5 text-[11px] text-zinc-400">{def?.label || normalizeSectionType(section.type)}</p>
                  {children.length > 0 && (
                    <div className="mt-2 space-y-1 pl-3">
                      {children.map((child) => (
                        <p key={child} className="text-[11px] text-zinc-500">
                          {child}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuOpenFor((current) => (current === section.id ? null : section.id));
                    }}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpenFor === section.id && (
                    <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
                      <button onClick={() => { dispatch(duplicateSection(section.id)); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                      <button onClick={() => { dispatch(copySection(section.id)); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"><Copy className="h-3.5 w-3.5" /> Copy</button>
                      <button onClick={() => { dispatch(pasteSection(section.id)); setMenuOpenFor(null); }} disabled={!clipboardSection} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"><Copy className="h-3.5 w-3.5" /> Paste</button>
                      <button onClick={() => { dispatch(toggleSection(section.id)); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">{section.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{section.visible ? "Hide" : "Show"}</button>
                      <button onClick={() => { dispatch(toggleSectionLock(section.id)); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">{section.locked ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}{section.locked ? "Unlock" : "Lock"}</button>
                      <button onClick={() => { if (currentIndex > 0) dispatch(moveSection({ from: currentIndex, to: currentIndex - 1 })); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"><MoveUp className="h-3.5 w-3.5" /> Move Up</button>
                      <button onClick={() => { if (currentIndex < sections.length - 1) dispatch(moveSection({ from: currentIndex, to: currentIndex + 1 })); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"><MoveDown className="h-3.5 w-3.5" /> Move Down</button>
                      <button onClick={() => { dispatch(removeSection(section.id)); setMenuOpenFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
