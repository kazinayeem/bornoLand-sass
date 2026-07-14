"use client";

import { useMemo } from "react";
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
import { DropdownMenu } from "@/components/ui/dropdown-menu";

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

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        {sortedSections.map((section, index) => {
          const def = getSectionDef(section.type);
          const children = getLayerChildren(section.type, section.props);
          const selected = selectedSectionId === section.id;
          const currentIndex = sections.findIndex((s) => s.id === section.id);
          return (
            <div
              key={section.id}
              className={`group mb-2 rounded-2xl border p-3 transition-all overflow-visible ${
                selected ? "border-zinc-900/80 bg-zinc-50" : "border-transparent bg-zinc-50/70 hover:border-zinc-200 hover:bg-white"
              }`}
              onClick={() => dispatch(setSelectedSection(section.id))}
            >
              <div className="flex items-start gap-3 overflow-visible">
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
                <div className="min-w-0 flex-1 overflow-hidden">
                  <input
                    value={section.label}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => dispatch(updateSectionMeta({ id: section.id, label: event.target.value }))}
                    className="w-full truncate bg-transparent text-sm font-semibold text-zinc-900 outline-none"
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
                <div className="shrink-0 self-start">
                  <DropdownMenu
                    placement="bottom-end"
                    trigger={
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                        aria-label="Section actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    }
                    items={[
                      { label: "Duplicate", icon: Copy,    onClick: () => dispatch(duplicateSection(section.id)) },
                      { label: "Copy",      icon: Copy,    onClick: () => dispatch(copySection(section.id)) },
                      { label: "Paste",     icon: Copy,    onClick: () => dispatch(pasteSection(section.id)), disabled: !clipboardSection },
                      { divider: true },
                      section.visible
                        ? { label: "Hide",   icon: EyeOff,   onClick: () => dispatch(toggleSection(section.id)) }
                        : { label: "Show",   icon: Eye,      onClick: () => dispatch(toggleSection(section.id)) },
                      section.locked
                        ? { label: "Unlock", icon: LockOpen, onClick: () => dispatch(toggleSectionLock(section.id)) }
                        : { label: "Lock",   icon: Lock,     onClick: () => dispatch(toggleSectionLock(section.id)) },
                      { divider: true },
                      { label: "Move Up",   icon: MoveUp,   onClick: () => { if (currentIndex > 0) dispatch(moveSection({ from: currentIndex, to: currentIndex - 1 })); }, disabled: currentIndex === 0 },
                      { label: "Move Down", icon: MoveDown, onClick: () => { if (currentIndex < sections.length - 1) dispatch(moveSection({ from: currentIndex, to: currentIndex + 1 })); }, disabled: currentIndex === sections.length - 1 },
                      { divider: true },
                      { label: "Delete",    icon: Trash2,   onClick: () => dispatch(removeSection(section.id)), danger: true },
                    ]}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
