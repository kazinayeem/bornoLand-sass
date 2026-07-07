"use client";

import { toast } from "sonner";
import type { TabHelpers } from "./types";

export function StorageTab({ helpers }: { helpers: TabHelpers }) {
  const {
    localStorageMB, setLocalStorageMB,
    localStorageUnlimited, setLocalStorageUnlimited,
    settingsData, markDirty,
  } = helpers;

  const usage = settingsData?.usage;
  const effectiveLimit = settingsData?.storage?.limitMB ?? 0;
  const usedMB = usage?.storageMB ?? 0;
  const percent = effectiveLimit > 0 ? Math.min(100, Math.round((usedMB / effectiveLimit) * 100)) : 0;

  const handleLimitChange = (val: string) => {
    setLocalStorageMB(val === "" ? null : Number(val));
    markDirty();
  };

  const handleUnlimitedChange = (checked: boolean) => {
    setLocalStorageUnlimited(checked);
    if (checked) setLocalStorageMB(null);
    markDirty();
  };

  const planLimitMB = settingsData?.usage?.storageLimitMB ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Usage bar */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Current Usage</h4>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              {usage?.storageUsedFormatted ?? "0 MB"} used
            </span>
            <span className="font-medium text-zinc-700">
              {localStorageUnlimited
                ? "∞ Unlimited"
                : `${localStorageMB ?? planLimitMB} MB`}
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full transition-all ${
                percent > 90 ? "bg-red-500" : percent > 70 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-zinc-400">
            {percent}% used · {Math.max(0, effectiveLimit - usedMB)} MB remaining
          </p>
        </div>

        {usage && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs text-zinc-400">Plan Limit</p>
              <p className="font-semibold text-zinc-800">{planLimitMB} MB</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs text-zinc-400">Override</p>
              <p className="font-semibold text-zinc-800">
                {localStorageMB != null ? `${localStorageMB} MB` : "Not set"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Override controls */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Storage Override</h4>
        <p className="mt-1 text-xs text-zinc-500">
          Override the storage limit from the plan. Leave empty to use plan default.
        </p>

        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localStorageUnlimited}
              onChange={(e) => handleUnlimitedChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600"
            />
            <span className="text-sm text-zinc-700">Unlimited storage</span>
          </label>

          {!localStorageUnlimited && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">
                Custom storage limit (MB)
              </label>
              <input
                type="number"
                min={0}
                value={localStorageMB ?? ""}
                onChange={(e) => handleLimitChange(e.target.value)}
                placeholder="e.g. 10240 for 10 GB"
                className="h-10 w-full max-w-xs rounded-xl border border-zinc-200 px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Plan default: {planLimitMB} MB ({(planLimitMB / 1024).toFixed(1)} GB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Quick Actions</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              handleLimitChange(String(planLimitMB * 2));
              toast("Storage doubled to " + (planLimitMB * 2) + " MB");
            }}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            2x Plan ({planLimitMB * 2} MB)
          </button>
          <button
            onClick={() => {
              handleLimitChange(String(planLimitMB * 5));
              toast("Storage set to " + (planLimitMB * 5) + " MB");
            }}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            5x Plan ({planLimitMB * 5} MB)
          </button>
          <button
            onClick={() => {
              handleUnlimitedChange(true);
              toast("Storage set to unlimited");
            }}
            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
          >
            Unlimited
          </button>
          <button
            onClick={() => {
              setLocalStorageMB(null);
              setLocalStorageUnlimited(false);
              markDirty();
              toast("Reset to plan default");
            }}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Reset to Plan
          </button>
        </div>
      </div>
    </div>
  );
}
