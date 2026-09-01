"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, AlertCircle } from "lucide-react";
import type { RootState } from "@/store/store";
import { clearCart } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";
import { useStorefrontTracking } from "@/hooks/use-storefront-tracking";
import { toast } from "sonner";
import {
  CheckoutAddressSection,
} from "./checkout-address-section";
import {
  CheckoutDeliverySection,
} from "./checkout-delivery-section";
import {
  CheckoutPaymentSection,
} from "./checkout-payment-section";
import {
  CheckoutOrderSummary,
} from "./checkout-order-summary";
import {
  CheckoutSuccessView,
} from "./checkout-success-view";
import {
  type CheckoutInitialProps,
  type CheckoutFormState,
  EMPTY_FORM,
} from "./checkout-types";

export function CheckoutForm({
  initialPaymentMethods,
  initialDeliveryZones,
  store,
  settings,
  tenantSlug,
}: CheckoutInitialProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const customer = useSelector((state: RootState) => state.customer.customer);
  const [createOrder, { isLoading: isSubmittingOrder }] = useCreateOrderMutation();
  const { trackInitiateCheckout, trackAddPaymentInfo, trackPurchase } = useStorefrontTracking();

  // Interactive Form State
  const [form, setForm] = useState<CheckoutFormState>(EMPTY_FORM);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    initialDeliveryZones[0]?._id ?? "",
  );
  const [selectedPayment, setSelectedPayment] = useState<string>(() => {
    const cod = initialPaymentMethods.find((pm) => pm.type === "cod");
    return cod?._id ?? initialPaymentMethods[0]?._id ?? "cod";
  });

  // Mobile banking state
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Order submission result state
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    orderId: string;
    paymentMethod: string;
  } | null>(null);

  const items = cart.items;

  // Auto-match delivery zone when district changes
  const handleDistrictChanged = useCallback(
    (distId: string) => {
      if (!distId || initialDeliveryZones.length === 0) return;
      const isDhaka = distId.toLowerCase() === "dhaka";
      const matched = initialDeliveryZones.find((z) => {
        const name = z.name.toLowerCase();
        return isDhaka
          ? name.includes("inside") || name.includes("dhaka")
          : name.includes("outside") || !name.includes("dhaka");
      });
      if (matched) {
        setSelectedZoneId(matched._id);
      }
    },
    [initialDeliveryZones],
  );

  // Financial Calculations
  const selectedZone = useMemo(
    () => initialDeliveryZones.find((z) => z._id === selectedZoneId),
    [initialDeliveryZones, selectedZoneId],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const deliveryCharge = Number(selectedZone?.charge ?? 0);
  const discount = 0;
  const taxRate = Number(settings?.taxRate ?? 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal - discount + deliveryCharge + taxAmount);
  const currencyCode = settings?.currencyCode || "BDT";

  // Track initiate checkout once
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        items: items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalValue: total,
        currency: currencyCode,
      });
    }
  }, []);

  // Empty Cart State
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
          Your Cart is Empty
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Explore Products</span>
        </Link>
      </div>
    );
  }

  // Order Placement Success View
  if (orderSuccess) {
    return (
      <CheckoutSuccessView
        orderNumber={orderSuccess.orderNumber}
        orderId={orderSuccess.orderId}
        paymentMethod={orderSuccess.paymentMethod}
      />
    );
  }

  // Order Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    if (settings?.requireLoginEnabled && !customer) {
      toast.error("Please log in to complete your order.");
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }

    if (!form.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter your mobile phone number.");
      return;
    }
    if (!form.divisionName && !form.state) {
      toast.error("Please select your division.");
      return;
    }
    if (!form.districtName && !form.city) {
      toast.error("Please select your district / zila.");
      return;
    }
    if (!form.street.trim()) {
      toast.error("Please enter your delivery street address.");
      return;
    }

    const matchedPm = initialPaymentMethods.find(
      (pm) => pm._id === selectedPayment || pm.type === selectedPayment,
    );
    const payType = matchedPm?.type || selectedPayment || "cod";

    if (payType === "bkash" || payType === "nagad") {
      if (!senderNumber.trim()) {
        toast.error(`Please enter your ${payType.toUpperCase()} sender number.`);
        return;
      }
      if (!transactionId.trim()) {
        toast.error(`Please enter the ${payType.toUpperCase()} Transaction ID.`);
        return;
      }
    }

    try {
      trackAddPaymentInfo({
        paymentMethod: payType,
        totalValue: total,
        currency: currencyCode,
      });

      const payload: any = {
        storeId: store?._id,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          variantTitle: i.variantTitle || undefined,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          label: form.label,
          country: form.country || "Bangladesh",
          countryCode: form.countryCode || "BD",
          division: form.divisionName || form.state,
          divisionId: form.divisionId || undefined,
          divisionName: form.divisionName || undefined,
          divisionNameBn: form.divisionNameBn || undefined,
          district: form.districtName || form.city,
          districtId: form.districtId || undefined,
          districtName: form.districtName || undefined,
          districtNameBn: form.districtNameBn || undefined,
          upazila: form.upazilaName || form.area || undefined,
          upazilaId: form.upazilaId || undefined,
          upazilaName: form.upazilaName || undefined,
          upazilaNameBn: form.upazilaNameBn || undefined,
          union: form.unionName || undefined,
          unionId: form.unionId || undefined,
          village: form.village || undefined,
          state: form.divisionName || form.state,
          city: form.districtName || form.city,
          area: form.upazilaName || form.area,
          street: form.street.trim(),
          apartment: form.apartment.trim() || undefined,
          zip: form.zip.trim() || undefined,
          landmark: form.landmark.trim() || undefined,
          orderNotes: form.notes.trim() || undefined,
        },
        paymentMethod: payType,
        deliveryZoneId: selectedZoneId || undefined,
        deliveryCharge,
      };

      if (payType === "bkash" || payType === "nagad") {
        payload.paymentDetails = {
          senderNumber: senderNumber.trim(),
          receiverNumber: (settings?.paymentSettings as any)?.[payType]?.number || "",
          transactionId: transactionId.trim().toUpperCase(),
        };
      }

      const result = await createOrder(payload).unwrap();

      if (result.success && result.data?.order) {
        trackPurchase({
          orderId: result.data.order._id || result.data.order.orderNumber,
          items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalValue: result.data.order.total ?? total,
          currency: currencyCode,
          userData: {
            email: form.email,
            phone: form.phone,
            firstName: form.fullName?.split(" ")[0],
            lastName: form.fullName?.split(" ").slice(1).join(" "),
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
        });

        dispatch(clearCart({ tenantSlug }));

        const redirectUrl =
          (result.data as any).redirectUrl ||
          (result.data as any).gatewayUrl ||
          (result.data as any).payment?.redirectUrl;

        if (redirectUrl) {
          window.location.assign(redirectUrl);
          return;
        }

        setOrderSuccess({
          orderNumber: result.data.order.orderNumber,
          orderId: result.data.order._id,
          paymentMethod: payType,
        });
      } else {
        toast.error(result.message ?? "Checkout could not be completed.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Order placement failed.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          Complete Your Order
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fast and secure checkout for {store?.shortName || store?.name || "our store"}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* Left Column: Delivery details, Shipping method, Payment method */}
        <div className="space-y-6">
          <CheckoutAddressSection
            form={form}
            setForm={setForm}
            selectedSavedAddressId={selectedSavedAddressId}
            setSelectedSavedAddressId={setSelectedSavedAddressId}
            onDistrictChanged={handleDistrictChanged}
          />

          <CheckoutDeliverySection
            deliveryZones={initialDeliveryZones}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            currencyCode={currencyCode}
          />

          <CheckoutPaymentSection
            paymentMethods={initialPaymentMethods}
            settings={settings}
            selectedPayment={selectedPayment}
            onSelectPayment={setSelectedPayment}
            senderNumber={senderNumber}
            setSenderNumber={setSenderNumber}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
          />
        </div>

        {/* Right Column: Order Summary with instant line item interactions */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary
            items={items}
            subtotal={subtotal}
            deliveryCharge={deliveryCharge}
            taxAmount={taxAmount}
            discount={discount}
            total={total}
            currencyCode={currencyCode}
            isSubmitting={isSubmittingOrder}
            tenantSlug={tenantSlug}
          />
        </div>
      </div>
    </form>
  );
}
