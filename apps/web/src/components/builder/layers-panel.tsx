"use client";

import { useMemo, useCallback, useRef, useState, useEffect, createElement } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  addSection,
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
  setEditingZone,
} from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import {
  Copy, Eye, EyeOff, Lock, LockOpen, MoreHorizontal, MoveDown, MoveUp,
  Star, Trash2, GripVertical, ChevronRight, ChevronDown,
  PanelLeft, PanelRightOpen, PanelBottom, Layers, Filter,
  Menu, Search, ShoppingCart, User, Image,
  Type, Grid3x3, LayoutList, Sparkles, X,
  ArrowUpToLine, ArrowDownToLine, Bookmark, Download,
} from "lucide-react";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { useCreateBuilderTemplateMutation } from "@/redux/api/builder-template-api";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";

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
  if (normalized.includes("product") || normalized.includes("product-grid")) children.push("Product Grid");
  if (normalized.includes("category") || normalized.includes("category-grid")) children.push("Category Items");
  if (normalized === "newsletter") children.push("Form");
  if (normalized === "faq" || normalized === "accordion") children.push("Accordion Items");
  if (normalized.includes("testimonial")) children.push("Testimonial Cards");
  if (normalized.includes("feature")) children.push("Feature Items");
  if (normalized.includes("pricing")) children.push("Pricing Tiers");
  if (normalized.includes("team")) children.push("Team Members");
  if (normalized.includes("gallery") || normalized.includes("image")) children.push("Images");
  if (normalized.includes("stat") || normalized.includes("counter")) children.push("Statistics");
  if (normalized.includes("timeline")) children.push("Timeline Items");
  if (normalized.includes("tab")) children.push("Tab Items");
  return children;
}

function getSectionIcon(type: string) {
  const normalized = normalizeSectionType(type);
  if (normalized.includes("hero") || normalized.includes("banner")) return Image;
  if (normalized.includes("product") || normalized.includes("shop")) return ShoppingCart;
  if (normalized.includes("category")) return Grid3x3;
  if (normalized.includes("footer")) return PanelBottom;
  if (normalized.includes("header") || normalized.includes("nav")) return Menu;
  if (normalized.includes("feature") || normalized.includes("benefit")) return Sparkles;
  if (normalized.includes("testimonial") || normalized.includes("review")) return Star;
  if (normalized.includes("faq") || normalized.includes("accordion")) return LayoutList;
  if (normalized.includes("newsletter") || normalized.includes("form")) return Type;
  return Layers;
}

type DragItem = {
  id: string;
  fromIndex: number;
  zone: "header" | "body" | "footer";
};

type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
  sectionId: string;
  zone: "header" | "body" | "footer";
  index: number;
  totalCount: number;
};

// ─── Context Menu (right-click, positioned at cursor) ─────────────────────────

