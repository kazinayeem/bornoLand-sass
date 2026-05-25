"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Truck, MapPin, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetDeliveryZonesQuery, useCreateDeliveryZoneMutation, useUpdateDeliveryZoneMutation, useDeleteDeliveryZoneMutation } from "@/redux/api/delivery-api";
import { toast } from "sonner";

export default function DeliverySettingsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const storeId = stores[0]?._id ?? "";

  const { data, isLoading } = useGetDeliveryZonesQuery(storeId, { skip: !storeId });
  const [createZone] = useCreateDeliveryZoneMutation();
  const [updateZone] = useUpdateDeliveryZoneMutation();
  const [deleteZone] = useDeleteDeliveryZoneMutation();

  const zones = data?.data?.deliveryZones ?? [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", charge: 0, estimatedDays: "3-5 days", enabled: true });

  const resetForm = () => {
    setForm({ name: "", charge: 0, estimatedDays: "3-5 days", enabled: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    try {
      if (editing) {
        await updateZone({ storeId, id: editing, data: form }).unwrap();
        toast.success("Delivery zone updated");
      } else {
        await createZone({ storeId, data: form }).unwrap();
        toast.success("Delivery zone created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save");
    }
  };

  const startEdit = (z: any) => {
    setForm({ name: z.name, charge: z.charge, estimatedDays: z.estimatedDays, enabled: z.enabled });
    setEditing(z._id);
    setShowForm(true);
  };

  const toggleEnabled = async (z: any) => {
    if (!storeId) return;
    try {
      await updateZone({ storeId, id: z._id, data: { enabled: !z.enabled } }).unwrap();
      toast.success(z.enabled ? "Disabled" : "Enabled");
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!storeId) return;
    try {
      await deleteZone({ storeId, id }).unwrap();
      toast.success("Delivery zone deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Delivery Zones</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Set delivery charges by area.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Add Zone
        </button>
      </motion.div>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">{editing ? "Edit" : "Add"} Delivery Zone</h3>
            <button type="button" onClick={resetForm} className="rounded p-0.5 text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Area Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                required placeholder="e.g. Inside Dhaka"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Delivery Charge (BDT)</label>
              <input type="number" min={0} value={form.charge} onChange={(e) => setForm({ ...form, charge: Number(e.target.value) })}
                required
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Est. Delivery Time</label>
              <input type="text" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                placeholder="e.g. 3-5 days"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none" />
            </div>
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
      ) : zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12">
          <MapPin className="mb-2 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-400">No delivery zones configured</p>
          <button onClick={() => setShowForm(true)}
            className="mt-2 text-xs font-medium text-zinc-900 underline underline-offset-2">
            Add your first delivery zone
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {zones.map((z) => (
            <div key={z._id}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
                <Truck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900">{z.name}</p>
                <p className="text-xs text-zinc-400">
                  ৳{z.charge} delivery · {z.estimatedDays}
                </p>
              </div>
              <button onClick={() => toggleEnabled(z)} title={z.enabled ? "Disable" : "Enable"}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600">
                {z.enabled ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
              </button>
              <button onClick={() => startEdit(z)}
                className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-50">
                Edit
              </button>
              <button onClick={() => handleDelete(z._id)}
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
