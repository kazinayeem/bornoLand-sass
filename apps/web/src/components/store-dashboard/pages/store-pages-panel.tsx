"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus, Search, FileText, Loader2, Settings,
  FolderPlus, ChevronRight, ListTree, LayoutGrid,
  Trash2, Archive, RotateCcw,
} from "lucide-react";
import {
  useGetStorePagesQuery, useCreateStorePageMutation,
  useDuplicateStorePageMutation, usePublishStorePageMutation,
  useUnpublishStorePageMutation, useArchiveStorePageMutation,
  useRestoreStorePageMutation, useDeleteStorePageMutation,
  useRenameStorePageMutation,
  useGetDeletedStorePagesQuery,
  useRestoreSoftDeletedPageMutation,
  useGeneratePreviewTokenMutation,
} from "@/redux/api/store-page-api";
import type { StorePage } from "@/redux/api/store-page-api";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { cn } from "@/lib/utils";
import { PageTreeNode } from "./page-tree-node";
import { PageContextMenu } from "./page-context-menu";
import { PageSettingsDrawer } from "./page-settings-drawer";
import { NavConflictDialog } from "./nav-conflict-dialog";
import { toast } from "sonner";

function PagesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-56 animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-200" />
          <div className="h-9 w-20 animate-pulse rounded-xl bg-zinc-200" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-10 w-20 animate-pulse rounded-xl bg-zinc-100" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyPagesState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-zinc-300 bg-white p-16 text-center shadow-sm"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-apple-canvas-parchment">
        <FileText className="h-7 w-7 text-zinc-300" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-apple-ink">No pages yet</h3>
      <p className="mt-1 text-sm text-apple-ink-muted-48 max-w-xs mx-auto">
        Create your first page to get started. You can build landing pages, legal pages, and more.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Create Your First Page
      </button>
    </motion.div>
  );
}

