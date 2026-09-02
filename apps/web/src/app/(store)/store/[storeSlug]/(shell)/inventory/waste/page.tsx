"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetWasteLossQuery,
  useRecordWasteLossMutation,
  useGetInventoryQuery,
  useGetInventoryWarehousesQuery,
} from "@/redux/api/inventory-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Trash2,
  Plus,
  AlertTriangle,
  TrendingDown,
  Boxes,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function WasteLossPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [page, setPage] = useState(1);
  const [reasonFilter, setReasonFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [reason, setReason] = useState("damaged");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const hasAccess = useHasPermission("inventory:read");

  const { data: wasteData, isLoading, refetch } = useGetWasteLossQuery(
    {
      storeId,
      page,
      limit: 20,
      reason: reasonFilter !== "all" ? reasonFilter : undefined,
    },
    { skip: !storeId }
  );

  const { data: productsData } = useGetInventoryQuery(
    { storeId, limit: 100 },
    { skip: !storeId || !isModalOpen }
  );

  const { data: warehousesData } = useGetInventoryWarehousesQuery(storeId, {
    skip: !storeId || !isModalOpen,
  });

  const [recordWaste, { isLoading: isSubmitting }] = useRecordWasteLossMutation();

  const records = wasteData?.data?.records ?? [];
  const summary = wasteData?.data?.summary ?? { totalUnits: 0, totalLossValue: 0 };
  const products = productsData?.data?.items ?? [];
  const warehouses = (warehousesData?.data as any)?.warehouses ?? [];

  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => p.productId === pId);
    if (prod) {
      const cost = (prod as any).trueCost || (prod as any).costPrice || (prod as any).buyPrice || prod.sellingPrice || 0;
      setUnitCost(String(cost));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !selectedProductId) {
      toast.error(isBn ? "পণ্য নির্বাচন করুন" : "Please select a product");
      return;
    }
    const qtyNum = Number(quantity);
    if (!qtyNum || qtyNum <= 0) {
      toast.error(isBn ? "সঠিক পরিমাণ লিখুন" : "Please enter a valid quantity");
      return;
    }

    try {
      await recordWaste({
        storeId,
        productId: selectedProductId,
        warehouseId: selectedWarehouseId || null,
        quantity: qtyNum,
        unitCost: unitCost ? Number(unitCost) : undefined,
        reason,
        reference,
        notes,
      }).unwrap();

      toast.success(isBn ? "অপচয় / ক্ষতি সফলভাবে সংরক্ষিত হয়েছে" : "Waste/Loss recorded successfully");
      setIsModalOpen(false);
      setSelectedProductId("");
      setQuantity("1");
      setUnitCost("");
      setNotes("");
      setReference("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || (isBn ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Failed to record waste"));
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "ইনভেন্টরি অপচয় দেখার অনুমতি আপনার নেই।" : "You do not have permission to view inventory waste."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Trash2 className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            <span>{isBn ? "ক্ষয়ক্ষতি ও অপচয় ট্র্যাকার (Waste & Loss)" : "Waste & Loss Management"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "ভাঙা, মেয়াদোত্তীর্ণ ও নষ্ট পণ্যের ক্ষতি রেকর্ড করুন এবং স্টক ও আর্থিক লোকসান সামঞ্জস্য করুন।"
              : "Track damaged, expired, spoiled, and lost stock with accurate unit cost valuation and audit logs."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "নতুন অপচয় রেকর্ড করুন" : "Record Waste / Loss"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "মোট নষ্ট ইউনিট" : "Total Waste Units"}</span>
              <Boxes className="h-4 w-4 text-zinc-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {summary.totalUnits.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "রেকর্ডকৃত সমস্ত ক্ষয়ক্ষতি ইউনিট" : "Total units lost to damage/expiry"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "মোট আর্থিক ক্ষতি" : "Total Loss Value"}</span>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ৳{summary.totalLossValue.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "প্রকৃত ক্রয় মূল্যের ভিত্তিতে মোট লোকসান" : "Total loss based on true purchase cost"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "গড় ক্ষতি / আইটেম" : "Avg Loss / Item"}</span>
              <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              ৳{summary.totalUnits > 0 ? (summary.totalLossValue / summary.totalUnits).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "প্রতি নষ্ট পণ্যের গড় ক্রয় খরচ" : "Average unit cost per lost product"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-zinc-400" />
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder={isBn ? "কারণ অনুসারে ফিল্টার" : "Filter by reason"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isBn ? "সকল কারণ" : "All Reasons"}</SelectItem>
                <SelectItem value="damaged">{isBn ? "ক্ষতিগ্রস্ত / নষ্ট" : "Damaged"}</SelectItem>
                <SelectItem value="expired">{isBn ? "মেয়াদোত্তীর্ণ" : "Expired"}</SelectItem>
                <SelectItem value="broken">{isBn ? "ভাঙা পণ্য" : "Broken"}</SelectItem>
                <SelectItem value="handling_loss">{isBn ? "হ্যান্ডলিং লস" : "Handling Loss"}</SelectItem>
                <SelectItem value="warehouse_loss">{isBn ? "ওয়্যারহাউস লস" : "Warehouse Loss"}</SelectItem>
                <SelectItem value="pos_discrepancy">{isBn ? "POS গরমিল" : "POS Discrepancy"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "তারিখ" : "Date"}</th>
                  <th className="px-4 py-3">{isBn ? "পণ্য" : "Product"}</th>
                  <th className="px-4 py-3">{isBn ? "ওয়্যারহাউস" : "Warehouse"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "পরিমাণ" : "Qty"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "একক খরচ" : "Unit Cost"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "মোট ক্ষতি" : "Total Loss"}</th>
                  <th className="px-4 py-3">{isBn ? "কারণ" : "Reason"}</th>
                  <th className="px-4 py-3">{isBn ? "রিপোর্টার" : "Reported By"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading records..."}
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <Trash2 className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো অপচয় রেকর্ড পাওয়া যায়নি" : "No waste/loss records found"}</p>
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        <div>{r.productId?.name ?? "Unknown Product"}</div>
                        {r.productId?.sku && (
                          <div className="text-[11px] text-zinc-400">SKU: {r.productId.sku}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {r.warehouseId?.name ?? "Main Facility"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-600">
                        -{r.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-600 dark:text-zinc-400">
                        ৳{r.unitCost?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                        ৳{r.totalCost?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 capitalize">
                          {r.reason?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {r.reportedBy || "system"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Record Waste Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-600" />
                <span>{isBn ? "নতুন অপচয় রেকর্ড করুন" : "Record Waste / Loss"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "পণ্য নষ্ট বা ক্ষতিগ্রস্ত হলে স্টক থেকে কমিয়ে লোকসানের আর্থিক মূল্য হিসাবভুক্ত করুন।"
                  : "Deduct lost or damaged items from active stock and calculate exact financial true cost loss."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "পণ্য নির্বাচন করুন *" : "Select Product *"}</Label>
                <Select value={selectedProductId} onValueChange={handleProductSelect} required>
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? "পণ্য বাছাই করুন..." : "Choose product..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((p) => (
                      <SelectItem key={p.productId} value={p.productId}>
                        {p.name} (Stock: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? "পরিমাণ *" : "Quantity *"}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{isBn ? "একক প্রকৃত খরচ (৳)" : "Unit True Cost (৳)"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="Auto from True Cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? "ক্ষতির কারণ *" : "Reason *"}</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">{isBn ? "ক্ষতিগ্রস্ত (Damaged)" : "Damaged"}</SelectItem>
                      <SelectItem value="expired">{isBn ? "মেয়াদোত্তীর্ণ (Expired)" : "Expired"}</SelectItem>
                      <SelectItem value="broken">{isBn ? "ভাঙা (Broken)" : "Broken"}</SelectItem>
                      <SelectItem value="handling_loss">{isBn ? "হ্যান্ডলিং লস" : "Handling Loss"}</SelectItem>
                      <SelectItem value="warehouse_loss">{isBn ? "ওয়্যারহাউস লস" : "Warehouse Loss"}</SelectItem>
                      <SelectItem value="returned_damaged">{isBn ? "রিটার্ন নষ্ট পণ্য" : "Returned Damaged"}</SelectItem>
                      <SelectItem value="pos_discrepancy">{isBn ? "POS গরমিল" : "POS Discrepancy"}</SelectItem>
                      <SelectItem value="other">{isBn ? "অন্যান্য" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>{isBn ? "ওয়্যারহাউস" : "Warehouse"}</Label>
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
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "রেফারেন্স / নোট" : "Reference & Notes"}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isBn ? "নষ্ট হওয়ার বিবরণ লিখুন..." : "Describe the damage or batch details..."}
                  rows={2}
                />
              </div>

              {Number(quantity) > 0 && Number(unitCost) > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs">
                  <span className="font-medium text-rose-800 dark:text-rose-300">
                    {isBn ? "মোট ক্ষতি হিসাব:" : "Estimated Total Loss:"}
                  </span>
                  <span className="font-bold text-rose-700 dark:text-rose-200 text-sm">
                    ৳{(Number(quantity) * Number(unitCost)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isSubmitting ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Recording...") : isBn ? "নিশ্চিত করুন" : "Confirm & Deduct Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
