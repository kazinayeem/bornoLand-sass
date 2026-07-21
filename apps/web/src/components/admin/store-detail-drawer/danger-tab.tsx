"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { useActionStatus } from "@/providers/action-status-provider";
import {
  AlertTriangle, Trash2, RefreshCw, Database, BarChart3, HardDrive, Hash,
} from "lucide-react";
import type { TabHelpers } from "./types";

export function DangerTab({ helpers }: { helpers: TabHelpers }) {
  const { store, resetStore, recalculate, syncSub, deleteCascade } = helpers;
  const { startAction, finishAction } = useActionStatus();

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteStep, setDeleteStep] = useState<"initial" | "confirm">("initial");
  const [deleting, setDeleting] = useState(false);
  const [processingReset, setProcessingReset] = useState<string | null>(null);

  if (!store) return null;

  const storeName = store.name;
  const expectedDelete = `DELETE`;
  const expectedName = `Delete ${storeName}`;

  const handleDelete = async () => {
    if (deleteStep === "initial") return;
    if (deleteConfirm !== expectedName) return;
    setDeleting(true);
    const actionId = startAction("deleting", `store ${storeName}`);
    try {
      await deleteCascade();
      finishAction(actionId, "success", `${storeName} deleted`);
      toast.success(`${storeName} deleted permanently`);
      helpers.refetchSettings();
    } catch {
      finishAction(actionId, "error", "Delete failed");
      toast.error("Failed to delete store");
    } finally {
      setDeleting(false);
      setDeleteConfirm("");
      setDeleteStep("initial");
    }
  };

  // Get usage info for the delete warning
  const usageData = (helpers.settingsData as Record<string, unknown>)?.usage as Record<string, unknown> | undefined;
  const deleteSummary = [
    { label: "Products", value: usageData?.products ?? 0 },
    { label: "Orders", value: usageData?.orders ?? 0 },
    { label: "Customers", value: usageData?.customers ?? 0 },
    { label: "Media Files", value: usageData?.media ?? 0 },
    { label: "Categories", value: usageData?.categories ?? 0 },
    { label: "Builder Pages", value: usageData?.pages ?? 0 },
    { label: "Reviews", value: usageData?.reviews ?? 0 },
    { label: "Staff", value: usageData?.staff ?? 0 },
  ];

  const handleReset = async (type: string) => {
    setProcessingReset(type);
    const actionId = startAction("processing", `${type} reset`);
    try {
      await resetStore(type);
      finishAction(actionId, "success", `${type} reset completed`);
      toast.success(`${type} reset`);
    } catch {
      finishAction(actionId, "error", `${type} reset failed`);
      toast.error(`Failed to reset ${type}`);
    } finally {
      setProcessingReset(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Delete Store */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h4 className="text-sm font-semibold text-red-700">Danger Zone</h4>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Deleting this store will permanently remove all associated data. This action cannot be undone.
        </p>

        {/* Delete summary */}
        <div className="mt-3 rounded-lg border border-red-100 bg-white p-3">
          <p className="text-xs font-medium text-red-600">The following will be permanently deleted:</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {deleteSummary.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-lg font-bold text-zinc-800">{String(item.value)}</p>
                <p className="text-[10px] text-apple-ink-muted-48">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Type DELETE */}
        {deleteStep === "initial" && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-apple-ink-muted-80">
              Type <strong>DELETE</strong> to continue:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE"'
                className="h-10 w-40 rounded-xl border border-red-200 px-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <LoadingButton
                variant="danger"
                size="sm"
                disabled={deleteConfirm !== expectedDelete}
                onClick={() => setDeleteStep("confirm")}
              >
                Continue
              </LoadingButton>
            </div>
          </div>
        )}

        {/* Step 2: Confirm with store name */}
        {deleteStep === "confirm" && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-100/50 p-4">
            <p className="text-sm font-medium text-red-700">
              Are you absolutely sure?
            </p>
            <p className="mt-1 text-xs text-red-600">
              This will permanently delete <strong>{storeName}</strong> and all its data.
              Type <strong>{expectedName}</strong> to confirm.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={`Type "${expectedName}"`}
                className="h-10 flex-1 rounded-xl border border-red-300 px-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <LoadingButton
                variant="danger"
                size="sm"
                loading={deleting}
                loadingText="Deleting..."
                disabled={deleteConfirm !== expectedName}
                onClick={handleDelete}
              >
                Delete Forever
              </LoadingButton>
              <button
                onClick={() => {
                  setDeleteStep("initial");
                  setDeleteConfirm("");
                }}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Options */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Reset Options</h4>
        <p className="mt-1 text-xs text-apple-ink-muted-48">
          Reset various store metrics and caches.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<HardDrive className="h-4 w-4" />}
            loading={processingReset === "storage"}
            onClick={() => handleReset("storage")}
          >
            Reset Storage Usage
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<BarChart3 className="h-4 w-4" />}
            loading={processingReset === "analytics"}
            onClick={() => handleReset("analytics")}
          >
            Reset Analytics
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<Hash className="h-4 w-4" />}
            loading={processingReset === "cache"}
            onClick={() => handleReset("cache")}
          >
            Reset Cache
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<Database className="h-4 w-4" />}
            loading={processingReset === "builderCache"}
            onClick={() => handleReset("builderCache")}
          >
            Reset Builder Cache
          </LoadingButton>
        </div>
      </div>

      {/* Recalculate & Sync */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Recalculate & Sync</h4>
        <p className="mt-1 text-xs text-apple-ink-muted-48">
          Recalculate store metrics or sync subscription state.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              const actionId = startAction("processing", "recalculating usage");
              recalculate().then(() => {
                finishAction(actionId, "success", "Usage recalculated");
                toast.success("Usage recalculated");
              }).catch(() => {
                finishAction(actionId, "error", "Recalculation failed");
              });
            }}
          >
            Recalculate Store Usage
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="secondary"
            onClick={() => {
              const actionId = startAction("syncing", "subscription");
              syncSub().then(() => {
                finishAction(actionId, "success", "Subscription synced");
                toast.success("Subscription synced");
              }).catch(() => {
                finishAction(actionId, "error", "Sync failed");
              });
            }}
          >
            Sync Subscription
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="secondary"
            onClick={() => {
              const actionId = startAction("processing", "recalculating limits");
              resetStore("limits").then(() => {
                finishAction(actionId, "success", "Limits recalculated");
                toast.success("Limits recalculated");
              }).catch(() => {
                finishAction(actionId, "error", "Limits recalculation failed");
              });
            }}
          >
            Recalculate Limits
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
