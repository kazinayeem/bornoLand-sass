"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard, Smartphone, Landmark, Banknote, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetPaymentMethodsQuery, useCreatePaymentMethodMutation, useUpdatePaymentMethodMutation, useDeletePaymentMethodMutation, type PaymentMethodData } from "@/redux/api/payment-api";
import { toast } from "sonner";

const typeOptions = [
  { value: "cod", label: "Cash on Delivery", icon: Banknote },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Smartphone },
  { value: "rocket", label: "Rocket", icon: Smartphone },
  { value: "bank", label: "Bank Transfer", icon: Landmark },
];

export default function PaymentSettingsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const storeId = stores[0]?._id ?? "";

  const { data, isLoading } = useGetPaymentMethodsQuery(storeId, { skip: !storeId });
  const [createMethod] = useCreatePaymentMethodMutation();
  const [updateMethod] = useUpdatePaymentMethodMutation();
  const [deleteMethod] = useDeletePaymentMethodMutation();

  const methods = data?.data?.paymentMethods ?? [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ type: PaymentMethodData["type"]; label: string; accountNumber: string; accountType: PaymentMethodData["accountType"]; instructions: string; enabled: boolean }>({ type: "bkash", label: "", accountNumber: "", accountType: "personal", instructions: "", enabled: true });

  const resetForm = () => {
    setForm({ type: "bkash", label: "", accountNumber: "", accountType: "personal", instructions: "", enabled: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    try {
      if (editing) {
        await updateMethod({ storeId, id: editing, data: form }).unwrap();
        toast.success("Payment method updated");
      } else {
        await createMethod({ storeId, data: form }).unwrap();
        toast.success("Payment method created");
      }
      resetForm();
    } catch {
      toast.error("Failed to save payment method");
    }
  };

  const startEdit = (m: any) => {
    setForm({ type: m.type, label: m.label, accountNumber: m.accountNumber, accountType: m.accountType, instructions: m.instructions, enabled: m.enabled });
    setEditing(m._id);
    setShowForm(true);
  };

  const toggleEnabled = async (m: any) => {
    if (!storeId) return;
    try {
      await updateMethod({ storeId, id: m._id, data: { enabled: !m.enabled } }).unwrap();
      toast.success(m.enabled ? "Disabled" : "Enabled");
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!storeId) return;
    try {
      await deleteMethod({ storeId, id }).unwrap();
      toast.success("Payment method deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getTypeIcon = (type: string) => {
    const opt = typeOptions.find((o) => o.value === type);
    const Icon = opt?.icon ?? CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Payment Methods</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Manage bKash, Nagad, COD, and more.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Add Method
        </button>
      </motion.div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">{editing ? "Edit" : "Add"} Payment Method</h3>
            <button type="button" onClick={resetForm} className="rounded p-0.5 text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PaymentMethodData["type"] })}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none">
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Label</label>
              <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                required placeholder="e.g. bKash Personal"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Account Number</label>
              <input type="text" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="e.g. 017XXXXXXXX"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Account Type</label>
              <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value as PaymentMethodData["accountType"] })}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none">
                <option value="personal">Personal</option>
                <option value="agent">Agent</option>
                <option value="merchant">Merchant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Payment Instructions</label>
            <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={2} placeholder="e.g. Send money to this number and enter transaction ID during checkout"
              className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm}
              className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit"
              className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:opacity-90">
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
        </div>
      ) : methods.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12">
          <CreditCard className="mb-2 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-400">No payment methods configured</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 text-xs font-medium text-zinc-900 underline underline-offset-2">
            Add your first payment method
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map((m) => (
            <div key={m._id}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
                {getTypeIcon(m.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900">{m.label}</p>
                <p className="text-xs text-zinc-400">
                  {m.accountNumber ? `${m.accountNumber} · ` : ""}
                  {m.accountType ? `${m.accountType} · ` : ""}
                  {typeOptions.find((o) => o.value === m.type)?.label ?? m.type}
                </p>
              </div>
              <button onClick={() => toggleEnabled(m)} title={m.enabled ? "Disable" : "Enable"}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600">
                {m.enabled ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
              </button>
              <button onClick={() => startEdit(m)}
                className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-50">
                Edit
              </button>
              <button onClick={() => handleDelete(m._id)}
                className="rounded-lg p-1.5 text-zinc-300 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
