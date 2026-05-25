"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, CreditCard, Truck, Shield, CheckCircle, Banknote, Smartphone, Landmark, Loader2, AlertCircle } from "lucide-react";
import type { RootState } from "@/redux/store";
import { clearCart } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";
import { useGetPublicPaymentMethodsQuery } from "@/redux/api/payment-api";
import { useGetPublicDeliveryZonesQuery } from "@/redux/api/delivery-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";

const PAYMENT_ICONS: Record<string, typeof Banknote> = {
  cod: Banknote,
  bkash: Smartphone,
  nagad: Smartphone,
  rocket: Smartphone,
  bank: Landmark,
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "Bank Transfer",
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, hydrated } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, restored } = useSelector((state: RootState) => state.customer);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { settings } = useTenant();
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);

  const { data: pmData } = useGetPublicPaymentMethodsQuery();
  const { data: dzData } = useGetPublicDeliveryZonesQuery();

  const paymentMethods = pmData?.data?.paymentMethods ?? [];
  const deliveryZones = dzData?.data?.deliveryZones ?? [];

  const [form, setForm] = useState({
    fullName: "", phone: "", street: "", city: "", state: "", zip: "", notes: "",
  });
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (restored && !isAuthenticated) {
      router.push("/account/login?redirect=/checkout");
    }
  }, [restored, isAuthenticated, router]);

  useEffect(() => {
    if (deliveryZones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(deliveryZones[0]._id);
    }
  }, [deliveryZones, selectedZoneId]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPayment) {
      const cod = paymentMethods.find((pm) => pm.type === "cod");
      setSelectedPayment(cod?._id ?? paymentMethods[0]._id);
    }
  }, [paymentMethods, selectedPayment]);

  const selectedZone = deliveryZones.find((z) => z._id === selectedZoneId);
  const selectedPm = paymentMethods.find((pm) => pm._id === selectedPayment);

  const hasItems = items.length > 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = selectedZone?.charge ?? 0;
  const total = subtotal + deliveryCharge;

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

    if (!hasItems) {
      setErrorMsg("Your cart is empty. Please add items before checking out.");
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
          zip: form.zip || undefined,
        },
        paymentMethod: selectedPm?.type ?? "cod",
        deliveryZoneId: selectedZoneId || undefined,
        notes: form.notes || undefined,
      }).unwrap();

      if (result.success && result.data) {
        dispatch(clearCart());
        setOrderSuccess({
          orderNumber: result.data.order.orderNumber,
          orderId: result.data.order._id,
        });
      } else {
        setErrorMsg(result.message ?? "Checkout failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message ?? "Checkout failed. Please try again.");
    }
  };

  const isLoadingState = !mounted || !hydrated;
  const showEmpty = mounted && hydrated && !hasItems;

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-zinc-900">Order Placed!</h1>
        <p className="mt-2 text-zinc-500">
          {selectedPm?.type === "cod"
            ? "Pay when you receive your order."
            : `Complete payment using ${PAYMENT_LABELS[selectedPm?.type ?? ""] ?? selectedPm?.label}.`}
        </p>

        {selectedPm && selectedPm.type !== "cod" && selectedPm.accountNumber && (
          <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-left">
            <p className="text-xs font-medium text-zinc-500">Send payment to:</p>
            <p className="mt-1 text-lg font-bold text-zinc-900">{selectedPm.accountNumber}</p>
            {selectedPm.accountType && (
              <p className="text-xs text-zinc-400 capitalize">{selectedPm.accountType}</p>
            )}
            {selectedPm.instructions && (
              <p className="mt-2 text-xs text-zinc-500">{selectedPm.instructions}</p>
            )}
          </div>
        )}

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

  if (isLoadingState) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        <p className="text-sm text-zinc-400">Loading your cart...</p>
      </div>
    );
  }

  if (showEmpty) {
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
      <div className="mb-6 flex items-center gap-3">
        <Link href="/cart" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>
          <p className="text-sm text-zinc-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

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

            {deliveryZones.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="rounded-xl border border-zinc-100 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-zinc-700" />
                  <h2 className="font-semibold text-zinc-900">Delivery Area</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {deliveryZones.map((zone) => (
                    <label key={zone._id}
                      onClick={() => setSelectedZoneId(zone._id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                        selectedZoneId === zone._id
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-100 hover:border-zinc-200"
                      }`}>
                      <input type="radio" name="zone" checked={selectedZoneId === zone._id}
                        onChange={() => setSelectedZoneId(zone._id)} className="sr-only" />
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        selectedZoneId === zone._id ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-400"
                      }`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">{zone.name}</p>
                        <p className="text-xs text-zinc-400">{formatCurrency(zone.charge, settings)} · {zone.estimatedDays}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {paymentMethods.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-xl border border-zinc-100 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-zinc-700" />
                  <h2 className="font-semibold text-zinc-900">Payment Method</h2>
                </div>
                <div className="grid gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = PAYMENT_ICONS[pm.type] ?? CreditCard;
                    return (
                      <label key={pm._id}
                        onClick={() => setSelectedPayment(pm._id)}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                          selectedPayment === pm._id
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-100 hover:border-zinc-200"
                        }`}>
                        <input type="radio" name="payment" checked={selectedPayment === pm._id}
                          onChange={() => setSelectedPayment(pm._id)} className="sr-only" />
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          selectedPayment === pm._id ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-500"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900">{pm.label}</p>
                          {pm.accountNumber && (
                            <p className="text-xs text-zinc-400">{pm.accountNumber}</p>
                          )}
                        </div>
                        {!pm.enabled && (
                          <span className="text-[10px] font-medium text-red-400">Disabled</span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {selectedPm && selectedPm.instructions && (
                  <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2.5">
                    <p className="text-xs font-medium text-blue-700">Payment Instructions</p>
                    <p className="mt-0.5 text-xs text-blue-600">{selectedPm.instructions}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-600">Your information is secure</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-100 p-5">
              <h2 className="mb-4 font-semibold text-zinc-900">Order Summary</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-zinc-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-900">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-zinc-900">
                      {formatCurrency(item.price * item.quantity, settings)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, settings)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Delivery ({selectedZone?.name ?? "—"})</span>
                  <span>{deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge, settings)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>{formatCurrency(total, settings)}</span>
                </div>
              </div>

              {selectedPm && selectedPm.type !== "cod" && selectedPm.accountNumber && (
                <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-[11px] font-medium text-zinc-500">Send payment to:</p>
                  <p className="text-sm font-bold text-zinc-900">{selectedPm.accountNumber}</p>
                  {selectedPm.accountType && (
                    <p className="text-[11px] capitalize text-zinc-400">{selectedPm.accountType}</p>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-600">{errorMsg}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
                ) : (
                  `Place Order — ${formatCurrency(total, settings)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
