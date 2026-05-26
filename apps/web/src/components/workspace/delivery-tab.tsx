"use client";

import { useState } from "react";
import {
  useGetDeliveryZonesQuery, useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation, useDeleteDeliveryZoneMutation,
} from "@/redux/api/delivery-api";
import { useGetStoreSettingsQuery } from "@/redux/api/store-settings-api";
import {
  Truck, Plus, Pencil, Trash2, Check, Loader2, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";

type DeliveryTabProps = { storeId: string };

type DeliveryZone = {
  _id: string;
  name: string;
  charge: number;
  estimatedDays: string;
  enabled: boolean;
  sortOrder: number;
};

type FormData = {
  name: string; charge: string; estimatedDays: string; enabled: boolean; sortOrder: number;
};

export function DeliveryTab({ storeId }: DeliveryTabProps) {
  const { data, isLoading } = useGetDeliveryZonesQuery(storeId);
  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const curSymbol = settingsData?.data?.settings?.currencySymbol ?? "৳";
  const [createZone] = useCreateDeliveryZoneMutation();
  const [updateZone] = useUpdateDeliveryZoneMutation();
  const [deleteZone] = useDeleteDeliveryZoneMutation();

  const zones: DeliveryZone[] = data?.data?.deliveryZones ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", charge: "", estimatedDays: "", enabled: true, sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: "", charge: "", estimatedDays: "", enabled: true, sortOrder: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (z: DeliveryZone) => {
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteZone({ storeId, id: deleteId }).unwrap();
      toast.success("Zone deleted");
      setDeleteId(null);
    } catch { toast.error("Failed to delete"); }
  };

  const toggleEnabled = async (z: DeliveryZone) => {
    try {
      await updateZone({ storeId, id: z._id, data: { enabled: !z.enabled } }).unwrap();
    } catch { toast.error("Failed to toggle"); }
  };

  const columns: Column<DeliveryZone>[] = [
    {
      key: "zone", label: "Zone",
      render: (z) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{z.name}</span>
        </div>
      ),
    },
    {
      key: "charge", label: "Charge",
      render: (z) => <span className="text-sm font-bold text-emerald-600">{curSymbol}{z.charge}</span>,
    },
    {
      key: "estimatedDays", label: "Est. Time", hideOnMobile: true,
      render: (z) => <span className="text-sm text-zinc-500">{z.estimatedDays || "—"}</span>,
    },
    {
      key: "status", label: "Status",
      render: (z) => (
        <button onClick={(e) => { e.stopPropagation(); toggleEnabled(z); }} className="focus:outline-none">
          <Badge variant={z.enabled ? "success" : "default"}>{z.enabled ? "Active" : "Disabled"}</Badge>
        </button>
      ),
    },
    {
      key: "actions", label: "",
      render: (z) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(z)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteId(z._id)}
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
        <p className="text-sm text-zinc-500">{zones.length} zone{zones.length !== 1 ? "s" : ""}</p>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Zone
        </button>
      </div>

      <DataTable
        data={zones}
        columns={columns}
        keyExtractor={(z) => z._id}
        isLoading={isLoading}
        emptyIcon={Truck}
        emptyTitle="No delivery zones"
        emptyDescription="Add delivery zones to set shipping charges at checkout."
        emptyAction={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add Zone
          </button>
        }
      />

      <Modal open={showForm} onClose={resetForm}
        title={editId ? "Edit Delivery Zone" : "Add Delivery Zone"} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Zone Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" placeholder="e.g. Dhaka City" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Delivery Charge ({settingsData?.data?.settings?.currencyCode ?? "BDT"})</label>
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
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete delivery zone?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