export function StorePagesPanel() {
  const router = useRouter();
  const { store, storeId, isLoading: storeLoading } = useStorePage();

  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<StorePage | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; page: StorePage } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [deleteCheckPage, setDeleteCheckPage] = useState<StorePage | null>(null);

  const { data, isLoading: pagesLoading } = useGetStorePagesQuery(storeId ?? "", { skip: !storeId });
  const { data: trashData, isLoading: trashLoading } = useGetDeletedStorePagesQuery(storeId ?? "", { skip: !storeId || !showTrash });
  const [createPage, { isLoading: creating }] = useCreateStorePageMutation();
  const [duplicatePage] = useDuplicateStorePageMutation();
  const [publishPage] = usePublishStorePageMutation();
  const [unpublishPage] = useUnpublishStorePageMutation();
  const [archivePage] = useArchiveStorePageMutation();
  const [restorePage] = useRestoreStorePageMutation();
  const [deletePage] = useDeleteStorePageMutation();
  const [restoreDeleted] = useRestoreSoftDeletedPageMutation();
  const [generatePreviewToken] = useGeneratePreviewTokenMutation();
  const [renamePage] = useRenameStorePageMutation();

  const pages = data?.data?.pages ?? [];
  const tree = data?.data?.tree ?? [];
  const trashPages = trashData?.data?.pages ?? [];

  const filteredPages = searchQuery
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tree;

  const openBuilder = useCallback((page: StorePage) => {
    router.push(`/store/${store?.slug}/builder/${page.slug}`);
  }, [router, store?.slug]);

  const handleContextMenu = useCallback((e: React.MouseEvent, page: StorePage) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, page });
  }, []);

  const handleAction = useCallback(async (action: string, page: StorePage) => {
    if (!storeId) return;

    try {
      switch (action) {
        case "open-builder":
          openBuilder(page);
          break;
        case "preview": {
          window.open(`/${store?.slug}${page.slug === "/" ? "" : page.slug}`, "_blank");
          break;
        }
        case "rename":
          setRenameId(page._id);
          setRenameValue(page.title);
          break;
        case "duplicate":
          await duplicatePage({ id: page._id, storeId }).unwrap();
          toast.success("Page duplicated");
          break;
        case "copy-slug":
          await navigator.clipboard.writeText(page.slug);
          toast.success("Slug copied");
          break;
        case "copy-url":
          await navigator.clipboard.writeText(`${window.location.origin}/${store?.slug}${page.slug === "/" ? "" : page.slug}`);
          toast.success("URL copied");
          break;
        case "publish":
          await publishPage({ id: page._id, storeId }).unwrap();
          toast.success("Page published");
          break;
        case "unpublish":
          await unpublishPage({ id: page._id, storeId }).unwrap();
          toast.success("Page unpublished");
          break;
        case "schedule": {
          const dateStr = prompt("Enter publish date (YYYY-MM-DD HH:MM):");
          if (dateStr) {
            toast.success("Page scheduled (UI prompt — API call needed)");
          }
          break;
        }
        case "archive":
          await archivePage({ id: page._id, storeId }).unwrap();
          toast.success("Page archived");
          break;
        case "restore":
          await restorePage({ id: page._id, storeId }).unwrap();
          toast.success("Page restored");
          break;
        case "delete":
          setDeleteCheckPage(page);
          break;
        case "generate-preview": {
          const result = await generatePreviewToken({ pageId: page._id, storeId }).unwrap();
          const previewUrl = result?.data?.previewUrl;
          if (previewUrl) {
            await navigator.clipboard.writeText(`${window.location.origin}/api${previewUrl}`);
            toast.success("Preview link copied to clipboard (expires in 24h)");
          }
          break;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Action failed";
      toast.error(message);
    }
  }, [storeId, store?.slug, openBuilder, duplicatePage, publishPage, unpublishPage, archivePage, restorePage, deletePage, generatePreviewToken]);

  const handleConfirmDeletePage = useCallback(async () => {
    if (!storeId || !deleteCheckPage) return;
    try {
      await deletePage({ id: deleteCheckPage._id, storeId }).unwrap();
      toast.success("Page moved to trash");
      setDeleteCheckPage(null);
    } catch {
      toast.error("Failed to delete page");
    }
  }, [storeId, deleteCheckPage, deletePage]);

  const handleRenameSubmit = async (pageId: string) => {
    if (!storeId || !renameValue.trim()) return;
    try {
      await renamePage({ id: pageId, storeId, title: renameValue.trim() }).unwrap();
      toast.success("Page renamed");
      setRenameId(null);
    } catch {
      toast.error("Failed to rename");
    }
  };

  const handleCreatePage = async () => {
    if (!storeId || !newPageTitle.trim()) return;
    try {
      const slug = newPageSlug || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const result = await createPage({ storeId, title: newPageTitle.trim(), slug }).unwrap();
      const page = result.data?.page;
      if (page) {
        setShowNewPageModal(false);
        setNewPageTitle("");
        setNewPageSlug("");
        openBuilder(page);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create page";
      toast.error(message);
    }
  };

  const handleRestoreFromTrash = async (pageId: string) => {
    if (!storeId) return;
    try {
      await restoreDeleted({ id: pageId, storeId }).unwrap();
      toast.success("Page restored from trash");
    } catch {
      toast.error("Failed to restore");
    }
  };

  if (storeLoading || !store || !storeId) {
    return <PagesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-apple-ink">Pages</h1>
          <p className="text-sm text-apple-ink-muted-48 mt-0.5">
            Manage your storefront pages, organize with folders, and open in the Builder.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              showTrash
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-zinc-200 text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
            )}
          >
            <Trash2 className="h-4 w-4" />
            Trash
            {trashPages.length > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                {trashPages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            Folder
          </button>
          <button
            onClick={() => setShowNewPageModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Page
          </button>
        </div>
      </div>

      {/* Search + View Toggle */}
      {!showTrash && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-apple-ink-muted-48" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, status..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
            <button
              onClick={() => setViewMode("tree")}
              className={cn("p-2", viewMode === "tree" ? "bg-zinc-100 text-apple-ink" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80")}
            >
              <ListTree className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2", viewMode === "grid" ? "bg-zinc-100 text-apple-ink" : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Trash View */}
      {showTrash ? (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-apple-ink flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-apple-ink-muted-48" />
              Deleted Pages
            </h3>
          </div>
          {trashLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-apple-ink-muted-48" /></div>
          ) : trashPages.length === 0 ? (
            <div className="p-12 text-center">
              <Trash2 className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-2 text-sm text-apple-ink-muted-48">Trash is empty</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {trashPages.map((page) => (
                <div key={page._id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-apple-canvas-parchment transition-colors">
                  <FileText className="h-4 w-4 text-apple-ink-muted-48" />
                  <span className="flex-1 text-sm font-medium text-apple-ink truncate">{page.title}</span>
                  <span className="text-xs text-apple-ink-muted-48">{page.deletedAt ? new Date(page.deletedAt).toLocaleDateString() : ""}</span>
                  <button
                    onClick={() => handleRestoreFromTrash(page._id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[11px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Pages Content */}
          {pagesLoading ? (
            <PagesSkeleton />
          ) : pages.length === 0 ? (
            <EmptyPagesState onCreate={() => setShowNewPageModal(true)} />
          ) : viewMode === "tree" ? (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="p-3">
                {filteredPages.length === 0 && searchQuery ? (
                  <div className="p-8 text-center">
                    <Search className="mx-auto h-6 w-6 text-zinc-300" />
                    <p className="mt-2 text-sm text-apple-ink-muted-48">No pages match &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  filteredPages.map((page) => (
                    <PageTreeNode
                      key={page._id}
                      page={page}
                      depth={0}
                      selectedId={selectedId}
                      onSelect={(p) => { setSelectedId(p._id); setSelectedPage(p); }}
                      onDoubleClick={openBuilder}
                      onContextMenu={handleContextMenu}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pages.map((page) => (
                <button
                  key={page._id}
                  onClick={() => openBuilder(page)}
                  onContextMenu={(e) => handleContextMenu(e, page)}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                    <FileText className="h-5 w-5 text-apple-ink-muted-48" />
                  </div>
                  <div className="min-w-0 flex-1 w-full">
                    <p className="truncate font-semibold text-apple-ink">{page.title}</p>
                    <p className="truncate text-xs text-apple-ink-muted-48">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                      page.status === "published" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                      page.status === "scheduled" ? "text-blue-600 bg-blue-50 border-blue-200" :
                      page.status === "archived" ? "text-apple-ink-muted-48 bg-apple-canvas-parchment border-zinc-200" :
                      "text-apple-ink-muted-80 bg-apple-canvas-parchment border-zinc-200"
                    )}>
                      {page.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Page Modal */}
      {showNewPageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowNewPageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-apple-ink">Create New Page</h2>
            <p className="text-sm text-apple-ink-muted-48 mt-1">Set up a new page for your storefront.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-apple-ink-muted-48 mb-1">Page Title</label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug || newPageSlug === newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) {
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                    }
                  }}
                  placeholder="About Us"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-apple-ink-muted-48 mb-1">Slug</label>
                <div className="flex items-center gap-1 rounded-xl border border-zinc-200 px-3 text-sm text-apple-ink-muted-48">
                  <span>/</span>
                  <input
                    type="text"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.replace(/^\/+/, ""))}
                    placeholder="about-us"
                    className="flex-1 py-2.5 text-apple-ink placeholder:text-apple-ink-muted-48 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewPageModal(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={creating || !newPageTitle.trim()}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create & Open Builder"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Inline Rename */}
      {renameId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center p-4"
          onClick={() => setRenameId(null)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-apple-ink">Rename Page</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(renameId);
                if (e.key === "Escape") setRenameId(null);
              }}
              className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-apple-ink focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setRenameId(null)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">Cancel</button>
              <button onClick={() => handleRenameSubmit(renameId)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800">Save</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <PageContextMenu
          page={contextMenu.page}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleAction}
        />
      )}

      {/* Settings Drawer */}
      {showSettings && selectedPage && (
        <PageSettingsDrawer
          page={selectedPage}
          storeId={storeId}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Delete Confirmation with Nav Conflict Check */}
      {deleteCheckPage && (
        <NavConflictDialog
          page={deleteCheckPage}
          storeId={storeId}
          onClose={() => setDeleteCheckPage(null)}
          onConfirmDelete={handleConfirmDeletePage}
        />
      )}
    </div>
  );
}
