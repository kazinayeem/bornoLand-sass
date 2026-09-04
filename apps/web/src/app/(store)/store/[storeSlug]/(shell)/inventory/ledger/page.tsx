"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useGetStockMovementLedgerQuery } from "@/redux/api/inventory-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Package,
  Layers,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StockLedgerPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const [page, setPage] = useState(1);
  const [reasonFilter, setReasonFilter] = useState("all");

  const hasAccess = useHasPermission("inventory:read");

  const { data: ledgerData, isLoading, refetch } = useGetStockMovementLedgerQuery(
    {
      storeId,
      page,
      limit: 30,
      reason: reasonFilter !== "all" ? reasonFilter : undefined,
    },
    { skip: !storeId }
  );

  const logs = ledgerData?.data?.logs ?? [];
  const total = ledgerData?.data?.total ?? 0;
  const totalPages = ledgerData?.data?.totalPages ?? 1;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "স্টক মুভমেন্ট লেজার দেখার অনুমতি নেই।" : "You do not have permission to view the stock ledger."}
        </p>
      </div>
    );
  }

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "purchase":
      case "restock":
      case "transfer_in":
      case "opening_stock":
        return {
          icon: TrendingUp,
          bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          label: isBn ? "স্টক বৃদ্ধি (+)" : "Stock In (+)",
        };
      case "sale":
      case "pos_sale":
      case "order_placed":
      case "online_order":
        return {
          icon: ShoppingBag,
          bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          label: isBn ? "বিক্রয় (-)" : "Sale (-)",
        };
      case "waste":
      case "damage":
      case "expired":
      case "broken":
        return {
          icon: Trash2,
          bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800",
          label: isBn ? "অপচয় / ক্ষতি (-)" : "Waste / Damage (-)",
        };
      case "transfer_out":
      case "transfer":
        return {
          icon: ArrowLeftRight,
          bg: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800",
          label: isBn ? "ট্রান্সফার" : "Transfer",
        };
      default:
        return {
          icon: Layers,
          bg: "bg-zinc-50 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
          label: isBn ? "সমন্বয়" : "Adjustment",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <ArrowLeftRight className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "স্টক মুভমেন্ট লেজার (Stock Movement Ledger)" : "Stock Movement Ledger"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "ক্রয়, বিক্রয়, POS লেনদেন, অপচয় ও ট্রান্সফারের প্রতিটি স্টক পরিবর্তনের পূর্ণাঙ্গ অডিট হিসেব।"
              : "Complete chronological audit trail explaining every single increase, decrement, and transfer in active inventory."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </Button>
      </div>

      {/* Filter and Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-zinc-400" />
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-[200px] h-9 text-xs">
                <SelectValue placeholder={isBn ? "মুভমেন্ট টাইপ ফিল্টার" : "Filter by movement"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isBn ? "সমস্ত মুভমেন্ট" : "All Movements"}</SelectItem>
                <SelectItem value="purchase">{isBn ? "ক্রয় (Purchase/PO)" : "Purchases"}</SelectItem>
                <SelectItem value="order_placed">{isBn ? "অনলাইন অর্ডার (Sales)" : "Online Sales"}</SelectItem>
                <SelectItem value="pos_sale">{isBn ? "POS বিক্রয়" : "POS Sales"}</SelectItem>
                <SelectItem value="waste">{isBn ? "অপচয় (Waste/Loss)" : "Waste & Loss"}</SelectItem>
                <SelectItem value="damage">{isBn ? "ক্ষতিগ্রস্ত (Damage)" : "Damaged"}</SelectItem>
                <SelectItem value="transfer_in">{isBn ? "ট্রান্সফার আগমন" : "Transfer In"}</SelectItem>
                <SelectItem value="transfer_out">{isBn ? "ট্রান্সফার প্রস্থান" : "Transfer Out"}</SelectItem>
                <SelectItem value="manual_adjust">{isBn ? "ম্যানুয়াল অ্যাডজাস্টমেন্ট" : "Manual Adjustment"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-zinc-500">
            {isBn ? `মোট ${total} টি মুভমেন্ট রেকর্ড` : `${total} total movement entries`}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "তারিখ ও সময়" : "Timestamp"}</th>
                  <th className="px-4 py-3">{isBn ? "পণ্য" : "Product"}</th>
                  <th className="px-4 py-3">{isBn ? "মুভমেন্ট ধরন" : "Movement Type"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "আগের স্টক" : "Prev Stock"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "পরিবর্তন" : "Change"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "বর্তমান স্টক" : "New Stock"}</th>
                  <th className="px-4 py-3">{isBn ? "কারণ ও রেফারেন্স" : "Reason / Reference"}</th>
                  <th className="px-4 py-3">{isBn ? "অপারেটর" : "Operator"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading movement logs..."}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো স্টক মুভমেন্ট রেকর্ড নেই" : "No stock movement logs found"}</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const badge = getReasonBadge(log.reason);
                    const isPositive = log.quantityChange > 0;
                    return (
                      <tr key={log._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                          <div>{log.productId?.name ?? "Product"}</div>
                          {log.productId?.sku && (
                            <div className="text-[11px] text-zinc-400">SKU: {log.productId.sku}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${badge.bg}`}
                          >
                            <badge.icon className="h-3 w-3" />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-500">
                          {log.previousStock}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
                            {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                          {log.newStock}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                          {log.note || log.reference || log.reason?.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">
                          {log.updatedBy || log.source || "system"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {isBn ? "পূর্ববর্তী" : "Previous"}
              </Button>
              <span>
                {isBn ? `পৃষ্ঠা ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {isBn ? "পরবর্তী" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
