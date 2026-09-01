"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
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
  RotateCcw,
  RefreshCw,
  Globe,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { clearCart, setCartItems } from "@/redux/slices/cart-slice";
import { useCreateOrderMutation } from "@/redux/api/order-api";
import { useGetCartQuery, useSyncCartMutation } from "@/redux/api/cart-api";
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
  const [syncCart, { isLoading: isSyncing }] = useSyncCartMutation();
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
    data: cartData,
    isLoading: cartLoading,
    isFetching: cartFetching,
    isError: cartError,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, { skip: !mounted });

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

    // Smart Delivery Zone Auto-Matching
    if (distId && deliveryZones.length > 0) {
      const isDhaka = distId.toLowerCase() === "dhaka" || (distObj?.name || "").toLowerCase() === "dhaka";
      const matchedZone = deliveryZones.find((z) => {
        const n = z.name.toLowerCase();
        if (isDhaka) {
          return n.includes("inside") || n.includes("dhaka city") || n.includes("ঢাকা");
        } else {
          return n.includes("outside") || n.includes("ঢাকার বাইরে") || (!n.includes("inside") && !n.includes("dhaka"));
        }
      });
      if (matchedZone) {
        setSelectedZoneId(matchedZone._id);
      }
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
    ...(codAllowed ? [{ id: "cod", label: "Cash on Delivery (COD)", type: "cod", icon: Banknote }] : []),
    ...(sslcommerzAllowed ? [{ id: "sslcommerz", label: "SSLCommerz (Cards / Mobile Banking / Net Banking)", type: "sslcommerz", icon: Globe }] : []),
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

  // Progressive Checkout Autosave (20-second idle strategy - never locks UI)
  useEffect(() => {
    if (!mounted || !store?._id || !isDirty) return;

    const hasCustomerInfo = Boolean(
      (form.phone && form.phone.trim().length >= 6) ||
      (form.fullName && form.fullName.trim().length >= 2) ||
      (form.email && form.email.trim().length >= 5)
    );

    if (!hasCustomerInfo && items.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      setIsAutosaving(true);
      setSaveStatus("saving");

      const sessionId = getOrCreateCartSessionId();

      try {
        await trackProgress({
          storeId: store._id,
          sessionId,
          customerId: (customer as any)?._id || null,
          customerName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: [form.street, form.apartment, form.area].filter(Boolean).join(", "),
          street: form.street,
          apartment: form.apartment,
          city: form.city,
          area: form.area,
          state: form.state,
          zip: form.zip,
          country: form.country,
          landmark: form.landmark,
          notes: form.notes,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || undefined,
            variantTitle: i.variantTitle || "",
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image || "",
          })),
          subtotal,
          discount,
          shippingFee: deliveryCharge,
          tax: taxAmount,
          total,
          couponCode: backendCart?.couponCode || "",
          deliveryZoneId: selectedZoneId,
          deliveryZoneName: selectedZone?.name || "",
          paymentMethod: selectedPayment,
          step: selectedPayment ? "payment" : selectedZoneId ? "shipping" : "customer_info",
        }).unwrap();

        setIsDirty(false);
        setSaveStatus("saved");
        setLastSavedAt(Date.now());
      } catch {
        setSaveStatus("error");
      } finally {
        isSavingRef.current = false;
        setIsAutosaving(false);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    isDirty,
    mounted,
    store?._id,
    customer,
    form,
    items,
    subtotal,
    discount,
    deliveryCharge,
    taxAmount,
    total,
    selectedZoneId,
    selectedPayment,
    backendCart?.couponCode,
    selectedZone?.name,
    trackProgress,
  ]);

  const requireLogin = Boolean(settings.requireLoginEnabled || (settings as any).requireLogin) && !customer;

  const handleChange =
    (field: keyof CheckoutFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setSelectedSavedAddressId(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setIsDirty(true);
      setSaveStatus("dirty");
    };

  const handleRetry = () => {
    setIsInitTimedOut(false);
    refetchCart();
    refetchPm();
    refetchDz();
  };

  const isCheckingRecovery = Boolean(recoverToken && !recoveryAttempted && isRecovering);
  const isCheckoutInitializing = !mounted || (!isInitTimedOut && (cartLoading || isCheckingRecovery));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (isSubmittingOrder || isSyncing || isCheckoutInitializing || items.length === 0) return;
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
          country: form.country || "Bangladesh",
          countryCode: "BD",
          division: form.divisionName || form.state || undefined,
          divisionId: form.divisionId || undefined,
          divisionName: form.divisionName || form.state || undefined,
          divisionNameBn: form.divisionNameBn || undefined,
          district: form.districtName || form.city || undefined,
          districtId: form.districtId || undefined,
          districtName: form.districtName || form.city || undefined,
          districtNameBn: form.districtNameBn || undefined,
          upazila: form.upazilaName || form.area || undefined,
          upazilaId: form.upazilaId || undefined,
          upazilaName: form.upazilaName || form.area || undefined,
          upazilaNameBn: form.upazilaNameBn || undefined,
          union: form.unionName || form.unionId || undefined,
          unionId: form.unionId || undefined,
          village: form.village || undefined,
          state: form.divisionName || form.state || undefined,
          city: form.districtName || form.city,
          area: form.upazilaName || form.area || undefined,
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

        dispatch(clearCart());

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

  // 1. Initial Full-Page Loading Skeleton (Critical Data Initialization)
  if (isCheckoutInitializing) {
    return <CheckoutStorefrontSkeleton />;
  }

  // 2. Initialization Timeout / Critical Failure Screen
  if (isInitTimedOut && items.length === 0 && cartError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-apple-ink">Unable to load checkout</h2>
            <p className="text-xs text-zinc-500 max-w-sm">
              We couldn't load your checkout details. Please check your connection and try again.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-xl bg-apple-primary px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </button>
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-apple-ink hover:bg-zinc-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Order Placement Success Screen
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

  // 4. Empty Cart State (Rendered only after initialization settles)
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

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-base sm:text-xs text-apple-ink placeholder:text-zinc-400 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const textareaClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-base sm:text-xs text-apple-ink placeholder:text-zinc-400 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-none";

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-disabled={isSubmittingOrder}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100",
              isSubmittingOrder && "pointer-events-none opacity-50"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-apple-ink">Checkout</h1>
              {/* Autosave clear status indicator */}
              {saveStatus === "saving" ? (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin text-apple-primary" /> Saving...
                </span>
              ) : saveStatus === "dirty" ? (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Unsaved changes
                </span>
              ) : saveStatus === "error" ? (
                <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                  <AlertCircle className="h-3 w-3 text-rose-500" /> Unable to save
                </span>
              ) : lastSavedAt ? (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                  <Check className="h-3 w-3 text-emerald-500" /> Saved
                </span>
              ) : null}
            </div>
            <p className="text-xs text-zinc-500">{items.length} item(s) in your order</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Recovered Checkout Notice */}
      {recoveredBanner && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="h-4 w-4 text-sky-600 shrink-0" />
            <p className="text-xs font-medium">
              We restored your previous checkout attempt with current prices and inventory. Please review details and complete your order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRecoveredBanner(false)}
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold underline shrink-0 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* Checkout Form & Grid */}
      <form onSubmit={handleSubmit} aria-busy={isSubmittingOrder}>
        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Form Submission Interaction Overlay */}
          {isSubmittingOrder && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-white/75 backdrop-blur-[2px] transition-all"
              aria-hidden="true"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-xl">
                <Loader2 className="h-5 w-5 animate-spin text-apple-primary" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-apple-ink">Placing your order...</p>
                  <p className="text-[10px] text-zinc-500">Please do not refresh or close this window.</p>
                </div>
              </div>
            </div>
          )}

          {/* Left Form (3 cols) */}
          <div className="space-y-6 lg:col-span-3">
            {/* Customer Saved Address Book (if logged in) */}
            {customer && (
              <CustomerAddressBook
                selectedAddressId={selectedSavedAddressId}
                onSelectAddress={applySavedAddress}
              />
            )}

            {/* Step 1: Customer & Delivery Address */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Shield className="h-5 w-5 text-apple-primary" />
                <h2 className="font-bold text-apple-ink text-sm">1. Customer & Delivery Address</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full Name *">
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={handleChange("fullName")}
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
                    placeholder="e.g. rahim@example.com"
                    disabled={isSubmittingOrder}
                    className={inputClass}
                  />
                </Field>

                {/* Country Display */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Country
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                      <span className="text-base">🇧🇩</span> Bangladesh
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Domestic Shipping
                    </span>
                  </div>
                </div>

                {/* Division Selector */}
                <LocationSelect
                  label="Division"
                  required
                  placeholder="Select division..."
                  searchPlaceholder="Search division (e.g. Dhaka, চট্টগ্রাম)..."
                  options={divisions}
                  value={form.divisionId}
                  onChange={handleDivisionChange}
                  disabled={isSubmittingOrder}
                />

                {/* District / Zila Selector */}
                <LocationSelect
                  label="District / Zila"
                  required
                  placeholder={form.divisionId ? "Select district..." : "Select division first"}
                  searchPlaceholder="Search district (e.g. Gazipur, কুমিল্লা)..."
                  options={districts}
                  value={form.districtId}
                  onChange={handleDistrictChange}
                  disabled={!form.divisionId || isSubmittingOrder}
                />

                {/* Upazila / Thana Selector */}
                <LocationSelect
                  label="Upazila / Thana"
                  required
                  placeholder={form.districtId ? "Select upazila/thana..." : "Select district first"}
                  searchPlaceholder="Search upazila (e.g. Savar, ধানমন্ডি)..."
                  options={upazilas}
                  value={form.upazilaId}
                  onChange={handleUpazilaChange}
                  disabled={!form.districtId || isSubmittingOrder}
                />

                {/* Union / Pourashava Selector or Input */}
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
                      placeholder="e.g. Ward / Pourashava"
                      disabled={!form.upazilaId || isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>
                )}

                {/* Village / Area */}
                <Field label="Village / Local Area (Optional)">
                  <input
                    type="text"
                    value={form.village || ""}
                    onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))}
                    placeholder="e.g. Sector 4, Block C, Village..."
                    disabled={isSubmittingOrder}
                    className={inputClass}
                  />
                </Field>

                {/* Postal / ZIP Code */}
                <Field label="Postal / ZIP Code">
                  <input
                    type="text"
                    value={form.zip}
                    onChange={handleChange("zip")}
                    placeholder="e.g. 1209"
                    disabled={isSubmittingOrder}
                    className={inputClass}
                  />
                </Field>

                {/* Street / House & Road Address */}
                <div className="sm:col-span-2">
                  <Field label="Street / House & Road Address *">
                    <input
                      type="text"
                      required
                      value={form.street}
                      onChange={handleChange("street")}
                      placeholder="e.g. House 12, Road 4, Sector 7"
                      disabled={isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Apartment / Suite */}
                <div className="sm:col-span-2">
                  <Field label="Apartment / Suite / Flat (Optional)">
                    <input
                      type="text"
                      value={form.apartment}
                      onChange={handleChange("apartment")}
                      placeholder="e.g. Flat 4B, 3rd Floor"
                      disabled={isSubmittingOrder}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Special Delivery Instructions / Notes">
                <textarea
                  value={form.notes}
                  onChange={handleChange("notes")}
                  rows={2}
                  placeholder="Optional instructions for courier delivery"
                  disabled={isSubmittingOrder}
                  className={textareaClass}
                />
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
                      onClick={() => {
                        if (!isSubmittingOrder) {
                          setSelectedZoneId(zone._id);
                          setIsDirty(true);
                          setSaveStatus("dirty");
                        }
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                        selectedZoneId === zone._id ? "border-apple-primary bg-apple-primary/5 shadow-xs" : "border-zinc-200 hover:border-zinc-300",
                        isSubmittingOrder && "pointer-events-none opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={selectedZoneId === zone._id}
                        onChange={() => {
                          setSelectedZoneId(zone._id);
                          setIsDirty(true);
                          setSaveStatus("dirty");
                        }}
                        disabled={isSubmittingOrder}
                        className="sr-only"
                      />
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
                      onClick={() => {
                        if (!isSubmittingOrder) {
                          setSelectedPayment(pm.id);
                          setIsDirty(true);
                          setSaveStatus("dirty");
                        }
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
                        active ? "border-apple-primary bg-apple-primary/5 shadow-xs" : "border-zinc-200 hover:border-zinc-300",
                        isSubmittingOrder && "pointer-events-none opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={active}
                        onChange={() => {
                          setSelectedPayment(pm.id);
                          setIsDirty(true);
                          setSaveStatus("dirty");
                        }}
                        disabled={isSubmittingOrder}
                        className="sr-only"
                      />
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold", active ? "bg-apple-primary text-white" : "bg-zinc-100 text-zinc-500")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-apple-ink">{pm.label}</p>
                        {pm.id === "cod" && <p className="text-[11px] text-zinc-500">Pay cash upon product delivery</p>}
                        {pm.id === "sslcommerz" && <p className="text-[11px] text-zinc-500">Instant online payment via Cards, Mobile Banking, or Net Banking</p>}
                        {(pm.id === "bkash" || pm.id === "nagad") && (
                          <p className="text-[11px] text-zinc-500">Send money & provide Transaction ID</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* SSLCommerz Automated Gateway Banner */}
              {selectedPayment === "sslcommerz" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Globe className="h-4 w-4 text-amber-600" />
                    <span>Automated SSLCommerz Gateway</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    You will be securely redirected to SSLCommerz to pay with your Visa, Mastercard, bKash, Nagad, or Internet Banking. Your order will be verified automatically.
                  </p>
                </div>
              )}

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
                disabled={isSubmittingOrder || isSyncing || cartFetching || requireLogin || items.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-apple-primary py-3.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order…</span>
                  </>
                ) : (
                  `Place Order • ${formatCurrency(total, settings)}`
                )}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutStorefrontSkeleton />}>
      <CheckoutForm />
    </Suspense>
  );
}
