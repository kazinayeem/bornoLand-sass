"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminPlatformPaymentMethodsQuery,
  useUpdateAdminPlatformPaymentMethodMutation,
  type PlatformPaymentMethod,
} from "@/redux/api/subscription-payment-api";

export function AdminPlatformPaymentMethodsPanel({ compact = false }: { compact?: boolean }) {
  const { data, isLoading } = useGetAdminPlatformPaymentMethodsQuery();
  const [updateMethod, { isLoading: saving }] = useUpdateAdminPlatformPaymentMethodMutation();
  const methods = data?.data?.methods ?? [];
  const [editing, setEditing] = useState<PlatformPaymentMethod | null>(null);
  const [form, setForm] = useState<Partial<PlatformPaymentMethod>>({});

  const openEdit = (method: PlatformPaymentMethod) => {
    setEditing(method);
    setForm({ ...method });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      await updateMethod({
        type: editing.type,
        data: {
          label: form.label,
          accountNumber: form.accountNumber,
          merchantNumber: form.merchantNumber,
          personalNumber: form.personalNumber,
          accountName: form.accountName,
          bankName: form.bankName,
          branchName: form.branchName,
          instructions: form.instructions,
          qrCodeUrl: form.qrCodeUrl,
          enabled: form.enabled,
          sortOrder: form.sortOrder,
        },
      }).unwrap();
      toast.success(`${editing.label} updated`);
      setEditing(null);
    } catch {
      toast.error("Failed to update payment method");
    }
  };

  if (isLoading) {
    return (
      <div className={compact ? "flex justify-center py-4" : "flex justify-center py-8"}>
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {methods.map((method) => (
          <span
            key={method.type}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              method.enabled ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {method.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {methods.map((method) => (
          <div key={method.type} className="rounded-2xl border border-zinc-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900">{method.label}</p>
                <p className="text-sm text-zinc-500">{method.accountNumber}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  method.enabled ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {method.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openEdit(method)}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="text-lg font-semibold text-zinc-900">Edit {editing.label}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["label", "Label"],
              ["accountNumber", "Account Number"],
              ["merchantNumber", "Merchant Number"],
              ["personalNumber", "Personal Number"],
              ["accountName", "Account Name"],
              ["bankName", "Bank Name"],
              ["branchName", "Branch Name"],
              ["qrCodeUrl", "QR Code URL"],
              ["sortOrder", "Sort Order"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-zinc-600">{label}</label>
                <input
                  type={key === "sortOrder" ? "number" : "text"}
                  value={String(form[key as keyof PlatformPaymentMethod] ?? "")}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [key]: key === "sortOrder" ? Number(e.target.value) : e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600">Instructions</label>
              <textarea
                value={form.instructions ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.enabled ?? true}
                onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
              />
              Enabled
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
