"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Shield, UserX, RefreshCw, Key } from "lucide-react";
import type { TabHelpers } from "./types";

export function UsersTab({ helpers }: { helpers: TabHelpers }) {
  const { store, manageStaff, localLoginDisabled, setLocalLoginDisabled, localMaintenanceMode, setLocalMaintenanceMode, markDirty } = helpers;
  const [processing, setProcessing] = useState<string | null>(null);

  if (!store) return null;

  const storeObj = store as Record<string, unknown>;
  const owner = storeObj.userId as { _id?: string; name?: string; email?: string } | undefined;

  const doStaffAction = async (action: string, teamMemberId?: string, role?: string) => {
    setProcessing(action);
    try {
      await manageStaff(action, teamMemberId, role);
      toast.success(`Staff ${action}ed`);
    } catch {
      toast.error(`Failed to ${action} staff`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Owner */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Store Owner</h4>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white">
            {owner?.name?.[0] ?? "?"}
          </div>
          <div>
            <p className="font-medium text-zinc-900">{owner?.name ?? "—"}</p>
            <p className="text-sm text-zinc-500">{owner?.email ?? "—"}</p>
          </div>
          <div className="ml-auto">
            <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Owner
            </span>
          </div>
        </div>
      </div>

      {/* Staff area (placeholder) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Staff</h4>
        <p className="mt-1 text-xs text-zinc-400">
          Staff management is handled through the Team Members section. Use the buttons below for quick actions.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => toast.info("Staff list would load from the team members API")}
          >
            Load Staff
          </LoadingButton>
        </div>
      </div>

      {/* Access Controls */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Access Controls</h4>
        <p className="mt-1 text-xs text-zinc-500">
          Temporarily restrict access to this store.
        </p>
        <div className="mt-4 space-y-4">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-700">Maintenance Mode</span>
            </div>
            <button
              onClick={() => {
                setLocalMaintenanceMode(!localMaintenanceMode);
                markDirty();
              }}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                localMaintenanceMode ? "bg-amber-500" : "bg-zinc-200"
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  localMaintenanceMode ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-700">Disable Login</span>
            </div>
            <button
              onClick={() => {
                setLocalLoginDisabled(!localLoginDisabled);
                markDirty();
              }}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                localLoginDisabled ? "bg-red-500" : "bg-zinc-200"
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  localLoginDisabled ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Quick Staff Actions */}
      <div className="rounded-xl border border-red-100 bg-red-50/30 p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Staff Actions</h4>
        <p className="mt-1 text-xs text-zinc-500">
          These actions are available for the store owner. For managing team members, use the
          Team Members page inside the store.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LoadingButton
            size="sm"
            variant="danger"
            icon={<UserX className="h-4 w-4" />}
            onClick={() => toast.error("Cannot remove owner via this panel")}
          >
            Remove Owner
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<Key className="h-4 w-4" />}
            onClick={() => toast.info("Password reset link would be sent")}
          >
            Reset Password
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
