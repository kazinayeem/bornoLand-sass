"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle,
  Banknote,
  Smartphone,
  Loader2,
  AlertCircle,
  Lock,
  Tag,
  Check,
  RotateCcw,
  Globe,
  HelpCircle,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { clearCart, setCartItems } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";
import { useGetPublicPaymentMethodsQuery } from "@/redux/api/payment-api";
import { useGetPublicDeliveryZonesQuery } from "@/redux/api/delivery-api";
import {
  useTrackCheckoutProgressMutation,
  useLazyRecoverCheckoutQuery,
} from "@/redux/api/incomplete-checkout-api";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { CustomerAddressBook } from "@/components/storefront/customer-address-book";
import type { CustomerAddress } from "@/redux/api/customer-api";
import { CheckoutStorefrontSkeleton } from "@/components/loading/storefront-skeletons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStorefrontTracking } from "@/hooks/use-storefront-tracking";
import { LocationSelect, type LocationOption } from "@/components/ui/location-select";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
  findDivision,
  findDistrict,
  findUpazila,
} from "@/lib/bangladesh-locations";

type CheckoutFormState = {
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  email: string;
  country: string;
  countryCode: string;
  divisionId: string;
  divisionName: string;
  divisionNameBn?: string;
  districtId: string;
  districtName: string;
  districtNameBn?: string;
  upazilaId: string;
  upazilaName: string;
  upazilaNameBn?: string;
  unionId?: string;
  unionName?: string;
  village?: string;
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
  countryCode: "BD",
  divisionId: "",
  divisionName: "",
  divisionNameBn: "",
  districtId: "",
  districtName: "",
  districtNameBn: "",
  upazilaId: "",
  upazilaName: "",
  upazilaNameBn: "",
  unionId: "",
  unionName: "",
  village: "",
  state: "",
  city: "",
  area: "",
  street: "",
  apartment: "",
  zip: "",
  landmark: "",
  notes: "",
};

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const localCart = useSelector((state: RootState) => state.cart);
  const customer = useSelector((state: RootState) => state.customer.customer);
  const [createOrder, { isLoading: isSubmittingOrder }] = useCreateOrderMutation();
  const [trackProgress] = useTrackCheckoutProgressMutation();
  const [triggerRecover, { isFetching: isRecovering }] = useLazyRecoverCheckoutQuery();
  const { store, settings } = useTenant();
  const { trackInitiateCheckout, trackAddPaymentInfo, trackPurchase } = useStorefrontTracking();

  // Mounting & Initialization States
  const [mounted, setMounted] = useState(false);
  const [isInitTimedOut, setIsInitTimedOut] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const isSavingRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const AUTOSAVE_DELAY = 20_000;

  // Form & Checkout States
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string; paymentMethod: string } | null>(null);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [recoveredBanner, setRecoveredBanner] = useState(false);

  // Mobile Banking specific fields
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const {
    data: pmData,
    isLoading: pmLoading,
    refetch: refetchPm,
  } = useGetPublicPaymentMethodsQuery(store?._id, { skip: !mounted || !store?._id });

  const {
    data: dzData,
    isLoading: dzLoading,
    refetch: refetchDz,
  } = useGetPublicDeliveryZonesQuery(store?._id, { skip: !mounted || !store?._id });

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

  // Bangladesh Location Options & Hierarchy
  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => getDistricts(form.divisionId), [form.divisionId]);
  const upazilas = useMemo(() => getUpazilas(form.districtId), [form.districtId]);
  const unions = useMemo(() => getUnions(form.upazilaId), [form.upazilaId]);

  const handleDivisionChange = (divId: string, item?: LocationOption) => {
    const divObj = item || findDivision(divId);
    setForm((prev) => ({
      ...prev,
      divisionId: divId,
      divisionName: divObj?.name || "",
      divisionNameBn: divObj?.nameBn || "",
      state: divObj?.name || "",
      // Clear downstream selections
      districtId: "",
      districtName: "",
      districtNameBn: "",
      city: "",
      upazilaId: "",
      upazilaName: "",
      upazilaNameBn: "",
      area: "",
      unionId: "",
      unionName: "",
      village: "",
    }));
    setIsDirty(true);
    setSaveStatus("dirty");
  };

  const handleDistrictChange = (distId: string, item?: LocationOption) => {
    const distObj = item || findDistrict(distId);
    setForm((prev) => ({
      ...prev,
      districtId: distId,
      districtName: distObj?.name || "",
      districtNameBn: distObj?.nameBn || "",
      city: distObj?.name || "",
      zip: (distObj as any)?.defaultPostalCode || prev.zip,
      // Clear downstream selections
      upazilaId: "",
      upazilaName: "",
      upazilaNameBn: "",
      area: "",
      unionId: "",
      unionName: "",
      village: "",
    }));
    setIsDirty(true);
    setSaveStatus("dirty");

    // Auto-match delivery zone if Dhaka vs Outside Dhaka
    if (distObj?.id && deliveryZones.length > 0) {
      const isDhaka = distObj.id.toLowerCase() === "dhaka";
      const matched = deliveryZones.find((z) => {
        const n = z.name.toLowerCase();
        return isDhaka ? n.includes("inside") || n.includes("dhaka") : n.includes("outside") || !n.includes("dhaka");
      });
      if (matched) setSelectedZoneId(matched._id);
    }
  };

  const handleUpazilaChange = (upzId: string, item?: LocationOption) => {
    const upzObj = item || findUpazila(upzId);
    setForm((prev) => ({
      ...prev,
      upazilaId: upzId,
      upazilaName: upzObj?.name || "",
      upazilaNameBn: upzObj?.nameBn || "",
      area: upzObj?.name || "",
      zip: (upzObj as any)?.postalCodes?.[0] || prev.zip,
      unionId: "",
      unionName: "",
      village: "",
    }));
    setIsDirty(true);
    setSaveStatus("dirty");
  };

  const recoverToken = searchParams?.get("recover");
  const [recoveryAttempted, setRecoveryAttempted] = useState(!recoverToken);

  // Mount effect & Timeout protection (10 seconds)
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsInitTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Abandoned Checkout Recovery from URL token (?recover=xyz)
  useEffect(() => {
    if (recoverToken && mounted && !recoveryAttempted) {
      triggerRecover(recoverToken)
        .unwrap()
        .then((res) => {
          setRecoveryAttempted(true);
          if (res.data?.checkout) {
            const c = res.data.checkout;
            const divObj = findDivision((c as any).divisionId || c.state);
            const distObj = findDistrict((c as any).districtId || c.city);
            const upzObj = findUpazila((c as any).upazilaId || c.area);

            setForm((prev) => ({
              ...prev,
              fullName: c.customerName || prev.fullName,
              phone: c.phone || prev.phone,
              email: c.email || prev.email,
              country: c.country || "Bangladesh",
              countryCode: "BD",
              divisionId: divObj?.id || (c as any).divisionId || prev.divisionId,
              divisionName: divObj?.name || c.state || prev.divisionName,
              divisionNameBn: divObj?.nameBn || prev.divisionNameBn,
              districtId: distObj?.id || (c as any).districtId || prev.districtId,
              districtName: distObj?.name || c.city || prev.districtName,
              districtNameBn: distObj?.nameBn || prev.districtNameBn,
              upazilaId: upzObj?.id || (c as any).upazilaId || prev.upazilaId,
              upazilaName: upzObj?.name || c.area || prev.upazilaName,
              upazilaNameBn: upzObj?.nameBn || prev.upazilaNameBn,
              unionId: (c as any).unionId || prev.unionId,
              unionName: (c as any).union || prev.unionName,
              village: (c as any).village || prev.village,
              street: c.street || c.address || prev.street,
              apartment: c.apartment || prev.apartment,
              city: distObj?.name || c.city || prev.city,
              area: upzObj?.name || c.area || prev.area,
              state: divObj?.name || c.state || prev.state,
              zip: c.zip || distObj?.defaultPostalCode || prev.zip,
              landmark: c.landmark || prev.landmark,
              notes: c.notes || prev.notes,
            }));
            if (c.deliveryZoneId) setSelectedZoneId(c.deliveryZoneId);
            if (c.paymentMethod) setSelectedPayment(c.paymentMethod);
            if (c.items && c.items.length > 0) {
              dispatch(
                setCartItems(
                  c.items.map((it: any) => ({
                    productId: it.productId,
                    variantId: it.variantId || undefined,
                    variantTitle: it.variantTitle || "",
                    name: it.name,
                    price: it.price,
                    quantity: it.quantity,
                    image: it.image || "",
                  }))
                )
              );
            }
            setRecoveredBanner(true);
            toast.success("Previous checkout attempt restored!");
          }
        })
        .catch((err) => {
          setRecoveryAttempted(true);
          if (err?.data?.isConverted) {
            toast.info("This checkout has already been completed.");
          } else {
            toast.error(err?.data?.message || "Could not recover checkout link.");
          }
        });
    }
  }, [recoverToken, mounted, recoveryAttempted, triggerRecover, dispatch]);

  const items = localCart.items;

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
    const divObj = findDivision((address as any).divisionId || address.state);
    const distObj = findDistrict((address as any).districtId || address.city);
    const upzObj = findUpazila((address as any).upazilaId || address.area);

    setForm({
      label: address.label || "Home",
      fullName: address.fullName,
      phone: address.phone,
      email: address.email ?? "",
      country: address.country || "Bangladesh",
      countryCode: "BD",
      divisionId: divObj?.id || (address as any).divisionId || "",
      divisionName: divObj?.name || address.state || "",
      divisionNameBn: divObj?.nameBn || "",
      districtId: distObj?.id || (address as any).districtId || "",
      districtName: distObj?.name || address.city || "",
      districtNameBn: distObj?.nameBn || "",
      upazilaId: upzObj?.id || (address as any).upazilaId || "",
      upazilaName: upzObj?.name || address.area || "",
      upazilaNameBn: upzObj?.nameBn || "",
      unionId: (address as any).unionId || "",
      unionName: (address as any).union || "",
      village: (address as any).village || "",
      state: divObj?.name || address.state || "",
      city: distObj?.name || address.city || "",
      area: upzObj?.name || address.area || "",
      street: address.street,
      apartment: address.apartment ?? "",
      zip: address.zip ?? distObj?.defaultPostalCode ?? "",
      landmark: address.landmark ?? "",
      notes: address.orderNotes ?? "",
    });
    setIsDirty(true);
    setSaveStatus("dirty");

    // Auto-match delivery zone if available
    if (distObj?.id && deliveryZones.length > 0) {
      const isDhaka = distObj.id.toLowerCase() === "dhaka";
      const matched = deliveryZones.find((z) => {
        const n = z.name.toLowerCase();
        return isDhaka ? n.includes("inside") || n.includes("dhaka") : n.includes("outside") || !n.includes("dhaka");
      });
      if (matched) setSelectedZoneId(matched._id);
    }
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
  const sslcommerzAllowed = paymentMethods.some((pm) => pm.type === "sslcommerz" && pm.enabled);

  const availablePaymentMethods = [
    ...(codAllowed ? [{ id: "cod", label: "Cash on Delivery (COD)", type: "cod", icon: Banknote, desc: "Pay cash upon receiving your order" }] : []),
    ...(sslcommerzAllowed ? [{ id: "sslcommerz", label: "SSLCommerz Online Payment", type: "sslcommerz", icon: Globe, desc: "Pay securely via Cards, Mobile Banking or Net Banking" }] : []),
    ...(bkashAllowed ? [{ id: "bkash", label: "bKash Mobile Banking", type: "bkash", icon: Smartphone, desc: "Send money & verify with Transaction ID" }] : []),
    ...(nagadAllowed ? [{ id: "nagad", label: "Nagad Mobile Banking", type: "nagad", icon: Smartphone, desc: "Send money & verify with Transaction ID" }] : []),
  ];

  useEffect(() => {
    if (availablePaymentMethods.length > 0 && (!selectedPayment || !availablePaymentMethods.some((pm) => pm.id === selectedPayment))) {
      setSelectedPayment(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods, selectedPayment]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = Number(selectedZone?.charge ?? 0);
  const discount = 0;
  const taxRate = Number(settings.taxRate ?? 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal - discount + deliveryCharge + taxAmount);

  // Initiate Checkout Analytics tracking
  useEffect(() => {
    if (mounted && items.length > 0) {
      trackInitiateCheckout({
        items: items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalValue: total,
        currency: settings.currencyCode || "BDT",
      });
    }
  }, [mounted]);

  // Autosave Checkout Progress
  const performAutosave = useCallback(async () => {
    if (!mounted || isSavingRef.current || (!form.phone && !form.email && !form.fullName)) {
      return;
    }

    try {
      isSavingRef.current = true;
      setIsAutosaving(true);
      setSaveStatus("saving");

      const sessionId = getOrCreateCartSessionId();
      await trackProgress({
        storeId: store?._id,
        sessionId,
        customerName: form.fullName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        country: form.country || "Bangladesh",
        state: form.divisionName || form.state || undefined,
        city: form.districtName || form.city || undefined,
        area: form.upazilaName || form.area || undefined,
        union: form.unionName || undefined,
        village: form.village || undefined,
        street: form.street || undefined,
        apartment: form.apartment || undefined,
        zip: form.zip || undefined,
        landmark: form.landmark || undefined,
        notes: form.notes || undefined,
        divisionId: form.divisionId || undefined,
        districtId: form.districtId || undefined,
        upazilaId: form.upazilaId || undefined,
        unionId: form.unionId || undefined,
        deliveryZoneId: selectedZoneId || undefined,
        deliveryZoneName: selectedZone?.name || undefined,
        deliveryCharge: selectedZone?.charge,
        paymentMethod: selectedPayment || undefined,
        step: "2",
        subtotal,
        discount,
        total,
      }).unwrap();

      setLastSavedAt(Date.now());
      setIsDirty(false);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
      setIsAutosaving(false);
    }
  }, [
    mounted,
    form,
    selectedZoneId,
    selectedZone,
    selectedPayment,
    subtotal,
    discount,
    total,
    store?._id,
    trackProgress,
  ]);

  useEffect(() => {
    if (!isDirty || !mounted) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      performAutosave();
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isDirty, mounted, performAutosave]);

  const handleChange = (field: keyof CheckoutFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    setIsDirty(true);
    setSaveStatus("dirty");
  };

  const handleBlur = () => {
    if (isDirty && !isSavingRef.current) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      performAutosave();
    }
  };

  const handleRetry = () => {
    setIsInitTimedOut(false);
    refetchPm();
    refetchDz();
  };

  const requireLogin = Boolean(settings.requireLoginEnabled && !customer);
  const isCheckoutInitializing = !mounted || ((pmLoading || dzLoading) && !isInitTimedOut);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    setErrorMsg("");

    if (requireLogin) {
      toast.error("Please login to complete your order.");
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }

    if (!form.fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      toast.error("Please enter your full name.");
      return;
    }
    if (!form.phone.trim()) {
      setErrorMsg("Please enter your mobile phone number.");
      toast.error("Please enter your mobile phone number.");
      return;
    }
    if (!form.divisionName && !form.state) {
      setErrorMsg("Please select your division.");
      toast.error("Please select your division.");
      return;
    }
    if (!form.districtName && !form.city) {
      setErrorMsg("Please select your district / zila.");
      toast.error("Please select your district / zila.");
      return;
    }
    if (!form.street.trim()) {
      setErrorMsg("Please enter your delivery street address.");
      toast.error("Please enter your delivery street address.");
      return;
    }

    const payType = selectedPm.type || selectedPayment;

    if (payType === "bkash" || payType === "nagad") {
      if (!senderNumber.trim()) {
        setErrorMsg(`Please enter your ${payType.toUpperCase()} sender mobile number.`);
        toast.error(`Please enter your ${payType.toUpperCase()} sender number.`);
        return;
      }
      if (!transactionId.trim()) {
        setErrorMsg(`Please enter the ${payType.toUpperCase()} Transaction ID (TrxID).`);
        toast.error(`Please enter the Transaction ID.`);
        return;
      }
    }

    try {
      trackAddPaymentInfo({
        paymentMethod: payType,
        totalValue: total,
        currency: settings.currencyCode || "BDT",
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
          receiverNumber: (settings.paymentSettings as any)?.[payType]?.number || "",
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
          currency: settings.currencyCode || "BDT",
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

        dispatch(clearCart({ tenantSlug: store?.slug }));

        const redirectUrl =
          (result.data as any).redirectUrl ||
          (result.data as any).gatewayUrl ||
          (result.data as any).payment?.redirectUrl;

        if (redirectUrl) {
          console.info("[REDIRECT_START]", { redirectUrl, orderNumber: result.data.order.orderNumber });
          window.location.assign(redirectUrl);
          return;
        }

        setOrderSuccess({
          orderNumber: result.data.order.orderNumber,
          orderId: result.data.order._id,
          paymentMethod: payType,
        });
      } else {
        setErrorMsg(result.message ?? "Checkout failed. Please try again.");
      }
    } catch (err: any) {
      const backendErr = err?.data?.message || err?.message;
      if (err?.status === "TIMEOUT_ERROR") {
        setErrorMsg("Payment gateway request timed out. Please try again.");
      } else {
        setErrorMsg(backendErr ?? "Checkout failed. Please try again.");
      }
    }
  };

  // 1. Initial Full-Page Loading Skeleton
  if (isCheckoutInitializing) {
    return <CheckoutStorefrontSkeleton />;
  }

  // 2. Initialization Timeout Screen
  if (isInitTimedOut && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Unable to load checkout</h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
          We couldn't connect to your cart. Please check your internet connection and try again.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try Again
          </button>
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  // 3. Order Placement Success Screen
  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <CheckCircle className="h-10 w-10" />
        </motion.div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Thank You For Your Order!</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {orderSuccess.paymentMethod === "cod"
            ? "Your order has been confirmed. You will pay cash upon delivery."
            : "Your payment verification is pending. Our team will verify your Transaction ID shortly."}
        </p>
        <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-5 space-y-1">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Order Reference Number</p>
          <p className="text-2xl font-mono font-extrabold text-zinc-900">{orderSuccess.orderNumber}</p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/orders/${orderSuccess.orderId}`} className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800">
            View Order Status
          </Link>
          <Link href="/" className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // 4. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Your Cart is Empty</h2>
        <p className="text-sm text-zinc-500 max-w-sm">Please add items from the store before proceeding to checkout.</p>
        <Link href="/shop" className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-all">
          <ArrowLeft className="h-4 w-4" /> Explore Products
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-zinc-50/50";
  const textareaClass =
    "w-full rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-zinc-50/50 resize-none";

  return (
    <div className="min-h-screen bg-white pb-20 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              aria-disabled={isSubmittingOrder}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50",
                isSubmittingOrder && "pointer-events-none opacity-50"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Checkout</h1>
                {saveStatus === "saving" ? (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin text-zinc-700" /> Saving...
                  </span>
                ) : saveStatus === "dirty" ? (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Unsaved changes
                  </span>
                ) : lastSavedAt ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">{items.length} {items.length === 1 ? "item" : "items"} in your order</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customer ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                <Check className="h-3.5 w-3.5" /> Logged in as {customer.email}
              </span>
            ) : settings.requireLoginEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                <Lock className="h-3.5 w-3.5" /> Login Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 border border-zinc-200/60">
                Guest Checkout
              </span>
            )}
          </div>
        </div>

        {/* Recovered Checkout Notice */}
        {recoveredBanner && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sky-900">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-sky-600 shrink-0" />
              <p className="text-xs font-medium">
                We restored your previous checkout attempt with current prices and inventory.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRecoveredBanner(false)}
              className="text-xs text-sky-700 hover:underline font-semibold shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Require Login Warning Card */}
        {requireLogin && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Login Required</h4>
                <p className="text-xs text-amber-800">This store requires customer login before completing purchases.</p>
              </div>
            </div>
            <Link
              href={`/login?redirect=${encodeURIComponent("/checkout")}`}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 whitespace-nowrap"
            >
              Login to Continue
            </Link>
          </div>
        )}

        {/* Checkout Form Grid */}
        <form onSubmit={handleSubmit} aria-busy={isSubmittingOrder}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Form: Customer, Delivery, Payment (7 cols) */}
            <div className="space-y-10 lg:col-span-7">
              {/* Customer Saved Address Book */}
              {customer && (
                <CustomerAddressBook
                  selectedAddressId={selectedSavedAddressId}
                  onSelectAddress={applySavedAddress}
                />
              )}

              {/* Section 1: Customer & Delivery Address */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
                    1
                  </span>
                  <h2 className="font-bold text-zinc-900 text-base">Customer & Delivery Address</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Full Name *">
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={handleChange("fullName")}
                        onBlur={handleBlur}
                        placeholder="e.g. Rahim Ahmed"
                        disabled={isSubmittingOrder}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Mobile Phone Number *">
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange("phone")}
                      onBlur={handleBlur}
                      placeholder="e.g. 017XXXXXXXX"
                      disabled={isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      onBlur={handleBlur}
                      placeholder="e.g. rahim@example.com"
                      disabled={isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>

                  {/* Country Selector */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Country
                    </label>
                    <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-3.5 py-2.5 text-sm">
                      <span className="flex items-center gap-2 font-medium text-zinc-900">
                        <span className="text-base">🇧🇩</span> Bangladesh
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100/80">
                        Domestic Delivery
                      </span>
                    </div>
                  </div>

                  {/* Cascading Bangladesh Locations */}
                  <LocationSelect
                    label="Division *"
                    required
                    placeholder="Select division..."
                    searchPlaceholder="Search division (e.g. Dhaka, Chittagong)..."
                    options={divisions}
                    value={form.divisionId}
                    onChange={handleDivisionChange}
                    disabled={isSubmittingOrder}
                  />

                  <LocationSelect
                    label="District / Zila *"
                    required
                    placeholder={form.divisionId ? "Select district..." : "Select division first"}
                    searchPlaceholder="Search district (e.g. Gazipur, Cumilla)..."
                    options={districts}
                    value={form.districtId}
                    onChange={handleDistrictChange}
                    disabled={!form.divisionId || isSubmittingOrder}
                  />

                  <LocationSelect
                    label="Upazila / Thana *"
                    required
                    placeholder={form.districtId ? "Select upazila/thana..." : "Select district first"}
                    searchPlaceholder="Search upazila (e.g. Dhanmondi, Mirpur)..."
                    options={upazilas}
                    value={form.upazilaId}
                    onChange={handleUpazilaChange}
                    disabled={!form.districtId || isSubmittingOrder}
                  />

                  {unions.length > 0 ? (
                    <LocationSelect
                      label="Union / Pourashava"
                      placeholder="Select union..."
                      searchPlaceholder="Search union..."
                      options={unions}
                      value={form.unionId || ""}
                      onChange={(val, opt) => setForm((p) => ({ ...p, unionId: val, unionName: opt?.name || val }))}
                      disabled={!form.upazilaId || isSubmittingOrder}
                    />
                  ) : (
                    <Field label="Union / Pourashava (Optional)">
                      <input
                        type="text"
                        value={form.unionName || ""}
                        onChange={(e) => setForm((p) => ({ ...p, unionName: e.target.value, unionId: e.target.value }))}
                        onBlur={handleBlur}
                        placeholder="e.g. Ward / Pourashava"
                        disabled={!form.upazilaId || isSubmittingOrder}
                        className={inputClass}
                      />
                    </Field>
                  )}

                  <Field label="Village / Local Area (Optional)">
                    <input
                      type="text"
                      value={form.village || ""}
                      onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))}
                      onBlur={handleBlur}
                      placeholder="e.g. Sector 4, Block C"
                      disabled={isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Postal / ZIP Code">
                    <input
                      type="text"
                      value={form.zip}
                      onChange={handleChange("zip")}
                      onBlur={handleBlur}
                      placeholder="e.g. 1209"
                      disabled={isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Street / House & Road Address *">
                      <input
                        type="text"
                        required
                        value={form.street}
                        onChange={handleChange("street")}
                        onBlur={handleBlur}
                        placeholder="e.g. House 12, Road 4, Sector 7"
                        disabled={isSubmittingOrder}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Apartment / Suite / Flat (Optional)">
                      <input
                        type="text"
                        value={form.apartment}
                        onChange={handleChange("apartment")}
                        onBlur={handleBlur}
                        placeholder="e.g. Flat 4B, 3rd Floor"
                        disabled={isSubmittingOrder}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Special Delivery Instructions (Optional)">
                  <textarea
                    value={form.notes}
                    onChange={handleChange("notes")}
                    onBlur={handleBlur}
                    rows={2}
                    placeholder="e.g. Call before delivery / Leave with security guard"
                    disabled={isSubmittingOrder}
                    className={textareaClass}
                  />
                </Field>
              </div>

              {/* Section 2: Delivery Method */}
              {deliveryZones.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
                      2
                    </span>
                    <h2 className="font-bold text-zinc-900 text-base">Delivery Method</h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {deliveryZones.map((zone) => {
                      const isSelected = selectedZoneId === zone._id;
                      return (
                        <label
                          key={zone._id}
                          onClick={() => {
                            if (!isSubmittingOrder) {
                              setSelectedZoneId(zone._id);
                              setIsDirty(true);
                              setSaveStatus("dirty");
                            }
                          }}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                            isSelected
                              ? "border-zinc-900 bg-zinc-50/60 ring-1 ring-zinc-900/10 shadow-xs"
                              : "border-zinc-200/80 bg-white hover:border-zinc-300",
                            isSubmittingOrder && "pointer-events-none opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                                isSelected
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-300 bg-white"
                              )}
                            >
                              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{zone.name}</p>
                              <p className="text-xs text-zinc-500">{zone.estimatedDays || "1–3 business days"}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-zinc-900">
                            {zone.charge === 0 ? "Free" : formatCurrency(zone.charge, settings)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Payment Method */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
                    3
                  </span>
                  <h2 className="font-bold text-zinc-900 text-base">Payment Method</h2>
                </div>

                <div className="grid gap-3">
                  {availablePaymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = selectedPayment === pm.id;

                    return (
                      <label
                        key={pm.id}
                        onClick={() => {
                          if (!isSubmittingOrder) {
                            setSelectedPayment(pm.id);
                            setIsDirty(true);
                            setSaveStatus("dirty");
                          }
                        }}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                          isSelected
                            ? "border-zinc-900 bg-zinc-50/60 ring-1 ring-zinc-900/10 shadow-xs"
                            : "border-zinc-200/80 bg-white hover:border-zinc-300",
                          isSubmittingOrder && "pointer-events-none opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                              isSelected
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-300 bg-white"
                            )}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{pm.label}</p>
                            <p className="text-xs text-zinc-500">{pm.desc}</p>
                          </div>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                          <Icon className="h-4 w-4" />
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* SSLCommerz Details Card */}
                {selectedPayment === "sslcommerz" && (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-2 text-xs text-zinc-600">
                    <div className="flex items-center gap-2 font-semibold text-zinc-900">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>SSLCommerz Hosted Secure Gateway</span>
                    </div>
                    <p className="leading-relaxed">
                      You will be redirected to the secure SSLCommerz payment page to pay with Visa, Mastercard, bKash, Nagad, Rocket, or Internet Banking. Upon completion, you will be automatically returned to this store.
                    </p>
                  </div>
                )}

                {/* bKash / Nagad Manual Instructions Card */}
                {(selectedPayment === "bkash" || selectedPayment === "nagad") && (
                  <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
                      <Smartphone className="h-4 w-4 text-zinc-700" />
                      <span>{selectedPayment.toUpperCase()} Payment Instructions</span>
                    </div>

                    <p className="text-xs text-zinc-600">
                      Please send <strong>{formatCurrency(total, settings)}</strong> via &quot;Send Money&quot; to the shop number below:
                    </p>

                    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-zinc-200/80">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          Shop {selectedPayment.toUpperCase()} Number
                        </p>
                        <p className="text-sm font-mono font-bold text-zinc-900 mt-0.5">
                          {(settings.paymentSettings as any)?.[selectedPayment]?.number || "017XXXXXXXX"}
                        </p>
                      </div>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 uppercase">
                        {(settings.paymentSettings as any)?.[selectedPayment]?.type || "Personal"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <Field label="Your Sender Mobile Number *">
                        <input
                          type="tel"
                          required
                          value={senderNumber}
                          onChange={(e) => {
                            setSenderNumber(e.target.value);
                            setIsDirty(true);
                            setSaveStatus("dirty");
                          }}
                          placeholder="e.g. 017XXXXXXXX"
                          disabled={isSubmittingOrder}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Transaction ID (TrxID) *">
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => {
                            setTransactionId(e.target.value.toUpperCase());
                            setIsDirty(true);
                            setSaveStatus("dirty");
                          }}
                          placeholder="e.g. ABC123XYZ"
                          disabled={isSubmittingOrder}
                          className={cn(inputClass, "font-mono font-bold uppercase")}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sticky Order Summary (5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
                <h2 className="font-bold text-zinc-900 text-base pb-3 border-b border-zinc-100">
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 pr-1 space-y-3">
                  {items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex items-center gap-3.5 pt-3 first:pt-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-zinc-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-900">{item.name}</p>
                        {item.variantTitle && <p className="text-[11px] text-zinc-400">{item.variantTitle}</p>}
                        <p className="text-[11px] text-zinc-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-zinc-900">
                        {formatCurrency(item.price * item.quantity, settings)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2.5 border-t border-zinc-100 pt-4 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-zinc-900">{formatCurrency(subtotal, settings)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between font-semibold text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount, settings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping {selectedZone ? `(${selectedZone.name})` : ""}</span>
                    <span className="font-medium text-zinc-900">
                      {deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge, settings)}
                    </span>
                  </div>

                  {taxAmount > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Estimated Tax ({taxRate}%)</span>
                      <span className="font-medium text-zinc-900">{formatCurrency(taxAmount, settings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-zinc-200/80 pt-3 text-base font-extrabold text-zinc-900">
                    <span>Total</span>
                    <span>{formatCurrency(total, settings)}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-rose-50/80 border border-rose-100 p-3.5 text-xs text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmittingOrder || requireLogin || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Placing Order…</span>
                    </>
                  ) : (
                    `Place Order • ${formatCurrency(total, settings)}`
                  )}
                </button>

                {/* Trust and Assurance Indicators */}
                <div className="border-t border-zinc-100 pt-4 text-center space-y-2">
                  <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-Bit SSL Encrypted Checkout
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Guaranteed Safe & Secure Checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modern Clean Submission Modal Backdrop */}
      {isSubmittingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 backdrop-blur-xs p-4 animate-in fade-in-0">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl border border-zinc-100 space-y-3 animate-in zoom-in-95">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Placing your order...</h3>
            <p className="text-xs text-zinc-500">
              Please do not refresh or close this window while we securely confirm your order details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutStorefrontSkeleton />}>
      <CheckoutForm />
    </Suspense>
  );
}
