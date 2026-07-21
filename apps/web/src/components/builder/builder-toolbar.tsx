"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Send, ExternalLink } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { markSaved, setSaving, setPublishing, setSaveError } from "@/redux/slices/builder-slice";
import { useSaveStorePageDraftMutation, usePublishStorePageMutation } from "@/redux/api/store-page-api";
import { toast } from "sonner";
import { useRequiredStore } from "@/providers/store-context";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { LoadingButton } from "@/components/ui/loading-button";
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
};

export function BuilderToolbar({ onBack, saving, publishing, isDirty }: Props) {
  const dispatch = useDispatch();
  const { store, storeId } = useRequiredStore();
  const storeSettings = useSelector((s: RootState) => s.storeSettings);
  const theme = useSelector((s: RootState) => s.theme);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const headerSections = useSelector((s: RootState) => s.builder.headerSections);
  const footerSections = useSelector((s: RootState) => s.builder.footerSections);
  const headerSettings = useSelector((s: RootState) => s.builder.headerSettings);
  const footerSettings = useSelector((s: RootState) => s.builder.footerSettings);
  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const lastSaved = useSelector((s: RootState) => s.builder.lastSaved);
  const lastSaveError = useSelector((s: RootState) => s.builder.lastSaveError);

  const [savePageDraft] = useSaveStorePageDraftMutation();
  const [publishPage] = usePublishStorePageMutation();
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!pageId) {
      toast.error("Home page not loaded");
      return;
    }
    dispatch(setSaving(true));
    try {
      await savePageDraft({
        id: pageId,
        storeId,
        sections,
        headerSections,
        footerSections,
        headerSettings,
        footerSettings,
        theme,
        settings: storeSettings,
      }).unwrap();
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Saved");
    } catch {
      dispatch(setSaveError("Save failed"));
      toast.error("Failed to save");
    }
  };

  const handlePublish = async () => {
    if (!pageId) {
      toast.error("Home page not loaded");
      return;
    }
    dispatch(setPublishing(true));
    try {
      await savePageDraft({
        id: pageId,
        storeId,
        sections,
        headerSections,
        footerSections,
        headerSettings,
        footerSettings,
        theme,
        settings: storeSettings,
      }).unwrap();
      await publishPage({ id: pageId, storeId }).unwrap();
      await revalidateStorefrontAction({ tenantSlug: store.subdomain || store.slug, storeId, scope: "all" });
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Published!");
    } catch {
      toast.error("Publish failed");
    }
    dispatch(setPublishing(false));
  };

  const statusLabel = saving
    ? "Saving…"
    : lastSaveError
      ? "Save failed"
      : isDirty
        ? "Unsaved changes"
        : lastSaved
          ? `Saved ${timeAgo(lastSaved)}`
          : null;

  return (
    <header className="frosted-bar sticky top-0 z-40 flex min-h-14 items-center justify-between gap-4 border-b border-apple-hairline px-4 py-2 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to dashboard"
          className="btn-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-apple-surface-chip/64 text-apple-ink-muted-80 transition-colors hover:text-apple-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-body-strong text-apple-ink">{store.shortName || store.name}</p>
          <p className="truncate text-caption text-apple-ink-muted-48">
            Homepage{statusLabel ? ` · ${statusLabel}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.open(`/store/${store.slug}`, "_blank", "noopener,noreferrer")}
          className="btn-press hidden items-center gap-2 rounded-apple-pill border border-apple-hairline bg-apple-canvas px-4 py-2 text-caption font-medium text-apple-ink transition-colors hover:bg-apple-canvas-parchment sm:inline-flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Preview
        </button>
        <LoadingButton
          type="button"
          variant="outline"
          size="sm"
          loading={saving}
          loadingKey="save"
          onClick={() => void handleSave()}
          disabled={!isDirty}
          icon={<Save className="h-3.5 w-3.5" />}
          className="rounded-apple-pill"
        >
          Save
        </LoadingButton>
        <LoadingButton
          type="button"
          variant="primary"
          size="sm"
          loading={publishing}
          loadingKey="publish"
          onClick={() => void handlePublish()}
          icon={<Send className="h-3.5 w-3.5" />}
          className={cn("rounded-apple-pill bg-apple-primary hover:bg-apple-primary-focus")}
        >
          Publish
        </LoadingButton>
      </div>
    </header>
  );
}
