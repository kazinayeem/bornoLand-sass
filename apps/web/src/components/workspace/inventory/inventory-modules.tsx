"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  Check,
  Package,
  ScanBarcode,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/format-bdt";
import { Badge } from "@/components/ui/badge";
import {
  useGetInventorySuppliersQuery,
  useCreateInventorySupplierMutation,
  useUpdateInventorySupplierMutation,
  useDeleteInventorySupplierMutation,
  useGetInventoryWarehousesQuery,
  useCreateInventoryWarehouseMutation,
  useDeleteInventoryWarehouseMutation,
  useGetInventoryPurchaseOrdersQuery,
  useCreateInventoryPurchaseOrderMutation,
  useUpdateInventoryPurchaseOrderMutation,
  useReceiveInventoryPurchaseOrderMutation,
  useGetInventoryTransfersQuery,
  useCreateInventoryTransferMutation,
  useApproveInventoryTransferMutation,
  useCompleteInventoryTransferMutation,
  useGetInventoryBatchesQuery,
  useGetInventoryPriceHistoryQuery,
  useGetInventoryCostHistoryQuery,
  useGetInventoryAuditQuery,
  useGetInventoryValuationReportQuery,
  useGetInventoryAgingReportQuery,
  useGetInventoryAnalyticsQuery,
  useLazySearchInventoryBarcodeQuery,
  useGenerateInventoryBarcodeMutation,
  useGetInventoryAlertSettingsQuery,
  useUpdateInventoryAlertSettingsMutation,
  useGetInventoryQuery,
} from "@/redux/api/inventory-api";

function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-apple-hairline bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-apple-hairline px-5 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-apple-ink dark:text-zinc-100">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-apple-ink-muted-48">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-12 text-center text-sm text-apple-ink-muted-48 dark:border-zinc-800">
      {message}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" || status === "received" || status === "completed" || status === "approved"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : status === "cancelled" || status === "blocked" || status === "inactive"
        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
        : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", tone)}>{status}</span>;
}

function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </div>
  );
}

function nameOf(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  if (typeof ref === "object" && ref && "name" in ref) return String((ref as { name?: string }).name ?? "—");
  return "—";
}

/* ─── Suppliers ──────────────────────────────────────────────────────────── */

