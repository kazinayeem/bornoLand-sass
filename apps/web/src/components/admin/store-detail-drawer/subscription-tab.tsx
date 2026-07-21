"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import type { TabHelpers } from "./types";

const STATUS_OPTIONS = ["active", "paused", "suspended", "cancelled", "expired"];
const BILLING_OPTIONS = ["trial", "active", "past_due", "cancelled", "paused"];

export function SubscriptionTab({ helpers }: { helpers: TabHelpers }) {
  const {
    store, manageSub, syncSub,
    localSubStatusOverride, setLocalSubStatusOverride,
    localBillingStatusOverride, setLocalBillingStatusOverride,
    markDirty, saving,
  } = helpers;

  const [processing, setProcessing] = useState<string | null>(null);

  if (!store) return null;

  const effectiveStatus = localSubStatusOverride ?? store.subscriptionStatus ?? "—";
  const effectiveBilling = localBillingStatusOverride ?? store.billingStatus ?? "—";

  const doAction = async (action: string) => {
    setProcessing(action);
    try {
      await manageSub(action);
      toast.success(`Subscription ${action}ed`);
      if (action === "renew") markDirty();
    } catch {
      toast.error(`Failed to ${action} subscription`);
    } finally {
      setProcessing(null);
    }
  };

  const handleSync = async () => {
    setProcessing("sync");
    try {
      await syncSub();
      toast.success("Subscription synced");
    } catch {
      toast.error("Failed to sync subscription");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current State */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Current Subscription State</h4>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-apple-canvas-parchment p-3">
            <p className="text-xs text-apple-ink-muted-48">Billing Status</p>
            <p className="font-semibold text-zinc-800">{effectiveBilling}</p>
          </div>
          <div className="rounded-lg bg-apple-canvas-parchment p-3">
            <p className="text-xs text-apple-ink-muted-48">Subscription Status</p>
            <p className="font-semibold text-zinc-800">{effectiveStatus}</p>
          </div>
        </div>
        {localSubStatusOverride && (
          <p className="mt-2 text-xs text-amber-600">* Status overridden from plan default</p>
        )}
      </div>

      {/* Override status */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Override Subscription Status</h4>
        <p className="mt-1 text-xs text-apple-ink-muted-48">
          Set a specific status override, or leave as plan default.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Subscription Status</label>
            <select
              value={localSubStatusOverride ?? ""}
              onChange={(e) => {
                setLocalSubStatusOverride(e.target.value || null);
                markDirty();
              }}
              className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            >
              <option value="">Plan default ({store.subscriptionStatus})</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">Billing Status</label>
            <select
              value={localBillingStatusOverride ?? ""}
              onChange={(e) => {
                setLocalBillingStatusOverride(e.target.value || null);
                markDirty();
              }}
              className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            >
              <option value="">Plan default ({store.billingStatus})</option>
              {BILLING_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Subscription Actions</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <LoadingButton size="sm" loading={processing === "pause"} onClick={() => doAction("pause")}>Pause</LoadingButton>
          <LoadingButton size="sm" variant="secondary" loading={processing === "resume"} onClick={() => doAction("resume")}>Resume</LoadingButton>
          <LoadingButton size="sm" variant="danger" loading={processing === "suspend"} onClick={() => doAction("suspend")}>Suspend</LoadingButton>
          <LoadingButton size="sm" variant="danger" loading={processing === "cancel"} onClick={() => doAction("cancel")}>Cancel</LoadingButton>
          <LoadingButton size="sm" variant="danger" loading={processing === "expire"} onClick={() => doAction("expire")}>Expire</LoadingButton>
          <LoadingButton size="sm" variant="primary" loading={processing === "renew"} onClick={() => doAction("renew")}>Renew</LoadingButton>
          <LoadingButton size="sm" variant="secondary" loading={processing === "sync"} onClick={handleSync}>Sync</LoadingButton>
        </div>
      </div>
    </div>
  );
}
