"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useLanguage } from "@/providers/language-provider";
import { PosOrderModal } from "@/components/pos/pos-order-modal";
import {
  Calculator,
  Plus,
  ShoppingCart,
  Receipt,
  RotateCw,
  Loader2,
  Calendar,
  CreditCard,
  User,
  DollarSign,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { StorePageCard } from "@/components/store-dashboard/store-page";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { useHasPermission } from "@/features/session/hooks";
import { useGetRecentStoreOrdersQuery, type RecentStoreOrder } from "@/redux/api/store-order-api";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { PosReceiptDocument } from "@/components/documents/templates/pos-receipt-document";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export default function PosTerminalPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData, isLoading } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const { language } = useLanguage();
  const isBn = false;

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

  const summary = useMemo(() => {
    const totalVolume = recentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const count = recentOrders.length;
    const avg = count > 0 ? Math.round(totalVolume / count) : 0;
    return { totalVolume, count, avg };
  }, [recentOrders]);

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#003399]" />
      </div>
    );
  }

  if (!hasPosAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50">
          <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {isBn ? "অনুমতি প্রয়োজন" : "Permission Denied"}
        </h2>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          {isBn
            ? "আপনার অ্যাকাউন্টে এই স্টোরের POS টার্মিনাল অ্যাক্সেস করার অনুমতি নেই।"
            : "You don't have permission to access the Point of Sale terminal for this store."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Point of Sale (POS) Terminal"
        description="In-person cashier register, rapid barcode/SKU checkout, multi-payment support, and instant thermal receipt printing."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Sales" },
          { label: "POS Terminal" },
        ]}
        actions={
          <Button
            onClick={() => setPosOpen(true)}
            className="gap-2 bg-[#003399] text-white hover:bg-[#002B80] shadow-2xs font-bold text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Open POS Register</span>
          </Button>
        }
      />

      {/* ── KPI Metric Summary ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Recent In-Store Sales (BDT)"
          value={`৳${summary.totalVolume.toLocaleString()}`}
          subtitle="Last 10 counter transactions"
          icon={DollarSign}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />

        <MetricCard
          title="Counter Transactions"
          value={summary.count}
          subtitle="Recorded in recent queue"
          icon={Receipt}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Average Counter Ticket"
          value={`৳${summary.avg.toLocaleString()}`}
          subtitle="Per in-person order"
          icon={TrendingUp}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* ── Recent POS Orders Table ───────────────────────────── */}
      <StorePageCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#003399] dark:text-[#FFDA1A]" />
              <span>Recent Cashier Orders</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live in-store sales log with one-click thermal receipt re-printing.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRecentOrders()}
            disabled={loadingRecentOrders}
            className="gap-1.5 h-8 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <RotateCw className={cn("h-3.5 w-3.5", loadingRecentOrders && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="mt-4">
          {loadingRecentOrders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
            </div>
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No recent POS orders"
              description="Transactions completed in the POS register will appear here immediately."
              action={
                <Button
                  onClick={() => setPosOpen(true)}
                  size="sm"
                  className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Open POS Register
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
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
                        <Badge
                          variant={
                            order.status === "delivered" || order.status === "processing"
                              ? "success"
                              : order.status === "cancelled"
                              ? "danger"
                              : "primary"
                          }
                        >
                          {order.status}
                        </Badge>
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
                          className="h-7 text-xs gap-1.5 text-zinc-600 hover:text-[#003399] dark:text-zinc-300 dark:hover:text-[#FFDA1A] cursor-pointer"
                          title="Print / Re-print Receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>Print Slip</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StorePageCard>

      {/* POS Order Modal */}
      {posOpen && store?._id && (
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

      {/* POS Receipt Re-print Preview Dialog */}
      {selectedReceiptOrder && store && (
        <DocumentPreviewDialog
          open={Boolean(selectedReceiptOrder)}
          onOpenChange={(open) => !open && setSelectedReceiptOrder(null)}
          title={`Receipt #${selectedReceiptOrder.orderNumber}`}
          initialPageFormat="pos_80mm"
          availablePageFormats={["pos_80mm", "pos_58mm", "a4"]}
          renderDocument={({ pageFormat }) => {
            const receiptData: PosReceiptData = {
              orderNumber: selectedReceiptOrder.orderNumber,
              createdAt: selectedReceiptOrder.createdAt,
              customerName: selectedReceiptOrder.customerName,
              customerPhone: selectedReceiptOrder.customerPhone,
              cashierName: "Cashier Station",
              registerName: "Main Counter POS",
              items: selectedReceiptOrder.items.map((i) => ({
                name: i.name,
                variantTitle: i.variantTitle,
                sku: i.sku,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
              })),
              subtotal: selectedReceiptOrder.subtotal,
              discount: selectedReceiptOrder.discount,
              deliveryCharge: selectedReceiptOrder.deliveryCharge,
              total: selectedReceiptOrder.total,
              paidAmount: selectedReceiptOrder.paidAmount,
              changeAmount: selectedReceiptOrder.changeAmount,
              paymentMethod: selectedReceiptOrder.paymentMethod,
              paymentStatus: selectedReceiptOrder.paymentStatus,
              status: selectedReceiptOrder.status,
              notes: selectedReceiptOrder.notes,
            };

            return (
              <PosReceiptDocument
                data={receiptData}
                store={store}
                pageFormat={pageFormat}
              />
            );
          }}
        />
      )}
    </div>
  );
}
