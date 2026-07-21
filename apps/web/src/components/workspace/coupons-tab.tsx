"use client";

import { useState } from "react";
import { Loader2, Plus, Ticket } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
  type Coupon,
} from "@/redux/api/coupon-api";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

const emptyForm = {
  code: "",
  name: "",
  type: "percentage" as Coupon["type"],
  value: 10,
  minimumOrderAmount: 0,
  maximumDiscount: 0,
  status: "draft" as Coupon["status"],
};

export function CouponsTab({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetCouponsQuery(storeId);
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const coupons = data?.data?.coupons ?? [];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimumOrderAmount,
      maximumDiscount: coupon.maximumDiscount,
      status: coupon.status,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateCoupon({ storeId, id: editing._id, data: form }).unwrap();
        toast.success("Coupon updated");
      } else {
        await createCoupon({ storeId, data: form }).unwrap();
        toast.success("Coupon created");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save coupon");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-apple-ink-muted-48">{coupons.length} coupons</p>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          New Coupon
        </button>
      </div>

      <div className="space-y-2">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Ticket className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-apple-ink">{coupon.name}</p>
                <p className="text-xs text-apple-ink-muted-48">{coupon.code} · {coupon.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={coupon.status === "active" ? "success" : "slate"}>{coupon.status}</Badge>
              <button type="button" onClick={() => openEdit(coupon)} className="text-sm font-medium text-blue-600">Edit</button>
              <button
                type="button"
                onClick={async () => {
                  await deleteCoupon({ storeId, id: coupon._id });
                  toast.success("Coupon deleted");
                }}
                className="text-sm font-medium text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-200 py-12 text-center text-sm text-apple-ink-muted-48">
            No coupons yet. Create percentage, fixed, free shipping, or buy X get Y discounts.
          </p>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Coupon" : "Create Coupon"}>
        <div className="space-y-3">
          {!editing && (
            <input
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          )}
          <input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Coupon["type"] }))} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
            <option value="free_shipping">Free shipping</option>
            <option value="buy_x_get_y">Buy X Get Y</option>
          </select>
          <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Coupon["status"] }))} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <button type="button" onClick={handleSave} className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white">
            Save Coupon
          </button>
        </div>
      </Modal>
    </div>
  );
}
