"use client";

import { useGetStoreInvoicesQuery } from "@/redux/api/billing-api";
import { Loader2, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function InvoiceHistoryTable({ storeId }: { storeId?: string }) {
  const { data: invoicesData, isLoading } = useGetStoreInvoicesQuery(storeId ?? "", { skip: !storeId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const invoices = invoicesData?.data?.invoices ?? [];

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-500">No invoices found for this store.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200/80">
        <h2 className="text-lg font-semibold text-zinc-900">Invoice History</h2>
        <p className="text-sm text-zinc-500">View and download your past invoices.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-6 py-4">Invoice Number</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80 bg-white">
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="transition-colors hover:bg-zinc-50/50">
                <td className="px-6 py-4 font-medium text-zinc-900">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4">{formatDate(invoice.createdAt)}</td>
                <td className="px-6 py-4">{invoice.planId?.name}</td>
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {invoice.total.toLocaleString()} {invoice.currency}
                </td>
                <td className="px-6 py-4">
                  {invoice.status === "paid" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                  ) : invoice.status === "pending" ? (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{invoice.status}</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
