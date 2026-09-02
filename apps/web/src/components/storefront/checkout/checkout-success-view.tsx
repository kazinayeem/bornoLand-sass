"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";

type CheckoutSuccessViewProps = {
  orderNumber: string;
  orderId: string;
  paymentMethod: string;
};

export function CheckoutSuccessView({
  orderNumber,
  orderId,
  paymentMethod,
}: CheckoutSuccessViewProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
        Order Placed Successfully!
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {paymentMethod === "cod"
          ? "Your order has been confirmed. You will pay in cash upon receiving your package."
          : "Your payment verification is in progress. Our team will verify your payment details shortly."}
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Order Reference Number
        </p>
        <p className="mt-1 font-mono text-2xl font-extrabold text-zinc-900">
          {orderNumber}
        </p>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={`/orders/${orderId}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <span>Track Order</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
