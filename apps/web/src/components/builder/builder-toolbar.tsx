"use client";

import { Monitor, Smartphone, Tablet, ArrowLeft, Save, Send, Undo2, Redo2, FileEdit, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setDevice } from "@/redux/slices/preview-slice";
import { markSaved, setSaving, setPublishing, undo, redo, setDraft } from "@/redux/slices/builder-slice";
import { useSavePageMutation, usePublishPageMutation } from "@/redux/api/builder-api";
import { useUpdateStoreMutation } from "@/redux/api/store-api";
import { toast } from "sonner";

type Props = {
  storeId: string;
  storeName: string;
  onBack: () => void;
  saving: boolean;
  publishing: boolean;
  isDirty: boolean;
};

export function BuilderToolbar({ storeId, storeName, onBack, saving, publishing, isDirty }: Props) {
  const dispatch = useDispatch();
  const device = useSelector((s: RootState) => s.preview.device);
  const theme = useSelector((s: RootState) => s.theme);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const pageId = useSelector((s: RootState) => s.builder.pageId);
  const isDraft = useSelector((s: RootState) => s.builder.isDraft);
  const canUndo = useSelector((s: RootState) => s.builder.past.length > 0);
  const canRedo = useSelector((s: RootState) => s.builder.future.length > 0);

  const [savePage] = useSavePageMutation();
  const [publishPage] = usePublishPageMutation();
  const [updateStore] = useUpdateStoreMutation();

  const handleSave = async () => {
    if (!pageId) { toast.error("No page selected"); return; }
    dispatch(setSaving(true));
    try {
      await savePage({ pageId, data: { sections, theme } }).unwrap();
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
      await savePage({ pageId, data: { sections, theme } }).unwrap();
      await publishPage(pageId).unwrap();
      await updateStore({ id: storeId, data: { theme } }).unwrap();
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
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="h-5 w-px bg-zinc-200" />
        <div>
          <h1 className="text-sm font-semibold text-zinc-900">Store Builder</h1>
          <p className="text-[11px] text-zinc-400">{storeName}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5">
          {devices.map(({ key, icon: Icon, label }) => (
            <button key={key} title={label} onClick={() => dispatch(setDevice(key))}
              className={`rounded-md p-1.5 transition-colors ${device === key ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        <button title="Undo" onClick={() => dispatch(undo())} disabled={!canUndo}
          className="rounded-md p-1.5 text-zinc-400 transition hover:text-zinc-600 disabled:opacity-30">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button title="Redo" onClick={() => dispatch(redo())} disabled={!canRedo}
          className="rounded-md p-1.5 text-zinc-400 transition hover:text-zinc-600 disabled:opacity-30">
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-5 w-px bg-zinc-200" />

        <button onClick={() => dispatch(setDraft(!isDraft))}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
            isDraft ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}>
          {isDraft ? <FileEdit className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {isDraft ? "Draft" : "Published"}
        </button>

        {isDirty && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
            Unsaved
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
    </header>
  );
}
