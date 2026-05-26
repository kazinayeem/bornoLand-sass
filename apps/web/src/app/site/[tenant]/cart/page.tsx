"use client";

import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import type { RootState } from "@/redux/store";
import { updateQuantity, removeFromCart } from "@/redux/slices/cart-slice";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";

export default function CartPage() {
  const dispatch = useDispatch();
  const { theme, settings } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;
  const { items } = useSelector((state: RootState) => state.cart);
  const [updateRemote] = useUpdateCartItemMutation();
  const [removeRemote] = useRemoveFromCartMutation();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeThreshold = settings.currencyCode === "BDT" ? 5000 : 100;
  const shippingRate = settings.currencyCode === "BDT" ? 99 : 9.99;
  const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
  const taxRate = settings.taxEnabled ? (settings.taxRate ?? 0) : 0;
  const taxAmount = taxRate > 0 && !settings.taxIncluded ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + taxAmount + shipping;

  const handleQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
      removeRemote(productId);
    } else {
      dispatch(updateQuantity({ productId, quantity }));
      updateRemote({ productId, quantity });
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
    removeRemote(productId);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16" style={{ color: isDark ? "#27272a" : "#e4e4e7" }} />
        <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Your cart is empty</h2>
        <p className="text-sm" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>Looks like you haven&apos;t added anything yet.</p>
        <Link href="/"
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: primaryColor }}>
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              key={item.productId}
              className="flex gap-4 rounded-xl p-4"
              style={{
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                borderWidth: 1,
                borderStyle: "solid",
                backgroundColor: isDark ? "#18181b" : "#ffffff"
              }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-lg" style={{ backgroundColor: isDark ? "#09090b" : "#f4f4f5" }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <ShoppingBag className="h-8 w-8" style={{ color: isDark ? "#27272a" : "#d4d4d8" }} />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{item.name}</h3>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: primaryColor }}>
                      {formatCurrency(item.price, settings)}
                    </p>
                  </div>
                  <button onClick={() => handleRemove(item.productId)} className="text-zinc-300 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg p-0.5"
                    style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", borderWidth: 1, borderStyle: "solid" }}>
                    <button onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
                    {formatCurrency(item.price * item.quantity, settings)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="h-fit rounded-xl p-4"
          style={{
            borderColor: isDark ? "#27272a" : "#e4e4e7",
            borderWidth: 1,
            borderStyle: "solid",
            backgroundColor: isDark ? "#18181b" : "#ffffff"
          }}>
          <h3 className="mb-4 font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, settings)}</span>
            </div>
            <div className="flex justify-between" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatCurrency(shipping, settings)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex justify-between" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount, settings)}</span>
              </div>
            )}
            {subtotal < 100 && (
              <p className="text-xs" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>Free shipping on orders over {formatCurrency(100, settings)}</p>
            )}
            <div className="border-t pt-2" style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
              <div className="flex justify-between font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
                <span>Total</span>
                <span>{formatCurrency(total, settings)}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}>
            Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="mt-2 flex items-center justify-center gap-1 text-xs" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>
            <ArrowLeft className="h-3 w-3" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