export function SuppliersModule({ storeId }: { storeId: string }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", address: "", notes: "" });
  const { data, isLoading } = useGetInventorySuppliersQuery({
    storeId,
    params: { search, perPage: 50 },
  });
  const [createSupplier, { isLoading: creating }] = useCreateInventorySupplierMutation();
  const [updateSupplier] = useUpdateInventorySupplierMutation();
  const [deleteSupplier] = useDeleteInventorySupplierMutation();
  const items = data?.data?.items ?? [];

  const onCreate = async () => {
    if (!form.name.trim()) return toast.error("Supplier name is required");
    try {
      await createSupplier({ storeId, body: form }).unwrap();
      toast.success("Supplier created");
      setForm({ name: "", email: "", phone: "", company: "", address: "", notes: "" });
      setShowForm(false);
    } catch {
      toast.error("Failed to create supplier");
    }
  };

  return (
    <Panel
      title="Suppliers"
      description="Profiles, contacts, purchase totals, and outstanding dues."
      actions={
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-apple-ink px-3 py-2 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Plus className="h-3.5 w-3.5" /> Add Supplier
        </button>
      }
    >
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Search className="h-4 w-4 text-apple-ink-muted-48" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers…"
          className="h-10 w-full bg-transparent text-sm outline-none"
        />
      </div>

      {showForm && (
        <div className="mb-4 grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 md:grid-cols-2">
          {(["name", "company", "email", "phone", "address"] as const).map((key) => (
            <input
              key={key}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          ))}
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes"
            className="min-h-[80px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm md:col-span-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <div className="md:col-span-2">
            <button
              type="button"
              disabled={creating}
              onClick={onCreate}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {creating ? "Saving…" : "Save Supplier"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No suppliers yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-apple-ink-muted-48">
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="pb-2 font-medium">Supplier</th>
                <th className="pb-2 font-medium">Contact</th>
                <th className="pb-2 font-medium">Purchases</th>
                <th className="pb-2 font-medium">Due</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id} className="border-b border-zinc-50 dark:border-zinc-900">
                  <td className="py-3">
                    <div className="font-medium text-apple-ink dark:text-zinc-100">{s.name}</div>
                    <div className="text-xs text-apple-ink-muted-48">{s.company || s.code || "—"}</div>
                  </td>
                  <td className="py-3 text-xs text-apple-ink-muted-80">
                    <div>{s.email || "—"}</div>
                    <div>{s.phone || "—"}</div>
                  </td>
                  <td className="py-3">{formatBDT(s.totalPurchases ?? 0)}</td>
                  <td className="py-3">{formatBDT(s.outstandingDue ?? 0)}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={async () => {
                        const next = s.status === "active" ? "inactive" : "active";
                        await updateSupplier({ storeId, id: s._id, body: { status: next } });
                      }}
                    >
                      <StatusBadge status={s.status} />
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteSupplier({ storeId, id: s._id });
                        toast.success("Supplier deleted");
                      }}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ─── Warehouses ─────────────────────────────────────────────────────────── */

export function WarehousesModule({ storeId }: { storeId: string }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { data, isLoading } = useGetInventoryWarehousesQuery({ storeId });
  const [createWarehouse, { isLoading: creating }] = useCreateInventoryWarehouseMutation();
  const [deleteWarehouse] = useDeleteInventoryWarehouseMutation();
  const items = data?.data?.items ?? [];

  return (
    <Panel title="Warehouses" description="Multi-location stock, managers, and warehouse reports.">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Warehouse name"
          className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          className="h-10 w-32 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="button"
          disabled={creating}
          onClick={async () => {
            if (!name.trim()) return toast.error("Name required");
            await createWarehouse({ storeId, body: { name, code } });
            setName("");
            setCode("");
            toast.success("Warehouse created");
          }}
          className="rounded-xl bg-apple-ink px-4 py-2 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </div>
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No warehouses yet." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => (
            <div
              key={w._id}
              className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-apple-ink dark:text-zinc-100">{w.name}</div>
                  <div className="text-xs text-apple-ink-muted-48">{w.code || "No code"}</div>
                </div>
                {w.isDefault && <Badge>Default</Badge>}
              </div>
              <p className="mt-2 text-xs text-apple-ink-muted-80">{w.address || w.city || "No address"}</p>
              <p className="mt-1 text-xs text-apple-ink-muted-48">{w.managerName || "No manager"}</p>
              <button
                type="button"
                onClick={async () => {
                  await deleteWarehouse({ storeId, id: w._id });
                  toast.success("Warehouse deleted");
                }}
                className="mt-3 text-xs font-medium text-rose-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ─── Purchase Orders ────────────────────────────────────────────────────── */

export function PurchaseOrdersModule({ storeId }: { storeId: string }) {
  const { data: suppliersData } = useGetInventorySuppliersQuery({ storeId, params: { perPage: 100 } });
  const { data: productsData } = useGetInventoryQuery({ storeId, params: { perPage: 100 } });
  const { data, isLoading } = useGetInventoryPurchaseOrdersQuery({ storeId });
  const [createPo] = useCreateInventoryPurchaseOrderMutation();
  const [updatePo] = useUpdateInventoryPurchaseOrderMutation();
  const [receivePo] = useReceiveInventoryPurchaseOrderMutation();
  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const suppliers = suppliersData?.data?.items ?? [];
  const products = productsData?.data?.items ?? [];
  const items = data?.data?.items ?? [];

  return (
    <Panel title="Purchase Orders" description="Draft → Ordered → Receive stock and generate inventory entries.">
      <div className="mb-4 grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 md:grid-cols-5">
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Supplier</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 md:col-span-2"
        >
          <option value="">Product</option>
          {products.map((p) => (
            <option key={`${p.productId}-${p.variantId ?? ""}`} value={p.productId}>
              {p.name} {p.sku ? `(${p.sku})` : ""}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value) || 1)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Qty"
        />
        <input
          type="number"
          min={0}
          value={unitCost}
          onChange={(e) => setUnitCost(Number(e.target.value) || 0)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Unit cost"
        />
        <button
          type="button"
          className="rounded-xl bg-apple-ink px-4 py-2 text-xs font-semibold text-white md:col-span-5 dark:bg-zinc-100 dark:text-zinc-900"
          onClick={async () => {
            if (!supplierId || !productId) return toast.error("Supplier and product required");
            const product = products.find((p) => p.productId === productId);
            await createPo({
              storeId,
              body: {
                supplierId,
                status: "draft",
                items: [
                  {
                    productId,
                    quantity: qty,
                    unitCost,
                    name: product?.name,
                    sku: product?.sku,
                  },
                ],
              },
            }).unwrap();
            toast.success("Purchase order created");
          }}
        >
          Create Draft PO
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No purchase orders yet." />
      ) : (
        <div className="space-y-3">
          {items.map((po) => (
            <div key={po._id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-apple-ink dark:text-zinc-100">{po.poNumber}</div>
                  <div className="text-xs text-apple-ink-muted-48">
                    {nameOf(po.supplierId)} · {formatBDT(po.total ?? 0)}
                  </div>
                </div>
                <StatusBadge status={po.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {po.status === "draft" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await updatePo({ storeId, id: po._id, body: { status: "ordered" } });
                      toast.success("Marked ordered");
                    }}
                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900"
                  >
                    Mark Ordered
                  </button>
                )}
                {["ordered", "partial", "pending"].includes(po.status) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await receivePo({ storeId, id: po._id }).unwrap();
                      toast.success("Stock received");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Check className="h-3.5 w-3.5" /> Receive Stock
                  </button>
                )}
                {!["cancelled", "received"].includes(po.status) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await updatePo({ storeId, id: po._id, body: { status: "cancelled" } });
                      toast.success("Cancelled");
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ─── Batches ────────────────────────────────────────────────────────────── */

export function BatchesModule({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryBatchesQuery({ storeId, params: { perPage: 50 } });
  const items = data?.data?.items ?? [];

  return (
    <Panel title="Batch / FIFO Inventory" description="Lots never merge. Sales allocate oldest batches first.">
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No batches yet. Receive a purchase order to create batches." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-apple-ink-muted-48">
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="pb-2 font-medium">Batch</th>
                <th className="pb-2 font-medium">Lot</th>
                <th className="pb-2 font-medium">Remaining</th>
                <th className="pb-2 font-medium">Cost</th>
                <th className="pb-2 font-medium">Purchased</th>
                <th className="pb-2 font-medium">Expiry</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b._id} className="border-b border-zinc-50 dark:border-zinc-900">
                  <td className="py-3 font-medium">{b.batchNumber}</td>
                  <td className="py-3">{b.lotNumber || "—"}</td>
                  <td className="py-3">{b.remainingQuantity}</td>
                  <td className="py-3">{formatBDT(b.buyCost ?? 0)}</td>
                  <td className="py-3 text-xs">{b.purchaseDate ? new Date(b.purchaseDate).toLocaleDateString() : "—"}</td>
                  <td className="py-3 text-xs">{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "—"}</td>
                  <td className="py-3">
                    <StatusBadge status={b.status || "active"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ─── Transfers ──────────────────────────────────────────────────────────── */

export function TransfersModule({ storeId }: { storeId: string }) {
  const { data: warehousesData } = useGetInventoryWarehousesQuery({ storeId });
  const { data: productsData } = useGetInventoryQuery({ storeId, params: { perPage: 100 } });
  const { data, isLoading } = useGetInventoryTransfersQuery({ storeId });
  const [createTransfer] = useCreateInventoryTransferMutation();
  const [approveTransfer] = useApproveInventoryTransferMutation();
  const [completeTransfer] = useCompleteInventoryTransferMutation();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);

  const warehouses = warehousesData?.data?.items ?? [];
  const products = productsData?.data?.items ?? [];
  const items = data?.data?.items ?? [];

  return (
    <Panel title="Stock Transfer" description="Move inventory between warehouses with approval workflow.">
      <div className="mb-4 grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 md:grid-cols-4">
        <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
          <option value="">From warehouse</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
        <select value={toId} onChange={(e) => setToId(e.target.value)} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
          <option value="">To warehouse</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
          <option value="">Product</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value) || 1)}
            className="h-10 w-20 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="button"
            className="flex-1 rounded-xl bg-apple-ink text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            onClick={async () => {
              if (!fromId || !toId || !productId) return toast.error("Complete all fields");
              if (fromId === toId) return toast.error("Warehouses must differ");
              await createTransfer({
                storeId,
                body: { fromWarehouseId: fromId, toWarehouseId: toId, items: [{ productId, quantity: qty }] },
              }).unwrap();
              toast.success("Transfer created");
            }}
          >
            Create
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No transfers yet." />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div>
                <div className="font-semibold">{t.transferNumber || t._id.slice(-6)}</div>
                <div className="text-xs text-apple-ink-muted-48">
                  {nameOf(t.fromWarehouseId)} → {nameOf(t.toWarehouseId)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={t.status} />
                {t.status === "pending" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await approveTransfer({ storeId, id: t._id });
                      toast.success("Approved");
                    }}
                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold"
                  >
                    Approve
                  </button>
                )}
                {t.status === "approved" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await completeTransfer({ storeId, id: t._id });
                      toast.success("Completed");
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ─── Histories ──────────────────────────────────────────────────────────── */

export function PriceHistoryModule({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryPriceHistoryQuery({ storeId, params: { perPage: 50 } });
  const items = data?.data?.items ?? [];
  return (
    <Panel title="Price History" description="Selling, compare, wholesale, and discount changes over time.">
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No price changes recorded yet." />
      ) : (
        <TimelineList
          items={items.map((i) => ({
            id: i._id,
            title: `${i.field}: ${formatBDT(i.previousPrice)} → ${formatBDT(i.newPrice)}`,
            meta: `${i.reason || "update"} · ${i.createdBy || "system"}`,
            at: i.createdAt,
          }))}
        />
      )}
    </Panel>
  );
}

export function CostHistoryModule({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryCostHistoryQuery({ storeId, params: { perPage: 50 } });
  const items = data?.data?.items ?? [];
  return (
    <Panel title="Cost History" description="Purchase, average, supplier, and batch cost timeline.">
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No cost changes recorded yet." />
      ) : (
        <TimelineList
          items={items.map((i) => ({
            id: i._id,
            title: `${formatBDT(i.previousCost)} → ${formatBDT(i.newCost)}`,
            meta: i.reason || "cost update",
            at: i.createdAt,
          }))}
        />
      )}
    </Panel>
  );
}

function TimelineList({ items }: { items: Array<{ id: string; title: string; meta: string; at: string }> }) {
  return (
    <ol className="relative space-y-0 border-l border-zinc-200 pl-6 dark:border-zinc-800">
      {items.map((item) => (
        <li key={item.id} className="relative pb-6 last:pb-0">
          <span className="absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full bg-apple-ink dark:bg-zinc-200" />
          <div className="font-medium text-apple-ink dark:text-zinc-100">{item.title}</div>
          <div className="text-xs text-apple-ink-muted-48">
            {item.meta} · {new Date(item.at).toLocaleString()}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ─── Reports ────────────────────────────────────────────────────────────── */

export function ReportsModule({ storeId }: { storeId: string }) {
  const { data: valuation, isLoading: vLoading } = useGetInventoryValuationReportQuery(storeId);
  const { data: aging, isLoading: aLoading } = useGetInventoryAgingReportQuery(storeId);
  const { data: analytics } = useGetInventoryAnalyticsQuery(storeId);
  const val = valuation?.data as
    | {
        retailValue?: number;
        costValue?: number;
        units?: number;
        productCount?: number;
      }
    | undefined;
  const age = aging?.data as
    | {
        lowStock?: { count?: number };
        outOfStock?: { count?: number };
        deadStock?: { count?: number };
      }
    | undefined;

  return (
    <Panel title="Inventory Reports" description="Valuation, aging, fast/slow movers, and dead stock.">
      {vLoading || aLoading ? (
        <SkeletonRows rows={4} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Inventory Value", value: formatBDT(val?.retailValue ?? 0) },
              { label: "Cost Value", value: formatBDT(val?.costValue ?? 0) },
              { label: "Low Stock", value: String(age?.lowStock?.count ?? 0) },
              { label: "Out of Stock", value: String(age?.outOfStock?.count ?? 0) },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
              >
                <div className="text-xs font-medium text-apple-ink-muted-48">{card.label}</div>
                <div className="mt-1 text-xl font-semibold text-apple-ink dark:text-zinc-100">{card.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Top Moving</h3>
              <ul className="space-y-2 text-sm">
                {(analytics?.data?.mostSold ?? []).slice(0, 8).map((row) => (
                  <li key={row.productId} className="flex justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                    <span>{row.name}</span>
                    <span className="font-medium">{row.totalSold}</span>
                  </li>
                ))}
                {(analytics?.data?.mostSold ?? []).length === 0 && <EmptyState message="No movement data yet." />}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Dead Stock</h3>
              <ul className="space-y-2 text-sm">
                {(analytics?.data?.deadStock ?? []).slice(0, 8).map((row) => (
                  <li key={row.productId} className="flex justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                    <span>{row.name}</span>
                    <span className="font-medium">{row.stock}</span>
                  </li>
                ))}
                {(analytics?.data?.deadStock ?? []).length === 0 && <EmptyState message="No dead stock flagged." />}
              </ul>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ─── Barcode ────────────────────────────────────────────────────────────── */

export function BarcodeModule({ storeId }: { storeId: string }) {
  const [code, setCode] = useState("");
  const [productId, setProductId] = useState("");
  const [search, { data, isFetching }] = useLazySearchInventoryBarcodeQuery();
  const [generate] = useGenerateInventoryBarcodeMutation();
  const { data: inv } = useGetInventoryQuery({ storeId, params: { perPage: 50 } });
  const products = inv?.data?.items ?? [];

  const result = useMemo(() => data?.data ?? null, [data]);

  return (
    <Panel title="Barcode" description="Generate, search, and print variant barcodes.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <ScanBarcode className="h-4 w-4" /> Search / Scan
          </div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter barcode"
              className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={isFetching}
              onClick={() => {
                if (!code.trim()) return toast.error("Enter a barcode");
                search({ storeId, barcode: code.trim() });
              }}
              className="rounded-xl bg-apple-ink px-4 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </button>
          </div>
          {result != null && (
            <pre className="mt-3 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4" /> Generate
          </div>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="mb-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={async () => {
              if (!productId) return toast.error("Select a product");
              const res = await generate({ storeId, productId }).unwrap();
              const barcode = (res as { data?: { barcode?: string } })?.data?.barcode ?? (res as { barcode?: string }).barcode;
              toast.success(barcode ? `Barcode: ${barcode}` : "Barcode generated");
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Generate Barcode
          </button>
        </div>
      </div>
    </Panel>
  );
}

/* ─── Alerts ─────────────────────────────────────────────────────────────── */

export function AlertsModule({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryAlertSettingsQuery(storeId);
  const [update, { isLoading: saving }] = useUpdateInventoryAlertSettingsMutation();
  const settings = data?.data;
  const [minQty, setMinQty] = useState<string>("");
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [notifyOwner, setNotifyOwner] = useState(true);

  useEffect(() => {
    if (!settings) return;
    setMinQty(settings.lowStockMinQuantity != null ? String(settings.lowStockMinQuantity) : "");
    setEmail(settings.lowStockAlertEmail ?? "");
    setEnabled(settings.lowStockAlertEnabled ?? true);
    setNotifyOwner(settings.lowStockNotifyOwner ?? true);
  }, [settings]);

  return (
    <Panel title="Low Stock Alerts" description="Dashboard alerts, email notifications, push-ready settings.">
      {isLoading || !settings ? (
        <SkeletonRows rows={3} />
      ) : (
        <div className="max-w-lg space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Enable low stock alerts
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notifyOwner} onChange={(e) => setNotifyOwner(e.target.checked)} />
            Notify store owner
          </label>
          <div>
            <label className="text-xs font-medium text-apple-ink-muted-48">Minimum quantity</label>
            <input
              type="number"
              min={0}
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-apple-ink-muted-48">Alert email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              await update({
                storeId,
                body: {
                  lowStockAlertEnabled: enabled,
                  lowStockNotifyOwner: notifyOwner,
                  lowStockAlertEmail: email,
                  lowStockMinQuantity: minQty === "" ? null : Number(minQty),
                },
              }).unwrap();
              toast.success("Alert settings saved");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-apple-ink px-4 py-2 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            <Bell className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}
    </Panel>
  );
}

/* ─── Audit ──────────────────────────────────────────────────────────────── */

export function AuditModule({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryAuditQuery({ storeId, params: { perPage: 50 } });
  const items = data?.data?.items ?? [];
  return (
    <Panel title="Inventory Audit Log" description="Permanent trail of who changed what, when, and from where.">
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState message="No audit events yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-apple-ink-muted-48">
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="pb-2 font-medium">When</th>
                <th className="pb-2 font-medium">Who</th>
                <th className="pb-2 font-medium">Action</th>
                <th className="pb-2 font-medium">IP / Device</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-b border-zinc-50 dark:border-zinc-900">
                  <td className="py-3 text-xs">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="py-3">{row.actorName || "system"}</td>
                  <td className="py-3 font-medium">{row.action}</td>
                  <td className="py-3 text-xs text-apple-ink-muted-48">
                    {row.ipAddress || "—"} · {row.device || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
