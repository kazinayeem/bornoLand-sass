"use client";

import { useState } from "react";
import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
  type Coupon,
} from "@/redux/api/coupon-api";
import { CouponFormModal } from "@/components/coupons/coupon-form-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader2,
  Tag,
  Percent,
  DollarSign,
  Truck,
  Gift,
  Calendar,
  AlertCircle,
  Users,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusTab = "all" | "active" | "draft" | "expired";

export function CouponsTab({ storeId }: { storeId: string }) {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetCouponsQuery({
    storeId,
    search,
    status: activeTab,
    page,
    limit: 20,
  });

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const responseData = data?.data;
  const coupons = responseData?.coupons ?? [];
  const total = responseData?.total ?? 0;
  const activeCount = responseData?.activeCount ?? 0;
  const totalUsage = responseData?.totalUsage ?? 0;

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  const handleSaveCoupon = async (formData: Partial<Coupon>) => {
    try {
      if (editingCoupon) {
        const res = await updateCoupon({ storeId, id: editingCoupon._id, data: formData }).unwrap();
        if (res.success) {
          toast.success("Coupon updated successfully");
          setFormOpen(false);
        }
      } else {
        const res = await createCoupon({ storeId, data: formData }).unwrap();
        if (res.success) {
          toast.success("Coupon created successfully");
          setFormOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      const res = await deleteCoupon({ storeId, id: couponId }).unwrap();
      if (res.success) {
        toast.success("Coupon deleted");
        setConfirmDeleteId(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete coupon");
    }
  };

  const getTypeBadge = (type: Coupon["type"]) => {
    switch (type) {
      case "percentage":
        return { label: "Percentage", icon: Percent, color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "fixed":
        return { label: "Fixed Amount", icon: DollarSign, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "free_shipping":
        return { label: "Free Shipping", icon: Truck, color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "buy_x_get_y":
        return { label: "Buy X Get Y", icon: Gift, color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: type, icon: Tag, color: "bg-zinc-50 text-zinc-700 border-zinc-200" };
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
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Coupons</span>
            <Ticket className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-apple-ink">{total}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Promotions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{activeCount}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Redemptions</span>
            <Tag className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-apple-ink">{totalUsage}</p>
        </div>
      </div>

      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1">
          {(["all", "active", "draft", "expired"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all capitalize",
                  active
                    ? "bg-white text-apple-ink shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Action & Search */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search code or name…"
              className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-apple-ink focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-apple-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      {coupons.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-apple-ink">No coupons found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">Create percentage, fixed, free shipping, or buy X get Y promotions for your store.</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-zinc-100"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Type & Value</th>
                  <th className="py-3 px-4">Targeting</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {coupons.map((coupon) => {
                  const badge = getTypeBadge(coupon.type);
                  const Icon = badge.icon;
                  const statusClass =
                    coupon.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : coupon.status === "expired"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-zinc-100 text-zinc-600 border-zinc-200";

                  const productTargetingText =
                    coupon.productIds?.length
                      ? `${coupon.productIds.length} Product(s)`
                      : coupon.categoryIds?.length
                      ? `${coupon.categoryIds.length} Category(ies)`
                      : "All Products";

                  const customerTargetingText = coupon.customerIds?.length
                    ? `${coupon.customerIds.length} Customer(s)`
                    : "All Customers";

                  return (
                    <tr key={coupon._id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Code & Name */}
                      <td className="py-3.5 px-4 font-semibold text-apple-ink">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-extrabold uppercase tracking-wide text-apple-primary">
                            {coupon.code}
                          </span>
                          <span className="text-zinc-600">{coupon.name}</span>
                        </div>
                      </td>

                      {/* Type & Value */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={cn("inline-flex items-center gap-1 w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold", badge.color)}>
                            <Icon className="h-3 w-3" /> {badge.label}
                          </span>
                          <span className="font-bold text-apple-ink">
                            {coupon.type === "percentage"
                              ? `${coupon.value}% Off`
                              : coupon.type === "fixed"
                              ? `${coupon.value} BDT Off`
                              : coupon.type === "free_shipping"
                              ? "Free Shipping"
                              : `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity}`}
                          </span>
                        </div>
                      </td>

                      {/* Targeting */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="inline-flex items-center gap-1 text-zinc-700">
                            <Package className="h-3 w-3 text-zinc-400" /> {productTargetingText}
                          </span>
                          <span className="inline-flex items-center gap-1 text-zinc-500">
                            <Users className="h-3 w-3 text-zinc-400" /> {customerTargetingText}
                          </span>
                        </div>
                      </td>

                      {/* Redemptions */}
                      <td className="py-3.5 px-4 font-semibold text-apple-ink">
                        {coupon.usageCount} {coupon.usageLimit > 0 ? `/ ${coupon.usageLimit}` : "uses"}
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                        {coupon.startsAt || coupon.expiresAt ? (
                          <div className="flex flex-col">
                            {coupon.startsAt && <span>Starts: {new Date(coupon.startsAt).toLocaleDateString()}</span>}
                            {coupon.expiresAt && <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
                          </div>
                        ) : (
                          <span>Always active</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusClass)}>
                          {coupon.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(coupon)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                            title="Edit Coupon"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(coupon._id)}
                            disabled={isDeleting}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                            title="Delete Coupon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupon Form Modal */}
      <CouponFormModal
        open={formOpen}
        storeId={storeId}
        initialData={editingCoupon}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSaveCoupon}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) handleDelete(confirmDeleteId);
        }}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? Customers will no longer be able to use this code."
        confirmLabel="Delete Coupon"
        variant="danger"
      />
    </div>
  );
}
