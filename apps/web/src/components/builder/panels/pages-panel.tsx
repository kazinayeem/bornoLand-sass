"use client";

import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { loadSections, setPageMetadata } from "@/redux/slices/builder-slice";
import {
  useGetStorePagesQuery,
  useCreateStorePageMutation,
  useDeleteStorePageMutation,
  useDuplicateStorePageMutation,
  useRenameStorePageMutation,
  useArchiveStorePageMutation,
  useRestoreStorePageMutation,
  useUpdateStorePageMutation,
  usePublishStorePageMutation,
  useSaveStorePageDraftMutation,
  type StorePage as PageData,
} from "@/redux/api/store-page-api";
import { useGetBuilderTemplatesQuery, type BuilderTemplate } from "@/redux/api/builder-template-api";
import { useRequiredStore } from "@/providers/store-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FileText, Home, Search, MoreHorizontal, X, Check,
  Eye, Settings, Copy, Edit3, Archive, Trash2, ExternalLink,
  Globe, EyeOff, RefreshCw, ChevronRight, ChevronDown,
  PanelRightOpen, PanelRightClose,
} from "lucide-react";
import { ResetPageDialog } from "@/components/builder/reset-page-dialog";

type CtxMenu = {
  x: number;
  y: number;
  page: PageData;
} | null;

const statusBadge = (status: string) => {
  switch (status) {
    case "published":
      return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200/50">Published</span>;
    case "archived":
      return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 border border-zinc-200/50">Archived</span>;
    default:
      return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200/50">Draft</span>;
  }
};

