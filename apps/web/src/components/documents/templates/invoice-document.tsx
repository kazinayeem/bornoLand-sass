import React from "react";
import type { InvoiceData, StoreIdentity } from "../document-types";
import { DocumentHeader } from "../document-header";
import { DocumentFooter } from "../document-footer";

interface InvoiceDocumentProps {
  store: StoreIdentity;
  invoice: InvoiceData;
  isBn?: boolean;
}

export function InvoiceDocument({
  store,
  invoice,
  isBn = false,
}: InvoiceDocumentProps) {
  const cust = invoice.customer;

  return (
    <div className="doc-sheet-a4-portrait">
      {/* Header */}
      <DocumentHeader
        store={store}
        title={isBn ? "চালান / ইনভয়েস" : "TAX INVOICE"}
        subtitle={invoice.orderNumber ? `Order #${invoice.orderNumber}` : undefined}
        documentNumber={invoice.invoiceNumber}
        date={invoice.issueDate}
        status={invoice.status}
      />

      {/* Bill To & Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-xs">
        {/* Bill To */}
        <div className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/60">
          <span className="font-bold text-zinc-700 uppercase tracking-wider text-[10px] block mb-1.5">
            {isBn ? "গ্রাহকের তথ্য (Billed To):" : "Invoice To / Billed To:"}
          </span>
          <p className="text-sm font-bold text-zinc-900">{cust.name}</p>
          {cust.phone && <p className="text-zinc-600 mt-0.5">Phone: {cust.phone}</p>}
          {cust.email && <p className="text-zinc-600 mt-0.5">Email: {cust.email}</p>}
          {cust.billingAddress && (
            <p className="text-zinc-600 mt-1 leading-relaxed">
              Address: {cust.billingAddress}
            </p>
          )}
        </div>

        {/* Invoice Meta */}
        <div className="border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/60 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Invoice Number:</span>
            <span className="font-mono font-bold text-zinc-900">{invoice.invoiceNumber}</span>
          </div>
          {invoice.orderNumber && (
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Order Number:</span>
              <span className="font-mono font-semibold text-zinc-800">#{invoice.orderNumber}</span>
            </div>
          )}
          {invoice.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Payment Method:</span>
              <span className="capitalize font-semibold text-zinc-800">
                {invoice.paymentMethod.replace("_", " ")}
              </span>
            </div>
          )}
          {invoice.dueDate && (
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Payment Due:</span>
              <span className="text-zinc-800">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(invoice.dueDate))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Itemized Table */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
              <th className="py-2.5 px-3 text-left w-10">#</th>
              <th className="py-2.5 px-3 text-left">Item Description</th>
              <th className="py-2.5 px-3 text-center w-16">Qty</th>
              <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
              {(invoice.discountTotal || 0) > 0 && (
                <th className="py-2.5 px-3 text-right w-20">Discount</th>
              )}
              <th className="py-2.5 px-3 text-right w-28">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50">
                <td className="py-2.5 px-3 text-zinc-400 font-mono">{idx + 1}</td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-zinc-900">{item.title}</div>
                  {item.variantTitle && (
                    <div className="text-[11px] text-zinc-500">Option: {item.variantTitle}</div>
                  )}
                  {item.sku && (
                    <div className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</div>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-medium text-zinc-800">{item.quantity}</td>
                <td className="py-2.5 px-3 text-right text-zinc-700 font-medium">
                  ৳{item.unitPrice.toLocaleString()}
                </td>
                {(invoice.discountTotal || 0) > 0 && (
                  <td className="py-2.5 px-3 text-right text-rose-600 font-medium">
                    {item.discount ? `-৳${item.discount.toLocaleString()}` : "—"}
                  </td>
                )}
                <td className="py-2.5 px-3 text-right font-bold text-zinc-900">
                  ৳{item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72 border border-zinc-200 rounded-lg p-3.5 bg-zinc-50/60 text-xs space-y-2">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal:</span>
            <span className="font-medium">৳{invoice.subtotal.toLocaleString()}</span>
          </div>

          {(invoice.discountTotal || 0) > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discounts Applied:</span>
              <span className="font-medium">-৳{(invoice.discountTotal || 0).toLocaleString()}</span>
            </div>
          )}

          {(invoice.taxTotal || 0) > 0 && (
            <div className="flex justify-between text-zinc-600">
              <span>VAT / Tax Total:</span>
              <span className="font-medium">+৳{(invoice.taxTotal || 0).toLocaleString()}</span>
            </div>
          )}

          {(invoice.shippingCharge || 0) > 0 && (
            <div className="flex justify-between text-zinc-600">
              <span>Shipping & Handling:</span>
              <span className="font-medium">+৳{(invoice.shippingCharge || 0).toLocaleString()}</span>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-black text-zinc-900">
            <span>Grand Total:</span>
            <span className="text-emerald-700 font-mono">৳{invoice.grandTotal.toLocaleString()}</span>
          </div>

          {(invoice.paidAmount || 0) > 0 && (
            <div className="flex justify-between text-zinc-600 pt-1">
              <span>Paid Amount:</span>
              <span className="font-semibold text-emerald-600">
                ৳{(invoice.paidAmount || 0).toLocaleString()}
              </span>
            </div>
          )}

          {(invoice.dueAmount || 0) > 0 && (
            <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-dashed border-zinc-200">
              <span>Amount Due:</span>
              <span className="font-mono">৳{(invoice.dueAmount || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <DocumentFooter
        notes={invoice.notes}
        terms={invoice.terms || "Goods once sold cannot be returned without original receipt. Thank you for your business."}
        showSignatures={true}
        signatureLabels={["Customer Received", "Authorized Store Signature"]}
      />
    </div>
  );
}
