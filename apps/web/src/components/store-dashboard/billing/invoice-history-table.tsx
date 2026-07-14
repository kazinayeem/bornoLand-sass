"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, Eye, Download } from "lucide-react";
import { useGetStoreInvoicesQuery, type Invoice } from "@/redux/api/billing-api";
import { formatBDT } from "@/lib/store-status";
import { Badge } from "@/components/ui/badge";
import { InvoiceDetail } from "./invoice-detail";

export function InvoiceHistoryTable({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetStoreInvoicesQuery(storeId);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const invoices = data?.data?.invoices ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
        <FileText className="mx-auto h-10 w-10 text-zinc-300" />
        <h3 className="mt-3 text-lg font-semibold text-zinc-900">No invoices yet</h3>
        <p className="mt-1 text-sm text-zinc-500">Invoices are generated after payment approval.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Duration</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoices.map((inv, idx) => {
              const planName = typeof inv.planId === "object" ? inv.planId.name : "—";
              return (
                <motion.tr
                  key={inv._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-zinc-900">{inv.invoiceNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(inv.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-900">{planName}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 capitalize">{inv.duration?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-900">{formatBDT(inv.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
