"use client";

import { useGetStoreSubscriptionPaymentsQuery } from "@/redux/api/subscription-payment-api";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function PaymentHistoryTable({ storeId }: { storeId?: string }) {
  const { data: paymentsData, isLoading } = useGetStoreSubscriptionPaymentsQuery(storeId ?? "", { skip: !storeId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  const payments = paymentsData?.data?.payments ?? [];

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-apple-hairline bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-apple-ink-muted-48">No payment history found for this store.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-apple-hairline bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-apple-hairline">
        <h2 className="text-lg font-semibold text-apple-ink">Payment History</h2>
        <p className="text-sm text-apple-ink-muted-48">Review your past transactions and payments.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-apple-ink-muted-80">
          <thead className="bg-apple-canvas-parchment/50 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Gateway</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80 bg-white">
            {payments.map((payment) => (
              <tr key={payment._id} className="transition-colors hover:bg-apple-canvas-parchment/50">
                <td className="px-6 py-4 font-medium text-apple-ink">{payment.transactionId || payment._id.slice(-8)}</td>
                <td className="px-6 py-4 capitalize">{payment.paymentMethod}</td>
                <td className="px-6 py-4">{formatDate(payment.createdAt)}</td>
                <td className="px-6 py-4 font-medium text-apple-ink">
                  {payment.amount.toLocaleString()} {payment.currency}
                </td>
                <td className="px-6 py-4 text-xs text-apple-ink-muted-48 max-w-[200px] truncate" title={payment.transactionId}>
                  {payment.transactionId}
                </td>
                <td className="px-6 py-4 text-right">
                  {payment.status === "approved" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Approved</Badge>
                  ) : payment.status === "pending" ? (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
                  ) : payment.status === "rejected" ? (
                    <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                  ) : payment.status === "requested_info" ? (
                    <Badge className="bg-violet-100 text-violet-800 border-violet-200">More Info</Badge>
                  ) : (
                    <Badge className="bg-zinc-100 text-zinc-800 border-zinc-200">{payment.status}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
