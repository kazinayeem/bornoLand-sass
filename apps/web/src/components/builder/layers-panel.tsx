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
} from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import {
  Copy, Eye, EyeOff, MoreHorizontal, Trash2, GripVertical,
  PanelBottom, Layers, Menu, Search, ShoppingCart, Image,
  Type, Grid3x3, LayoutList, Sparkles, X, Plus, LayoutGrid, Star,
  Pencil, ArrowUp, ArrowDown,
} from "lucide-react";
import { getSectionDef, normalizeSectionType } from "@/lib/section-registry";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Zone = "header" | "body" | "footer";

type FlatSection = {
  section: BuilderSection;
  zone: Zone;
  zoneIndex: number;
};

type DragItem = {
  id: string;
  fromIndex: number;
  zone: Zone;
};

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
      className="fixed z-[100] w-52 rounded-xl border border-apple-hairline bg-white py-1.5 shadow-2xl shadow-black/10"
      style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 320) }}
    >
      {items.map((item, index) => {
        if ("divider" in item && item.divider) {
          return <div key={`div-${index}`} className="my-1 border-t border-zinc-100" />;
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
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium outline-none transition-colors",
              i.disabled && "cursor-not-allowed opacity-40",
              !i.disabled && i.danger && "text-red-600 hover:bg-red-50",
              !i.disabled && !i.danger && "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment",
            )}
          >
            {Icon && <Icon className={cn("h-4 w-4 shrink-0", i.danger ? "text-red-500" : "text-apple-ink-muted-48")} />}
            <span className="truncate">{i.label}</span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

export function LayersPanel({ title: _title = "Sections" }: { title?: "Layers" | "Navigator" | "Sections" }) {
  const dispatch = useDispatch();
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const clipboardSection = useSelector((s: RootState) => s.builder.clipboardSection);

  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    item: FlatSection | null;
  }>({ open: false, x: 0, y: 0, item: null });
  const dragItem = useRef<DragItem | null>(null);

  const flatList = useMemo<FlatSection[]>(() => {
    const list: FlatSection[] = [];
    headerSections.forEach((section, zoneIndex) => list.push({ section, zone: "header", zoneIndex }));
    sections.forEach((section, zoneIndex) => list.push({ section, zone: "body", zoneIndex }));
    footerSections.forEach((section, zoneIndex) => list.push({ section, zone: "footer", zoneIndex }));
    return list;
  }, [headerSections, sections, footerSections]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return flatList;
    return flatList.filter(({ section }) => {
      const label = (section.label || getSectionDef(section.type)?.label || "").toLowerCase();
      return label.includes(q) || section.type.toLowerCase().includes(q);
    });
  }, [flatList, searchQuery]);

  const zoneList = useCallback((zone: Zone) => {
    if (zone === "header") return headerSections;
    if (zone === "footer") return footerSections;
    return sections;
  }, [headerSections, footerSections, sections]);

  const selectSection = useCallback((item: FlatSection) => {
    dispatch(setEditingZone(item.zone));
    dispatch(setSelectedSection(item.section.id));
    dispatch(setActiveRightTab("content"));
    dispatch(setRightPanelOpen(true));
    scrollSectionIntoView(item.section.id);
  }, [dispatch]);

  const withZone = useCallback((zone: Zone, fn: () => void) => {
    dispatch(setEditingZone(zone));
    fn();
  }, [dispatch]);

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
    dragItem.current = { id: item.section.id, fromIndex: item.zoneIndex, zone: item.zone };
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverKey(null);
    dragItem.current = null;
  };

  const handleDropOn = (target: FlatSection) => {
    setDragOverKey(null);
    setIsDragging(false);
    const drag = dragItem.current;
    dragItem.current = null;
    if (!drag) return;

    if (drag.zone === target.zone) {
      if (drag.fromIndex === target.zoneIndex) return;
      withZone(target.zone, () => {
        dispatch(moveSection({ from: drag.fromIndex, to: target.zoneIndex }));
      });
      return;
    }

    const source = zoneList(drag.zone)[drag.fromIndex];
    if (!source) return;
    withZone(drag.zone, () => {
      dispatch(removeSection(source.id));
      dispatch(setEditingZone(target.zone));
      setTimeout(() => {
        dispatch(addSection({
          ...source,
          id: `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          index: target.zoneIndex,
        }));
      }, 0);
    });
  };

  const moveInZone = (item: FlatSection, direction: "up" | "down") => {
    const list = zoneList(item.zone);
    const to = direction === "up" ? item.zoneIndex - 1 : item.zoneIndex + 1;
    if (to < 0 || to >= list.length) return;
    withZone(item.zone, () => {
      dispatch(moveSection({ from: item.zoneIndex, to }));
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, open: false, item: null }));
  }, []);

  const buildMenuItems = (item: FlatSection): DropdownItem[] => {
    const { section, zone, zoneIndex } = item;
    const list = zoneList(zone);
    const canMoveUp = zoneIndex > 0;
    const canMoveDown = zoneIndex < list.length - 1;

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
        onClick: () => withZone(zone, () => dispatch(duplicateSection(section.id))),
      },
      {
        key: "move-up",
        label: "Move up",
        icon: ArrowUp,
        disabled: !canMoveUp || Boolean(section.locked),
        onClick: () => moveInZone(item, "up"),
      },
      {
        key: "move-down",
        label: "Move down",
        icon: ArrowDown,
        disabled: !canMoveDown || Boolean(section.locked),
        onClick: () => moveInZone(item, "down"),
      },
      {
        key: "visibility",
        label: section.visible ? "Hide" : "Show",
        icon: section.visible ? EyeOff : Eye,
        onClick: () => dispatch(toggleSection(section.id)),
      },
      { divider: true, key: "danger-divider" },
      {
        key: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        disabled: Boolean(section.locked),
        onClick: () => withZone(zone, () => dispatch(removeSection(section.id))),
      },
    ];
  };

  const openAddSection = () => {
    dispatch(setEditingZone("body"));
    dispatch(openSectionLibrary({ insertPosition: null, targetZone: "body" }));
  };

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-apple-canvas">
      <div className="shrink-0 space-y-2.5 border-b border-apple-hairline px-3 py-3">
        <p className="text-[13px] font-semibold text-apple-ink">Sections</p>
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
            placeholder="Search…"
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

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible overscroll-contain px-2 py-2">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center px-3 py-10 text-center">
            <Layers className="mb-2 h-5 w-5 text-apple-ink-muted-48" />
            <p className="text-[13px] font-semibold text-apple-ink">
              {searchQuery ? "No matches" : "No sections yet"}
            </p>
            {!searchQuery ? (
              <button
                type="button"
                onClick={openAddSection}
                className="btn-press mt-4 inline-flex items-center gap-1.5 rounded-apple-pill bg-apple-primary px-4 py-2 text-[12px] font-medium text-apple-on-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Section
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredList.map((item) => {
              const { section, zone, zoneIndex } = item;
              const selected = selectedSectionId === section.id;
              const Icon = getSectionIcon(section.type);
              const dropKey = `${zone}:${zoneIndex}`;
              const menuItems = buildMenuItems(item);
              const displayLabel = section.label || getSectionDef(section.type)?.label || "Section";
              const isRenaming = renamingId === section.id;

              return (
                <div
                  key={section.id}
                  className="relative"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    selectSection(item);
                    setContextMenu({ open: true, x: e.clientX, y: e.clientY, item });
                  }}
                >
                  {dragOverKey === dropKey ? (
                    <div className="mb-0.5 h-0.5 rounded-full bg-apple-primary" />
                  ) : null}

                  <div
                    draggable={!section.locked && !isRenaming}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverKey(dropKey);
                    }}
                    onDragLeave={() => setDragOverKey((prev) => (prev === dropKey ? null : prev))}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOn(item);
                    }}
                    onClick={() => {
                      if (!isRenaming) selectSection(item);
                    }}
                    className={cn(
                      "group flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border px-1.5 transition-colors duration-150",
                      selected
                        ? "border-apple-primary/40 bg-apple-primary/5"
                        : "border-transparent hover:bg-apple-canvas-parchment",
                      isDragging && dragItem.current?.id === section.id && "opacity-50",
                      !section.visible && "opacity-50",
                    )}
                  >
                    <div
                      className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-apple-ink-muted-48 active:cursor-grabbing"
                      onClick={(e) => e.stopPropagation()}
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>

                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                        selected ? "bg-apple-primary text-apple-on-primary" : "bg-apple-canvas-parchment text-apple-ink-muted-48",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
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
                          className="h-7 w-full truncate rounded bg-white px-1.5 text-[13px] font-semibold text-apple-ink outline-none ring-2 ring-apple-primary/30"
                          aria-label="Section name"
                        />
                      ) : (
                        <p className="truncate text-[13px] font-semibold leading-none text-apple-ink">
                          {displayLabel}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleSection(section.id));
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink"
                        title={section.visible ? "Hide" : "Show"}
                        aria-label={section.visible ? "Hide section" : "Show section"}
                      >
                        {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-red-400" />}
                      </button>

                      <DropdownMenu
                        placement="bottom-end"
                        minWidth={180}
                        trigger={
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-apple-ink-muted-48 hover:bg-apple-canvas hover:text-apple-ink"
                            aria-label="More actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
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
