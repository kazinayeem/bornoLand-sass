"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from "lucide-react";
import type { RootState } from "@/redux/store";
import { clearCart } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, restored } = useSelector((state: RootState) => state.customer);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    notes: ""
  });

  useEffect(() => {
    if (restored && !isAuthenticated) {
      router.push("/account/login?redirect=/checkout");
    }
  }, [restored, isAuthenticated, router]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("customer_token");
    if (!token) {
      router.push("/account/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Your cart is empty");
      return;
    }

    try {
      const result = await createOrder({
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state || undefined,
          zip: form.zip || undefined
        },
        notes: form.notes || undefined
      }).unwrap();

      if (result.success && result.data) {
        dispatch(clearCart());
        setOrderSuccess({
          orderNumber: result.data.order.orderNumber,
          orderId: result.data.order._id
        });
      } else {
        setErrorMsg(result.message ?? "Checkout failed");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message ?? "Checkout failed");
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-zinc-900">Order Placed!</h1>
        <p className="mt-2 text-zinc-500">Thank you for your purchase.</p>
        <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-sm text-zinc-500">Order Number</p>
          <p className="text-lg font-bold text-zinc-900">{orderSuccess.orderNumber}</p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/orders/${orderSuccess.orderId}`}
            className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
            View Order
          </Link>
          <Link href="/"
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-zinc-200" />
        <h2 className="text-xl font-semibold text-zinc-900">Your cart is empty</h2>
        <p className="text-sm text-zinc-500">Add some items before checking out.</p>
        <Link href="/" className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-100 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-zinc-700" />
                <h2 className="font-semibold text-zinc-900">Shipping Address</h2>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Full Name *</label>
                    <input type="text" value={form.fullName} onChange={handleChange("fullName")} required
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Phone *</label>
                    <input type="tel" value={form.phone} onChange={handleChange("phone")} required
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Street Address *</label>
                  <input type="text" value={form.street} onChange={handleChange("street")} required
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">City *</label>
                    <input type="text" value={form.city} onChange={handleChange("city")} required
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">State</label>
                    <input type="text" value={form.state} onChange={handleChange("state")}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">ZIP</label>
                    <input type="text" value={form.zip} onChange={handleChange("zip")}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Order Notes</label>
                  <textarea value={form.notes} onChange={handleChange("notes")} rows={2} placeholder="Optional"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-zinc-100 p-5">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-zinc-700" />
                <h2 className="font-semibold text-zinc-900">Payment</h2>
              </div>
              <p className="text-sm text-zinc-500">Cash on Delivery</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-blue-600">Your information is secure</p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-100 p-5">
              <h2 className="mb-4 font-semibold text-zinc-900">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50">
                      <ShoppingBag className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-zinc-900">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {errorMsg && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
              )}

              <button type="submit" disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#18181b" }}>
                {isLoading ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
