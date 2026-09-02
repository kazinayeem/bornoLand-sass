"use client";

import React from "react";
import { CreditCard, Banknote, Globe, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicPaymentMethod } from "@/lib/server/checkout-data";
import type { CheckoutSettingsData } from "./checkout-types";

type CheckoutPaymentSectionProps = {
  paymentMethods: PublicPaymentMethod[];
  settings: CheckoutSettingsData | null;
  selectedPayment: string;
  onSelectPayment: (paymentId: string) => void;
  senderNumber: string;
  setSenderNumber: (val: string) => void;
  transactionId: string;
  setTransactionId: (val: string) => void;
};

export const CheckoutPaymentSection = React.memo(function CheckoutPaymentSection({
  paymentMethods,
  settings,
  selectedPayment,
  onSelectPayment,
  senderNumber,
  setSenderNumber,
  transactionId,
  setTransactionId,
}: CheckoutPaymentSectionProps) {
  const codAllowed =
    (settings as any)?.cashOnDelivery !== false &&
    (settings?.paymentSettings as any)?.codEnabled !== false;
  const bkashAllowed =
    (settings?.paymentSettings as any)?.bkash?.enabled ?? true;
  const nagadAllowed =
    (settings?.paymentSettings as any)?.nagad?.enabled ?? true;
  const sslcommerzAllowed = paymentMethods.some(
    (pm) => pm.type === "sslcommerz" && pm.enabled,
  );

  const availableMethods = [
    ...(codAllowed
      ? [
          {
            id: "cod",
            label: "Cash on Delivery (COD)",
            type: "cod",
            icon: Banknote,
            desc: "Pay in cash when you receive your package",
          },
        ]
      : []),
    ...(sslcommerzAllowed
      ? [
          {
            id: "sslcommerz",
            label: "SSLCommerz Online Payment",
            type: "sslcommerz",
            icon: Globe,
            desc: "Cards, bKash, Nagad, Rocket, Internet Banking via SSLCommerz Gateway",
          },
        ]
      : []),
    ...(bkashAllowed
      ? [
          {
            id: "bkash",
            label: "bKash Manual Send Money",
            type: "bkash",
            icon: Smartphone,
            desc: "Send money to merchant number and provide Transaction ID",
          },
        ]
      : []),
    ...(nagadAllowed
      ? [
          {
            id: "nagad",
            label: "Nagad Manual Send Money",
            type: "nagad",
            icon: Smartphone,
            desc: "Send money to merchant number and provide Transaction ID",
          },
        ]
      : []),
  ];

  const selectedMethodObj = availableMethods.find((m) => m.id === selectedPayment);
  const isMobileBanking = selectedPayment === "bkash" || selectedPayment === "nagad";
  const merchantNumber =
    (settings?.paymentSettings as any)?.[selectedPayment]?.number || "";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Payment Method</h2>
          <p className="text-xs text-zinc-500">Select how you want to pay</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {availableMethods.map((method) => {
          const isSelected = selectedPayment === method.id;
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              onClick={() => onSelectPayment(method.id)}
              className={cn(
                "relative flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all",
                isSelected
                  ? "border-zinc-900 bg-zinc-900/[0.02] shadow-sm ring-1 ring-zinc-900"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                    isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white",
                  )}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-900">{method.label}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{method.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isMobileBanking && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="text-xs font-semibold text-amber-900">
            Please send money to our official {selectedPayment.toUpperCase()} number:{" "}
            <span className="font-mono text-sm font-bold text-zinc-900">
              {merchantNumber || "Contact store for number"}
            </span>
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700">
                Your {selectedPayment.toUpperCase()} Sender Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700">
                Transaction ID (TrxID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 9J87H6TR"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm uppercase text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
