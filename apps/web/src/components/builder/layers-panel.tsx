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
  openSectionLibrary,
} from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import {
  Copy, Eye, EyeOff, Lock, LockOpen, MoreHorizontal, MoveDown, MoveUp,
  Star, Trash2, GripVertical, ChevronRight, ChevronDown,
  PanelLeft, PanelBottom, Layers,
  Menu, Search, ShoppingCart, Image,
  Type, Grid3x3, LayoutList, Sparkles, X,
  ArrowUpToLine, ArrowDownToLine, Bookmark, Download,
  Pencil, Plus, ChevronsUpDown, ChevronsDownUp,
  Filter, LayoutGrid,
} from "lucide-react";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { useCreateBuilderTemplateMutation } from "@/redux/api/builder-template-api";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  if (normalized.includes("slider")) children.push("Slides");
  if (normalized.includes("banner")) children.push("Banner Content");
  if (normalized.includes("countdown")) children.push("Timer");
  if (normalized.includes("instagram")) children.push("Posts Feed");
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
  if (normalized.includes("gallery") || normalized.includes("image")) return LayoutGrid;
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

// ─── Section type filter chips ──────────────────────────────────────────────

const TYPE_FILTERS = [
  { id: "all", label: "All", icon: Layers },
  { id: "hero", label: "Hero", icon: Image },
  { id: "product", label: "Products", icon: ShoppingCart },
  { id: "category", label: "Categories", icon: Grid3x3 },
  { id: "content", label: "Content", icon: Type },
  { id: "trust", label: "Trust", icon: Star },
  { id: "marketing", label: "Marketing", icon: Sparkles },
] as const;

type TypeFilterId = typeof TYPE_FILTERS[number]["id"];

// ─── Context Menu (right-click, positioned at cursor) ─────────────────────

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
      className="fixed z-[100] w-56 rounded-xl border border-apple-hairline bg-white py-1.5 shadow-2xl shadow-black/10 ring-1 ring-black/5"
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
              !i.disabled && !i.danger && "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            )}
          >
            {Icon && (
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                i.danger ? "text-red-500" : "text-apple-ink-muted-48"
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
      label: "Rename",
      icon: Pencil,
      onClick: () => {
        dispatch(setSelectedSection(section.id));
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>(`[data-layer-input-id="${section.id}"]`);
          input?.focus();
          input?.select();
        }, 50);
      },
    },
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

