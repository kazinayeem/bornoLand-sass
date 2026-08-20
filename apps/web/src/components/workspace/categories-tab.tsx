"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useGetCategoriesQuery, useCreateCategoryMutation,
  useUpdateCategoryMutation, useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} from "@/redux/api/category-api";
import type { Category } from "@/redux/api/category-api";
import {
  Layers, Plus, Loader2, Pencil, Trash2, ChevronRight, ChevronDown,
  Star, X, Check, GripVertical, Search,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchBar } from "@/components/ui/search-bar";
import { MediaPicker } from "@/components/media/media-picker";
import { selectionMediaId } from "@/lib/media-selection";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";


type CategoriesTabProps = { storeId: string; billingHref?: string };

type TreeNode = {
  category: Category;
  children: TreeNode[];
  depth: number;
};

function buildTree(categories: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  for (const cat of categories) {
    map.set(cat._id, { category: cat, children: [], depth: 0 });
  }
  for (const cat of categories) {
    const node = map.get(cat._id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.category.sortOrder - b.category.sortOrder);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return result;
}

function getCategoryPath(catId: string, categories: Category[]): string {
  const cat = categories.find((c) => c._id === catId);
  if (!cat) return "";
  if (!cat.parentId) return cat.name;
  const parent = categories.find((c) => c._id === cat.parentId);
  if (parent) return `${getCategoryPath(parent._id, categories)} / ${cat.name}`;
  return cat.name;
}

export function CategoriesTab({ storeId, billingHref = "#" }: CategoriesTabProps) {
  const { store } = useStorePage();
  const { data, isLoading } = useGetCategoriesQuery(storeId);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [reorderCategories] = useReorderCategoriesMutation();

  const categories = data?.data?.categories ?? [];
  const sorted = useMemo(() => [...categories].sort((a, b) => a.sortOrder - b.sortOrder), [categories]);

  const tree = useMemo(() => buildTree(sorted), [sorted]);
  const flatTree = useMemo(() => flattenTree(tree), [tree]);

  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const resetForm = () => {
    setEditCat(null);
    setShowForm(false);
  };

  const openEdit = (c: Category) => {
    setEditCat(c);
    setShowForm(true);
  };

  const genSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory({ storeId, id: deleteTarget._id }).unwrap();
      if (store) {
        await revalidateStorefrontForStore(store, {
          scope: "categories",
          categorySlug: deleteTarget.slug,
        });
      }
      toast.success("Category deleted");
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete"); }
  };

  const handleDragStart = (treeIdx: number) => {
    setDragIdx(treeIdx);
  };

  const handleDragOver = (e: React.DragEvent, treeIdx: number) => {
    e.preventDefault();
    setDragOverIdx(treeIdx);
  };

  const handleDrop = async () => {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const reordered = flatTree.map((n) => n.category);
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dragOverIdx, 0, moved);
    try {
      await reorderCategories({ storeId, orderedIds: reordered.map((c) => c._id) }).unwrap();
      toast.success("Categories reordered");
    } catch { toast.error("Failed to reorder"); }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTree = useMemo(() => {
    if (!search) return flatTree;
    const q = search.toLowerCase();
    return flatTree.filter((n) =>
      n.category.name.toLowerCase().includes(q) ||
      n.category.slug.toLowerCase().includes(q)
    );
  }, [flatTree, search]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." className="max-w-xs" />
        <div className="flex items-center gap-2">
          <p className="text-xs text-apple-ink-muted-48">{categories.length} categories</p>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Category
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-apple-lg border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-apple-ink-muted-48" />
          <h3 className="mt-3 text-base font-semibold text-apple-ink">No categories yet</h3>
          <p className="mt-1 text-sm text-apple-ink-muted-48">Create categories to organize your products.</p>
        </div>
      ) : (
        <div className="rounded-apple-lg border border-apple-hairline bg-white overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_80px_80px] gap-4 border-b border-apple-divider-soft bg-apple-canvas-parchment/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
            <div className="flex items-center gap-2"><GripVertical className="h-3 w-3 invisible" /> Category</div>
            <div>Slug</div>
            <div className="text-center">Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Tree items */}
          {filteredTree.length === 0 && search && (
            <div className="p-8 text-center">
              <Search className="mx-auto h-6 w-6 text-apple-ink-muted-48" />
              <p className="mt-2 text-sm text-apple-ink-muted-48">No categories match &quot;{search}&quot;</p>
            </div>
          )}
          {filteredTree.map((node, idx) => {
            const hasChildren = node.children.length > 0;
            const isExpanded = expandedIds.has(node.category._id);
            const isDrag = dragIdx === idx;
            const isOver = dragOverIdx === idx;
            const canDrag = !search;

            return (
              <motion.div key={node.category._id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`grid grid-cols-[1fr_100px_80px_80px] gap-4 border-b border-zinc-50 px-4 py-3 transition-colors hover:bg-apple-canvas-parchment/50 ${
                  isDrag ? "opacity-40 bg-blue-50" : ""
                } ${isOver ? "border-t-2 border-t-blue-400" : ""}`}
                draggable={canDrag}
                onDragStart={canDrag ? () => handleDragStart(idx) : undefined}
                onDragOver={canDrag ? (e) => handleDragOver(e, idx) : undefined}
                onDragEnd={canDrag ? handleDrop : undefined}
              >
                <div className="flex items-center gap-2 min-w-0"
                  style={{ paddingLeft: `${node.depth * 20}px` }}>
                  <div className="flex items-center gap-1 shrink-0">
                    <div
                      className="cursor-grab active:cursor-grabbing text-apple-ink-muted-48 hover:text-apple-ink-muted-48 transition-colors"
                      onMouseDown={(e) => e.stopPropagation()}>
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    {hasChildren ? (
                      <button onClick={() => toggleExpand(node.category._id)}
                        className="rounded p-0.5 text-apple-ink-muted-48 hover:text-apple-ink-muted-80 transition-colors">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    ) : (
                      <span className="w-4" />
                    )}
                  </div>
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-apple-canvas-parchment flex items-center justify-center overflow-hidden">
                    {node.category.imageUrl ? (
                      <img src={node.category.imageUrl} alt={node.category.name} className="h-full w-full object-cover" />
                    ) : (
                      <Layers className="h-4 w-4 text-apple-ink-muted-48" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-apple-ink truncate">{node.category.name}</p>
                      {node.category.featured && <Star className="h-3 w-3 text-amber-500 shrink-0" fill="currentColor" />}
                    </div>
                    {node.depth > 0 && (
                      <p className="text-[10px] text-apple-ink-muted-48 truncate">
                        Subcategory of {getCategoryPath(node.category.parentId!, sorted)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-apple-ink-muted-48 truncate">/{node.category.slug}</span>
                </div>
                <div className="flex items-center justify-center">
                  <button onClick={() => updateCategory({ storeId, id: node.category._id, data: { active: !node.category.active } }).unwrap()}
                    className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                      node.category.active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-apple-canvas-parchment text-apple-ink-muted-48 hover:bg-zinc-200"
                    }`}>
                    {node.category.active ? "Active" : "Draft"}
                  </button>
                </div>
                <div className="flex items-center justify-end gap-1">
                  {node.depth === 0 && (
                    <button
                      onClick={() => {
                        resetForm();
                        setEditCat({ parentId: node.category._id } as any);
                        setShowForm(true);
                      }}
                      title="Add Subcategory"
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Sub
                    </button>
                  )}
                  <button onClick={() => openEdit(node.category)}
                    title="Edit Category"
                    className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(node.category)}
                    title="Delete Category"
                    className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}


      {/* Form Modal */}
      <CategoryFormModal
        open={showForm}
        mode={editCat ? "edit" : "create"}
        category={editCat}
        categories={categories}
        storeId={storeId}
        billingHref={billingHref}
        saving={saving}
        onClose={resetForm}
        onSave={async (formData) => {
          setSaving(true);
          try {
            const payload = {
              name: formData.name.trim(),
              slug: formData.slug || genSlug(formData.name),
              description: formData.description,
              imageUrl: formData.imageUrl,
              imageId: formData.imageId || null,
              bannerUrl: formData.bannerUrl,
              bannerId: formData.bannerId || null,
              iconUrl: formData.iconUrl,
              iconId: formData.iconId || null,
              parentId: formData.parentId || null,
              active: formData.active,
              featured: formData.featured,
              metaTitle: formData.metaTitle || undefined,
              metaDescription: formData.metaDescription || undefined,
            };
            if (editCat) {
              await updateCategory({ storeId, id: editCat._id, data: payload }).unwrap();
              if (store) {
                await revalidateStorefrontForStore(store, {
                  scope: "categories",
                  categorySlug: payload.slug,
                });
              }
              toast.success("Category updated");
            } else {
              await createCategory({ storeId, data: payload }).unwrap();
              if (store) {
                await revalidateStorefrontForStore(store, {
                  scope: "categories",
                  categorySlug: payload.slug,
                });
              }
              toast.success("Category created");
            }
            resetForm();
          } catch (err: any) {
            toast.error(err?.data?.message ?? "Failed to save category");
          } finally {
            setSaving(false);
          }
        }}
      />


      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will be uncategorized, and subcategories will become top-level.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
