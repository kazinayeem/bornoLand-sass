"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Plus, Minus, Trash2, ShoppingBag, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { updateQuantity, removeFromCart, type CartItem } from "@/redux/slices/cart-slice";
import { formatCurrency } from "@/lib/format-currency";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  taxAmount: number;
  discount: number;
  total: number;
  currencyCode?: string;
  isSubmitting: boolean;
  tenantSlug?: string;
};

export const CheckoutOrderSummary = React.memo(function CheckoutOrderSummary({
  items,
  subtotal,
  deliveryCharge,
  taxAmount,
  discount,
  total,
  currencyCode = "BDT",
  isSubmitting,
  tenantSlug,
}: CheckoutOrderSummaryProps) {
  const dispatch = useDispatch();

  const handleIncrement = (item: CartItem) => {
    dispatch(
      updateQuantity({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity + 1,
      }),
    );
  };

  const handleDecrement = (item: CartItem) => {
    dispatch(
      updateQuantity({
        productId: item.productId,
        variantId: item.variantId,
        quantity: Math.max(0, item.quantity - 1),
      }),
    );
  };

  const handleRemove = (item: CartItem) => {
    dispatch(
      removeFromCart({
        productId: item.productId,
        variantId: item.variantId,
      }),
    );
  };

  const curr = (currencyCode as any) || "BDT";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-zinc-900" />
          <h2 className="text-base font-bold text-zinc-900">Order Summary</h2>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
          {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="mt-4 max-h-80 divide-y divide-zinc-100 overflow-y-auto pr-1">
        {items.map((item) => {
          const itemKey = `${item.productId}-${item.variantId ?? "default"}`;
          const resolvedImg = resolveMediaUrl(item.image) || "/logo.png";
          return (
            <div key={itemKey} className="flex items-center gap-3 py-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                <Image
                  src={resolvedImg}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                {item.variantTitle && (
                  <p className="text-xs text-zinc-500">{item.variantTitle}</p>
                )}
                <p className="text-xs font-semibold text-zinc-900">
                  {formatCurrency(item.price, curr)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/50 p-1">
                <button
                  type="button"
                  onClick={() => handleDecrement(item)}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-white hover:text-zinc-900"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-zinc-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement(item)}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-white hover:text-zinc-900"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="text-zinc-400 hover:text-rose-500"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pricing Breakdown */}
      <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span className="font-semibold text-zinc-900">
            {formatCurrency(subtotal, curr)}
          </span>
        </div>

        <div className="flex justify-between text-zinc-600">
          <span>Delivery Charge</span>
          <span className="font-semibold text-zinc-900">
            {deliveryCharge > 0 ? formatCurrency(deliveryCharge, curr) : "Calculated at next step"}
          </span>
        </div>

        {taxAmount > 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Estimated Tax / VAT</span>
            <span className="font-semibold text-zinc-900">
              {formatCurrency(taxAmount, curr)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span className="font-semibold">-{formatCurrency(discount, curr)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-extrabold text-zinc-900">
          <span>Total Payable</span>
          <span className="font-mono text-lg">{formatCurrency(total, curr)}</span>
        </div>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="submit"
        disabled={isSubmitting || items.length === 0}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Confirm & Place Order</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>256-Bit SSL Encrypted & Verified Checkout</span>
      </div>
    </div>
  );
});