export function LayersPanel({ title = "Sections" }: { title?: "Layers" | "Navigator" | "Sections" }) {
  const dispatch = useDispatch();
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const clipboardSection = useSelector((s: RootState) => s.builder.clipboardSection);

  const { storeId } = useRequiredStore();
  const [createTemplate] = useCreateBuilderTemplateMutation();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilterId>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedRegions, setCollapsedRegions] = useState<Record<string, boolean>>({
    header: false,
    footer: false,
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState<{ zone: string; index: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false, x: 0, y: 0, sectionId: "", zone: "body", index: 0, totalCount: 0,
  });
  const dragItem = useRef<DragItem | null>(null);

  // ─── Derived state ──────────────────────────────────────────────────────────
  const totalSections = sections.length + headerSections.length + footerSections.length;

  const toggleRegion = (region: string) => {
    setCollapsedRegions((prev) => ({ ...prev, [region]: !prev[region] }));
  };

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  };

  const expandAll = useCallback(() => {
    const allIds = new Set<string>();
    sections.forEach((s) => allIds.add(s.id));
    headerSections.forEach((s) => allIds.add(s.id));
    footerSections.forEach((s) => allIds.add(s.id));
    setExpandedSections(allIds);
  }, [sections, headerSections, footerSections]);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
    setCollapsedRegions({ header: true, footer: true });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, open: false }));
  }, []);

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((sectionId: string, index: number, zone: "header" | "body" | "footer") => {
    dragItem.current = { id: sectionId, fromIndex: index, zone };
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOver(null);
    dragItem.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, zone: "header" | "body" | "footer", index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver({ zone, index });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetZone: "header" | "body" | "footer", toIndex: number) => {
    e.preventDefault();
    setDragOver(null);
    setIsDragging(false);
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
    setIsDragging(false);
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

  // ─── Filter function ─────────────────────────────────────────────────────────

  const filterSection = useCallback((s: BuilderSection): boolean => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || s.label.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (typeFilter === "all") return true;
    const normalized = normalizeSectionType(s.type);
    switch (typeFilter) {
      case "hero": return normalized.includes("hero") || normalized.includes("banner") || normalized.includes("slider");
      case "product": return normalized.includes("product") || normalized.includes("shop") || normalized.includes("featured");
      case "category": return normalized.includes("category");
      case "content": return normalized.includes("text") || normalized.includes("faq") || normalized.includes("accordion") || normalized.includes("feature") || normalized.includes("team") || normalized.includes("gallery") || normalized.includes("timeline");
      case "trust": return normalized.includes("testimonial") || normalized.includes("review") || normalized.includes("trust") || normalized.includes("badge");
      case "marketing": return normalized.includes("newsletter") || normalized.includes("email") || normalized.includes("popup") || normalized.includes("announcement") || normalized.includes("countdown") || normalized.includes("discount") || normalized.includes("coupon");
      default: return true;
    }
  }, [searchQuery, typeFilter]);

  // ─── Render section item ─────────────────────────────────────────────────────

  const renderSectionItem = (section: BuilderSection, index: number, zone: "header" | "body" | "footer", totalCount: number) => {
    const def = getSectionDef(section.type);
    const children = getLayerChildren(section.type, section.props);
    const selected = selectedSectionId === section.id;
    const currentIndex = zone === "body" ? sections.findIndex((s) => s.id === section.id) : index;
    const Icon = getSectionIcon(section.type);
    const isExpanded = expandedSections.has(section.id);
    const hasChildren = children.length > 0;

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
          <div className="flex items-center gap-1 px-2 py-1">
            <div className="h-0.5 flex-1 rounded-full bg-apple-primary" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-apple-primary" />
            <div className="h-0.5 flex-1 rounded-full bg-apple-primary" />
          </div>
        )}

        <div
          draggable
          onDragStart={() => handleDragStart(section.id, currentIndex, zone)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, zone, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, zone, index)}
          onClick={() => {
            dispatch(setEditingZone(zone));
            dispatch(setSelectedSection(section.id));
          }}
          className={cn(
            "group/section mb-2 cursor-pointer rounded-apple-lg border px-3 py-3 transition-all duration-200 ease-apple",
            selected
              ? "border-apple-primary bg-apple-primary/5 ring-2 ring-apple-primary/25"
              : "border-apple-hairline bg-apple-canvas hover:border-apple-primary/30 hover:bg-apple-canvas-parchment/60",
            isDragging && "scale-[0.98] opacity-60"
          )}
        >
          <div className="flex items-center gap-1.5">
            {/* Expand/collapse toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(section.id); }}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all",
                hasChildren
                  ? "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80"
                  : "text-transparent cursor-default"
              )}
            >
              {hasChildren && (
                isExpanded
                  ? <ChevronDown className="h-3 w-3" />
                  : <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {/* Drag handle */}
            <div className="shrink-0 cursor-grab text-apple-ink-muted-48 opacity-60 transition-opacity group-hover/section:opacity-100 active:cursor-grabbing">
              <GripVertical className="h-4 w-4" />
            </div>

            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-apple-md transition-all",
                selected ? "bg-apple-primary text-apple-on-primary" : "bg-apple-canvas-parchment text-apple-ink-muted-48"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <input
                value={section.label}
                data-layer-input-id={section.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => dispatch(updateSectionMeta({ id: section.id, label: e.target.value }))}
                className={cn(
                  "w-full truncate rounded-apple-sm bg-transparent px-1 py-1 text-body-strong outline-none transition-all",
                  selected ? "text-apple-ink" : "text-apple-ink",
                  "focus:bg-apple-canvas focus:ring-2 focus:ring-apple-primary/20"
                )}
              />
              <p className="px-1 text-caption text-apple-ink-muted-48">{def?.label || normalizeSectionType(section.type)}</p>
            </div>

            <div className="flex shrink-0 items-center">
              {/* Move up/down buttons (visible on hover) */}
              <button
                onClick={(e) => { e.stopPropagation(); if (currentIndex > 0) dispatch(moveSection({ from: currentIndex, to: currentIndex - 1 })); }}
                disabled={currentIndex === 0}
                className="rounded-md p-1 text-apple-ink-muted-48 opacity-0 group-hover/section:opacity-100 hover:text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-all disabled:opacity-0 disabled:cursor-not-allowed"
                title="Move up"
              >
                <MoveUp className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if (currentIndex < totalCount - 1) dispatch(moveSection({ from: currentIndex, to: currentIndex + 1 })); }}
                disabled={currentIndex >= totalCount - 1}
                className="rounded-md p-1 text-apple-ink-muted-48 opacity-0 group-hover/section:opacity-100 hover:text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-all disabled:opacity-0 disabled:cursor-not-allowed"
                title="Move down"
              >
                <MoveDown className="h-3 w-3" />
              </button>

              {/* Visibility toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(toggleSection(section.id)); }}
                className={cn(
                  "rounded-md p-1 opacity-0 group-hover/section:opacity-100 transition-all",
                  section.visible ? "text-apple-ink-muted-48 hover:text-apple-ink-muted-80 hover:bg-apple-canvas-parchment" : "text-red-400 hover:bg-red-50"
                )}
                title={section.visible ? "Hide section" : "Show section"}
              >
                {section.visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>

              {/* Lock toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(toggleSectionLock(section.id)); }}
                className={cn(
                  "rounded-md p-1 opacity-0 group-hover/section:opacity-100 transition-all",
                  section.locked ? "text-amber-500" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                )}
                title={section.locked ? "Unlock section" : "Lock section"}
              >
                {section.locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
              </button>

              {/* More menu */}
              <DropdownMenu
                placement="bottom-end"
                trigger={
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-apple-ink-muted-48 opacity-0 group-hover/section:opacity-100 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-all"
                    aria-label="Section actions"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                }
                items={menuItems}
              />
            </div>
          </div>

          {/* Children list (expandable) */}
          {hasChildren && (
            <div
              className={cn(
                "ml-7 mt-2 space-y-0.5 overflow-hidden border-l-2 border-apple-divider-soft pl-3 transition-all duration-200 ease-apple",
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {children.map((child) => (
                <div
                  key={child}
                  className="flex cursor-default items-center gap-2 rounded-apple-md px-2 py-1.5 text-caption text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-apple-ink-muted-48/40" />
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
    sectionList: BuilderSection[],
    colorClass: string,
  ) => {
    const isCollapsed = collapsedRegions[zone] ?? false;
    const isActive = editingZone === zone;
    const filteredSections = sectionList.filter(filterSection);

    return (
      <div className={cn("mb-3 rounded-apple-lg border transition-all duration-200 ease-apple", isActive ? "border-apple-primary/20 bg-apple-primary/[0.03]" : "border-transparent")}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => { toggleRegion(zone); dispatch(setEditingZone(zone)); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleRegion(zone);
              dispatch(setEditingZone(zone));
            }
          }}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-apple-lg px-3 py-2.5 text-left outline-none transition-all",
            isActive ? "bg-apple-canvas-parchment" : "hover:bg-apple-canvas-parchment/60"
          )}
        >
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-apple-md text-white", colorClass)}>
            {createElement(icon, { className: "h-3.5 w-3.5" })}
          </div>
          <span className="flex-1 text-body-strong text-apple-ink">{label}</span>
          <span className="rounded-apple-pill bg-apple-canvas-parchment px-2 py-0.5 text-caption font-medium text-apple-ink-muted-48">
            {filteredSections.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setEditingZone(zone));
              dispatch(openSectionLibrary({ insertPosition: null, targetZone: zone }));
            }}
            className="rounded-apple-md p-1.5 text-apple-primary opacity-0 transition-all hover:bg-apple-primary/10 group-hover:opacity-100"
            title={`Add to ${label.toLowerCase()}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-apple-ink-muted-48" /> : <ChevronDown className="h-4 w-4 text-apple-ink-muted-48" />}
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-apple",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
          )}
        >
          <div className="px-2 pb-2 pt-1">
            {filteredSections.length === 0 ? (
              <div className="px-3 py-5 text-center">
                <p className="text-caption text-apple-ink-muted-48">
                  {searchQuery || typeFilter !== "all"
                    ? "No matching sections"
                    : zone === "header" ? "Nothing in your top bar yet"
                    : zone === "footer" ? "Nothing at the bottom yet"
                    : "Your homepage is empty"}
                </p>
                {!searchQuery && typeFilter === "all" && (
                  <button
                    onClick={() => {
                      dispatch(setEditingZone(zone));
                      dispatch(openSectionLibrary({ insertPosition: null, targetZone: zone }));
                    }}
                    className="btn-press mt-3 inline-flex items-center gap-1.5 rounded-apple-pill bg-apple-primary px-4 py-2 text-caption font-medium text-apple-on-primary"
                    title="Add section"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add section
                  </button>
                )}
              </div>
            ) : (
              filteredSections.map((section, index) => renderSectionItem(section, index, zone, filteredSections.length))
            )}

            <div
              onDragOver={(e) => handleDragOver(e, zone, filteredSections.length)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone, filteredSections.length)}
              className={cn(
                "group/drop mt-2 rounded-apple-lg border-2 border-dashed p-3 text-center transition-all duration-200 ease-apple",
                dragOver?.zone === zone && dragOver.index === filteredSections.length
                  ? "scale-[1.01] border-apple-primary bg-apple-primary/5"
                  : "border-apple-hairline hover:border-apple-primary/30 hover:bg-apple-primary/[0.02]"
              )}
            >
              {dragOver?.zone === zone && dragOver.index === filteredSections.length ? (
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-apple-primary" />
                  <p className="text-caption font-medium text-apple-primary">Drop here</p>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-apple-primary" />
                </div>
              ) : (
                <button
                  onClick={() => {
                    dispatch(setEditingZone(zone));
                    dispatch(openSectionLibrary({ insertPosition: null, targetZone: zone }));
                  }}
                  className="inline-flex items-center gap-1 rounded-apple-pill border border-apple-hairline bg-apple-canvas px-3 py-1.5 text-caption font-medium text-apple-ink-muted-48 opacity-0 shadow-sm transition-all group-hover/drop:opacity-100 hover:border-apple-primary/30 hover:text-apple-primary"
                  title="Add section"
                >
                  <Plus className="h-3 w-3" />
                  Add section
                </button>
              )}
            </div>
          </div>
        </div>
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
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-apple-canvas">
      <div className="border-b border-apple-hairline px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-body-strong text-apple-ink">What&apos;s on your page</p>
            <p className="text-caption text-apple-ink-muted-48">{totalSections} blocks · drag to reorder</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-apple-hairline px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            dispatch(setEditingZone("body"));
            dispatch(openSectionLibrary({ insertPosition: null, targetZone: "body" }));
          }}
          className="btn-press inline-flex items-center gap-1.5 rounded-apple-pill bg-apple-primary px-3 py-1.5 text-caption font-medium text-apple-on-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1 rounded-apple-pill border px-3 py-1.5 text-caption font-medium transition-colors",
            showFilters
              ? "border-apple-primary bg-apple-primary/5 text-apple-primary"
              : "border-apple-hairline text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="space-y-2 px-3 pb-2 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a section…"
            className="h-10 w-full rounded-apple-pill border border-apple-hairline bg-apple-canvas-parchment pl-9 pr-8 text-caption text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-apple-ink-muted-48 hover:bg-apple-canvas"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map(({ id, label, icon: FilterIcon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTypeFilter(id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-apple-pill px-2.5 py-1 text-fine-print font-medium transition-all",
                  typeFilter === id
                    ? "bg-apple-primary text-apple-on-primary"
                    : "bg-apple-canvas-parchment text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                )}
              >
                <FilterIcon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Section List ────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 pb-3 space-y-1">
        {(() => {
          return (
            <>
              {renderRegion("Top bar", "header", Menu, headerSections, "bg-apple-primary")}
              <div className="border-t border-apple-divider-soft pt-2">
                {renderRegion("Main content", "body", Layers, sections, "bg-apple-ink")}
              </div>
              <div className="border-t border-apple-divider-soft pt-2">
                {renderRegion("Bottom", "footer", PanelBottom, footerSections, "bg-violet-600")}
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
