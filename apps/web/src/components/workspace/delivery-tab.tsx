"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetDeliveryZonesQuery, useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation, useDeleteDeliveryZoneMutation,
} from "@/redux/api/delivery-api";
import {
  Truck, Plus, Loader2, Pencil, Trash2,
  Eye, EyeOff, X, Check, MapPin,
} from "lucide-react";
import { toast } from "sonner";

type DeliveryTabProps = { storeId: string };

type FormData = {
  name: string; charge: string; estimatedDays: string; enabled: boolean; sortOrder: number;
};

export function DeliveryTab({ storeId }: DeliveryTabProps) {
  const { data, isLoading } = useGetDeliveryZonesQuery(storeId);
  const [createZone] = useCreateDeliveryZoneMutation();
  const [updateZone] = useUpdateDeliveryZoneMutation();
  const [deleteZone] = useDeleteDeliveryZoneMutation();

  const zones = data?.data?.deliveryZones ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", charge: "", estimatedDays: "", enabled: true, sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ name: "", charge: "", estimatedDays: "", enabled: true, sortOrder: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (z: typeof zones[0]) => {
    setEditId(z._id);
    setForm({ name: z.name, charge: String(z.charge), estimatedDays: z.estimatedDays, enabled: z.enabled, sortOrder: z.sortOrder });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.charge) { toast.error("Name and charge are required"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), charge: Number(form.charge), estimatedDays: form.estimatedDays, enabled: form.enabled, sortOrder: form.sortOrder };
      if (editId) {
        await updateZone({ storeId, id: editId, data: payload }).unwrap();
        toast.success("Zone updated");
      } else {
        await createZone({ storeId, data: payload }).unwrap();
        toast.success("Zone created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this delivery zone?")) return;
    try {
      await deleteZone({ storeId, id }).unwrap();
      toast.success("Zone deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const toggleEnabled = async (z: typeof zones[0]) => {
    try {
      await updateZone({ storeId, id: z._id, data: { enabled: !z.enabled } }).unwrap();
    } catch { toast.error("Failed to toggle"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{zones.length} zone{zones.length !== 1 ? "s" : ""}</p>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Truck className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-base font-semibold text-zinc-900">No delivery zones</h3>
          <p className="mt-1 text-sm text-zinc-500">Add delivery zones to set shipping charges at checkout.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z, i) => (
            <motion.div key={z._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900">{z.name}</h4>
                    <p className="text-lg font-bold text-emerald-600">৳{z.charge}</p>
                    {z.estimatedDays && <p className="text-xs text-zinc-400">{z.estimatedDays}</p>}
                  </div>
                </div>
                <button onClick={() => toggleEnabled(z)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    z.enabled ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                  }`}>
                  {z.enabled ? "Active" : "Disabled"}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-1 pt-3 border-t border-zinc-100">
                <button onClick={() => openEdit(z)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(z._id)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-20"
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-zinc-900">{editId ? "Edit" : "Add"} Delivery Zone</h3>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Zone Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="e.g. Dhaka City" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Delivery Charge (BDT)</label>
                <input type="number" min={0} value={form.charge} onChange={(e) => setForm({ ...form, charge: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">Estimated Delivery Time</label>
                <input type="text" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="e.g. 1-3 business days" />
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.enabled}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                    className="rounded border-zinc-300" />
                  <span className="text-xs font-medium text-zinc-700">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