export function PagesPanel() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { storeId, storeSlug } = useRequiredStore();
  const currentPageId = useSelector((s: RootState) => s.builder.page.id);

  const { data: pagesData, isLoading, refetch } = useGetStorePagesQuery(storeId, { skip: !storeId });
  const [createPage] = useCreateStorePageMutation();
  const [deletePage] = useDeleteStorePageMutation();
  const [duplicatePage] = useDuplicateStorePageMutation();
  const [renamePageMutation] = useRenameStorePageMutation();
  const [updatePage] = useUpdateStorePageMutation();
  const [archivePage] = useArchiveStorePageMutation();
  const [restorePage] = useRestoreStorePageMutation();
  const [publishPage] = usePublishStorePageMutation();

  // Templates for "New Page" picker
  const { data: templatesData } = useGetBuilderTemplatesQuery({ storeId, templateType: "page" });

  const [search, setSearch] = useState("");
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [settingsPage, setSettingsPage] = useState<PageData | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [resetPageTarget, setResetPageTarget] = useState<PageData | null>(null);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTemplateId, setNewPageTemplateId] = useState<string>("blank");
  const [creating, setCreating] = useState(false);
  const ctxRef = useRef<HTMLDivElement>(null);

  const pages: PageData[] = useMemo(() => {
    const all = pagesData?.data?.pages ?? [];
    const filtered = search
      ? all.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()))
      : all;
    return filtered.filter((p) => showArchived || p.status !== "archived");
  }, [pagesData, search, showArchived]);

  const homePage = useMemo(() => pages.find((p) => p.isHomePage), [pages]);
  const customPages = useMemo(() => pages.filter((p) => !p.isHomePage), [pages]);
  const archivedPages = useMemo(() => pages.filter((p) => p.status === "archived"), [pages]);
  const sortedCustom = useMemo(() => [...customPages].sort((a, b) => a.title.localeCompare(b.title)), [customPages]);

  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });

  // Smart position: calculate immediately before paint using useLayoutEffect
  useLayoutEffect(() => {
    if (!ctxMenu) return;
    const el = ctxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 12;
    let x = ctxMenu.x;
    let y = ctxMenu.y;

    // Flip left if no room on right
    if (x + rect.width > vw - pad) x = x - rect.width;
    // Flip up if no room below
    if (y + rect.height > vh - pad) y = y - rect.height;

    // Clamp to viewport
    if (x < pad) x = pad;
    if (x + rect.width > vw - pad) x = vw - rect.width - pad;
    if (y < pad) y = pad;
    if (y + rect.height > vh - pad) y = vh - rect.height - pad;

    setCtxPos({ x, y });
  }, [ctxMenu]);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCtxMenu(null);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [ctxMenu]);

  const handleOpenPage = useCallback((page: PageData) => {
    dispatch(setPageMetadata({ id: page._id, title: page.title, slug: page.slug }));
    dispatch(loadSections([]));
    router.push(`/store/${storeSlug}/builder/${page.slug.startsWith('/') ? page.slug.slice(1) : page.slug}`);
    setCtxMenu(null);
  }, [dispatch, router, storeSlug]);

  const handleCreatePage = async () => {
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;
    setCreating(true);
    try {
      const payload: { title: string; slug: string; templateId?: string } = {
        title: newPageTitle.trim(),
        slug: newPageSlug.trim().startsWith("/") ? newPageSlug.trim() : `/${newPageSlug.trim()}`,
      };
      if (newPageTemplateId && newPageTemplateId !== "blank") {
        payload.templateId = newPageTemplateId;
      }
      const result = await createPage({ storeId, ...payload }).unwrap();
      toast.success("Page created");
      setNewPageOpen(false);
      setNewPageTitle("");
      setNewPageSlug("");
      setNewPageTemplateId("blank");
      const page = result.data?.page;
      if (page) {
        dispatch(setPageMetadata({ id: page._id, title: page.title, slug: page.slug }));
        dispatch(loadSections((page as any).sections ?? []));
        router.push(`/store/${storeSlug}/builder/${page.slug.startsWith('/') ? page.slug.slice(1) : page.slug}`);
      } else {
        refetch();
      }
    } catch {
      toast.error("Failed to create page");
    }
    setCreating(false);
  };

  const handleRename = async (pageId: string) => {
    if (!renameValue.trim()) return;
    try {
      await renamePageMutation({ id: pageId, storeId, title: renameValue.trim() }).unwrap();
      toast.success("Renamed");
      setRenamingId(null);
      refetch();
    } catch {
      toast.error("Failed to rename");
    }
  };

  const handleDuplicate = async (page: PageData) => {
    try {
      await duplicatePage({ id: page._id, storeId }).unwrap();
      toast.success("Duplicated");
      setCtxMenu(null);
      refetch();
    } catch { toast.error("Failed to duplicate"); }
  };

  const handleArchive = async (page: PageData) => {
    try {
      await archivePage({ id: page._id, storeId }).unwrap();
      toast.success("Archived");
      setCtxMenu(null);
      refetch();
    } catch { toast.error("Failed to archive"); }
  };

  const handleRestore = async (page: PageData) => {
    try {
      await restorePage({ id: page._id, storeId }).unwrap();
      toast.success("Restored");
      setCtxMenu(null);
      refetch();
    } catch { toast.error("Failed to restore"); }
  };

  const handleDelete = async (page: PageData) => {
    try {
      await deletePage({ id: page._id, storeId }).unwrap();
      toast.success("Deleted");
      if (currentPageId === page._id) {
        router.push(`/store/${storeSlug}/builder/`);
      }
      setCtxMenu(null);
      refetch();
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggle = async (page: PageData, field: "showHeader" | "showFooter" | "navigationVisible") => {
    try {
      await updatePage({ id: page._id, storeId, data: { [field]: !(page as any)[field] } }).unwrap();
      refetch();
    } catch { toast.error("Failed to update"); }
  };

  const handlePublish = async (page: PageData) => {
    try {
      if (page.status === "published") {
        await updatePage({ id: page._id, storeId, data: { status: "draft" } }).unwrap();
      } else {
        await publishPage({ id: page._id, storeId }).unwrap();
      }
      refetch();
      setCtxMenu(null);
    } catch { toast.error("Failed to update status"); }
  };

  const isHome = (p: PageData) => p.isHomePage;

  const renderPageCard = (page: PageData, home: boolean) => {
    const isActive = currentPageId === page._id;
    const showHeader = (page as any).showHeader !== false && (page as any).settings?.showHeader !== false;
    const showFooter = (page as any).showFooter !== false && (page as any).settings?.showFooter !== false;
    const navVisible = !!(page as any).navigationVisible;

    return (
      <div key={page._id} className="group relative">
        <div
          onClick={() => handleOpenPage(page)}
          className={cn(
            "w-full rounded-xl border px-3.5 py-3 text-left transition-all cursor-pointer",
            isActive
              ? "border-zinc-900 bg-zinc-50 shadow-sm"
              : "border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-sm"
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              home ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
            )}>
              {home ? <Home className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {renamingId === page._id ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(page._id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="h-7 w-36 rounded-md border border-zinc-300 px-2 text-xs font-medium outline-none focus:border-zinc-900"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleRename(page._id); }}
                      className="rounded-md bg-zinc-900 p-1 text-white"><Check className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}
                      className="rounded-md border border-zinc-200 p-1 text-zinc-500"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-zinc-900 truncate max-w-[160px]">{page.title}</span>
                )}
                {home && <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white">Home</span>}
                {statusBadge(page.status)}
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-400">{page.slug}</p>
              {!home && (
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-zinc-400">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(page, "showHeader" as any); }}
                    className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
                      showHeader ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    {showHeader ? <PanelRightOpen className="h-3 w-3" /> : <PanelRightClose className="h-3 w-3" />}
                    Header
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(page, "showFooter" as any); }}
                    className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
                      showFooter ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    {showFooter ? <PanelRightOpen className="h-3 w-3" /> : <PanelRightClose className="h-3 w-3" />}
                    Footer
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(page, "navigationVisible"); }}
                    className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
                      navVisible ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    {navVisible ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Nav
                  </button>
                  {page.updatedAt && (
                    <span className="text-zinc-300">{new Date(page.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const x = e.clientX;
                  const y = e.clientY;
                  setCtxPos({ x, y });
                  setCtxMenu({ x, y, page });
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all"
              >
                <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Pages</p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-900">Manage store pages</h2>
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs outline-none focus:border-zinc-400 focus:bg-white"
          />
        </div>
        <button
          onClick={() => setNewPageOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2 text-[11px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> New Page
        </button>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {homePage && renderPageCard(homePage, true)}

        {sortedCustom.length > 0 && (
          <div className="pt-3">
            <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Custom Pages ({sortedCustom.length})
            </p>
            <div className="space-y-0.5">
              {sortedCustom.map((p) => renderPageCard(p, false))}
            </div>
          </div>
        )}

        {archivedPages.length > 0 && (
          <div className="pt-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex w-full items-center gap-1.5 px-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600"
            >
              {showArchived ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Archived ({archivedPages.length})
            </button>
            {showArchived && (
              <div className="mt-1 space-y-0.5">
                {archivedPages.filter((p) => !p.isHomePage).map((p) => renderPageCard(p, false))}
              </div>
            )}
          </div>
        )}

        {!isLoading && pages.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-xs text-zinc-500">No pages yet. Create your first page.</p>
          </div>
        )}
      </div>

      {/* Context menu — portal to body so it's never clipped by overflow containers */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {ctxMenu && (
            <motion.div
              ref={ctxRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", left: ctxPos.x, top: ctxPos.y, zIndex: 9999 }}
              className="w-48 rounded-xl border border-zinc-200/80 bg-white py-1.5 shadow-2xl shadow-black/10 ring-1 ring-black/5"
            >
              {isHome(ctxMenu.page) ? (
                <>
                  <CtxBtn icon={Eye} label="Open" onClick={() => handleOpenPage(ctxMenu.page)} />
                  <CtxBtn icon={Settings} label="Page Settings" onClick={() => { setSettingsPage(ctxMenu.page); setCtxMenu(null); }} />
                  <CtxBtn icon={RefreshCw} label="Reset to Template" onClick={() => { setResetPageTarget(ctxMenu.page); setCtxMenu(null); }} />
                </>
              ) : (
                <>
                  <CtxBtn icon={Eye} label="Open" onClick={() => handleOpenPage(ctxMenu.page)} />
                  <CtxBtn icon={ExternalLink} label="Preview" onClick={() => window.open(`/preview/${storeSlug}/${ctxMenu.page.slug.startsWith("/") ? ctxMenu.page.slug.slice(1) : ctxMenu.page.slug}`, "_blank")} />
                  <div className="border-t border-zinc-100 my-1" />
                  <CtxBtn icon={Settings} label="Page Settings" onClick={() => { setSettingsPage(ctxMenu.page); setCtxMenu(null); }} />
                  <CtxBtn icon={Edit3} label="Rename" onClick={() => { setRenamingId(ctxMenu.page._id); setRenameValue(ctxMenu.page.title); setCtxMenu(null); }} />
                  <CtxBtn icon={Copy} label="Duplicate" onClick={() => handleDuplicate(ctxMenu.page)} />
                  <div className="border-t border-zinc-100 my-1" />
                  <CtxBtn icon={ctxMenu.page.status === "published" ? EyeOff : Eye} label={ctxMenu.page.status === "published" ? "Unpublish" : "Publish"} onClick={() => handlePublish(ctxMenu.page)} />
                  {ctxMenu.page.status === "archived" ? (
                    <CtxBtn icon={Globe} label="Restore" onClick={() => handleRestore(ctxMenu.page)} />
                  ) : (
                    <CtxBtn icon={Archive} label="Archive" onClick={() => handleArchive(ctxMenu.page)} />
                  )}
                  <CtxBtn icon={RefreshCw} label="Reset to Template" onClick={() => { setResetPageTarget(ctxMenu.page); setCtxMenu(null); }} />
                  <div className="border-t border-zinc-100 my-1" />
                  <CtxBtn icon={Trash2} label="Delete" danger onClick={() => handleDelete(ctxMenu.page)} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* New Page Dialog */}
      <AnimatePresence>
        {newPageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setNewPageOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">New Page</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">Start blank or pick a template</p>
                </div>
                <button onClick={() => setNewPageOpen(false)} className="rounded-lg p-1.5 hover:bg-zinc-100 transition-colors">
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Title + Slug */}
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-zinc-500">Page Name</label>
                    <input
                      value={newPageTitle}
                      onChange={(e) => {
                        setNewPageTitle(e.target.value);
                        setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }}
                      placeholder="Sale Page"
                      autoFocus
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-zinc-500">URL Slug</label>
                    <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 focus-within:border-zinc-400 focus-within:bg-white transition-colors">
                      <span className="text-xs text-zinc-400">/</span>
                      <input
                        value={newPageSlug}
                        onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "").replace(/(^-|-$)/g, ""))}
                        placeholder="sale-page"
                        className="h-10 flex-1 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Template picker */}
                <div>
                  <label className="mb-2 block text-[11px] font-medium text-zinc-500">Start With</label>
                  <NewPageTemplatePicker
                    templates={templatesData?.data?.templates ?? []}
                    selected={newPageTemplateId}
                    onChange={setNewPageTemplateId}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
                <button
                  onClick={() => { setNewPageOpen(false); setNewPageTitle(""); setNewPageSlug(""); setNewPageTemplateId("blank"); }}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePage}
                  disabled={creating || !newPageTitle.trim() || !newPageSlug.trim()}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {creating ? "Creating…" : "Create Page"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Settings Drawer */}
      {settingsPage && (
        <PageSettingsDrawer
          page={settingsPage}
          storeId={storeId}
          onClose={() => setSettingsPage(null)}
          onSaved={() => { refetch(); }}
          isHome={isHome(settingsPage)}
        />
      )}

      {/* Reset to Template Dialog */}
      {resetPageTarget && (
        <ResetPageDialog
          open={!!resetPageTarget}
          onClose={() => setResetPageTarget(null)}
          storeId={storeId}
          pageId={resetPageTarget._id}
          title={resetPageTarget.title}
          isHome={isHome(resetPageTarget)}
          onSuccess={() => { refetch(); }}
        />
      )}
    </div>
  );
}

function CtxBtn({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium transition-colors outline-none",
        danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", danger ? "text-red-500" : "text-zinc-400")} />
      {label}
    </button>
  );
}

function PageSettingsDrawer({ page, storeId, onClose, onSaved, isHome }: {
  page: PageData; storeId: string; onClose: () => void; onSaved: () => void; isHome: boolean;
}) {
  const [updatePage] = useUpdateStorePageMutation();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState((page as any).seo?.title ?? "");
  const [seoDesc, setSeoDesc] = useState((page as any).seo?.description ?? "");
  const [showHeader, setShowHeader] = useState((page as any).showHeader !== false && (page as any).settings?.showHeader !== false);
  const [showFooter, setShowFooter] = useState((page as any).showFooter !== false && (page as any).settings?.showFooter !== false);
  const [navVisible, setNavVisible] = useState(!!(page as any).navigationVisible);
  const [password, setPassword] = useState((page as any).settings?.password ?? "");
  const [customCss, setCustomCss] = useState((page as any).settings?.customCss ?? "");
  const [customJs, setCustomJs] = useState((page as any).settings?.customJs ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePage({
        id: page._id,
        storeId,
        data: {
          title, slug,
          seo: { title: seoTitle, description: seoDesc },
          showHeader, showFooter, navigationVisible: navVisible,
          password, customCss, customJs,
        },
      }).unwrap();
      toast.success("Settings saved");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  };

  return (
    <Drawer open={!!page} onClose={onClose} title="Page Settings" side="right" size="md">
      <div className="space-y-5 pb-8">
        <Section label="General">
          <Field label="Page Name">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs outline-none focus:border-zinc-400 focus:bg-white" />
          </Field>
          <Field label="URL Slug">
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 focus-within:border-zinc-400 focus-within:bg-white">
              <span className="text-xs text-zinc-400">/</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                className="h-9 flex-1 bg-transparent text-xs outline-none"
                disabled={isHome}
              />
            </div>
            {isHome && <p className="mt-1 text-[10px] text-zinc-400">Home page slug cannot be changed.</p>}
          </Field>
        </Section>

        <Section label="SEO">
          <Field label="SEO Title">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs outline-none focus:border-zinc-400 focus:bg-white" />
          </Field>
          <Field label="SEO Description">
            <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-zinc-400 focus:bg-white resize-none" />
          </Field>
        </Section>

        <Section label="Layout">
          <ToggleField label="Show Header" checked={showHeader} onChange={setShowHeader} />
          <ToggleField label="Show Footer" checked={showFooter} onChange={setShowFooter} />
          <ToggleField label="Show in Navigation" checked={navVisible} onChange={setNavVisible} />
        </Section>

        <Section label="Password Protection">
          <Field label="Password (leave empty for public)">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="text"
              placeholder="No password"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs outline-none focus:border-zinc-400 focus:bg-white" />
          </Field>
        </Section>

        <Section label="Custom Code">
          <Field label="Custom CSS">
            <textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-mono outline-none focus:border-zinc-400 focus:bg-white resize-none" />
          </Field>
          <Field label="Custom JS">
            <textarea value={customJs} onChange={(e) => setCustomJs(e.target.value)} rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-mono outline-none focus:border-zinc-400 focus:bg-white resize-none" />
          </Field>
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </Drawer>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2.5 cursor-pointer hover:bg-zinc-50 transition-colors">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-zinc-900" : "bg-zinc-200"
        )}
      >
        <span className={cn(
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4"
        )} />
      </button>
    </label>
  );
}

// ─── Template picker for New Page dialog ─────────────────────────────────────

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
  ecommerce:   { icon: "🛍️", label: "Ecommerce",   color: "from-violet-500 to-purple-600" },
  fashion:     { icon: "👗", label: "Fashion",      color: "from-pink-500 to-rose-500" },
  electronics: { icon: "💻", label: "Electronics",  color: "from-blue-500 to-cyan-500" },
  restaurant:  { icon: "🍽️", label: "Restaurant",   color: "from-orange-500 to-red-500" },
  landing:     { icon: "🚀", label: "Landing Page", color: "from-emerald-500 to-teal-500" },
};

function NewPageTemplatePicker({
  templates,
  selected,
  onChange,
}: {
  templates: BuilderTemplate[];
  selected: string;
  onChange: (id: string) => void;
}) {
  const options = [
    { id: "blank", name: "Blank Page", description: "Start with an empty canvas", icon: "📄", color: "from-zinc-200 to-zinc-300" },
    ...templates.map((t) => ({
      id: t._id,
      name: t.name,
      description: t.description ?? `${t.sections?.length ?? 0} sections`,
      icon: CATEGORY_META[t.category]?.icon ?? "📄",
      color: CATEGORY_META[t.category]?.color ?? "from-zinc-400 to-zinc-500",
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "relative flex flex-col overflow-hidden rounded-xl border text-left transition-all",
            selected === opt.id
              ? "border-zinc-900 ring-2 ring-zinc-900/10"
              : "border-zinc-200 hover:border-zinc-300",
          )}
        >
          {/* Colour swatch */}
          <div className={`flex h-14 items-center justify-center bg-gradient-to-br ${opt.color}`}>
            <span className="text-2xl">{opt.icon}</span>
          </div>
          {/* Label */}
          <div className="px-2.5 py-2">
            <p className="text-xs font-semibold text-zinc-900 truncate">{opt.name}</p>
            <p className="mt-0.5 text-[10px] text-zinc-400 leading-tight line-clamp-2">{opt.description}</p>
          </div>
          {/* Selected tick */}
          {selected === opt.id && (
            <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
