"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet, ArrowLeft, Save, Send, Undo2, Redo2, ZoomIn, Search, Plus, Download, Upload, History, Palette, Maximize, Eye, EyeOff, Layers, PanelRightOpen, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setDevice, setZoom, toggleGuides, toggleGrid, setFullscreen } from "@/redux/slices/preview-slice";
import { markSaved, setSaving, setPublishing, undoBuilder, redoBuilder, restoreHistorySnapshot, updateSectionProps, loadSections, toggleLeftPanel, toggleRightPanel, setSaveError, setEditingZone } from "@/redux/slices/builder-slice";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import { useSavePageMutation, usePublishPageMutation } from "@/redux/api/builder-api";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { ThemePanel } from "@/components/builder/panels/theme-panel";
import { BuilderCommandPalette } from "@/components/builder/builder-command-palette";
import { useRequiredStore } from "@/providers/store-context";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { useImportPageSectionsMutation } from "@/redux/api/store-page-api";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 30000) return "Just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

type Props = {
  onBack: () => void;
  saving: boolean;
  publishing: boolean;
  isDirty: boolean;
  onOpenSectionLibrary?: () => void;
  onClearPage?: () => void;
};

export function BuilderToolbar({ onBack, saving, publishing, isDirty, onOpenSectionLibrary, onClearPage }: Props) {
  const dispatch = useDispatch();
  const { store, storeId } = useRequiredStore();
  const storeSettings = useSelector((s: RootState) => s.storeSettings);
  const device = useSelector((s: RootState) => s.preview.device);
  const zoom = useSelector((s: RootState) => s.preview.zoom);
  const theme = useSelector((s: RootState) => s.theme);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const headerSettings = useSelector((s: RootState) => s.builder.headerSettings);
  const footerSettings = useSelector((s: RootState) => s.builder.footerSettings);
  const editingZone = useSelector((s: RootState) => s.builder.editingZone);
  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const lastSaved = useSelector((s: RootState) => s.builder.lastSaved);
  const lastSaveError = useSelector((s: RootState) => s.builder.lastSaveError);
  const pastCount = useSelector((s: RootState) => s.builder.past.length);
  const futureCount = useSelector((s: RootState) => s.builder.future.length);
  const historySnapshots = useSelector((s: RootState) => s.builder.past);
  const leftPanelOpen = useSelector((s: RootState) => s.builder.leftPanelOpen);
  const rightPanelOpen = useSelector((s: RootState) => s.builder.rightPanelOpen);
  const showGuides = useSelector((s: RootState) => s.preview.showGuides);
  const showGrid = useSelector((s: RootState) => s.preview.showGrid);

  const [savePage] = useSavePageMutation();
  const [publishPage] = usePublishPageMutation();
  const [importPageSections] = useImportPageSectionsMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSave = async () => {
    if (!pageId) { toast.error("No page selected"); return; }
    dispatch(setSaving(true));
    try {
      await savePage({
        storeId, pageId,
        data: { sections, headerSections, footerSections, headerSettings, footerSettings, theme, settings: storeSettings },
      }).unwrap();
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Saved");
    } catch {
      dispatch(setSaveError("Save failed"));
      toast.error("Failed to save");
    }
  };

  const handlePublish = async () => {
    if (!pageId) { toast.error("No page selected"); return; }
    dispatch(setPublishing(true));
    try {
      await savePage({
        storeId, pageId,
        data: { sections, headerSections, footerSections, headerSettings, footerSettings, theme, settings: storeSettings },
      }).unwrap();
      await publishPage({ storeId, pageId, status: "published" }).unwrap();
      await revalidateStorefrontAction({ tenantSlug: store.subdomain || store.slug, storeId, scope: "all" });
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Published!");
    } catch {
      toast.error("Publish failed");
    }
    dispatch(setPublishing(false));
  };

  const handleExport = async () => {
    if (!pageId) { toast.error("No page selected"); return; }
    try {
      const blob = new Blob([JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), sections, theme, settings: storeSettings }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `page-export.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch { toast.error("Export failed"); }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.sections || !Array.isArray(data.sections)) { toast.error("Invalid import file"); return; }
        if (pageId) await importPageSections({ pageId, storeId, sections: data.sections, theme: data.theme, settings: data.settings }).unwrap();
        dispatch(loadSections(data.sections.map((s: BuilderSection) => ({ ...s, id: `${s.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))));
        toast.success(`${data.sections.length} sections imported`);
      } catch { toast.error("Import failed"); }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const devices = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop (1280)" },
    { key: "laptop" as const, icon: Monitor, label: "Laptop (1024)" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet (820)" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile (390)" },
  ];

  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-200 bg-white/95 backdrop-blur-sm px-3 gap-2">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-zinc-900 truncate max-w-[140px]">{store.shortName || store.name}</span>
        </div>
        {/* Save status pill */}
        <div className="flex items-center gap-1.5 ml-2">
          {saving && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-200/50">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Saving...
            </span>
          )}
          {!saving && !lastSaveError && lastSaved && !isDirty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200/50">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Saved {timeAgo(lastSaved)}
            </span>
          )}
          {!saving && !lastSaveError && isDirty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 border border-zinc-200/50">
              Unsaved
            </span>
          )}
          {!saving && lastSaveError && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 border border-red-200/50">
              Save Failed
            </span>
          )}
        </div>
      </div>

      {/* Center */}
        <div className="hidden md:flex items-center gap-1">
        {/* Editing Zone Switcher */}
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
          {[
            { key: "body" as const, label: "Body", icon: Layers },
            { key: "header" as const, label: "Header", icon: PanelRightOpen },
            { key: "footer" as const, label: "Footer", icon: PanelRightOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} title={label} onClick={() => dispatch(setEditingZone(key))}
              className={cn("rounded-md px-2 py-1 text-[10px] font-medium transition-colors inline-flex items-center gap-1",
                editingZone === key ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}>
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* Device switcher */}
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
          {devices.map(({ key, icon: Icon, label }) => (
            <button key={key} title={label} onClick={() => dispatch(setDevice(key))}
              className={cn("rounded-md p-1.5 transition-colors", device === key ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* Undo/Redo */}
        <button onClick={() => dispatch(undoBuilder())} disabled={pastCount === 0}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 transition-all">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => dispatch(redoBuilder())} disabled={futureCount === 0}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 transition-all">
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1">
          <ZoomIn className="h-3 w-3 text-zinc-400" />
          <select value={zoom} onChange={(e) => dispatch(setZoom(Number(e.target.value)))}
            className="bg-transparent text-[11px] text-zinc-600 outline-none w-12">
            {[25, 50, 75, 100, 125, 150, 200].map((v) => <option key={v} value={v}>{v}%</option>)}
          </select>
        </div>

        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* Quick add */}
        <button onClick={() => onOpenSectionLibrary?.()}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>

        {/* Tools */}
        <button onClick={() => dispatch(toggleGuides())}
          className={cn("rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all", showGuides ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50")}
          title="Show guides">
          Guides
        </button>

        {/* History drawer */}
        <button onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50">
          <History className="h-3.5 w-3.5" /> History
        </button>

        {/* Export/Import */}
        <button onClick={handleExport}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50">
          <Download className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50">
          <Upload className="h-3.5 w-3.5" />
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <div className="h-4 w-px bg-zinc-200 mx-1" />
        <button onClick={onClearPage}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50">
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <button onClick={() => setCommandPaletteOpen(true)}
          className="hidden lg:flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] text-zinc-500">
          <Search className="h-3 w-3" /> Search
          <span className="rounded bg-zinc-100 px-1 py-0.5 text-[9px] text-zinc-400">⌘K</span>
        </button>

        <div className="h-4 w-px bg-zinc-200" />

        <button onClick={() => setStylesOpen(true)}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50">
          <Palette className="h-3.5 w-3.5" /> Styles
        </button>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || !isDirty}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-30">
          {saving ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>

        {/* Publish */}
        <button onClick={handlePublish} disabled={publishing}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all"
          style={{ backgroundColor: "#18181b" }}>
          {publishing ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-3.5 w-3.5" />}
          Publish
        </button>
      </div>

      <Drawer open={stylesOpen} onClose={() => setStylesOpen(false)} title="Global Styles" description="Theme, spacing, typography, and shared storefront presentation." side="right" size="lg" className="px-0 py-0">
        <ThemePanel />
      </Drawer>
      <Drawer open={historyOpen} onClose={() => setHistoryOpen(false)} title="History & Snapshots" description="Restore previous builder snapshots." side="right" size="lg">
        <div className="space-y-2">
          {historySnapshots.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">No history yet. Start editing sections to create snapshots.</div>
          )}
          {[...historySnapshots].reverse().map((snapshot, index) => {
            const originalIndex = historySnapshots.length - 1 - index;
            const totalSections = (snapshot.sections?.length ?? 0) + (snapshot.headerSections?.length ?? 0) + (snapshot.footerSections?.length ?? 0);
            return (
              <div key={originalIndex} className="rounded-xl border border-zinc-200 bg-white p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Snapshot {historySnapshots.length - index}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{totalSections} sections</p>
                  </div>
                  <button onClick={() => { dispatch(restoreHistorySnapshot(snapshot)); setHistoryOpen(false); }}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800">
                    Restore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Drawer>
      <BuilderCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </header>
  );
}
