import React from "react";
import type { PosReceiptData, StoreIdentity } from "../document-types";
import { DocumentHeader } from "../document-header";
import { DocumentFooter } from "../document-footer";

interface PosReceiptDocumentProps {
  store: StoreIdentity;
  receipt: PosReceiptData;
  is58mm?: boolean;
}

export function PosReceiptDocument({
  store,
  receipt,
  is58mm = false,
}: PosReceiptDocumentProps) {
  return (
    <div className={is58mm ? "doc-sheet-thermal-58" : "doc-sheet-thermal-80"}>
      {/* Header */}
      <DocumentHeader
        store={store}
        title="POS RECEIPT"
        documentNumber={receipt.receiptNumber}
        date={receipt.dateTime}
        isThermal={true}
      />

      {/* Cashier & Customer Info */}
      <div className="text-[10px] text-zinc-700 pb-1 mb-1 border-b border-dashed border-zinc-400 space-y-0.5">
        {receipt.cashierName && (
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span className="font-semibold">{receipt.cashierName}</span>
          </div>
        )}
        {receipt.registerOrCounter && (
          <div className="flex justify-between">
            <span>Counter:</span>
            <span>{receipt.registerOrCounter}</span>
          </div>
        )}
        {receipt.customer?.name && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{receipt.customer.name}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="pb-1 mb-1 border-b border-dashed border-zinc-400">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-zinc-400 text-left">
              <th className="pb-1 font-bold">Item</th>
              <th className="pb-1 text-center w-8">Qty</th>
              <th className="pb-1 text-right w-14">Price</th>
              <th className="pb-1 text-right w-16">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, idx) => (
              <tr key={idx} className="border-b border-dotted border-zinc-200">
                <td className="py-1">
                  <div className="font-semibold">{item.title}</div>
                  {item.discount ? (
                    <div className="text-[9px] text-zinc-500">Disc: -৳{item.discount}</div>
                  ) : null}
                </td>
                <td className="py-1 text-center align-top font-medium">{item.quantity}</td>
                <td className="py-1 text-right align-top">৳{item.unitPrice}</td>
                <td className="py-1 text-right align-top font-bold">৳{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Calculation */}
      <div className="text-[11px] space-y-0.5 pb-1 mb-1 border-b border-dashed border-zinc-400">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>৳{receipt.subtotal.toLocaleString()}</span>
        </div>
        {(receipt.discount || 0) > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-৳{(receipt.discount || 0).toLocaleString()}</span>
          </div>
        )}
        {(receipt.tax || 0) > 0 && (
          <div className="flex justify-between">
            <span>Tax/VAT:</span>
            <span>+৳{(receipt.tax || 0).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] font-black pt-1 border-t border-dotted border-zinc-400">
          <span>TOTAL:</span>
          <span className="font-mono">৳{receipt.grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="text-[10px] space-y-0.5 pb-1 mb-1">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="font-semibold uppercase">{receipt.paymentMethod}</span>
        </div>
        {(receipt.tenderedAmount || 0) > 0 && (
          <div className="flex justify-between">
            <span>Cash Tendered:</span>
            <span>৳{(receipt.tenderedAmount || 0).toLocaleString()}</span>
          </div>
        )}
        {typeof receipt.changeAmount === "number" && (
          <div className="flex justify-between font-bold">
            <span>Change Returned:</span>
            <span>৳{receipt.changeAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <DocumentFooter notes={receipt.notes} isThermal={true} />
    </div>
  );
}
