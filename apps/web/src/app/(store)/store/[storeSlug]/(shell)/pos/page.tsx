"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useLanguage } from "@/providers/language-provider";
import { PosOrderModal } from "@/components/pos/pos-order-modal";
import {
  Calculator,
  Plus,
  ShoppingCart,
  Sparkles,
  ShieldAlert,
  Receipt,
  RotateCw,
  Loader2,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHasPermission } from "@/features/session/hooks";
import { useGetRecentStoreOrdersQuery, type RecentStoreOrder } from "@/redux/api/store-order-api";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { PosReceiptDocument } from "@/components/documents/templates/pos-receipt-document";
import { cn } from "@/lib/utils";

export default function PosTerminalPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData, isLoading } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [posOpen, setPosOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<RecentStoreOrder | null>(null);
  const hasPosAccess = useHasPermission("pos:read");

  const {
    data: recentData,
    isLoading: loadingRecentOrders,
    refetch: refetchRecentOrders,
  } = useGetRecentStoreOrdersQuery(
    { storeId: store?._id || "" },
    { skip: !store?._id }
  );
  const recentOrders = recentData?.data?.orders || [];

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  if (!hasPosAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {isBn ? "অনুমতি প্রয়োজন" : "Permission Denied"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 max-w-sm">
          {isBn
            ? "আপনার অ্যাকাউন্টে এই স্টোরের POS টার্মিনাল অ্যাক্সেস করার অনুমতি নেই।"
            : "You don't have permission to access the Point of Sale terminal for this store."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Calculator className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "পয়েন্ট অব সেল (POS) টার্মিনাল" : "Point of Sale (POS) Terminal"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "দোকানের কাউন্টারে সরাসরি ক্যাশ, কার্ড বা মোবাইল ব্যাংকিংয়ের মাধ্যমে অর্ডার তৈরি ও রসিদ প্রিন্ট করুন।"
              : "In-person cashier register, rapid checkout, barcode scanning, and instant receipt generation."}
          </p>
        </div>

        <Button
          onClick={() => setPosOpen(true)}
          className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{isBn ? "নতুন POS অর্ডার তৈরি করুন" : "Open POS Register"}</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-zinc-500" />
              <span>{isBn ? "দ্রুত চেকআউট" : "Rapid Checkout"}</span>
            </CardTitle>
            <CardDescription>
              {isBn ? "বারকোড স্ক্যানিং বা নাম দিয়ে দ্রুত পণ্য খুঁজুন" : "Search products by SKU, name, or barcode"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "ভ্যারিয়েন্ট বাছাই, ডিসকাউন্ট কুপন প্রয়োগ এবং তাত্ক্ষণিক স্টক হিসেব।"
                : "Instant inventory deductions, variation selection, custom discounts, and customer lookup."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <span>{isBn ? "মাল্টিপেমেন্ট মেথড" : "Multi-Payment Support"}</span>
            </CardTitle>
            <CardDescription>
              {isBn ? "ক্যাশ, কার্ড, বিকাশ, নগদ বা রকেট" : "Cash, Card, bKash, Nagad, or Rocket"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "অন-স্পট লেনদেন নিশ্চিতকরণ এবং গ্রাহকের ফোন নম্বরে অর্ডার হিস্ট্রি সংরক্ষণ।"
                : "Full audit logs of all cashier sales synced in real-time with your store catalog and orders."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-zinc-500" />
              <span>{isBn ? "রসিদ ও প্রিন্টিং" : "POS Receipts"}</span>
            </CardTitle>
            <CardDescription>
              {isBn ? "থার্মাল প্রিন্টার সামঞ্জস্যপূর্ণ" : "Thermal printer and 80mm/58mm slip ready"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "বিক্রয় সমাপ্ত হওয়ার সাথে সাথে স্বয়ংক্রিয় চালানের প্রিন্ট ভিউ প্রদর্শিত হবে।"
                : "Instant PDF and browser thermal receipt generation for completed in-person sales."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dedicated Recent 10 Orders Section */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{isBn ? "সাম্প্রতিক ১০টি অর্ডার" : "Recent Orders (Last 10)"}</span>
            </CardTitle>
            <CardDescription>
              {isBn
                ? "দোকানের সর্বশেষ ১০টি ক্যাশিয়ার ও কাউন্টার বিক্রয়ের তালিকা এবং রসিদ।"
                : "Latest in-store sales with real-time status and one-click receipt re-printing."}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRecentOrders()}
            disabled={loadingRecentOrders}
            className="gap-1.5 h-8 text-xs font-semibold"
          >
            <RotateCw className={cn("h-3.5 w-3.5", loadingRecentOrders && "animate-spin")} />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loadingRecentOrders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 space-y-2">
              <Receipt className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-medium text-zinc-500">
                {isBn ? "কোনো সাম্প্রতিক অর্ডার পাওয়া যায়নি" : "No recent orders found"}
              </p>
              <p className="text-xs text-zinc-400">
                {isBn
                  ? "নতুন বিক্রয় শুরু করতে উপরের 'নতুন POS অর্ডার তৈরি করুন' বাটনে ক্লিক করুন।"
                  : "Click 'Open POS Register' above to start your first cashier checkout."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <User className="h-3 w-3 text-zinc-400" />
                          <span>{order.customerName}</span>
                        </div>
                        {order.customerPhone && (
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                            {order.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase">
                          <CreditCard className="h-3 w-3" />
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            order.status === "delivered" || order.status === "processing"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                              : order.status === "cancelled"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200"
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="h-7 text-xs gap-1.5 text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                          title="Print / Re-print Receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>Receipt</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* POS Register Checkout Modal */}
      {store?._id && (
        <PosOrderModal
          open={posOpen}
          storeId={store._id}
          onClose={() => setPosOpen(false)}
          onSuccess={() => {
            setPosOpen(false);
            refetchRecentOrders();
          }}
        />
      )}

      {/* POS Receipt Re-print Dialog */}
      {selectedReceiptOrder && (
        <DocumentPreviewDialog
          open={Boolean(selectedReceiptOrder)}
          onClose={() => setSelectedReceiptOrder(null)}
          title={`POS Receipt #${selectedReceiptOrder.orderNumber}`}
          defaultPageSize="thermal-80"
        >
          <PosReceiptDocument
            store={{
              name: store?.name || "Store",
              address: typeof (store as any)?.address === "string" ? (store as any).address : (store as any)?.address?.street || "",
              phone: (store as any)?.contactPhone || (store as any)?.phone || "",
              email: (store as any)?.contactEmail || (store as any)?.email || "",
              logoUrl: (store as any)?.logo,
            }}
            receipt={{
              receiptNumber: `REC-${selectedReceiptOrder.orderNumber}`,
              orderNumber: selectedReceiptOrder.orderNumber,
              dateTime: selectedReceiptOrder.createdAt ? new Date(selectedReceiptOrder.createdAt) : new Date(),
              customer: {
                name: selectedReceiptOrder.customerName,
                phone: selectedReceiptOrder.customerPhone || "",
              },
              items: [
                {
                  title: `In-Store Purchase (${selectedReceiptOrder.itemCount || 1} items)`,
                  quantity: selectedReceiptOrder.itemCount || 1,
                  unitPrice: selectedReceiptOrder.total,
                  total: selectedReceiptOrder.total,
                },
              ],
              subtotal: selectedReceiptOrder.total,
              discount: 0,
              grandTotal: selectedReceiptOrder.total,
              paymentMethod: String(selectedReceiptOrder.paymentMethod || "CASH").toUpperCase(),
            }}
          />
        </DocumentPreviewDialog>
      )}
    </div>
  );
}
