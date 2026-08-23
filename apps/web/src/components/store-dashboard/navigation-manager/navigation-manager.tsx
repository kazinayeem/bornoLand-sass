"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  Menu, Plus, GripVertical, Trash2, Pencil, ExternalLink, EyeOff,
  ChevronRight, ChevronDown, Link, FileText,
  Loader2, Globe, Settings, Search, X, Check, Copy,
  MoreHorizontal, Pin, PinOff, Filter, Layers, PanelRightOpen,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useGetStoreNavigationsQuery,
  useAddMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUpdateNavigationMutation,
  useReorderMenuItemsMutation,
  useGetAvailableNavPagesQuery,
} from "@/redux/api/navigation-api";
import type { Navigation, MenuItem, MenuItemTree } from "@/redux/api/navigation-api";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  storeId: string;
};

const NAV_ICONS: Record<string, typeof Menu> = {
  primary: Globe,
  footer: Menu,
  mobile: Menu,
  top_bar: Menu,
  account: Menu,
  sidebar: Menu,
};

export const MAX_TOP_LEVEL_NAV_ITEMS = 6;
export const MAX_DROPDOWN_CHILDREN = 6;

const LINK_TYPES = [
  { value: "page", label: "Page" },
  { value: "product", label: "Product" },
  { value: "category", label: "Category" },
  { value: "brand", label: "Brand" },
  { value: "custom", label: "Custom URL" },
  { value: "external", label: "External Link" },
] as const;

