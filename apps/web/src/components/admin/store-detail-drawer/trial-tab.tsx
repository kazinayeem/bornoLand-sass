"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import type { TabHelpers } from "./types";

export function TrialTab({ helpers }: { helpers: TabHelpers }) {
  const { store, manageTrial, localTrialEnabled, setLocalTrialEnabled, localTrialEndsAt, setLocalTrialEndsAt, markDirty } = helpers;
  const [days, setDays] = useState(14);
  const [processing, setProcessing] = useState<string | null>(null);

  if (!store) return null;

  const trialEnd = (store as Record<string, unknown>).trialEndsAt as string | undefined;
  const trialStart = (store as Record<string, unknown>).trialStartedAt as string | undefined;
  const isTrialing = store.subscriptionStatus === "trialing" || localTrialEnabled;

  const doAction = async (action: string, extra?: { days?: number; endsAt?: string }) => {
    setProcessing(action);
    try {
      await manageTrial(action, extra?.days, extra?.endsAt);
      toast.success(`Trial ${action}ed`);
      markDirty();
    } catch {
      toast.error(`Failed to ${action} trial`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Trial Status</h4>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-xs text-zinc-400">Status</p>
            <p className="font-semibold text-zinc-800">
              {isTrialing ? "Active" : "Inactive"}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-xs text-zinc-400">Enabled</p>
            <p className="font-semibold text-zinc-800">
              {localTrialEnabled ? "Yes" : localTrialEnabled === false ? "No" : "Plan default"}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-xs text-zinc-400">Started</p>
            <p className="font-semibold text-zinc-800">
              {trialStart ? new Date(trialStart).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-xs text-zinc-400">Ends</p>
            <p className="font-semibold text-zinc-800">
              {localTrialEndsAt
                ? new Date(localTrialEndsAt).toLocaleDateString()
                : trialEnd
                  ? new Date(trialEnd).toLocaleDateString()
                  : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Enable / Disable Trial</h4>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => {
              setLocalTrialEnabled(!localTrialEnabled);
              markDirty();
            }}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              localTrialEnabled ? "bg-blue-600" : "bg-zinc-200"
            }`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                localTrialEnabled ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-zinc-600">
            {localTrialEnabled ? "Trial enabled" : localTrialEnabled === false ? "Trial disabled" : "Using plan default"}
          </span>
        </div>
      </div>

      {/* Custom expiry */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Custom Trial Expiry</h4>
        <p className="mt-1 text-xs text-zinc-500">Set a specific date for trial to end.</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="date"
            value={localTrialEndsAt ? localTrialEndsAt.slice(0, 10) : ""}
            onChange={(e) => {
              setLocalTrialEndsAt(e.target.value ? new Date(e.target.value).toISOString() : "");
              markDirty();
            }}
            className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
          />
          <button
            onClick={() => {
              setLocalTrialEndsAt("");
              markDirty();
            }}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Trial Actions</h4>
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Days:</label>
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-9 w-20 rounded-lg border border-zinc-200 px-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <LoadingButton size="sm" variant="secondary" loading={processing === "extend"} onClick={() => doAction("extend", { days })}>
              Extend ({days}d)
            </LoadingButton>
            <LoadingButton size="sm" variant="secondary" loading={processing === "reduce"} onClick={() => doAction("reduce", { days })}>
              Reduce ({days}d)
            </LoadingButton>
            <LoadingButton size="sm" variant="danger" loading={processing === "end"} onClick={() => doAction("end")}>
              End Trial
            </LoadingButton>
            <LoadingButton size="sm" variant="secondary" loading={processing === "restart"} onClick={() => doAction("restart", { days })}>
              Restart ({days}d)
            </LoadingButton>
            <LoadingButton size="sm" variant="secondary" loading={processing === "disable"} onClick={() => doAction("disable")}>
              Disable
            </LoadingButton>
            <LoadingButton size="sm" variant="primary" loading={processing === "convert"} onClick={() => doAction("convert")}>
              Convert to Paid
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