function SectionContextMenu({
  items,
  x,
  y,
  onClose,
}: {
  items: DropdownItem[];
  x: number;
  y: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const menuX = Math.min(x, window.innerWidth - 220);
  const menuY = Math.min(y, window.innerHeight - 480);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[100] w-56 rounded-xl border border-zinc-200/80 bg-white py-1.5 shadow-2xl shadow-black/10 ring-1 ring-black/5"
      style={{ left: menuX, top: menuY }}
    >
      {items.map((item, index) => {
        if ("divider" in item && item.divider) {
          return <div key={item.key ?? `div-${index}`} className="my-1 border-t border-zinc-100" />;
        }
        const i = item as Extract<DropdownItem, { label: string }>;
        const Icon = i.icon;
        return (
          <button
            key={i.key ?? i.label}
            type="button"
            disabled={i.disabled}
            onClick={() => {
              if (!i.disabled) {
                i.onClick();
                onClose();
              }
            }}
            className={cn(
              "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium outline-none transition-colors",
              i.disabled && "cursor-not-allowed opacity-40",
              !i.disabled && i.danger && "text-red-600 hover:bg-red-50",
              !i.disabled && !i.danger && "text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {Icon && (
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                i.danger ? "text-red-500" : "text-zinc-400"
              )} />
            )}
            <span className="truncate">{i.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

// ─── Menu Items Builder ──────────────────────────────────────────────────────

function buildMenuItems(
  section: BuilderSection,
  zone: "header" | "body" | "footer",
  index: number,
  totalCount: number,
  clipboardSection: BuilderSection | null,
  dispatch: ReturnType<typeof useDispatch>,
  createTemplate: ReturnType<typeof useCreateBuilderTemplateMutation>[0],
  storeId: string,
): DropdownItem[] {
  return [
    {
      label: "Duplicate",
      icon: Copy,
      onClick: () => dispatch(duplicateSection(section.id)),
    },
    {
      label: "Copy",
      icon: Copy,
      onClick: () => dispatch(copySection(section.id)),
    },
    {
      label: "Paste",
      icon: Copy,
      onClick: () => dispatch(pasteSection(section.id)),
      disabled: !clipboardSection,
    },
    { divider: true },
    section.visible
      ? { label: "Hide", icon: EyeOff, onClick: () => dispatch(toggleSection(section.id)) }
      : { label: "Show", icon: Eye, onClick: () => dispatch(toggleSection(section.id)) },
    section.locked
      ? { label: "Unlock", icon: LockOpen, onClick: () => dispatch(toggleSectionLock(section.id)) }
      : { label: "Lock", icon: Lock, onClick: () => dispatch(toggleSectionLock(section.id)) },
    { divider: true },
    {
      label: "Move Up",
      icon: MoveUp,
      onClick: () => { if (index > 0) dispatch(moveSection({ from: index, to: index - 1 })); },
      disabled: index === 0,
    },
    {
      label: "Move Down",
      icon: MoveDown,
      onClick: () => { if (index < totalCount - 1) dispatch(moveSection({ from: index, to: index + 1 })); },
      disabled: index >= totalCount - 1,
    },
    {
      label: "Move to Top",
      icon: ArrowUpToLine,
      onClick: () => { if (index > 0) dispatch(moveSection({ from: index, to: 0 })); },
      disabled: index === 0,
    },
    {
      label: "Move to Bottom",
      icon: ArrowDownToLine,
      onClick: () => { if (index < totalCount - 1) dispatch(moveSection({ from: index, to: totalCount - 1 })); },
      disabled: index >= totalCount - 1,
    },
    { divider: true },
    {
      label: "Save as Template",
      icon: Bookmark,
      onClick: () => {
        createTemplate({
          storeId,
          name: section.label,
          description: `Section template from "${section.label}"`,
          category: section.type,
          templateType: "section",
          sections: [section],
        });
      },
    },
    {
      label: "Export Section",
      icon: Download,
      onClick: () => {
        const json = JSON.stringify(section, null, 2);
        navigator.clipboard.writeText(json);
      },
    },
    { divider: true },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => dispatch(removeSection(section.id)),
      danger: true,
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LayersPanel() {
  const dispatch = useDispatch();
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const clipboardSection = useSelector((s: RootState) => s.builder.clipboardSection);

  const { storeId } = useRequiredStore();
  const [createTemplate] = useCreateBuilderTemplateMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedRegions, setCollapsedRegions] = useState<Record<string, boolean>>({
    header: false,
    footer: false,
  });
  const [dragOver, setDragOver] = useState<{ zone: string; index: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false, x: 0, y: 0, sectionId: "", zone: "body", index: 0, totalCount: 0,
  });
  const dragItem = useRef<DragItem | null>(null);

  const toggleRegion = (region: string) => {
    setCollapsedRegions((prev) => ({ ...prev, [region]: !prev[region] }));
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, open: false }));
  }, []);

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((sectionId: string, index: number, zone: "header" | "body" | "footer") => {
    dragItem.current = { id: sectionId, fromIndex: index, zone };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, zone: "header" | "body" | "footer", index: number) => {
    e.preventDefault();
    setDragOver({ zone, index });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetZone: "header" | "body" | "footer", toIndex: number) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragItem.current) return;
    const { fromIndex, zone: fromZone } = dragItem.current;
    if (fromZone !== targetZone || fromIndex !== toIndex) {
      if (fromZone === targetZone) {
        dispatch(moveSection({ from: fromIndex, to: toIndex }));
      } else {
        const sourceList = getZoneSections(fromZone);
        const item = sourceList[fromIndex];
        if (item) {
          dispatch(removeSection(item.id));
          dispatch(setEditingZone(targetZone));
          setTimeout(() => {
            dispatch(addSection({
              ...item,
              id: `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              label: `${item.label}`,
            }));
          }, 0);
        }
      }
    }
    dragItem.current = null;
  }, [dispatch]);

  const handleDropZone = useCallback((e: React.DragEvent, zone: "header" | "body" | "footer") => {
    e.preventDefault();
    setDragOver(null);
    if (!dragItem.current) return;
    const { zone: fromZone } = dragItem.current;
    if (fromZone !== zone) {
      const sourceList = getZoneSections(fromZone);
      const item = sourceList[dragItem.current.fromIndex];
      if (item) {
        dispatch(removeSection(item.id));
        dispatch(setEditingZone(zone));
        setTimeout(() => {
          dispatch(addSection({
            ...item,
            id: `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label: `${item.label}`,
          }));
        }, 0);
      }
    }
    setDragOver(null);
    dragItem.current = null;
  }, []);

  // ─── Right-click handler ─────────────────────────────────────────────────────

  const handleContextMenu = useCallback((
    e: React.MouseEvent,
    sectionId: string,
    zone: "header" | "body" | "footer",
    index: number,
    totalCount: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setEditingZone(zone));
    dispatch(setSelectedSection(sectionId));
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      sectionId,
      zone,
      index,
      totalCount,
    });
  }, [dispatch]);

  // ─── Zone helpers ────────────────────────────────────────────────────────────

  const getZoneSections = (zone: "header" | "body" | "footer") => {
    if (zone === "header") return headerSections;
    if (zone === "footer") return footerSections;
    return sections;
  };

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)));
  }, [sections]);

  // ─── Render section item ─────────────────────────────────────────────────────

  const renderSectionItem = (section: typeof sections[0], index: number, zone: "header" | "body" | "footer", totalCount: number) => {
    const def = getSectionDef(section.type);
    const children = getLayerChildren(section.type, section.props);
    const selected = selectedSectionId === section.id;
    const currentIndex = zone === "body" ? sections.findIndex((s) => s.id === section.id) : index;
    const zoneSections = getZoneSections(zone);
    const Icon = getSectionIcon(section.type);

    const menuItems = buildMenuItems(
      section, zone, currentIndex, totalCount,
      clipboardSection, dispatch, createTemplate, storeId,
    );

    return (
      <div
        key={section.id}
        className="group relative"
        onContextMenu={(e) => handleContextMenu(e, section.id, zone, currentIndex, totalCount)}
      >
        {/* Drop indicator */}
        {dragOver?.zone === zone && dragOver.index === index && (
          <div className="flex items-center gap-1 px-2 py-0.5">
            <div className="h-0.5 flex-1 rounded-full bg-blue-500" />
          </div>
        )}

        <div
          draggable
          onDragStart={() => handleDragStart(section.id, currentIndex, zone)}
          onDragOver={(e) => handleDragOver(e, zone, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, zone, index)}
          onClick={() => {
            dispatch(setEditingZone(zone));
            dispatch(setSelectedSection(section.id));
          }}
          className={cn(
            "group/section mb-1 cursor-pointer rounded-xl border px-3 py-2.5 transition-all",
            selected
              ? "border-zinc-900/80 bg-zinc-50 shadow-sm"
              : "border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50/50"
          )}
        >
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <div className="shrink-0 cursor-grab text-zinc-300 opacity-0 group-hover/section:opacity-100 transition-opacity active:cursor-grabbing">
              <GripVertical className="h-3.5 w-3.5" />
            </div>

            {/* Section type icon */}
            <div className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
              selected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
            )}>
              <Icon className="h-3 w-3" />
            </div>

            {/* Section info */}
            <div className="min-w-0 flex-1">
              <input
                value={section.label}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => dispatch(updateSectionMeta({ id: section.id, label: e.target.value }))}
                className="w-full truncate bg-transparent text-xs font-semibold text-zinc-900 outline-none"
              />
              <p className="text-[10px] text-zinc-400 leading-tight">{def?.label || normalizeSectionType(section.type)}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(toggleSection(section.id)); }}
                className={cn(
                  "rounded-md p-1 opacity-0 group-hover/section:opacity-100 transition-all",
                  section.visible ? "text-zinc-400 hover:text-zinc-600" : "text-red-400"
                )}
                title={section.visible ? "Hide section" : "Show section"}
              >
                {section.visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); dispatch(toggleSectionLock(section.id)); }}
                className="rounded-md p-1 text-zinc-400 opacity-0 group-hover/section:opacity-100 hover:text-zinc-600 transition-all"
                title={section.locked ? "Unlock section" : "Lock section"}
              >
                {section.locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
              </button>

              <DropdownMenu
                placement="bottom-end"
                trigger={
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 opacity-0 group-hover/section:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 transition-all"
                    aria-label="Section actions"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                }
                items={menuItems}
              />
            </div>
          </div>

          {/* Children list */}
          {children.length > 0 && (
            <div className="ml-9 mt-2 space-y-0.5 border-l-2 border-zinc-100 pl-3">
              {children.map((child) => (
                <div
                  key={child}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-zinc-500 hover:bg-zinc-100"
                >
                  <div className="h-1 w-1 rounded-full bg-zinc-300" />
                  {child}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Render region ───────────────────────────────────────────────────────────

  const renderRegion = (
    label: string,
    zone: "header" | "body" | "footer",
    icon: typeof Layers,
    sections: typeof headerSections,
    colorClass: string,
  ) => {
    const isCollapsed = collapsedRegions[zone] ?? false;
    const isActive = editingZone === zone;

    return (
      <div className={cn("mb-2 rounded-xl border transition-all", isActive ? "border-zinc-900/20 bg-zinc-50" : "border-transparent")}>
        {/* Region header */}
        <button
          onClick={() => { toggleRegion(zone); dispatch(setEditingZone(zone)); }}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all",
            isActive ? "bg-zinc-100" : "hover:bg-zinc-50"
          )}
        >
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-white", colorClass)}>
            {createElement(icon, { className: "h-3 w-3" })}
          </div>
          <span className="flex-1 text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
          <span className="text-[10px] font-medium text-zinc-400">{sections.length}</span>
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
        </button>

        {/* Region sections */}
        {!isCollapsed && (
          <div className="px-2 pb-2">
            {sections.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-[11px] text-zinc-400">
                  {zone === "header" ? "No header sections yet" :
                   zone === "footer" ? "No footer sections yet" :
                   "No sections on this page"}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-300">Add sections from the library</p>
              </div>
            ) : (
              sections.map((section, index) => renderSectionItem(section, index, zone, sections.length))
            )}

            {/* Drop zone at end of region */}
            <div
              onDragOver={(e) => handleDragOver(e, zone, sections.length)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone, sections.length)}
              className={cn(
                "mt-1 rounded-lg border-2 border-dashed p-2 text-center transition-all",
                dragOver?.zone === zone && dragOver.index === sections.length
                  ? "border-blue-400 bg-blue-50"
                  : "border-transparent"
              )}
            >
              {dragOver?.zone === zone && dragOver.index === sections.length && (
                <p className="text-[10px] font-medium text-blue-600">Drop here</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Build context menu items for right-click ────────────────────────────────

  const contextMenuItems = useMemo(() => {
    if (!contextMenu.open || !contextMenu.sectionId) return [];
    const allSections = getZoneSections(contextMenu.zone);
    const section = allSections.find((s) => s.id === contextMenu.sectionId);
    if (!section) return [];
    return buildMenuItems(
      section, contextMenu.zone, contextMenu.index, contextMenu.totalCount,
      clipboardSection, dispatch, createTemplate, storeId,
    );
  }, [contextMenu, clipboardSection, dispatch, createTemplate, storeId, sections, headerSections, footerSections]);

  return (
    <aside className="flex h-full flex-col bg-white">
      <div className="border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
            <PanelLeft className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Layers</p>
            <p className="text-xs font-semibold text-zinc-900">Page Structure</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-1 pt-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter sections..."
            className="h-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-7 pr-7 text-[11px] text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:bg-white" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
        {(() => {
          const q = searchQuery.toLowerCase();
          const filterFn = (s: typeof sections[0]) => !q || s.label.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
          return (
            <>
              {renderRegion("Header", "header", Menu, headerSections.filter(filterFn), "bg-blue-500")}
              <div className="border-t border-zinc-100 pt-2">
                {renderRegion("Body", "body", Layers, sections.filter(filterFn), "bg-zinc-800")}
              </div>
              <div className="border-t border-zinc-100 pt-2">
                {renderRegion("Footer", "footer", PanelBottom, footerSections.filter(filterFn), "bg-purple-500")}
              </div>
            </>
          );
        })()}
      </div>

      {/* Right-click context menu */}
      {contextMenu.open && contextMenuItems.length > 0 && (
        <SectionContextMenu
          items={contextMenuItems}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}
    </aside>
  );
}
