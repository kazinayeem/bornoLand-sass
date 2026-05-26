"use client";

import { useState } from "react";
import {
  useGetPaymentMethodsQuery, useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation, useDeletePaymentMethodMutation,
} from "@/redux/api/payment-api";
import type { PaymentMethodData } from "@/redux/api/payment-api";
import {
  CreditCard, Plus, Pencil, Trash2, Check, Loader2,
  Smartphone, Landmark, Banknote, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";

type PaymentsTabProps = { storeId: string };

const methodIcons: Record<string, typeof CreditCard> = {
  cod: Banknote, bkash: Smartphone, nagad: Smartphone,
  rocket: Smartphone, bank: Landmark, stripe: Globe,
  sslcommerz: Globe, manual: CreditCard,
};

const methodColors: Record<string, string> = {
  cod: "bg-emerald-100 text-emerald-600",
  bkash: "bg-pink-100 text-pink-600",
  nagad: "bg-orange-100 text-orange-600",
  rocket: "bg-blue-100 text-blue-600",
  bank: "bg-violet-100 text-violet-600",
  stripe: "bg-indigo-100 text-indigo-600",
  sslcommerz: "bg-amber-100 text-amber-600",
  manual: "bg-zinc-100 text-zinc-600",
};

export function PaymentsTab({ storeId }: PaymentsTabProps) {
  const { data, isLoading } = useGetPaymentMethodsQuery(storeId);
  const [createPayment] = useCreatePaymentMethodMutation();
  const [updatePayment] = useUpdatePaymentMethodMutation();
  const [deletePayment] = useDeletePaymentMethodMutation();

  const methods = data?.data?.paymentMethods ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editMethod, setEditMethod] = useState<PaymentMethodData | null>(null);
  const [form, setForm] = useState<Partial<PaymentMethodData>>({
    type: "bkash", label: "", accountNumber: "", accountType: "personal",
    instructions: "", enabled: true, sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ type: "bkash", label: "", accountNumber: "", accountType: "personal", instructions: "", enabled: true, sortOrder: 0 });
    setEditMethod(null);
    setShowForm(false);
  };

  const openEdit = (m: PaymentMethodData) => {
    setEditMethod(m);
    setForm({ type: m.type, label: m.label, accountNumber: m.accountNumber, accountType: m.accountType, instructions: m.instructions, enabled: m.enabled, sortOrder: m.sortOrder });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.type || !form.label) { toast.error("Type and label are required"); return; }
    setSaving(true);
    try {
      if (editMethod) {
        await updatePayment({ storeId, id: editMethod._id, data: form }).unwrap();
        toast.success("Payment method updated");
      } else {
        await createPayment({ storeId, data: form }).unwrap();
        toast.success("Payment method created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePayment({ storeId, id: deleteId }).unwrap();
      toast.success("Payment method deleted");
      setDeleteId(null);
    } catch { toast.error("Failed to delete"); }
  };

  const toggleEnabled = async (m: PaymentMethodData) => {
    try {
      await updatePayment({ storeId, id: m._id, data: { enabled: !m.enabled } }).unwrap();
    } catch { toast.error("Failed to toggle"); }
  };

  const columns: Column<PaymentMethodData>[] = [
    {
      key: "method", label: "Method",
      render: (m) => {
        const Icon = methodIcons[m.type] || CreditCard;
        const colorClass = methodColors[m.type] || "bg-zinc-100 text-zinc-600";
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{m.label}</p>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">{m.type}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "account", label: "Account",
      render: (m) => <span className="text-sm text-zinc-600">{m.accountNumber || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "status", label: "Status",
      render: (m) => (
        <button onClick={(e) => { e.stopPropagation(); toggleEnabled(m); }} className="focus:outline-none">
          <Badge variant={m.enabled ? "success" : "default"}>{m.enabled ? "Active" : "Disabled"}</Badge>
        </button>
      ),
    },
    {
      key: "actions", label: "",
      render: (m) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(m)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteId(m._id)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{methods.length} method{methods.length !== 1 ? "s" : ""}</p>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Method
        </button>
      </div>

      <DataTable
        data={methods}
        columns={columns}
        keyExtractor={(m) => m._id}
        isLoading={isLoading}
        emptyIcon={CreditCard}
        emptyTitle="No payment methods"
        emptyDescription="Add payment methods to accept payments at checkout."
        emptyAction={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add Method
          </button>
        }
      />

      <Modal open={showForm} onClose={resetForm}
        title={editMethod ? "Edit Payment Method" : "Add Payment Method"} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="cod">Cash on Delivery</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">Bank Transfer</option>
              <option value="stripe">Stripe</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="manual">Manual Payment</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Label</label>
            <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="e.g. bKash Personal" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Account / Merchant Number</label>
            <input type="text" value={form.accountNumber ?? ""} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Account Type</label>
            <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value as any })}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
              <option value="personal">Personal</option>
              <option value="agent">Agent</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Instructions (shown at checkout)</label>
            <textarea rows={3} value={form.instructions ?? ""} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm" placeholder="e.g. Send payment to this number..." />
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="rounded border-zinc-300" />
              <span className="text-xs font-medium text-zinc-700">Enabled</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={resetForm}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editMethod ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete payment method?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
