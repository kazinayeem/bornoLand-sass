"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";
import type { RootState } from "@/store/store";
import { clearCart, setCartItems } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";
import { useGetCartQuery, useSyncCartMutation } from "@/redux/api/cart-api";
import { useGetPublicPaymentMethodsQuery } from "@/redux/api/payment-api";
import { useGetPublicDeliveryZonesQuery } from "@/redux/api/delivery-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { useRequireCustomerAuth } from "@/hooks/use-require-customer-auth";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { CustomerAddressBook } from "@/components/storefront/customer-address-book";
import type { CustomerAddress } from "@/redux/api/customer-api";
import {
  cartIdentityDebug,
  logCartDebug,
  summarizeCartItems,
} from "@/lib/cart-session";

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
  const pathname = usePathname() || "";
  const dispatch = useDispatch();
  const localCart = useSelector((state: RootState) => state.cart);
  const customer = useSelector((state: RootState) => state.customer.customer);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [syncCart, { isLoading: isSyncing }] = useSyncCartMutation();
  const { store, settings } = useTenant();
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

  const { showLoader, ready } = useRequireCustomerAuth("/checkout");
  const {
    data: cartData,
    isLoading: cartLoading,
    isFetching: cartFetching,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, { skip: !ready });

  const { data: pmData } = useGetPublicPaymentMethodsQuery();
  const { data: dzData } = useGetPublicDeliveryZonesQuery();

  const paymentMethods = pmData?.data?.paymentMethods ?? [];
  const deliveryZones = dzData?.data?.deliveryZones ?? [];

  const [form, setForm] = useState<CheckoutFormState>(EMPTY_FORM);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const checkoutSyncAttempted = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Authenticated checkout: backend cart is the single source of truth.
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

  const items = backendItems.length > 0 ? backendItems : ready ? [] : localCart.items;
  const cartReady = mounted && localCart.hydrated && ready && !cartLoading;
  const awaitingBackendSync =
    ready &&
    !cartLoading &&
    backendItems.length === 0 &&
    localCart.items.length > 0 &&
    (cartFetching || isSyncing);

  useEffect(() => {
    if (!ready || cartLoading || !backendCart) return;
    logCartDebug("checkout cart state", {
      cartId: backendCart._id ?? null,
      storeId: store._id || backendCart.storeId || null,
      customerId: customer?._id ?? backendCart.customerId ?? null,
      backend: summarizeCartItems(backendItems),
      frontendLocal: summarizeCartItems(localCart.items),
      ...cartIdentityDebug(),
    });
  }, [ready, cartLoading, backendCart, backendItems, localCart.items, store._id, customer?._id]);

  // If backend is empty but local still has lines, sync before allowing checkout UI.
  useEffect(() => {
    if (!ready || cartLoading || cartFetching) return;
    if (backendItems.length > 0 || localCart.items.length === 0) return;
    if (checkoutSyncAttempted.current) return;
    checkoutSyncAttempted.current = true;
    void (async () => {
      try {
        logCartDebug("checkout auto-sync local → backend", summarizeCartItems(localCart.items));
        const result = await syncCart({
          items: localCart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }).unwrap();
        const synced = (result.data?.cart?.items ?? []).map((item) => ({
          productId: String(item.productId),
          variantId: item.variantId,
          variantTitle: item.variantTitle,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }));
        dispatch(setCartItems(synced));
        await refetchCart();
      } catch (error) {
        logCartDebug("checkout auto-sync failed", { error: String(error) });
      }
    })();
  }, [
    ready,
    cartLoading,
    cartFetching,
    backendItems.length,
    localCart.items,
    syncCart,
    dispatch,
    refetchCart,
  ]);

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

  useEffect(() => {
    if (!deliveryZones.length) return;
    const city = form.city.trim().toLowerCase();
    const state = form.state.trim().toLowerCase();
    const zip = form.zip.trim().toLowerCase();
    if (!city && !state && !zip) return;

    const matched = deliveryZones.find((zone) => {
      const districts = (zone.districts ?? []).map((d) => d.toLowerCase());
      const divisions = (zone.divisions ?? []).map((d) => d.toLowerCase());
      const codes = (zone.postalCodes ?? []).map((d) => d.toLowerCase());
      if (city && districts.some((d) => d === city || city.includes(d) || d.includes(city))) return true;
      if (state && divisions.some((d) => d === state || state.includes(d) || d.includes(state))) return true;
      if (zip && codes.some((c) => c === zip)) return true;
      return false;
    });
    if (matched && matched._id !== selectedZoneId) {
      setSelectedZoneId(matched._id);
    }
  }, [form.city, form.state, form.zip, deliveryZones, selectedZoneId]);

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

  if (showLoader) {
    return <CustomerAuthLoader message="Preparing checkout…" />;
  }

  const selectedZone = deliveryZones.find((z) => z._id === selectedZoneId);
  const selectedPm = paymentMethods.find((pm) => pm._id === selectedPayment);

  const hasItems = items.length > 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const shippingEnabled = settings.shippingEnabled !== false;
  const freeShipping =
    shippingEnabled &&
    Boolean(settings.freeShippingEnabled) &&
    (settings.freeShippingMin ?? 0) > 0 &&
    subtotal >= (settings.freeShippingMin ?? 0);
  const baseDelivery = shippingEnabled ? (selectedZone?.charge ?? 0) : 0;
  const deliveryCharge = freeShipping ? 0 : baseDelivery;
  const taxRate = settings.taxEnabled ? (settings.taxRate ?? 0) : 0;
  const taxAmount = taxRate > 0 && !settings.taxIncluded ? (subtotal - discount) * (taxRate / 100) : 0;
  const total = Math.max(0, subtotal - discount + taxAmount + deliveryCharge);

  const handleChange =
    (field: keyof CheckoutFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setSelectedSavedAddressId(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!ready) return;

    // Final sync + refetch so Place Order never uses a stale empty backend cart.
    let orderItems = items;
    let cartId = backendCart?._id;

    try {
      if (orderItems.length === 0 && localCart.items.length > 0) {
        const synced = await syncCart({
          items: localCart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }).unwrap();
        orderItems = (synced.data?.cart?.items ?? []).map((item) => ({
          productId: String(item.productId),
          variantId: item.variantId,
          variantTitle: item.variantTitle,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }));
        cartId = synced.data?.cart?._id;
        dispatch(setCartItems(orderItems));
      } else if (orderItems.length > 0) {
        const latest = await refetchCart().unwrap();
        const latestItems = latest.data?.cart?.items ?? [];
        if (latestItems.length === 0) {
          const synced = await syncCart({
            items: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }).unwrap();
          orderItems = (synced.data?.cart?.items ?? []).map((item) => ({
            productId: String(item.productId),
            variantId: item.variantId,
            variantTitle: item.variantTitle,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }));
          cartId = synced.data?.cart?._id;
        } else {
          orderItems = latestItems.map((item) => ({
            productId: String(item.productId),
            variantId: item.variantId,
            variantTitle: item.variantTitle,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }));
          cartId = latest.data?.cart?._id;
        }
      }
    } catch (error: any) {
      setErrorMsg(error?.data?.message ?? "Could not synchronize your cart. Please try again.");
      return;
    }

    if (orderItems.length === 0) {
      setErrorMsg("Your cart is empty. Please add items before checking out.");
      return;
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
        paymentMethod: selectedPm?.type ?? "cod",
        deliveryZoneId: selectedZoneId || undefined,
        notes: form.notes || undefined,
        cartId,
        storeId: store._id || undefined,
        customerId: customer?._id || undefined,
        items: orderItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      };

      logCartDebug("placing order", {
        cartId: payload.cartId ?? null,
        storeId: payload.storeId ?? null,
        customerId: payload.customerId ?? null,
        ...summarizeCartItems(payload.items),
        ...cartIdentityDebug(),
      });

      const result = await createOrder(payload).unwrap();

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

  const isLoadingState = !cartReady || awaitingBackendSync;
  const showEmpty = cartReady && !awaitingBackendSync && !hasItems;

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-apple-ink">Order Placed!</h1>
        <p className="mt-2 text-apple-ink-muted-48">
          {selectedPm?.type === "cod"
            ? "Pay when you receive your order."
            : `Complete payment using ${PAYMENT_LABELS[selectedPm?.type ?? ""] ?? selectedPm?.label}.`}
        </p>
        <div className="mt-6 rounded-xl border border-zinc-100 bg-apple-canvas-parchment p-4">
          <p className="text-sm text-apple-ink-muted-48">Order Number</p>
          <p className="text-lg font-bold text-apple-ink">{orderSuccess.orderNumber}</p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/orders/${orderSuccess.orderId}`} className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90">
            View Order
          </Link>
          <Link href="/" className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment">
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
        <p className="text-sm text-apple-ink-muted-48">
          {awaitingBackendSync ? "Syncing your cart…" : "Loading your cart..."}
        </p>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag className="h-16 w-16 text-zinc-200" />
        <h2 className="text-xl font-semibold text-apple-ink">Your cart is empty</h2>
        <p className="text-sm text-apple-ink-muted-48">Add some items before checking out.</p>
        <Link href="/" className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/cart" className="flex h-8 w-8 items-center justify-center rounded-lg text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-apple-ink">Checkout</h1>
          <p className="text-sm text-apple-ink-muted-48">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <CustomerAddressBook
              mode="checkout"
              selectedAddressId={selectedSavedAddressId}
              onSelectAddress={applySavedAddress}
            />

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-zinc-100 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-apple-ink-muted-80" />
                <h2 className="font-semibold text-apple-ink">Shipping Address</h2>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Full Name *"><input type="text" value={form.fullName} onChange={handleChange("fullName")} required className={inputClass} /></Field>
                  <Field label="Phone *"><input type="tel" value={form.phone} onChange={handleChange("phone")} required className={inputClass} /></Field>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Email"><input type="email" value={form.email} onChange={handleChange("email")} className={inputClass} /></Field>
                  <Field label="Label"><select value={form.label} onChange={handleChange("label")} className={inputClass}><option value="Home">Home</option><option value="Office">Office</option><option value="Other">Other</option></select></Field>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Country *"><input type="text" value={form.country} onChange={handleChange("country")} required className={inputClass} /></Field>
                  <Field label="Division / State *"><input type="text" value={form.state} onChange={handleChange("state")} required className={inputClass} /></Field>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="District / City *"><input type="text" value={form.city} onChange={handleChange("city")} required className={inputClass} /></Field>
                  <Field label="Area"><input type="text" value={form.area} onChange={handleChange("area")} className={inputClass} /></Field>
                </div>
                <Field label="Street Address *"><input type="text" value={form.street} onChange={handleChange("street")} required className={inputClass} /></Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Apartment / Flat"><input type="text" value={form.apartment} onChange={handleChange("apartment")} className={inputClass} /></Field>
                  <Field label="Postal Code"><input type="text" value={form.zip} onChange={handleChange("zip")} className={inputClass} /></Field>
                </div>
                <Field label="Landmark"><input type="text" value={form.landmark} onChange={handleChange("landmark")} className={inputClass} /></Field>
                <Field label="Order Notes"><textarea value={form.notes} onChange={handleChange("notes")} rows={2} placeholder="Optional" className={textareaClass} /></Field>
              </div>
            </motion.div>

            {deliveryZones.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-zinc-100 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-apple-ink-muted-80" />
                  <h2 className="font-semibold text-apple-ink">Delivery Area</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {deliveryZones.map((zone) => (
                    <label key={zone._id} onClick={() => setSelectedZoneId(zone._id)} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${selectedZoneId === zone._id ? "border-zinc-900 bg-apple-canvas-parchment" : "border-zinc-100 hover:border-zinc-200"}`}>
                      <input type="radio" name="zone" checked={selectedZoneId === zone._id} onChange={() => setSelectedZoneId(zone._id)} className="sr-only" />
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${selectedZoneId === zone._id ? "bg-zinc-900 text-white" : "bg-apple-canvas-parchment text-apple-ink-muted-48"}`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-apple-ink">{zone.name}</p>
                        <p className="text-xs text-apple-ink-muted-48">{formatCurrency(zone.charge, settings)} · {zone.estimatedDays}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {paymentMethods.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-zinc-100 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-apple-ink-muted-80" />
                  <h2 className="font-semibold text-apple-ink">Payment Method</h2>
                </div>
                <div className="grid gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = PAYMENT_ICONS[pm.type] ?? CreditCard;
                    return (
                      <label key={pm._id} onClick={() => setSelectedPayment(pm._id)} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${selectedPayment === pm._id ? "border-zinc-900 bg-apple-canvas-parchment" : "border-zinc-100 hover:border-zinc-200"}`}>
                        <input type="radio" name="payment" checked={selectedPayment === pm._id} onChange={() => setSelectedPayment(pm._id)} className="sr-only" />
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedPayment === pm._id ? "bg-zinc-900 text-white" : "bg-apple-canvas-parchment text-apple-ink-muted-48"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-apple-ink">{pm.label}</p>
                          {pm.accountNumber ? <p className="text-xs text-apple-ink-muted-48">{pm.accountNumber}</p> : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {selectedPm && selectedPm.instructions ? (
                  <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2.5">
                    <p className="text-xs font-medium text-blue-700">Payment Instructions</p>
                    <p className="mt-0.5 text-xs text-blue-600">{selectedPm.instructions}</p>
                  </div>
                ) : null}
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-600">Your information is secure</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-100 p-5">
              <h2 className="mb-4 font-semibold text-apple-ink">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-apple-canvas-parchment">
                      {item.image ? <img src={item.image} alt={item.name} className="h-full w-full rounded-lg object-cover" /> : <ShoppingBag className="h-4 w-4 text-zinc-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-apple-ink">{item.name}</p>
                      <p className="text-xs text-apple-ink-muted-48">Qty: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-apple-ink">{formatCurrency(item.price * item.quantity, settings)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm">
                <div className="flex justify-between text-apple-ink-muted-48"><span>Subtotal</span><span>{formatCurrency(subtotal, settings)}</span></div>
                <div className="flex justify-between text-apple-ink-muted-48"><span>Shipping {selectedZone ? `(${selectedZone.name})` : ""}</span><span>{deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge, settings)}</span></div>
                {taxAmount > 0 ? <div className="flex justify-between text-apple-ink-muted-48"><span>Tax ({taxRate}%)</span><span>{formatCurrency(taxAmount, settings)}</span></div> : null}
                <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold text-apple-ink"><span>Grand total</span><span>{formatCurrency(total, settings)}</span></div>
              </div>
              {errorMsg ? <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" /><p className="text-sm text-red-600">{errorMsg}</p></div> : null}
              <button type="submit" disabled={isLoading || isSyncing || cartFetching} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</> : `Place Order — ${formatCurrency(total, settings)}`}
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
    <div>
      <label className="mb-1 block text-xs font-medium text-apple-ink-muted-80">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 min-h-[44px] w-full rounded-xl border border-zinc-200 bg-apple-canvas-parchment px-3 text-base text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm";
const textareaClass =
  "min-h-[88px] w-full rounded-xl border border-zinc-200 bg-apple-canvas-parchment px-3 py-3 text-base text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm";
