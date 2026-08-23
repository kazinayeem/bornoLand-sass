"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  addSection,
  duplicateSection,
  moveSection,
  removeSection,
  setSelectedSection,
  setEditingZone,
  setActiveRightTab,
  setRightPanelOpen,
  toggleSection,
  updateSectionMeta,
  openSectionLibrary,
  setActiveTab,
  setHeaderSettings,
  setFooterSettings,
} from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import {
  Copy, Eye, EyeOff, MoreHorizontal, Trash2, GripVertical,
  PanelBottom, PanelTop, Layers, Menu, Search, ShoppingCart, Image,
  Type, Grid3x3, LayoutList, Sparkles, X, Plus, LayoutGrid, Star,
  Pencil, Sliders,
} from "lucide-react";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FlatSection = {
  section: BuilderSection;
  index: number;
};

type DragItem = {
  id: string;
  fromIndex: number;
};

const HEADER_TYPES = new Set(["header", "header-bar", "header-logo", "header-nav", "header-icons"]);
const FOOTER_TYPES = new Set(["footer", "simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "footer-links", "footer-social", "footer-copyright"]);

const HEADER_TEMPLATE_NAMES: Record<string, string> = {
  "minimal-clean": "1. Minimal / Clean Store",
  "minimal": "1. Minimal / Clean Store",
  "minimal-fashion": "1. Minimal / Clean Store",
  "modern-ecommerce": "2. Modern Ecommerce",
  "grocery": "2. Modern Ecommerce",
  "marketplace": "3. Marketplace Header",
  "daraz": "3. Marketplace Header",
  "premium-luxury": "4. Premium / Luxury",
  "modern-general": "4. Premium / Luxury",
  "luxury": "4. Premium / Luxury",
  "compact-professional": "5. Compact / Professional",
  "tech-mega": "5. Compact / Professional",
};

const FOOTER_TEMPLATE_NAMES: Record<string, string> = {
  "classic-ecommerce": "1. Classic Ecommerce",
  "classic": "1. Classic Ecommerce",
  "grocery": "1. Classic Ecommerce",
  "modern-multi-column": "2. Modern Multi Column",
  "tech-electronics": "2. Modern Multi Column",
  "minimal": "3. Minimal",
  "minimal-commerce": "3. Minimal",
  "marketplace": "4. Marketplace",
  "daraz": "4. Marketplace",
  "premium": "5. Premium",
  "modern-store": "5. Premium",
};

function getSectionIcon(type: string) {
  const normalized = normalizeSectionType(type);
  if (normalized.includes("hero") || normalized.includes("banner")) return Image;
  if (normalized.includes("product") || normalized.includes("shop")) return ShoppingCart;
  if (normalized.includes("category")) return Grid3x3;
  if (normalized.includes("feature") || normalized.includes("benefit")) return Sparkles;
  if (normalized.includes("testimonial") || normalized.includes("review")) return Star;
  if (normalized.includes("faq") || normalized.includes("accordion")) return LayoutList;
  if (normalized.includes("newsletter") || normalized.includes("form")) return Type;
  if (normalized.includes("gallery") || normalized.includes("image")) return LayoutGrid;
  return Layers;
}

function scrollSectionIntoView(sectionId: string) {
  requestAnimationFrame(() => {
    const el =
      document.querySelector(`[data-builder-section-id="${sectionId}"]`)
      ?? document.querySelector(`[data-section-id="${sectionId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

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
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
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

  return createPortal(
    <div
      ref={ref}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-50 min-w-[180px] rounded-apple-md border border-apple-hairline bg-apple-canvas-parchment py-1 shadow-apple-menu animate-in fade-in-0 zoom-in-95 duration-100"
    >
      {items.map((item, idx) => {
        if ("divider" in item && item.divider) {
          return <div key={item.key || idx} className="my-1 border-t border-apple-hairline" />;
        }
        const Icon = "icon" in item && item.icon ? item.icon : null;
        return (
          <button
            key={item.key}
            type="button"
            disabled={"disabled" in item ? item.disabled : false}
            onClick={() => {
              if ("onClick" in item && item.onClick) item.onClick();
              onClose();
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors",
              "danger" in item && item.danger
                ? "text-red-500 hover:bg-red-50"
                : "text-apple-ink hover:bg-apple-canvas",
              "disabled" in item && item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
            <span>{"label" in item ? item.label : ""}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export function LayersPanel() {
  const dispatch = useDispatch();
  const sections = useSelector((state: RootState) => state.builder.sections);
  const selectedSectionId = useSelector((state: RootState) => state.builder.selectedSectionId);
  const editingZone = useSelector((state: RootState) => state.builder.editingZone);
  const headerSettings = useSelector((state: RootState) => state.builder.headerSettings);
  const footerSettings = useSelector((state: RootState) => state.builder.footerSettings);

  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    item: FlatSection | null;
  }>({ open: false, x: 0, y: 0, item: null });
  const dragItem = useRef<DragItem | null>(null);

  // Pure Body Sections (safely ignore any legacy header/footer sections)
  const bodySections = useMemo(() => {
    return sections.filter((s) => {
      const type = normalizeSectionType(s.type);
      return !HEADER_TYPES.has(type) && !FOOTER_TYPES.has(type);
    });
  }, [sections]);

  const filteredList = useMemo<FlatSection[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const mapped = bodySections.map((section, index) => ({ section, index }));
    if (!q) return mapped;
    return mapped.filter(({ section }) => {
      const label = (section.label || getSectionDef(section.type)?.label || "").toLowerCase();
      return label.includes(q) || section.type.toLowerCase().includes(q);
    });
  }, [bodySections, searchQuery]);

  const selectBodySection = useCallback((item: FlatSection) => {
    dispatch(setEditingZone("body"));
    dispatch(setSelectedSection(item.section.id));
    dispatch(setActiveRightTab("content"));
    dispatch(setRightPanelOpen(true));
    scrollSectionIntoView(item.section.id);
  }, [dispatch]);

  const selectHeaderZone = useCallback(() => {
    dispatch(setEditingZone("header"));
    dispatch(setSelectedSection(null));
    dispatch(setActiveRightTab("content"));
    dispatch(setRightPanelOpen(true));
  }, [dispatch]);

  const selectFooterZone = useCallback(() => {
    dispatch(setEditingZone("footer"));
    dispatch(setSelectedSection(null));
    dispatch(setActiveRightTab("content"));
    dispatch(setRightPanelOpen(true));
  }, [dispatch]);

  const toggleHeaderEnabled = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const current = headerSettings.enabled !== false && headerSettings.visible !== false;
    dispatch(setHeaderSettings({ ...headerSettings, enabled: !current, visible: !current }));
  }, [dispatch, headerSettings]);

  const toggleFooterEnabled = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const current = footerSettings.enabled !== false && footerSettings.visible !== false;
    dispatch(setFooterSettings({ ...footerSettings, enabled: !current, visible: !current }));
  }, [dispatch, footerSettings]);

  const startRename = useCallback((sectionId: string) => {
    setRenamingId(sectionId);
  }, []);

  useEffect(() => {
    if (!renamingId) return;
    const id = window.setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [renamingId]);

  const handleDragStart = (item: FlatSection) => {
    dragItem.current = { id: item.section.id, fromIndex: item.index };
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  const handleDropOn = (target: FlatSection) => {
    setDragOverIndex(null);
    setIsDragging(false);
    const drag = dragItem.current;
    dragItem.current = null;
    if (!drag || drag.fromIndex === target.index) return;

    dispatch(setEditingZone("body"));
    dispatch(moveSection({ from: drag.fromIndex, to: target.index }));
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, open: false, item: null }));
  }, []);

  const buildMenuItems = (item: FlatSection): DropdownItem[] => {
    const { section, index } = item;
    const list = bodySections;
    const canMoveUp = index > 0;
    const canMoveDown = index < list.length - 1;

    return [
      {
        key: "rename",
        label: "Rename",
        icon: Pencil,
        onClick: () => startRename(section.id),
      },
      {
        key: "duplicate",
        label: "Duplicate",
        icon: Copy,
        onClick: () => {
          dispatch(setEditingZone("body"));
          dispatch(duplicateSection(section.id));
        },
      },
      { divider: true, key: "danger-divider" },
      {
        key: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        disabled: Boolean(section.locked),
        onClick: () => {
          dispatch(removeSection(section.id));
        },
      },
    ];
  };

  const openAddSection = () => {
    dispatch(setEditingZone("body"));
    dispatch(openSectionLibrary({ insertPosition: null, targetZone: "body" }));
  };

  const isHeaderActive = editingZone === "header";
  const isFooterActive = editingZone === "footer";
  const isHeaderEnabled = headerSettings.enabled !== false && headerSettings.visible !== false;
  const isFooterEnabled = footerSettings.enabled !== false && footerSettings.visible !== false;

  const headerTemplateName =
    HEADER_TEMPLATE_NAMES[headerSettings.template as string] ||
    HEADER_TEMPLATE_NAMES[headerSettings.headerTemplate as string] ||
    "2. Modern Ecommerce";

  const footerTemplateName =
    FOOTER_TEMPLATE_NAMES[footerSettings.template as string] ||
    FOOTER_TEMPLATE_NAMES[footerSettings.footerTemplate as string] ||
    "1. Classic Ecommerce";

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-apple-canvas select-none">
      {/* ── Top Controls ── */}
      <div className="shrink-0 space-y-2.5 border-b border-apple-hairline px-3 py-3">
        <p className="text-[13px] font-semibold text-apple-ink">Page Structure & Layers</p>
        <button
          type="button"
          onClick={openAddSection}
          className="btn-press flex h-9 w-full items-center justify-center gap-1.5 rounded-apple-pill bg-apple-primary text-[13px] font-medium text-apple-on-primary transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Section
        </button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search layers…"
            className="h-9 w-full rounded-apple-pill border border-apple-hairline bg-apple-canvas-parchment pl-8 pr-8 text-[13px] text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/15"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-apple-ink-muted-48 hover:bg-apple-canvas"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 space-y-3">
        {/* ── PINNED GLOBAL HEADER SLOT ── */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48 px-1 mb-1 block">
            Global Header
          </span>
          <div
            onClick={selectHeaderZone}
            className={cn(
              "group flex h-12 cursor-pointer items-center justify-between rounded-xl border px-3 transition-all",
              isHeaderActive
                ? "border-apple-primary/60 bg-apple-primary/10 shadow-xs ring-1 ring-apple-primary/20"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
              !isHeaderEnabled && "opacity-60 bg-zinc-100/60"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                  isHeaderActive ? "bg-apple-primary text-white" : "bg-zinc-100 text-zinc-700"
                )}
              >
                <PanelTop className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 leading-tight">Header</p>
                <p className="text-[11px] text-zinc-500 truncate leading-tight mt-0.5">
                  {headerTemplateName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleHeaderEnabled}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                title={isHeaderEnabled ? "Hide Header" : "Show Header"}
              >
                {isHeaderEnabled ? (
                  <Eye className="h-4 w-4 text-emerald-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-rose-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── BODY SECTIONS ── */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48 px-1 mb-1 block">
            Body Sections ({bodySections.length})
          </span>

          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center px-3 py-6 text-center bg-zinc-50/60 rounded-xl border border-dashed border-zinc-200">
              <p className="text-xs font-medium text-zinc-500">
                {searchQuery ? "No matching body sections" : "No content sections yet"}
              </p>
              <button
                type="button"
                onClick={openAddSection}
                className="mt-2 text-xs font-semibold text-apple-primary hover:underline"
              >
                + Add Content Section
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredList.map((item) => {
                const { section, index } = item;
                const selected = selectedSectionId === section.id && editingZone === "body";
                const Icon = getSectionIcon(section.type);
                const menuItems = buildMenuItems(item);
                const displayLabel = section.label || getSectionDef(section.type)?.label || "Section";
                const isRenaming = renamingId === section.id;

                return (
                  <div
                    key={section.id}
                    className="relative z-0 overflow-visible"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      selectBodySection(item);
                      setContextMenu({ open: true, x: e.clientX, y: e.clientY, item });
                    }}
                  >
                    {dragOverIndex === index ? (
                      <div className="mb-0.5 h-0.5 rounded-full bg-apple-primary" />
                    ) : null}

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDragLeave={() => setDragOverIndex((prev) => (prev === index ? null : prev))}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropOn(item);
                      }}
                      onClick={() => {
                        if (!isRenaming) selectBodySection(item);
                      }}
                      className={cn(
                        "group relative flex h-11 min-h-[44px] cursor-pointer items-center gap-1 overflow-visible rounded-lg border pl-0.5 pr-0 transition-colors duration-150",
                        selected
                          ? "border-apple-primary/40 bg-apple-primary/5"
                          : "border-transparent hover:bg-apple-canvas-parchment",
                        isDragging && dragItem.current?.id === section.id && "opacity-50",
                        !section.visible && "opacity-60"
                      )}
                    >
                      {/* Drag Handle */}
                      <div
                        draggable={!section.locked && !isRenaming}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(item);
                        }}
                        onDragEnd={handleDragEnd}
                        className="flex h-10 w-8 shrink-0 cursor-grab items-center justify-center text-apple-ink-muted-48 active:cursor-grabbing"
                        onClick={(e) => e.stopPropagation()}
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Icon */}
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          selected ? "bg-apple-primary text-apple-on-primary" : "bg-apple-canvas-parchment text-apple-ink-muted-48"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      {/* Name */}
                      <div className="min-w-0 flex-1 py-1 pr-1">
                        {isRenaming ? (
                          <input
                            ref={renameInputRef}
                            value={section.label}
                            placeholder={getSectionDef(section.type)?.label || "Section"}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => dispatch(updateSectionMeta({ id: section.id, label: e.target.value }))}
                            onBlur={() => setRenamingId(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                e.preventDefault();
                                setRenamingId(null);
                              }
                            }}
                            className="h-8 w-full truncate rounded bg-white px-1.5 text-[13px] font-semibold text-apple-ink outline-none ring-2 ring-apple-primary/30"
                            aria-label="Section name"
                          />
                        ) : (
                          <p className="truncate text-[13px] font-semibold leading-tight text-apple-ink">
                            {displayLabel}
                          </p>
                        )}
                      </div>

                      {/* Visibility + Menu */}
                      <div className="relative z-30 ml-auto flex shrink-0 items-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleSection(section.id));
                          }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink"
                          title={section.visible ? "Hide" : "Show"}
                        >
                          {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                        </button>

                        <DropdownMenu
                          placement="bottom-end"
                          minWidth={180}
                          trigger={
                            <button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center rounded-md text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink"
                              aria-label="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          }
                          items={menuItems}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PINNED GLOBAL FOOTER SLOT ── */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48 px-1 mb-1 block">
            Global Footer
          </span>
          <div
            onClick={selectFooterZone}
            className={cn(
              "group flex h-12 cursor-pointer items-center justify-between rounded-xl border px-3 transition-all",
              isFooterActive
                ? "border-apple-primary/60 bg-apple-primary/10 shadow-xs ring-1 ring-apple-primary/20"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
              !isFooterEnabled && "opacity-60 bg-zinc-100/60"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                  isFooterActive ? "bg-apple-primary text-white" : "bg-zinc-100 text-zinc-700"
                )}
              >
                <PanelBottom className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 leading-tight">Footer</p>
                <p className="text-[11px] text-zinc-500 truncate leading-tight mt-0.5">
                  {footerTemplateName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleFooterEnabled}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                title={isFooterEnabled ? "Hide Footer" : "Show Footer"}
              >
                {isFooterEnabled ? (
                  <Eye className="h-4 w-4 text-emerald-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-rose-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {contextMenu.open && contextMenu.item ? (
        <SectionContextMenu
          items={buildMenuItems(contextMenu.item)}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      ) : null}
    </aside>
  );
}
