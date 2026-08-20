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
import { Button } from "@/components/ui/button";
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
    <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 py-2 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => void handleBack()}
          aria-label="Back to dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{store.shortName || store.name}</p>
          <p
            className={cn(
              "truncate text-xs font-medium transition-opacity duration-300",
              autoSaveStatus === "unsaved" && "text-amber-600",
              autoSaveStatus === "saving" && "text-primary",
              autoSaveStatus === "saved" && "text-emerald-600",
              autoSaveStatus === "error" && "text-destructive",
              (autoSaveStatus === "idle" || !statusLabel) && "text-muted-foreground",
            )}
            aria-live="polite"
          >
            Homepage{statusLabel ? ` · ${statusLabel}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handlePreview()}
          className="hidden items-center gap-1.5 rounded-full text-xs font-semibold text-apple-ink hover:bg-apple-canvas-parchment sm:inline-flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Preview
        </Button>
        <LoadingButton
          type="button"
          variant="outline"
          size="sm"
          loading={saving}
          loadingKey="save"
          onClick={() => void handleSave()}
          disabled={!isDirty && !saving}
          icon={<Save className="h-3.5 w-3.5" />}
          className="rounded-full text-xs font-semibold text-apple-ink border-apple-hairline disabled:opacity-40"
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
          className="rounded-full bg-apple-ink text-white hover:bg-apple-ink/90 text-xs font-semibold shadow-sm"
        >
          Publish
        </LoadingButton>
      </div>
    </header>
  );
}

