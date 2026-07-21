"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Send, ExternalLink } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { markSaved, setPublishing, setSaveError } from "@/redux/slices/builder-slice";
import { usePublishStorePageMutation } from "@/redux/api/store-page-api";
import { toast } from "sonner";
import { useRequiredStore } from "@/providers/store-context";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  builderSaveStatusLabel,
  type BuilderSaveStatus,
} from "@/hooks/use-builder-auto-save";
import { cn } from "@/lib/utils";

type Props = {
  onBack: () => void;
  saving: boolean;
  publishing: boolean;
  isDirty: boolean;
  autoSaveStatus: BuilderSaveStatus;
  onForceSave: () => Promise<boolean>;
};

export function BuilderToolbar({
  onBack,
  saving,
  publishing,
  isDirty,
  autoSaveStatus,
  onForceSave,
}: Props) {
  const dispatch = useDispatch();
  const { store, storeId } = useRequiredStore();
  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const lastSaveError = useSelector((s: RootState) => s.builder.lastSaveError);

  const [publishPage] = usePublishStorePageMutation();
  const [statusVisible, setStatusVisible] = useState(true);

  useEffect(() => {
    if (autoSaveStatus === "saved") {
      setStatusVisible(true);
      const t = setTimeout(() => setStatusVisible(false), 2000);
      return () => clearTimeout(t);
    }
    if (autoSaveStatus === "idle") {
      setStatusVisible(false);
      return;
    }
    setStatusVisible(true);
  }, [autoSaveStatus]);

  const handleBack = async () => {
    if (isDirty) {
      await onForceSave();
    }
    onBack();
  };

  const handleSave = async () => {
    if (!pageId) {
      toast.error("Home page not loaded");
      return;
    }
    const ok = await onForceSave();
    if (ok) toast.success("Saved");
    else if (!isDirty) toast.message("Nothing to save");
  };

  const handlePreview = async () => {
    if (isDirty) {
      await onForceSave();
    }
    window.open(`/store/${store.slug}`, "_blank", "noopener,noreferrer");
  };

  const handlePublish = async () => {
    if (!pageId) {
      toast.error("Home page not loaded");
      return;
    }
    dispatch(setPublishing(true));
    try {
      await onForceSave();
      await publishPage({ id: pageId, storeId }).unwrap();
      await revalidateStorefrontAction({ tenantSlug: store.subdomain || store.slug, storeId, scope: "all" });
      dispatch(markSaved(new Date().toISOString()));
      toast.success("Published!");
    } catch {
      dispatch(setSaveError("Publish failed"));
      toast.error("Publish failed");
    }
    dispatch(setPublishing(false));
  };

  const statusLabel =
    publishing
      ? "Publishing…"
      : lastSaveError && autoSaveStatus === "error"
        ? builderSaveStatusLabel("error")
        : statusVisible
          ? builderSaveStatusLabel(autoSaveStatus)
          : null;

  return (
    <header className="frosted-bar sticky top-0 z-40 flex min-h-14 items-center justify-between gap-4 border-b border-apple-hairline px-4 py-2 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => void handleBack()}
          aria-label="Back to dashboard"
          className="btn-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-apple-surface-chip/64 text-apple-ink-muted-80 transition-colors hover:text-apple-ink"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-body-strong text-apple-ink">{store.shortName || store.name}</p>
          <p
            className={cn(
              "truncate text-caption transition-opacity duration-300",
              autoSaveStatus === "unsaved" && "text-amber-600",
              autoSaveStatus === "saving" && "text-apple-primary",
              autoSaveStatus === "saved" && "text-emerald-600",
              autoSaveStatus === "error" && "text-red-600",
              (autoSaveStatus === "idle" || !statusLabel) && "text-apple-ink-muted-48",
            )}
            aria-live="polite"
          >
            Homepage{statusLabel ? ` · ${statusLabel}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handlePreview()}
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
          disabled={!isDirty && !saving}
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