export function NavigationManager({ storeId }: Props) {
  const [activeNavId, setActiveNavId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAvailablePages, setShowAvailablePages] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "hidden">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", link: "", linkType: "custom" });

  const { data, isLoading } = useGetStoreNavigationsQuery(storeId);
  const { data: pagesData } = useGetAvailableNavPagesQuery(storeId);
  const [addItem] = useAddMenuItemMutation();
  const [updateItem] = useUpdateMenuItemMutation();
  const [deleteItem] = useDeleteMenuItemMutation();
  const [updateNav] = useUpdateNavigationMutation();
  const [reorderItems] = useReorderMenuItemsMutation();

  const navigations = data?.data?.navigations ?? [];
  const availablePages = pagesData?.data?.pages ?? [];
  const activeNav = navigations.find((n) => n._id === activeNavId) ?? navigations[0];

  const topLevelCount = activeNav?.items?.length ?? 0;
  const isTopLevelFull = topLevelCount >= MAX_TOP_LEVEL_NAV_ITEMS;

  const flatItems = useMemo(() => {
    if (!activeNav?.items) return [];
    const flatten = (items: MenuItemTree[]): MenuItemTree[] =>
      items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
    return flatten(activeNav.items);
  }, [activeNav]);

  const filteredItems = useMemo(() => {
    let items = flatItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || (i.link ?? "").toLowerCase().includes(q)
      );
    }
    if (filterMode === "active") {
      items = items.filter((i) => i.isVisible !== false);
    } else if (filterMode === "hidden") {
      items = items.filter((i) => i.isVisible === false);
    }
    return items;
  }, [flatItems, searchQuery, filterMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = flatItems.findIndex((i) => i._id === active.id);
    const newIndex = flatItems.findIndex((i) => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...flatItems];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    try {
      await reorderItems({
        navigationId: activeNav!._id,
        storeId,
        orderedIds: reordered.map((i) => i._id),
      }).unwrap();
    } catch {
      toast.error("Failed to reorder");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim() || !activeNav) return;
    if (isTopLevelFull) {
      toast.error("Maximum 6 navigation items allowed.");
      return;
    }
    try {
      await addItem({
        navigationId: activeNav._id,
        storeId,
        title: newItem.title.trim(),
        link: newItem.link,
        linkType: newItem.linkType,
      }).unwrap();
      setNewItem({ title: "", link: "", linkType: "custom" });
      setShowAddItem(false);
      toast.success("Menu item added");
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleAddPageAsItem = async (page: { _id: string; title: string; slug: string }) => {
    if (!activeNav) return;
    if (isTopLevelFull) {
      toast.error("Maximum 6 navigation items allowed.");
      return;
    }
    try {
      await addItem({
        navigationId: activeNav._id,
        storeId,
        title: page.title,
        link: page.slug,
        linkType: "page",
      }).unwrap();
      toast.success(`"${page.title}" added to ${activeNav.label}`);
    } catch {
      toast.error("Failed to add page");
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    try {
      await deleteItem({ itemId: item._id, storeId }).unwrap();
      toast.success("Menu item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          deleteItem({ itemId: id, storeId }).unwrap()
        )
      );
      toast.success(`${count} items deleted`);
      setSelectedIds(new Set());
      setBulkMode(false);
    } catch {
      toast.error("Failed to delete some items");
    }
  };

  const handleToggleNav = async (nav: Navigation) => {
    try {
      await updateNav({ id: nav._id, storeId, isActive: !nav.isActive }).unwrap();
      toast.success(nav.isActive ? "Navigation hidden" : "Navigation visible");
    } catch {
      toast.error("Failed to update navigation");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i._id)));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-full animate-pulse rounded-lg bg-zinc-200" />
        ))}
      </div>
    );
  }

  if (navigations.length === 0) {
    return (
      <div className="rounded-apple-lg border border-dashed border-zinc-300 bg-white p-16 text-center ">
        <Menu className="mx-auto h-12 w-12 text-apple-ink-muted-48" />
        <h3 className="mt-4 text-lg font-semibold text-apple-ink">No navigations configured</h3>
        <p className="mt-1 text-sm text-apple-ink-muted-48">Navigations will be created automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-apple-ink">Navigation</h1>
          <p className="text-sm text-apple-ink-muted-48">Manage menus, links, and navigation structure.</p>
        </div>
        <button
          onClick={() => setShowAvailablePages(!showAvailablePages)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
            showAvailablePages
              ? "border-zinc-900 bg-apple-ink text-white"
              : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          Pages
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Nav Tabs */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-apple-hairline pb-px">
            {navigations.map((nav) => {
              const Icon = NAV_ICONS[nav.key] ?? Menu;
              const isActive = activeNav?._id === nav._id;
              return (
                <button
                  key={nav._id}
                  onClick={() => setActiveNavId(nav._id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-zinc-900 text-apple-ink"
                      : "border-transparent text-apple-ink-muted-48 hover:border-zinc-300 hover:text-apple-ink-muted-80"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {nav.label}
                  {!nav.isActive && <EyeOff className="h-3 w-3 text-apple-ink-muted-48" />}
                </button>
              );
            })}
          </div>

          {activeNav && (
            <div className="mt-4 rounded-apple-lg border border-apple-hairline bg-white ">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-apple-divider-soft px-5 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-apple-ink">{activeNav.label}</h3>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    activeNav.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-apple-canvas-parchment text-apple-ink-muted-48"
                  )}>
                    {activeNav.isActive ? "Active" : "Hidden"}
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    isTopLevelFull
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-zinc-100 text-apple-ink-muted-80"
                  )}>
                    {topLevelCount} / {MAX_TOP_LEVEL_NAV_ITEMS} items
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleNav(activeNav)}
                    className="rounded-lg border border-apple-hairline px-2.5 py-1.5 text-[11px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                  >
                    {activeNav.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      bulkMode
                        ? "border-zinc-900 bg-apple-ink text-white"
                        : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                    )}
                  >
                    {bulkMode ? "Done" : "Select"}
                  </button>
                  <button
                    onClick={() => {
                      if (isTopLevelFull) {
                        toast.error("Maximum 6 navigation items allowed.");
                        return;
                      }
                      setShowAddItem(true);
                    }}
                    disabled={isTopLevelFull}
                    title={isTopLevelFull ? "Maximum 6 navigation items allowed." : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                      isTopLevelFull
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        : "bg-apple-ink text-white hover:bg-apple-ink-muted-80"
                    )}
                  >
                    <Plus className="h-3 w-3" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Search + Filter */}
              <div className="flex items-center gap-2 border-b border-apple-divider-soft px-5 py-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-apple-ink-muted-48" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full rounded-lg border border-apple-hairline py-1.5 pl-8 pr-3 text-xs text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="h-3 w-3 text-apple-ink-muted-48 hover:text-apple-ink-muted-80" />
                    </button>
                  )}
                </div>
                <div className="flex rounded-lg border border-apple-hairline overflow-hidden">
                  {(["all", "active", "hidden"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={cn(
                        "px-2.5 py-1.5 text-[10px] font-medium",
                        filterMode === mode ? "bg-apple-canvas-parchment text-apple-ink" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                      )}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk actions bar */}
              {bulkMode && selectedIds.size > 0 && (
                <div className="flex items-center gap-2 border-b border-apple-divider-soft bg-apple-canvas-parchment px-5 py-2">
                  <span className="text-xs font-medium text-apple-ink-muted-80">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={selectAll}
                    className="text-xs font-medium text-apple-ink-muted-48 hover:text-apple-ink-muted-80 underline"
                  >
                    {selectedIds.size === filteredItems.length ? "Deselect all" : "Select all"}
                  </button>
                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete ({selectedIds.size})
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              {activeNav.items && activeNav.items.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={filteredItems.map((i) => i._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="p-3 space-y-0.5">
                      {filteredItems.length === 0 && searchQuery ? (
                        <div className="p-8 text-center">
                          <Search className="mx-auto h-6 w-6 text-apple-ink-muted-48" />
                          <p className="mt-2 text-sm text-apple-ink-muted-48">No items match &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      ) : (
                        activeNav.items.map((item) => (
                          <SortableMenuItemRow
                            key={item._id}
                            item={item}
                            depth={0}
                            bulkMode={bulkMode}
                            isSelected={selectedIds.has(item._id)}
                            onToggleSelect={() => toggleSelect(item._id)}
                            onEdit={() => setEditingItem(item)}
                            onDelete={() => handleDeleteItem(item)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="p-12 text-center">
                  <Link className="mx-auto h-8 w-8 text-apple-ink-muted-48" />
                  <p className="mt-2 text-sm text-apple-ink-muted-48">No menu items yet</p>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-apple-ink px-4 py-2 text-xs font-medium text-white hover:bg-apple-ink-muted-80"
                  >
                    <Plus className="h-3 w-3" />
                    Add your first item
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Item Panel */}
          {showAddItem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-apple-lg border border-apple-hairline bg-white p-5 "
            >
              <h3 className="text-sm font-semibold text-apple-ink mb-4">Add Menu Item</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-apple-ink-muted-48 mb-1">Title</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Home"
                    className="w-full rounded-lg border border-apple-hairline px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-ink-muted-48 mb-1">Link</label>
                  <input
                    type="text"
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                    placeholder="/"
                    className="w-full rounded-lg border border-apple-hairline px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-apple-ink-muted-48 mb-1">Link Type</label>
                  <select
                    value={newItem.linkType}
                    onChange={(e) => setNewItem({ ...newItem, linkType: e.target.value })}
                    className="w-full rounded-lg border border-apple-hairline px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    {LINK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowAddItem(false); setNewItem({ title: "", link: "", linkType: "custom" }); }}
                  className="rounded-lg border border-apple-hairline px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.title.trim()}
                  className="rounded-lg bg-apple-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-apple-ink-muted-80 disabled:opacity-50"
                >
                  Add Item
                </button>
              </div>
            </motion.div>
          )}

          {/* Edit Item Modal */}
          {editingItem && (
            <EditMenuItemModal
              item={editingItem}
              storeId={storeId}
              onClose={() => setEditingItem(null)}
            />
          )}
        </div>

        {/* Available Pages Sidebar */}
        {showAvailablePages && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 shrink-0"
          >
            <div className="rounded-apple-lg border border-apple-hairline bg-white ">
              <div className="border-b border-apple-divider-soft px-4 py-3">
                <h3 className="text-xs font-semibold text-apple-ink flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  Available Pages
                </h3>
                <p className="text-[10px] text-apple-ink-muted-48 mt-0.5">
                  Click to add as nav item in &ldquo;{activeNav?.label}&rdquo;
                </p>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-2 space-y-0.5">
                {availablePages.length === 0 ? (
                  <div className="p-4 text-center">
                    <FileText className="mx-auto h-6 w-6 text-apple-ink-muted-48" />
                    <p className="mt-1 text-xs text-apple-ink-muted-48">No pages available</p>
                  </div>
                ) : (
                  availablePages.map((page) => (
                    <button
                      key={page._id}
                      onClick={() => handleAddPageAsItem(page)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-apple-canvas-parchment transition-colors group"
                    >
                      <FileText className="h-3.5 w-3.5 text-apple-ink-muted-48 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-apple-ink-muted-80 truncate group-hover:text-apple-ink">
                          {page.title}
                        </p>
                        <p className="text-[10px] text-apple-ink-muted-48 truncate">{page.slug}</p>
                      </div>
                      <Plus className="h-3 w-3 text-apple-ink-muted-48 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Sortable Menu Item Row ───────────────────────────────────────────────────

function SortableMenuItemRow({
  item,
  depth,
  bulkMode,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  item: MenuItemTree;
  depth: number;
  bulkMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
          isSelected ? "bg-apple-canvas-parchment" : "hover:bg-apple-canvas-parchment"
        )}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        {bulkMode ? (
          <button
            onClick={onToggleSelect}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border transition-colors",
              isSelected ? "border-zinc-900 bg-apple-ink text-white" : "border-zinc-300"
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>
        ) : (
          <button
            {...attributes}
            {...listeners}
            className="flex h-5 w-5 items-center justify-center text-apple-ink-muted-48 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity hover:text-apple-ink-muted-48"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="flex h-4 w-4 items-center justify-center">
            {expanded ? <ChevronDown className="h-3 w-3 text-apple-ink-muted-48" /> : <ChevronRight className="h-3 w-3 text-apple-ink-muted-48" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <div className="flex h-5 w-5 items-center justify-center rounded bg-apple-canvas-parchment shrink-0">
          <FileText className="h-2.5 w-2.5 text-apple-ink-muted-48" />
        </div>
        <span className="flex-1 text-sm font-medium text-apple-ink truncate min-w-0">{item.title}</span>

        {/* Status badges */}
        <div className="flex items-center gap-1 shrink-0">
          {item.isVisible === false && (
            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 border border-amber-200">
              Hidden
            </span>
          )}
          {item.openInNewTab && (
            <span className="text-apple-ink-muted-48" title="Opens in new tab">
              <ExternalLink className="h-2.5 w-2.5" />
            </span>
          )}
          {item.authRequired && (
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 border border-blue-200">
              Auth
            </span>
          )}
          {item.badge && (
            <span className="rounded-full bg-apple-canvas-parchment px-1.5 py-0.5 text-[9px] font-medium text-apple-ink-muted-80">
              {item.badge}
            </span>
          )}
        </div>

        {!bulkMode && (
          <div className="shrink-0">
            {/* Portal-based DropdownMenu — escapes DnD scroll container stacking context */}
            <DropdownMenu
              placement="bottom-end"
              minWidth={144}
              trigger={
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-zinc-200 text-apple-ink-muted-48 hover:text-apple-ink-muted-80 transition-all"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              }
              items={[
                { label: "Edit",      icon: Pencil, onClick: onEdit },
                { label: "Copy Link", icon: Copy,   onClick: () => { navigator.clipboard.writeText(item.link ?? "/"); toast.success("Link copied"); } },
                { divider: true },
                { label: "Delete",   icon: Trash2, onClick: onDelete, danger: true },
              ]}
            />
          </div>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child) => (
            <SortableMenuItemRow
              key={child._id}
              item={child}
              depth={depth + 1}
              bulkMode={bulkMode}
              isSelected={isSelected}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Edit Item Modal ─────────────────────────────────────────────────────────

function EditMenuItemModal({
  item,
  storeId,
  onClose,
}: {
  item: MenuItem;
  storeId: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: item.title,
    link: item.link ?? "",
    linkType: (item.linkType ?? "custom") as "page" | "custom" | "product" | "collection" | "category" | "external" | "blog",
    icon: item.icon ?? "",
    badge: item.badge ?? "",
    target: (item.target ?? "_self") as "_self" | "_blank",
    openInNewTab: item.openInNewTab ?? false,
    noFollow: (item as any).noFollow ?? false,
    isVisible: item.isVisible ?? true,
    authRequired: item.authRequired ?? false,
    hideOnDesktop: (item as any).hideOnDesktop ?? false,
    hideOnMobile: (item as any).hideOnMobile ?? false,
    description: item.description ?? "",
    cssClass: item.cssClass ?? "",
  });
  const [updateItemMutation] = useUpdateMenuItemMutation();

  const handleSave = async () => {
    try {
      await updateItemMutation({
        itemId: item._id,
        storeId,
        data: form,
      }).unwrap();
      toast.success("Menu item updated");
      onClose();
    } catch {
      toast.error("Failed to update");
    }
  };

  const inputClass = "w-full rounded-lg border border-apple-hairline px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400";
  const labelClass = "block text-xs font-medium text-apple-ink-muted-48 mb-1";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-apple-lg border border-apple-hairline bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-apple-ink">Edit Menu Item</h2>
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Link</label>
              <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Link Type</label>
              <select value={form.linkType} onChange={(e) => setForm({ ...form, linkType: e.target.value as typeof form.linkType })} className={inputClass}>
                {LINK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Target</label>
              <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as typeof form.target })} className={inputClass}>
                <option value="_self">Same Tab</option>
                <option value="_blank">New Tab</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Icon</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass} placeholder="icon-name" />
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputClass} placeholder="New" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>

          <div className="space-y-3 border-t border-apple-divider-soft pt-3">
            <p className="text-xs font-semibold text-apple-ink-muted-48 uppercase tracking-wider">Visibility & Behavior</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 rounded-lg border border-apple-divider-soft p-2.5 hover:bg-apple-canvas-parchment cursor-pointer">
                <input type="checkbox" checked={form.openInNewTab} onChange={(e) => setForm({ ...form, openInNewTab: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-apple-ink focus:ring-zinc-900" />
                <span className="text-xs text-apple-ink-muted-80">Open in new tab</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-apple-divider-soft p-2.5 hover:bg-apple-canvas-parchment cursor-pointer">
                <input type="checkbox" checked={form.noFollow} onChange={(e) => setForm({ ...form, noFollow: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-apple-ink focus:ring-zinc-900" />
                <span className="text-xs text-apple-ink-muted-80">NoFollow</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-apple-divider-soft p-2.5 hover:bg-apple-canvas-parchment cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-apple-ink focus:ring-zinc-900" />
                <span className="text-xs text-apple-ink-muted-80">Visible</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-apple-divider-soft p-2.5 hover:bg-apple-canvas-parchment cursor-pointer">
                <input type="checkbox" checked={form.authRequired} onChange={(e) => setForm({ ...form, authRequired: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-apple-ink focus:ring-zinc-900" />
                <span className="text-xs text-apple-ink-muted-80">Auth required</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-apple-divider-soft p-2.5 hover:bg-apple-canvas-parchment cursor-pointer">
                <input type="checkbox" checked={form.hideOnDesktop} onChange={(e) => setForm({ ...form, hideOnDesktop: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-apple-ink focus:ring-zinc-900" />
                <span className="text-xs text-apple-ink-muted-80">Hide on desktop</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-apple-divider-soft p-2.5 hover:bg-apple-canvas-parchment cursor-pointer">
                <input type="checkbox" checked={form.hideOnMobile} onChange={(e) => setForm({ ...form, hideOnMobile: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-apple-ink focus:ring-zinc-900" />
                <span className="text-xs text-apple-ink-muted-80">Hide on mobile</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-apple-hairline px-4 py-2 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-apple-ink px-4 py-2 text-sm font-medium text-white hover:bg-apple-ink-muted-80">Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
