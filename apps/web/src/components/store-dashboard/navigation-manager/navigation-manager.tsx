"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Menu, Plus, GripVertical, Trash2, Pencil, ExternalLink, EyeOff,
  ChevronRight, ChevronDown, Link, FileText,
  Loader2, Globe, Settings,
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

const LINK_TYPES = [
  { value: "custom", label: "Custom URL" },
  { value: "page", label: "Internal Page" },
  { value: "product", label: "Product" },
  { value: "category", label: "Category" },
  { value: "collection", label: "Collection" },
  { value: "blog", label: "Blog" },
  { value: "external", label: "External Link" },
] as const;

export function NavigationManager({ storeId }: Props) {
  const [activeNavId, setActiveNavId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({ title: "", link: "", linkType: "custom" });

  const { data, isLoading } = useGetStoreNavigationsQuery(storeId);
  const [addItem] = useAddMenuItemMutation();
  const [updateItem] = useUpdateMenuItemMutation();
  const [deleteItem] = useDeleteMenuItemMutation();
  const [updateNav] = useUpdateNavigationMutation();
  const [reorderItems] = useReorderMenuItemsMutation();

  const navigations = data?.data?.navigations ?? [];
  const activeNav = navigations.find((n) => n._id === activeNavId) ?? navigations[0];

  const flatItems = useMemo(() => {
    if (!activeNav?.items) return [];
    const flatten = (items: MenuItemTree[]): MenuItemTree[] => {
      return items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
    };
    return flatten(activeNav.items);
  }, [activeNav]);

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

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteItem({ itemId: item._id, storeId }).unwrap();
      toast.success("Menu item deleted");
    } catch {
      toast.error("Failed to delete item");
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-zinc-100" />
        <div className="mt-6 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-zinc-200" />
          ))}
        </div>
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (navigations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-16 text-center shadow-sm">
        <Menu className="mx-auto h-12 w-12 text-zinc-300" />
        <h3 className="mt-4 text-lg font-semibold text-zinc-900">No navigations configured</h3>
        <p className="mt-1 text-sm text-zinc-500">Navigations will be created automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Navigation</h1>
        <p className="text-sm text-zinc-500">Manage your store menus, links, and navigation structure.</p>
      </div>

      {/* Nav Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-200 pb-px">
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
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {nav.label}
              {!nav.isActive && <EyeOff className="h-3 w-3 text-zinc-300" />}
            </button>
          );
        })}
      </div>

      {/* Active Navigation Panel */}
      {activeNav && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Nav Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">{activeNav.label}</h3>
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                activeNav.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
              )}>
                {activeNav.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleToggleNav(activeNav)}
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
              >
                {activeNav.isActive ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => setShowAddItem(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>
          </div>

          {/* Menu Items - Drag & Drop */}
          {activeNav.items && activeNav.items.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={flatItems.map((i) => i._id)} strategy={verticalListSortingStrategy}>
                <div className="p-3 space-y-0.5">
                  {activeNav.items.map((item) => (
                    <SortableMenuItemRow
                      key={item._id}
                      item={item}
                      depth={0}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => handleDeleteItem(item)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="p-12 text-center">
              <Link className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-2 text-sm text-zinc-500">No menu items yet</p>
              <button
                onClick={() => setShowAddItem(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
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
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Add Menu Item</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Title</label>
              <input type="text" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Home"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Link</label>
              <input type="text" value={newItem.link} onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                placeholder="/"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Link Type</label>
              <select value={newItem.linkType} onChange={(e) => setNewItem({ ...newItem, linkType: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400">
                {LINK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button onClick={() => { setShowAddItem(false); setNewItem({ title: "", link: "", linkType: "custom" }); }}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
            <button onClick={handleAddItem} disabled={!newItem.title.trim()}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
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
  );
}

// ─── Sortable Menu Item Row ───────────────────────────────────────────────────

function SortableMenuItemRow({
  item,
  depth,
  onEdit,
  onDelete,
}: {
  item: MenuItemTree;
  depth: number;
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
        className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-zinc-50 transition-colors"
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        <button {...attributes} {...listeners} className="flex h-5 w-5 items-center justify-center text-zinc-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-500">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="flex h-4 w-4 items-center justify-center">
            {expanded ? <ChevronDown className="h-3 w-3 text-zinc-400" /> : <ChevronRight className="h-3 w-3 text-zinc-400" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100">
          {item.linkType === "external" ? (
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          ) : (
            <FileText className="h-3 w-3 text-zinc-500" />
          )}
        </div>
        <span className="flex-1 text-sm font-medium text-zinc-900 truncate">{item.title}</span>
        {item.isVisible === false && <EyeOff className="h-3 w-3 text-zinc-300 shrink-0" />}
        {item.openInNewTab && <ExternalLink className="h-3 w-3 text-zinc-300 shrink-0" />}
        {item.badge && (
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 shrink-0">
            {item.badge}
          </span>
        )}
        <span className="hidden sm:block text-[10px] text-zinc-400 max-w-[120px] truncate">{item.link || "/"}</span>
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button onClick={onEdit} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={onDelete} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-500">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child) => (
            <SortableMenuItemRow
              key={child._id}
              item={child}
              depth={depth + 1}
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

  const inputClass = "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400";
  const labelClass = "block text-xs font-medium text-zinc-500 mb-1";

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
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900">Edit Menu Item</h2>
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

          {/* Toggles */}
          <div className="space-y-3 border-t border-zinc-100 pt-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Visibility & Behavior</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={form.openInNewTab} onChange={(e) => setForm({ ...form, openInNewTab: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-xs text-zinc-700">Open in new tab</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={form.noFollow} onChange={(e) => setForm({ ...form, noFollow: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-xs text-zinc-700">NoFollow</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-xs text-zinc-700">Visible</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={form.authRequired} onChange={(e) => setForm({ ...form, authRequired: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-xs text-zinc-700">Auth required</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={form.hideOnDesktop} onChange={(e) => setForm({ ...form, hideOnDesktop: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-xs text-zinc-700">Hide on desktop</span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-zinc-100 p-2.5 hover:bg-zinc-50 cursor-pointer">
                <input type="checkbox" checked={form.hideOnMobile} onChange={(e) => setForm({ ...form, hideOnMobile: e.target.checked })} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span className="text-xs text-zinc-700">Hide on mobile</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
