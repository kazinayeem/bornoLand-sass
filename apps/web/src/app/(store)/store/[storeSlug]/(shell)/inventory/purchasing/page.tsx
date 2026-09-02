"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetInventoryPurchaseOrdersQuery,
  useCreateInventoryPurchaseOrderMutation,
  useReceiveInventoryPurchaseOrderMutation,
  useGetInventorySuppliersQuery,
  useGetInventoryWarehousesQuery,
  useGetInventoryQuery,
} from "@/redux/api/inventory-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Receipt,
  Plus,
  Truck,
  CheckCircle,
  PackageCheck,
  RefreshCw,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function PurchasingPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [unitCost, setUnitCost] = useState("100");
  const [notes, setNotes] = useState("");

  const hasAccess = useHasPermission("procurement:read");

  const { data: poData, isLoading, refetch } = useGetInventoryPurchaseOrdersQuery(
    { storeId, limit: 30 },
    { skip: !storeId }
  );

  const { data: suppliersData } = useGetInventorySuppliersQuery(storeId, {
    skip: !storeId || !isModalOpen,
  });
  const { data: warehousesData } = useGetInventoryWarehousesQuery(storeId, {
    skip: !storeId || !isModalOpen,
  });
  const { data: productsData } = useGetInventoryQuery(
    { storeId, limit: 100 },
    { skip: !storeId || !isModalOpen }
  );

  const [createPO, { isLoading: isCreating }] = useCreateInventoryPurchaseOrderMutation();
  const [receivePO, { isLoading: isReceiving }] = useReceiveInventoryPurchaseOrderMutation();

  const purchaseOrders = (poData?.data as any)?.purchaseOrders ?? [];
  const suppliers = (suppliersData?.data as any)?.suppliers ?? [];
  const warehouses = (warehousesData?.data as any)?.warehouses ?? [];
  const products = productsData?.data?.items ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedProductId) {
      toast.error(isBn ? "সরবরাহকারী ও পণ্য নির্বাচন করুন" : "Please select supplier and product");
      return;
    }

    try {
      await createPO({
        storeId,
        supplierId: selectedSupplierId,
        warehouseId: selectedWarehouseId || undefined,
        items: [
          {
            productId: selectedProductId,
            quantity: Number(quantity),
            unitCost: Number(unitCost),
          },
        ],
        notes,
      }).unwrap();

      toast.success(isBn ? "পারচেজ অর্ডার তৈরি হয়েছে" : "Purchase order created successfully");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create PO");
    }
  };

  const handleReceive = async (poId: string) => {
    try {
      await receivePO({
        storeId,
        id: poId,
      }).unwrap();
      toast.success(isBn ? "পণ্য স্টক গ্রহণ সম্পন্ন হয়েছে" : "Goods received and inventory updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to receive PO");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "পারচেজ অর্ডার দেখার অনুমতি নেই।" : "You do not have permission to view purchasing."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "ক্রয় ও পারচেজ অর্ডার (Purchase Orders)" : "Purchasing & Purchase Orders"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "সরবরাহকারীদের সাথে ক্রয়াদেশ তৈরি করুন, চালান গ্রহণ করুন এবং স্বয়ংক্রিয়ভাবে স্টক ও গড় খরচ আপডেট করুন।"
              : "Manage supplier purchase orders, track incoming shipments, and automate inventory receiving & average costing."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "নতুন PO তৈরি করুন" : "Create Purchase Order"}</span>
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "PO নম্বর" : "PO Number"}</th>
                  <th className="px-4 py-3">{isBn ? "সরবরাহকারী" : "Supplier"}</th>
                  <th className="px-4 py-3">{isBn ? "ওয়্যারহাউস" : "Warehouse"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "মোট মূল্য" : "Total Amount"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="px-4 py-3">{isBn ? "তারিখ" : "Date"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading purchase orders..."}
                    </td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <Receipt className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো পারচেজ অর্ডার পাওয়া যায়নি" : "No purchase orders found"}</p>
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po: any) => (
                    <tr key={po._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-white">
                        {po.poNumber || "PO-ORD"}
                      </td>
                      <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200 font-medium">
                        {typeof po.supplierId === "object" ? po.supplierId?.name : "Main Supplier"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {typeof po.warehouseId === "object" ? po.warehouseId?.name : "Main Facility"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-white">
                        ৳{po.total?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            po.status === "received"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {po.status !== "received" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReceive(po._id)}
                            disabled={isReceiving}
                            className="gap-1.5 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                            <span>{isBn ? "স্টক গ্রহণ" : "Receive Stock"}</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create PO Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন পারচেজ অর্ডার তৈরি" : "Create Purchase Order"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "সরবরাহকারীর কাছ থেকে পাইকারি পণ্য ক্রয়ের অর্ডার তৈরি করুন।"
                  : "Order inventory batches from registered suppliers."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "সরবরাহকারী *" : "Supplier *"}</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId} required>
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "সরবরাহকারী বাছাই করুন..." : "Choose supplier..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} {s.company ? `(${s.company})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "গ্রহীতা ওয়্যারহাউস" : "Destination Warehouse"}</Label>
                <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "প্রধান স্টোরেজ" : "Main Facility"} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "পণ্য নির্বাচন করুন *" : "Product *"}</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "পণ্য বাছাই করুন..." : "Choose product..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-52">
                    {products.map((p: any) => (
                      <SelectItem key={p.productId} value={p.productId}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "পরিমাণ *" : "Quantity *"}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "একক ক্রয় মূল্য (৳) *" : "Unit Buy Cost (৳) *"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "নোট" : "Notes"}</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Terms, delivery instructions..."
                />
              </div>

              {Number(quantity) > 0 && Number(unitCost) > 0 && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-md border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between text-xs">
                  <span className="font-medium text-indigo-800 dark:text-indigo-300">
                    {isBn ? "মোট PO মূল্য:" : "Total PO Estimated Value:"}
                  </span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-200 text-sm">
                    ৳{(Number(quantity) * Number(unitCost)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "তৈরি হচ্ছে..." : "Creating...") : isBn ? "PO নিশ্চিত করুন" : "Confirm PO"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
