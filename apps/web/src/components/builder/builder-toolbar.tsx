"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, ArrowLeft, Save, Send, Undo2, Redo2, ZoomIn, Search, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setDevice, setZoom } from "@/redux/slices/preview-slice";
import { markSaved, setSaving, setPublishing, setActiveTab, undoBuilder, redoBuilder, restoreHistorySnapshot, updateSectionProps } from "@/redux/slices/builder-slice";
import { useSavePageMutation, usePublishPageMutation } from "@/redux/api/builder-api";
import { useUpdateStoreMutation } from "@/redux/api/store-api";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { ThemePanel } from "@/components/builder/panels/theme-panel";
import { BuilderCommandPalette } from "@/components/builder/builder-command-palette";
import { useRequiredStore } from "@/providers/store-context";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";

type Props = {
  onBack: () => void;
  saving: boolean;
  publishing: boolean;
  isDirty: boolean;
};

export function BuilderToolbar({ onBack, saving, publishing, isDirty }: Props) {
  const dispatch = useDispatch();
  const { store, storeId } = useRequiredStore();
  const storeSettings = useSelector((s: RootState) => s.storeSettings);
  const device = useSelector((s: RootState) => s.preview.device);
  const zoom = useSelector((s: RootState) => s.preview.zoom);
  const theme = useSelector((s: RootState) => s.theme);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const pageId = useSelector((s: RootState) => s.builder.pageId);
  const lastSaved = useSelector((s: RootState) => s.builder.lastSaved);
  const pastCount = useSelector((s: RootState) => s.builder.past.length);
  const futureCount = useSelector((s: RootState) => s.builder.future.length);
  const historySnapshots = useSelector((s: RootState) => s.builder.past);
  const selectedSection = useSelector((s: RootState) =>
    s.builder.sections.find((section) => section.id === s.builder.selectedSectionId),
  );

  const [savePage] = useSavePageMutation();
  const [publishPage] = usePublishPageMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [stylesOpen, setStylesOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [animationOpen, setAnimationOpen] = useState(false);

  const animationOptions = [
    { value: "none", label: "No animation" },
    { value: "fadeIn", label: "Fade In" },
    { value: "slideUp", label: "Slide Up" },
    { value: "slideInLeft", label: "Slide In Left" },
    { value: "slideInRight", label: "Slide In Right" },
    { value: "zoomIn", label: "Zoom In" },
  ];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
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
        storeId,
        pageId,
        data: { sections, theme, settings: storeSettings },
      }).unwrap();
      await updateStore({ id: storeId, data: { theme } }).unwrap();
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Storefront saved");
    } catch {
      toast.error("Failed to save");
      dispatch(setSaving(false));
    }
  };

  const handlePublish = async () => {
    if (!pageId) { toast.error("No page selected"); return; }
    dispatch(setPublishing(true));
    try {
      await savePage({ storeId, pageId, data: { sections, theme, settings: storeSettings } }).unwrap();
      await publishPage({ storeId, pageId, status: "published" }).unwrap();
      await updateStore({ id: storeId, data: { theme } }).unwrap();
      await revalidateStorefrontAction({
        tenantSlug: store.subdomain || store.slug,
        storeId,
        scope: "all",
      });
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Storefront published!");
    } catch {
      toast.error("Publish failed");
    }
    dispatch(setPublishing(false));
  };

  const devices = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ];

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-5 w-px bg-zinc-200" />
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">Store Builder</h1>
          <p className="text-[11px] text-zinc-400">{store.shortName || store.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
          {devices.map(({ key, icon: Icon, label }) => (
            <button key={key} title={label} onClick={() => dispatch(setDevice(key))}
              className={`rounded-md p-1.5 transition-colors ${device === key ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        <button onClick={() => dispatch(undoBuilder())} disabled={pastCount === 0}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-40">
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button onClick={() => dispatch(redoBuilder())} disabled={futureCount === 0}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-40">
          <Redo2 className="h-3.5 w-3.5" /> Redo
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1">
          <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
          <select
            value={zoom}
            onChange={(e) => dispatch(setZoom(Number(e.target.value)))}
            className="bg-transparent text-xs text-zinc-600 outline-none"
          >
            {[50, 75, 100, 125, 150].map((value) => (
              <option key={value} value={value}>{value}%</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab("components"))}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50"
        >
          <Plus className="h-3.5 w-3.5" /> Quick Add
        </button>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 lg:flex"
        >
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          Search anything...
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400">Ctrl K</span>
        </button>

        <button
          type="button"
          onClick={() => setStylesOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50"
        >
          Styles
        </button>
        <button
          type="button"
          onClick={() => setAnimationOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50"
        >
          Animations
        </button>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50"
        >
          History
        </button>

        {isDirty && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
            Unsaved
          </span>
        )}
        {!isDirty && lastSaved && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
            Saved
          </span>
        )}

        <button onClick={handleSave} disabled={saving || !isDirty}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-40">
          {saving ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </button>

        <button onClick={handlePublish} disabled={publishing}
          className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#18181b" }}>
          {publishing ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Publish
        </button>
      </div>
      <Drawer
        open={stylesOpen}
        onClose={() => setStylesOpen(false)}
        title="Global Styles"
        description="Adjust theme, spacing, typography, and shared storefront presentation."
        side="right"
        size="lg"
        className="px-0 py-0"
      >
        <ThemePanel />
      </Drawer>
      <Drawer
        open={animationOpen}
        onClose={() => setAnimationOpen(false)}
        title="Animation Drawer"
        description="Preview and apply motion only when needed."
        side="right"
        size="md"
      >
        <div className="space-y-3">
          {!selectedSection && (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
              Select a section in the canvas to manage its animation.
            </div>
          )}
          {selectedSection && (
            <>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">{selectedSection.label}</p>
                <p className="mt-1 text-xs text-zinc-500">Animations stay off the permanent inspector to keep the builder distraction-free.</p>
              </div>
              {animationOptions.map((option) => {
                const active = (selectedSection.props.animation ?? "none") === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateSectionProps({
                          id: selectedSection.id,
                          props: { ...selectedSection.props, animation: option.value },
                        }),
                      )
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                      active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className={`mt-1 text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}>Preview-ready motion preset</p>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </Drawer>
      <Drawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="History & Version Restore"
        description="Restore previous builder snapshots without keeping history controls on the canvas."
        side="right"
        size="lg"
      >
        <div className="space-y-3">
          {historySnapshots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
              No history yet. Start editing sections to create restorable snapshots.
            </div>
          )}
          {[...historySnapshots].reverse().map((snapshot, index) => {
            const sectionCount = snapshot.length;
            const originalIndex = historySnapshots.length - 1 - index;
            return (
              <div key={`${originalIndex}-${sectionCount}`} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Snapshot {historySnapshots.length - index}</p>
                    <p className="mt-1 text-xs text-zinc-500">{sectionCount} sections captured in this version</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(restoreHistorySnapshot(snapshot));
                      setHistoryOpen(false);
                    }}
                    className="rounded-xl bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white"
                  >
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
