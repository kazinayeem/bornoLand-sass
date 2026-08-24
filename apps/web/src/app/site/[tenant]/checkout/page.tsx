"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Banknote,
  Smartphone,
  Landmark,
  Loader2,
  AlertCircle,
  Lock,
  Tag,
  Check,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { clearCart, setCartItems } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";
import { useGetCartQuery, useSyncCartMutation } from "@/redux/api/cart-api";
import { useGetPublicPaymentMethodsQuery } from "@/redux/api/payment-api";
import { useGetPublicDeliveryZonesQuery } from "@/redux/api/delivery-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { CustomerAddressBook } from "@/components/storefront/customer-address-book";
import type { CustomerAddress } from "@/redux/api/customer-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStorefrontTracking } from "@/hooks/use-storefront-tracking";

const PAYMENT_ICONS: Record<string, typeof Banknote> = {
  cod: Banknote,
  bkash: Smartphone,
  nagad: Smartphone,
  rocket: Smartphone,
  bank: Landmark,
};

type CheckoutFormState = {
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  area: string;
  street: string;
  apartment: string;
  zip: string;
  landmark: string;
  notes: string;
};

const EMPTY_FORM: CheckoutFormState = {
  label: "Home",
  fullName: "",
  phone: "",
  email: "",
  country: "Bangladesh",
  state: "",
  city: "",
  area: "",
  street: "",
  apartment: "",
  zip: "",
  landmark: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const localCart = useSelector((state: RootState) => state.cart);
  const customer = useSelector((state: RootState) => state.customer.customer);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [syncCart, { isLoading: isSyncing }] = useSyncCartMutation();
  const { store, settings } = useTenant();
  const { trackInitiateCheckout, trackAddPaymentInfo, trackPurchase } = useStorefrontTracking();

  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string; paymentMethod: string } | null>(null);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

  // Mobile Banking specific fields
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const {
    data: cartData,
    isLoading: cartLoading,
    isFetching: cartFetching,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, { skip: !mounted });

  const { data: pmData } = useGetPublicPaymentMethodsQuery();
  const { data: dzData } = useGetPublicDeliveryZonesQuery();

  const paymentMethods = pmData?.data?.paymentMethods ?? [];
  const dbDeliveryZones = dzData?.data?.deliveryZones ?? [];
  const settingsDeliveryZones = (settings.deliveryZones ?? []).map((z: { id?: string; _id?: string; name: string; charge: number; estimatedDays?: string }) => ({
    _id: z.id || z._id || "",
    name: z.name,
    charge: z.charge,
    estimatedDays: z.estimatedDays || "2-3 Days",
  }));

  const deliveryZones = dbDeliveryZones.length > 0 ? dbDeliveryZones : settingsDeliveryZones;

  const [form, setForm] = useState<CheckoutFormState>(EMPTY_FORM);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cod");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill form from logged-in customer profile
  useEffect(() => {
    if (customer) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || (customer as any).name || (customer as any).email || "",
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
      }));
    }
  }, [customer]);


  const backendCart = cartData?.data?.cart;
  const backendItems = (backendCart?.items ?? []).map((item) => ({
    productId: typeof item.productId === "object" ? String((item.productId as { _id?: string })._id ?? item.productId) : String(item.productId),
    variantId: item.variantId,
    variantTitle: item.variantTitle,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  const items = backendItems.length > 0 ? backendItems : localCart.items;

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

  const applySavedAddress = (address: CustomerAddress) => {
    setSelectedSavedAddressId(address._id);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      email: address.email ?? "",
      country: address.country || "Bangladesh",
      state: address.state,
      city: address.city,
      area: address.area ?? "",
      street: address.street,
      apartment: address.apartment ?? "",
      zip: address.zip ?? "",
      landmark: address.landmark ?? "",
      notes: address.orderNotes ?? "",
    });
  };

  const selectedZone = deliveryZones.find((z) => z._id === selectedZoneId);
  const selectedPm = paymentMethods.find((pm) => pm._id === selectedPayment || pm.type === selectedPayment) ?? {
    _id: selectedPayment,
    type: selectedPayment,
    label: selectedPayment.toUpperCase(),
  };

  const codAllowed = (settings as any).cashOnDelivery !== false && (settings.paymentSettings as any)?.codEnabled !== false;
  const bkashAllowed = (settings.paymentSettings as any)?.bkash?.enabled ?? true;
  const nagadAllowed = (settings.paymentSettings as any)?.nagad?.enabled ?? true;

  const availablePaymentMethods = [
    ...(codAllowed ? [{ id: "cod", label: "Cash on Delivery (COD)", type: "cod", icon: Banknote }] : []),
    ...(bkashAllowed ? [{ id: "bkash", label: "bKash Mobile Banking", type: "bkash", icon: Smartphone }] : []),
    ...(nagadAllowed ? [{ id: "nagad", label: "Nagad Mobile Banking", type: "nagad", icon: Smartphone }] : []),
  ];

  useEffect(() => {
    if (availablePaymentMethods.length > 0 && (!selectedPayment || !availablePaymentMethods.some((pm) => pm.id === selectedPayment))) {
      setSelectedPayment(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods.length, selectedPayment]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = backendCart?.discount ?? 0;
  const shippingEnabled = settings.shippingEnabled !== false;
  const freeShipping =
    shippingEnabled &&
    Boolean(settings.freeShippingEnabled) &&
    (settings.freeShippingMin ?? 0) > 0 &&
    subtotal >= (settings.freeShippingMin ?? 0);
  const baseDelivery = shippingEnabled ? (selectedZone?.charge ?? 0) : 0;
  const deliveryCharge = freeShipping ? 0 : baseDelivery;
  const taxRate = settings.taxEnabled || (settings.taxRate && settings.taxRate > 0) ? (settings.taxRate ?? 0) : 0;
  const taxAmount = taxRate > 0 && !settings.taxIncluded ? (subtotal - discount) * (taxRate / 100) : 0;
  const total = Math.max(0, subtotal - discount + taxAmount + deliveryCharge);

  useEffect(() => {
    if (items.length > 0 && total > 0) {
      trackInitiateCheckout({
        items: items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
        totalValue: total,
        numItems: items.length,
        currency: settings.currencyCode || "BDT",
      });
    }
  }, [items.length, total, settings.currencyCode, trackInitiateCheckout]);

  useEffect(() => {
    if (selectedPayment && total > 0) {
      trackAddPaymentInfo({
        paymentMethod: selectedPayment,
        totalValue: total,
        currency: settings.currencyCode || "BDT",
      });
    }
  }, [selectedPayment, total, settings.currencyCode, trackAddPaymentInfo]);

  const requireLogin = Boolean(settings.requireLoginEnabled || (settings as any).requireLogin) && !customer;

  const handleChange =
    (field: keyof CheckoutFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setSelectedSavedAddressId(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (requireLogin) {
      toast.error("Please login to complete your order.");
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Your cart is empty. Please add items before checking out.");
      return;
    }

    const minOrder = Number((settings as any).minimumOrderAmount ?? (settings as any).minOrderAmount ?? 0);
    if (minOrder > 0 && subtotal < minOrder) {
      setErrorMsg(`Minimum order amount for this store is ${formatCurrency(minOrder, settings)}.`);
      return;
    }

    const payType = (selectedPm?.type || selectedPayment || "cod").toLowerCase();


    if (payType === "bkash" || payType === "nagad") {
      if (!senderNumber.trim()) {
        setErrorMsg(`Please enter your ${payType.toUpperCase()} sender phone number.`);
        return;
      }
      if (!transactionId.trim()) {
        setErrorMsg(`Please enter your ${payType.toUpperCase()} Transaction ID (TrxID).`);
        return;
      }
    }

    try {
      const payload = {
        shippingAddress: {
          label: form.label,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          country: form.country || undefined,
          state: form.state || undefined,
          city: form.city,
          area: form.area || undefined,
          street: form.street,
          apartment: form.apartment || undefined,
          zip: form.zip || undefined,
          landmark: form.landmark || undefined,
          orderNotes: form.notes || undefined,
        },
        paymentMethod: payType,
        deliveryZoneId: selectedZoneId || undefined,
        notes: form.notes || undefined,
        cartId: backendCart?._id,
        storeId: store._id || undefined,
        customerId: customer?._id || undefined,
        senderNumber: senderNumber.trim() || undefined,
        transactionId: transactionId.trim() || undefined,
        paymentDetails: {
          senderNumber: senderNumber.trim() || undefined,
          transactionId: transactionId.trim() || undefined,
          receiverNumber: (settings.paymentSettings as any)?.[payType]?.number || "",
        },
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      };

      const result = await createOrder(payload).unwrap();

      if (result.success && result.data) {
        trackPurchase({
          orderId: result.data.order._id,
          items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalValue: result.data.order.total ?? total,
          currency: settings.currencyCode || "BDT",
        });

        dispatch(clearCart());
        setOrderSuccess({
          orderNumber: result.data.order.orderNumber,
          orderId: result.data.order._id,
          paymentMethod: payType,
        });
      } else {
        setErrorMsg(result.message ?? "Checkout failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message ?? "Checkout failed. Please try again.");
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
        >
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-apple-ink">Order Placed Successfully!</h1>
        <p className="mt-2 text-apple-ink-muted-48 text-sm">
          {orderSuccess.paymentMethod === "cod"
            ? "Pay when you receive your package."
            : "Your payment verification is pending. Our shop manager will review your Transaction ID."}
        </p>
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 space-y-1">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Order Reference Number</p>
          <p className="text-xl font-mono font-extrabold text-apple-primary">{orderSuccess.orderNumber}</p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/orders/${orderSuccess.orderId}`} className="rounded-xl bg-apple-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            View Order Details
          </Link>
          <Link href="/" className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-apple-ink hover:bg-zinc-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-zinc-300" />
        <h2 className="text-xl font-bold text-apple-ink">Your cart is empty</h2>
        <p className="text-xs text-zinc-500 max-w-sm">Please add products to your cart before proceeding to checkout.</p>
        <Link href="/" className="flex items-center gap-2 rounded-xl bg-apple-primary px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cart" className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-apple-ink">Checkout</h1>
            <p className="text-xs text-zinc-500">{items.length} item(s) in your order</p>
          </div>
        </div>

        {customer ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" /> Logged in as {customer.email}
          </span>
        ) : settings.requireLoginEnabled ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
            <Lock className="h-3.5 w-3.5" /> Login Required
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700">
            Guest Checkout Enabled
          </span>
        )}
      </div>

      {/* Require Login Warning Card */}
      {requireLogin && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Login Required for Checkout</h4>
              <p className="text-xs text-amber-800">This store requires customer login before completing purchases.</p>
            </div>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent("/checkout")}`}
            className="rounded-xl bg-amber-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 whitespace-nowrap"
          >
            Login to Continue
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main Form (3 cols) */}
          <div className="space-y-6 lg:col-span-3">
            {/* Customer Saved Address Book */}
            {customer && (
              <CustomerAddressBook
                mode="checkout"
                selectedAddressId={selectedSavedAddressId}
                onSelectAddress={applySavedAddress}
              />
            )}

            {/* Step 1: Customer & Shipping Address */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Truck className="h-5 w-5 text-apple-primary" />
                <h2 className="font-bold text-apple-ink text-sm">1. Customer & Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full Name *">
                  <input type="text" value={form.fullName} onChange={handleChange("fullName")} required className={inputClass} placeholder="Your full name" />
                </Field>
                <Field label="Phone Number *">
                  <input type="tel" value={form.phone} onChange={handleChange("phone")} required className={inputClass} placeholder="017XXXXXXXX" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Email Address">
                  <input type="email" value={form.email} onChange={handleChange("email")} className={inputClass} placeholder="email@example.com (optional)" />
                </Field>
                <Field label="Address Label">
                  <select value={form.label} onChange={handleChange("label")} className={inputClass}>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Country *">
                  <input type="text" value={form.country} onChange={handleChange("country")} required className={inputClass} />
                </Field>
                <Field label="Division / State *">
                  <input type="text" value={form.state} onChange={handleChange("state")} required className={inputClass} placeholder="e.g. Dhaka Division" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="District / City *">
                  <input type="text" value={form.city} onChange={handleChange("city")} required className={inputClass} placeholder="e.g. Dhaka" />
                </Field>
                <Field label="Thana / Area">
                  <input type="text" value={form.area} onChange={handleChange("area")} className={inputClass} placeholder="e.g. Mirpur" />
                </Field>
              </div>

              <Field label="Street Address *">
                <input type="text" value={form.street} onChange={handleChange("street")} required className={inputClass} placeholder="House, Road, Block number" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Apartment / Suite">
                  <input type="text" value={form.apartment} onChange={handleChange("apartment")} className={inputClass} placeholder="Flat 4B" />
                </Field>
                <Field label="Postal Code">
                  <input type="text" value={form.zip} onChange={handleChange("zip")} className={inputClass} placeholder="1216" />
                </Field>
              </div>

              <Field label="Special Delivery Instructions / Notes">
                <textarea value={form.notes} onChange={handleChange("notes")} rows={2} placeholder="Optional instructions for courier delivery" className={textareaClass} />
              </Field>
            </motion.div>

            {/* Step 2: Delivery Area & Zones */}
            {deliveryZones.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Truck className="h-5 w-5 text-apple-primary" />
                  <h2 className="font-bold text-apple-ink text-sm">2. Delivery Method & Zone</h2>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {deliveryZones.map((zone) => (
                    <label
                      key={zone._id}
                      onClick={() => setSelectedZoneId(zone._id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                        selectedZoneId === zone._id ? "border-apple-primary bg-apple-primary/5 shadow-xs" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <input type="radio" name="zone" checked={selectedZoneId === zone._id} onChange={() => setSelectedZoneId(zone._id)} className="sr-only" />
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold", selectedZoneId === zone._id ? "bg-apple-primary text-white" : "bg-zinc-100 text-zinc-500")}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-apple-ink">{zone.name}</p>
                        <p className="text-[11px] text-zinc-500">{formatCurrency(zone.charge, settings)} • {zone.estimatedDays}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment Method & Mobile Banking Fields */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <CreditCard className="h-5 w-5 text-apple-primary" />
                <h2 className="font-bold text-apple-ink text-sm">3. Payment Method</h2>
              </div>

              <div className="grid gap-2.5">
                {availablePaymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const active = selectedPayment === pm.id;

                  return (
                    <label
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                        active ? "border-apple-primary bg-apple-primary/5 shadow-xs" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <input type="radio" name="payment" checked={active} onChange={() => setSelectedPayment(pm.id)} className="sr-only" />
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold", active ? "bg-apple-primary text-white" : "bg-zinc-100 text-zinc-500")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-apple-ink">{pm.label}</p>
                        {pm.id === "cod" && <p className="text-[11px] text-zinc-500">Pay cash upon product delivery</p>}
                        {(pm.id === "bkash" || pm.id === "nagad") && (
                          <p className="text-[11px] text-zinc-500">Send money & provide Transaction ID</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* bKash / Nagad Payment Instructions & Verification Form */}
              {(selectedPayment === "bkash" || selectedPayment === "nagad") && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span>{selectedPayment.toUpperCase()} Payment Instructions</span>
                  </div>

                  <p className="text-xs text-blue-800">
                    Send <strong>{formatCurrency(total, settings)}</strong> to the shop's {selectedPayment.toUpperCase()} number below:
                  </p>

                  <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-blue-200">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Shop {selectedPayment.toUpperCase()} Number</p>
                      <p className="text-sm font-mono font-extrabold text-blue-900">
                        {(settings.paymentSettings as any)?.[selectedPayment]?.number || "01711000000"}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800 uppercase">
                      {(settings.paymentSettings as any)?.[selectedPayment]?.type || "Personal"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Field label="Your Sender Mobile Number *">
                      <input
                        type="tel"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Transaction ID (TrxID) *">
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="e.g. ABC123XYZ"
                        className={cn(inputClass, "font-mono uppercase font-bold")}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Summary Panel (2 cols) */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
              <h2 className="font-bold text-apple-ink text-sm border-b border-zinc-100 pb-3">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-zinc-100">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 pt-2 first:pt-0">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <ShoppingBag className="h-4 w-4 text-zinc-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-apple-ink">{item.name}</p>
                      {item.variantTitle && <p className="text-[10px] text-zinc-400">{item.variantTitle}</p>}
                      <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-apple-ink">{formatCurrency(item.price * item.quantity, settings)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, settings)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount, settings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-500">
                  <span>Shipping {selectedZone ? `(${selectedZone.name})` : ""}</span>
                  <span>{deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge, settings)}</span>
                </div>

                {taxAmount > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax ({taxRate}%)</span>
                    <span>{formatCurrency(taxAmount, settings)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-extrabold text-apple-ink">
                  <span>Grand Total</span>
                  <span className="text-apple-primary">{formatCurrency(total, settings)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isSyncing || cartFetching || requireLogin}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-apple-primary py-3 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing Order…</> : `Place Order • ${formatCurrency(total, settings)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-apple-ink placeholder:text-zinc-400 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/20";
const textareaClass =
  "min-h-[70px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-apple-ink placeholder:text-zinc-400 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/20";
