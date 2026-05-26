"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Percent, Truck, Shield } from "lucide-react";
import type { RootState } from "@/redux/store";
import { closeCart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, selectCartSubtotal, selectCartDiscount, selectCartTax, selectCartTotal, selectCartCount } from "@/redux/slices/cart-slice";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { toast } from "sonner";

type CartDrawerProps = {
  primaryColor: string;
};

export function CartDrawer({ primaryColor }: CartDrawerProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { settings } = useTenant();
  const cart = useSelector((state: RootState) => state.cart);
  const { items, isOpen, coupon } = cart;
  const [updateRemote] = useUpdateCartItemMutation();
  const [removeRemote] = useRemoveFromCartMutation();
  const [couponInput, setCouponInput] = useState("");

  const subtotal = selectCartSubtotal(cart);
  const discount = selectCartDiscount(cart);
  const tax = selectCartTax(cart);
  const total = selectCartTotal(cart);
  const itemCount = selectCartCount(cart);

  const handleQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
      removeRemote(productId);
    } else {
      dispatch(updateQuantity({ productId, quantity, variant }));
      updateRemote({ productId, quantity });
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
    removeRemote(productId);
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const mockCoupon: Record<string, { type: "percentage" | "fixed"; value: number; minAmount?: number }> = {
      WELCOME10: { type: "percentage", value: 10, minAmount: 0 },
      SAVE50: { type: "fixed", value: 50, minAmount: 200 },
      FREESHIP: { type: "percentage", value: 0, minAmount: 0 },
    };
    const found = mockCoupon[code];
    if (found) {
      dispatch(applyCoupon({ code, ...found }));
      toast.success(`Coupon "${code}" applied!`);
    } else {
      toast.error("Invalid coupon code");
    }
    setCouponInput("");
  };

  const handleCheckout = () => {
    dispatch(closeCart());
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => dispatch(closeCart())} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" style={{ color: primaryColor }} />
                <span className="font-semibold text-zinc-900">Cart ({itemCount})</span>
              </div>
              <button onClick={() => dispatch(closeCart())} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
                <ShoppingBag className="h-12 w-12 text-zinc-200" />
                <p className="text-sm text-zinc-400">Your cart is empty</p>
                <button onClick={() => { dispatch(closeCart()); router.push("/shop"); }}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.productId + (item.variant ?? "")} className="flex gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-zinc-200">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-6 w-6" style={{ color: `${primaryColor}30` }} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                            {item.variant && <p className="text-[10px] text-zinc-400">{item.variant}</p>}
                          </div>
                          <button onClick={() => handleRemove(item.productId)} className="shrink-0 text-zinc-300 hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                          {formatCurrency(item.price * item.quantity, settings)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQuantity(item.productId, item.quantity - 1, item.variant)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-zinc-700">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item.productId, item.quantity + 1, item.variant)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-2">
                    <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                      className="h-9 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none" />
                    <button onClick={handleApplyCoupon}
                      className="h-9 rounded-xl bg-zinc-900 px-4 text-xs font-medium text-white hover:opacity-90">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-zinc-900">{formatCurrency(subtotal, settings)}</span>
                  </div>
                  {coupon && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Percent className="h-3 w-3" /> {coupon.code}
                      </span>
                      <span className="font-medium text-emerald-600">-{formatCurrency(discount, settings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="font-medium text-zinc-900">{cart.shippingCost > 0 ? formatCurrency(cart.shippingCost, settings) : "Free"}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Tax</span>
                      <span className="font-medium text-zinc-900">{formatCurrency(tax, settings)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-zinc-200 pt-2">
                    <span className="text-sm font-semibold text-zinc-900">Total</span>
                    <span className="text-lg font-bold text-zinc-900">{formatCurrency(total, settings)}</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={handleCheckout}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}>
                      Checkout <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Free shipping</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
