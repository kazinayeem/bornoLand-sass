"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Truck,
  CheckCircle2,
  Loader2,
  Package,
  Layers,
  Clock,
  Receipt,
  RotateCw,
  Eye,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProductsQuery, type Product, type ProductVariant } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreCustomersQuery } from "@/redux/api/store-customers-api";
import { useValidateCouponMutation, type ValidateCouponResponse } from "@/redux/api/coupon-api";
import {
  useCreateStoreOrderMutation,
  useGetRecentStoreOrdersQuery,
  type RecentStoreOrder,
} from "@/redux/api/store-order-api";
import { PosVariantModal } from "./pos-variant-modal";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { PosReceiptDocument } from "@/components/documents/templates/pos-receipt-document";
import { InvoiceDocument } from "@/components/documents/templates/invoice-document";
import type { PosReceiptData, InvoiceData, StoreIdentity } from "@/components/documents/document-types";

import { formatCurrency } from "@/lib/format-currency";
import { useTenant } from "@/providers/tenant-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PosLineItem = {
  productId: string;
  variantId?: string;
  productName: string;
  variantTitle?: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
};

type PosOrderModalProps = {
  open: boolean;
  storeId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const PAGE_SIZE = 24;

export function PosOrderModal({
  open,
  storeId,
  onClose,
  onSuccess,
}: PosOrderModalProps) {
  const router = useRouter();
  const { store, settings } = useTenant();

  // Search & Catalog state
  const [productSearch, setProductSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [accumulatedProducts, setAccumulatedProducts] = useState<Product[]>([]);

  // View Mode: 'catalog' | 'recent_orders'
  const [activeTab, setActiveTab] = useState<"catalog" | "recent">("catalog");

  // Customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);

  // Cart / Line items
  const [lineItems, setLineItems] = useState<PosLineItem[]>([]);

  // Variant selector modal state
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  // Coupon & Payment state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile_banking" | "cod">("cash");
  const [cashTendered, setCashTendered] = useState<number | "">("");
  const [shippingFee, setShippingFee] = useState(0);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [printDocumentState, setPrintDocumentState] = useState<{ order: any; format: "thermal" | "a4" } | null>(null);

  // Double-click / In-flight submission protection ref
  const isSubmittingRef = useRef(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(productSearch.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Server-side Product Query with pagination, search, and category filter
  const {
    data: productsData,
    isLoading: loadingProducts,
    isFetching: fetchingProducts,
  } = useGetProductsQuery(
    {
      storeId,
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      status: "active",
      view: "pos",
    },
    { skip: !open || !storeId }
  );

  const { data: categoriesData } = useGetCategoriesQuery({ storeId }, { skip: !open || !storeId });
  const { data: customersData } = useGetStoreCustomersQuery({ storeId, search: customerSearch }, { skip: !open || !storeId });

  // Recent 10 Orders Query
  const {
    data: recentOrdersData,
    isLoading: loadingRecentOrders,
    refetch: refetchRecentOrders,
  } = useGetRecentStoreOrdersQuery(
    { storeId, limit: 10 },
    { skip: !open || !storeId }
  );

  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const [createStoreOrder, { isLoading: isSubmittingOrder }] = useCreateStoreOrderMutation();

  const categories = categoriesData?.data?.categories ?? [];
  const customers = customersData?.data?.customers ?? [];
  const recentOrders = recentOrdersData?.data?.orders ?? [];

  // Manage accumulated products across pagination pages
  useEffect(() => {
    if (!productsData?.data?.products) return;
    const incoming = productsData.data.products;
    if (page === 1) {
      setAccumulatedProducts(incoming);
    } else {
      setAccumulatedProducts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        const added = incoming.filter((p) => !seen.has(p._id));
        return [...prev, ...added];
      });
    }
  }, [productsData, page]);

  const totalCatalogCount = productsData?.data?.total ?? accumulatedProducts.length;
  const totalPages = productsData?.data?.totalPages ?? 1;
  const hasMore = page < totalPages;

  // Reset page when category changes
  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName === selectedCategory ? "" : catName);
    setPage(1);
  };

  if (!open) return null;

  // Add Product to POS Order Line
  const handleSelectProduct = (product: Product) => {
    const hasVariants = (product.options?.length ?? 0) > 0 || (product.variants?.length ?? 0) > 0;
    if (hasVariants) {
      setVariantProduct(product);
    } else {
      if (product.stock <= 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }

      setLineItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === product._id && !item.variantId);
        if (existingIndex > -1) {
          const currentQty = prev[existingIndex].quantity;
          if (currentQty >= product.stock) {
            toast.error(`Only ${product.stock} available in stock`);
            return prev;
          }
          const updated = [...prev];
          updated[existingIndex].quantity += 1;
          return updated;
        }
        return [
          ...prev,
          {
            productId: product._id,
            productName: product.name,
            sku: product.sku || "N/A",
            image: product.imageUrl || product.thumbnailUrl || `https://placehold.co/100x100?text=Product`,
            price: product.price,
            quantity: 1,
            stock: product.stock,
          },
        ];
      });
      setAppliedCoupon(null);
    }
  };

  // Add Variant from PosVariantModal
  const handleSelectVariant = (variant: ProductVariant, qty: number) => {
    if (!variantProduct) return;
    const variantTitle = Object.values(variant.optionValues || {}).join(" / ") || variant.sku || "Default Variant";

    setLineItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === variantProduct._id && item.variantId === variant._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [
        ...prev,
        {
          productId: variantProduct._id,
          variantId: variant._id,
          productName: variantProduct.name,
          variantTitle,
          sku: variant.sku || variantProduct.sku || "N/A",
          image: variant.imageUrl || variantProduct.imageUrl || `https://placehold.co/100x100?text=Product`,
          price: variant.price ?? variantProduct.price ?? 0,
          quantity: qty,
          stock: variant.stock ?? 0,
        },
      ];
    });
    setAppliedCoupon(null);
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    } else {
      setLineItems((prev) => {
        const item = prev[index];
        if (item.stock && newQty > item.stock) {
          toast.error(`Only ${item.stock} in stock`);
          return prev;
        }
        const updated = [...prev];
        updated[index].quantity = newQty;
        return updated;
      });
    }
    setAppliedCoupon(null);
  };

  const handleRemoveItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
    setAppliedCoupon(null);
  };

  // Subtotals
  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + Number(shippingFee));

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    try {
      const res = await validateCoupon({
        storeId,
        code: couponCode.trim(),
        subtotal,
        shipping: shippingFee,
        customerId: selectedCustomer?.id,
        customerEmail: selectedCustomer?.email,
        items: lineItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      }).unwrap();

      if (res.data?.valid) {
        setAppliedCoupon(res.data);
        toast.success(`Coupon "${res.data.coupon.code}" applied`);
      } else {
        toast.error(res.message || "Invalid coupon code");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid coupon code");
    }
  };

  // Complete POS Order Submission with Idempotency and Loading Guard
  const handleCompleteOrder = async () => {
    if (isSubmittingRef.current || isSubmittingOrder) return;
    if (lineItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    isSubmittingRef.current = true;

    try {
      const customerName = selectedCustomer ? selectedCustomer.name : "Walk-in Customer";
      const customerPhone = selectedCustomer ? selectedCustomer.phone : "";
      const customerEmail = selectedCustomer ? selectedCustomer.email : "";

      // Unique Idempotency Key to prevent duplicate order creations
      const idempotencyKey = `pos_${storeId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const numericalTendered = typeof cashTendered === "number" && cashTendered > 0 ? cashTendered : grandTotal;
      const calculatedChange = Math.max(0, numericalTendered - grandTotal);

      const payload = {
        storeId,
        idempotencyKey,
        isPos: true,
        channel: "pos",
        customerId: selectedCustomer?.id,
        items: lineItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          variantTitle: item.variantTitle,
          name: `${item.productName}${item.variantTitle ? ` (${item.variantTitle})` : ""}`,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku,
        })),
        paymentMethod,
        tenderedAmount: numericalTendered,
        changeAmount: calculatedChange,
        paymentDetails: {
          tenderedAmount: numericalTendered,
          changeAmount: calculatedChange,
        },
        shippingAddress: {
          fullName: customerName,
          phone: customerPhone || "01700000000",
          email: customerEmail,
          city: "In-Store POS",
          street: "Counter Sales Register",
          orderNotes: `POS Sale • Payment: ${paymentMethod.toUpperCase()}`,
        },
      };

      const res = await createStoreOrder({ storeId, body: payload }).unwrap();

      if (res.data?.order) {
        toast.success(`POS Order #${res.data.order.orderNumber} completed!`);
        const completedWithCust = {
          ...res.data.order,
          customerName,
          customerPhone,
          tenderedAmount: numericalTendered,
          changeAmount: calculatedChange,
          items: res.data.order.items || payload.items,
        };
        setCompletedOrder(completedWithCust);
        // Clear cart only on successful completion
        setLineItems([]);
        setAppliedCoupon(null);
        setProductSearch("");
        refetchRecentOrders();
        onSuccess?.();
      } else {
        toast.error((res as any).message || "Failed to create POS order");
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || "Failed to create POS order";
      toast.error(errorMsg);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      <div
        key="pos-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmittingOrder) onClose();
        }}
      >
        <div
          key="pos-modal-content"
          className="flex flex-col w-full max-w-7xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden text-apple-ink"
          style={{ height: "min(94vh, 900px)" }}
        >
          {/* Top POS Header Bar */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 sm:px-6 bg-zinc-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003399] text-white font-black text-xs shadow-xs">
                POS
              </div>
              <div>
                <h3 className="text-sm font-black">{store?.name || "Store"} Terminal</h3>
                <p className="text-[10px] text-zinc-400">Point of Sale • Counter Register</p>
              </div>
            </div>

            {/* Middle Mode Switcher: Catalog vs Recent Orders */}
            <div className="flex items-center rounded-xl bg-zinc-800 p-1 border border-zinc-700/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition-all",
                  activeTab === "catalog"
                    ? "bg-[#003399] text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Catalog ({totalCatalogCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("recent")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition-all",
                  activeTab === "recent"
                    ? "bg-[#003399] text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Recent Sales ({recentOrders.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Customer Picker */}
              <div className="relative min-w-[180px] sm:min-w-[220px]">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-white border border-zinc-700">
                    <span className="truncate font-semibold max-w-[140px]">{selectedCustomer.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="ml-1 text-zinc-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Walk-in Customer (or search)"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#003399]"
                  />
                )}

                {/* Customer dropdown search results */}
                {customerSearch && !selectedCustomer && customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl divide-y divide-zinc-700">
                    {customers.map((c, cIdx) => (
                      <div
                        key={c._id || (c as any).id || `pos-customer-${cIdx}`}
                        onClick={() => {
                          setSelectedCustomer({ id: c._id || (c as any).id, name: c.name, email: c.email, phone: c.phone });
                          setCustomerSearch("");
                        }}
                        className="p-2 hover:bg-zinc-700 cursor-pointer text-xs"
                      >
                        <p className="font-bold text-white">{c.name}</p>
                        <p className="text-[10px] text-zinc-400">{c.phone || c.email || "No phone"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main POS Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
            {/* Left Column (7 cols): Catalog OR Recent Orders */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-50/60 p-4 min-h-0 overflow-hidden">
              {activeTab === "recent" ? (
                /* ── Recent 10 Orders View ── */
                <div className="flex flex-col h-full space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700">
                        Recent In-Store Sales (Last 10)
                      </h4>
                      <p className="text-[11px] text-zinc-400">Transactions processed on this counter</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => refetchRecentOrders()}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      <RotateCw className="h-3 w-3" /> Refresh
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {loadingRecentOrders ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-16 text-zinc-400 space-y-2">
                        <Receipt className="h-8 w-8 mx-auto text-zinc-300" />
                        <p className="text-xs font-medium">No sales recorded yet</p>
                      </div>
                    ) : (
                      recentOrders.map((order) => {
                        const isPaid = order.paymentStatus === "paid" || order.status === "delivered";
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/90 bg-white shadow-xs hover:border-[#003399]/40 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-black text-zinc-900">
                                  #{order.orderNumber}
                                </span>
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
                                    order.status === "delivered" || order.status === "processing"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-blue-50 text-[#003399] border border-blue-200"
                                  )}
                                >
                                  {order.status}
                                </span>
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                                    isPaid
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  )}
                                >
                                  Payment: {isPaid ? "PAID" : order.paymentStatus || "PENDING"}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600 font-medium">
                                {order.customerName} {order.customerPhone ? `• ${order.customerPhone}` : ""}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                                • {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 text-right">
                              <div>
                                <p className="text-sm font-black text-zinc-900 font-mono">
                                  {formatCurrency(order.total, settings)}
                                </p>
                                <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 uppercase">
                                  {order.paymentMethod}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setPrintDocumentState({ order, format: "thermal" })}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Print POS Thermal Receipt (80mm)"
                                >
                                  <Receipt className="h-3.5 w-3.5 text-zinc-500" />
                                  <span className="hidden sm:inline">Slip</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrintDocumentState({ order, format: "a4" })}
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Print Full A4 Invoice"
                                >
                                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                                  <span className="hidden sm:inline">A4</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* ── Catalog View with Search, Category Filter, and Infinite Loading ── */
                <>
                  <div className="space-y-3 shrink-0 mb-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search all store products by name or SKU / barcode…"
                        className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 py-2 text-xs font-medium text-apple-ink focus:outline-none focus:ring-2 focus:ring-[#003399]/20 shadow-xs"
                      />
                      {productSearch && (
                        <button
                          type="button"
                          onClick={() => setProductSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => handleSelectCategory("")}
                        className={cn(
                          "rounded-lg px-3 py-1 text-[11px] font-bold whitespace-nowrap transition-all",
                          !selectedCategory
                            ? "bg-[#003399] text-white shadow-xs"
                            : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                        )}
                      >
                        All Categories ({totalCatalogCount})
                      </button>
                      {categories.map((cat, catIdx) => (
                        <button
                          key={cat._id || (cat as any).id || cat.slug || `pos-cat-${catIdx}`}
                          type="button"
                          onClick={() => handleSelectCategory(cat.name)}
                          className={cn(
                            "rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-all",
                            selectedCategory === cat.name
                              ? "bg-[#003399] text-white font-bold shadow-xs"
                              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Catalog Grid */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {loadingProducts && page === 1 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                            <div className="aspect-square rounded-lg bg-zinc-100" />
                            <div className="h-3 w-3/4 rounded bg-zinc-100" />
                            <div className="h-3 w-1/2 rounded bg-zinc-100" />
                          </div>
                        ))}
                      </div>
                    ) : accumulatedProducts.length === 0 ? (
                      <div className="text-center py-16 text-zinc-400 space-y-2">
                        <Package className="h-10 w-10 mx-auto text-zinc-300" />
                        <p className="text-xs font-semibold">No products found</p>
                        {debouncedSearch && (
                          <p className="text-[11px] text-zinc-400">
                            No matches for &ldquo;{debouncedSearch}&rdquo; in this store.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {accumulatedProducts.map((product, pIdx) => {
                            const hasVariants =
                              (product.options?.length ?? 0) > 0 ||
                              (product.variants?.length ?? 0) > 0 ||
                              product.productType === "variable";
                            const isOutOfStock = !hasVariants && (product.stock ?? 0) <= 0;

                            return (
                              <div
                                key={product._id || (product as any).id || product.slug || `pos-prod-${pIdx}`}
                                onClick={() => handleSelectProduct(product)}
                                className={cn(
                                  "group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs transition-all hover:border-[#003399]/50 hover:shadow-xs cursor-pointer",
                                  isOutOfStock && "opacity-60 bg-zinc-50/80"
                                )}
                              >
                                <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100">
                                  <img
                                    src={product.imageUrl || product.thumbnailUrl || `https://placehold.co/200x200?text=Product`}
                                    alt={product.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                  />
                                  {hasVariants ? (
                                    <span className="absolute left-1.5 top-1.5 rounded-full bg-zinc-900/85 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                      Variants
                                    </span>
                                  ) : isOutOfStock ? (
                                    <span className="absolute left-1.5 top-1.5 rounded-full bg-red-600/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                      Out of Stock
                                    </span>
                                  ) : null}
                                </div>

                                <h4 className="line-clamp-1 text-xs font-bold text-zinc-900">{product.name}</h4>
                                <p className="text-[10px] text-zinc-400 font-mono">
                                  SKU: {product.sku || "N/A"}
                                  {!hasVariants && typeof product.stock === "number" ? ` • ${product.stock} in stock` : ""}
                                </p>

                                <div className="mt-2 flex items-center justify-between pt-2 border-t border-zinc-100">
                                  <span className="text-xs font-black text-[#003399]">
                                    {formatCurrency(product.price, settings)}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={isOutOfStock}
                                    className={cn(
                                      "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all",
                                      hasVariants
                                        ? "bg-blue-50 text-[#003399] border border-blue-200 hover:bg-blue-100"
                                        : isOutOfStock
                                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                        : "bg-[#003399] text-white hover:bg-[#002B80]"
                                    )}
                                  >
                                    {hasVariants ? (
                                      <>
                                        <Layers className="h-3 w-3" /> Select Variant
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3" /> Add
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Infinite Loading / Load More */}
                        {hasMore && (
                          <div className="pt-2 pb-4 text-center">
                            <button
                              type="button"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={fetchingProducts}
                              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 disabled:opacity-50"
                            >
                              {fetchingProducts ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#003399]" />
                                  Loading more products…
                                </>
                              ) : (
                                <>
                                  Load More Products ({totalCatalogCount - accumulatedProducts.length} remaining)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Column (5 cols): Order Lines & Checkout */}
            <div className="lg:col-span-5 flex flex-col bg-white p-4 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-3 shrink-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-600">
                  POS Order Lines ({lineItems.length})
                </h4>
                {lineItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setLineItems([]);
                      setAppliedCoupon(null);
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Order Line Items List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {lineItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 text-zinc-400 space-y-2">
                    <ShoppingCart className="h-10 w-10 text-zinc-300" />
                    <p className="text-xs font-bold text-zinc-600">No items in order</p>
                    <p className="text-[11px] text-zinc-400 max-w-[220px]">
                      Click products from the catalog or search to build the register sale.
                    </p>
                  </div>
                ) : (
                  lineItems.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.variantId || index}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white shadow-2xs"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                        <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold truncate text-zinc-900">{item.productName}</h5>
                        {item.variantTitle && (
                          <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[10px] font-semibold text-[#003399] mb-0.5">
                            {item.variantTitle}
                          </span>
                        )}
                        <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</p>

                        <p className="text-xs font-bold text-zinc-900 mt-1">
                          {formatCurrency(item.price, settings)} × {item.quantity} ={" "}
                          <span className="text-[#003399]">{formatCurrency(item.price * item.quantity, settings)}</span>
                        </p>
                      </div>

                      {/* Quantity adjustment & Remove */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-zinc-600 shadow-2xs hover:bg-zinc-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-zinc-600 shadow-2xs hover:bg-zinc-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                          title="Remove line item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Summary Footer */}
              <div className="border-t border-zinc-200 pt-3 mt-3 shrink-0 space-y-3 bg-zinc-50/70 p-3.5 rounded-2xl">
                {/* Coupon Input */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="truncate">Coupon &ldquo;{appliedCoupon.coupon.code}&rdquo; applied</span>
                    <button type="button" onClick={() => setAppliedCoupon(null)} className="text-emerald-700 hover:text-emerald-900">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Discount / Coupon Code"
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#003399]"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {isValidatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                    </button>
                  </form>
                )}

                {/* Totals Summary */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, settings)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount, settings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-200">
                    <span>Total Pay</span>
                    <span className="text-[#003399]">{formatCurrency(grandTotal, settings)}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Payment Method</label>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                    {[
                      { id: "cash", label: "Cash", icon: Banknote },
                      { id: "card", label: "Card", icon: CreditCard },
                      { id: "mobile_banking", label: "Mobile", icon: Smartphone },
                      { id: "cod", label: "COD", icon: Truck },
                    ].map((m) => {
                      const Icon = m.icon;
                      const active = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all gap-1",
                            active
                              ? "border-[#003399] bg-[#003399] text-white font-bold shadow-xs"
                              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cash Tendered & Change Helper for Cash Payments */}
                  {paymentMethod === "cash" && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-2.5 space-y-2 mt-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          Cash Tendered (৳)
                        </label>
                        {typeof cashTendered === "number" && cashTendered >= grandTotal && (
                          <span className="text-[11px] font-black text-emerald-600 font-mono">
                            Change: {formatCurrency(cashTendered - grandTotal, settings)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={cashTendered}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCashTendered(v === "" ? "" : Math.max(0, Number(v)));
                          }}
                          placeholder={`Exact (${grandTotal})`}
                          className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#003399]"
                        />
                        <button
                          type="button"
                          onClick={() => setCashTendered(grandTotal)}
                          className="rounded-md border border-zinc-200 px-2 py-1 text-[10px] font-bold hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                        >
                          Exact
                        </button>
                        {[100, 500, 1000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setCashTendered((prev) =>
                                typeof prev === "number" ? prev + preset : grandTotal + preset
                              )
                            }
                            className="rounded-md border border-zinc-200 px-1.5 py-1 text-[10px] font-bold hover:bg-zinc-100 text-zinc-700 font-mono cursor-pointer"
                          >
                            +{preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Register Sale Button */}
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={isSubmittingOrder || lineItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#003399] py-3 text-xs font-black text-white shadow-md hover:bg-[#002B80] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizing POS Sale…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Sale ({formatCurrency(grandTotal, settings)})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {variantProduct && (
        <PosVariantModal
          open={Boolean(variantProduct)}
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
          onSelectVariant={handleSelectVariant}
        />
      )}

      {/* ── POS SALE COMPLETED SUCCESS SCREEN MODAL (#6) ─────── */}
      {completedOrder && !printDocumentState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCompletedOrder(null);
            }
          }}
        >
          <div className="flex flex-col w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Celebration Header */}
            <div className="bg-gradient-to-b from-emerald-50 to-emerald-100/60 px-6 pt-7 pb-5 text-center border-b border-emerald-100">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 mb-2.5">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                Sale Completed!
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                POS in-store transaction recorded & stock deducted
              </p>
            </div>

            {/* Order Details Summary */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500 font-medium">Order Number</span>
                  <span className="font-mono font-black text-sm text-zinc-900">
                    #{completedOrder.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Order Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide">
                    <CheckCircle2 className="h-3 w-3" />
                    {completedOrder.status || "delivered"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Payment Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide">
                    <CheckCircle2 className="h-3 w-3" />
                    {completedOrder.paymentStatus || "paid"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Payment Method</span>
                  <span className="font-bold text-zinc-800 uppercase font-mono">
                    {completedOrder.paymentMethod || "CASH"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Customer</span>
                  <span className="font-semibold text-zinc-800">
                    {completedOrder.customerName ||
                      completedOrder.customerId?.name ||
                      completedOrder.customerSnapshot?.name ||
                      "Walk-in Customer"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900">Total Paid</span>
                  <span className="font-mono text-base font-black text-[#003399]">
                    {formatCurrency(completedOrder.total || 0, settings)}
                  </span>
                </div>

                {completedOrder.changeAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold text-[11px] pt-1">
                    <span>Change Returned</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(completedOrder.changeAmount, settings)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Button Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => setPrintDocumentState({ order: completedOrder, format: "thermal" })}
                    className="h-10 gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold cursor-pointer text-xs"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Print Receipt</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPrintDocumentState({ order: completedOrder, format: "a4" })}
                    className="h-10 gap-1.5 rounded-xl border-zinc-300 hover:bg-zinc-100 font-bold cursor-pointer text-zinc-800 text-xs"
                  >
                    <FileText className="h-4 w-4" />
                    <span>A4 Invoice</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => {
                      setCompletedOrder(null);
                      setCashTendered("");
                    }}
                    className="h-9.5 rounded-xl bg-[#003399] hover:bg-[#002B80] text-white font-black cursor-pointer text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    New Sale
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      onClose();
                      router.push(`/store/${store?.slug || storeId}/orders`);
                    }}
                    className="h-9.5 rounded-xl font-bold cursor-pointer text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View Orders
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DUAL FORMAT PRINT PREVIEW MODAL ───────────────────── */}
      {printDocumentState && store && (
        <DocumentPreviewDialog
          open={Boolean(printDocumentState)}
          onClose={() => setPrintDocumentState(null)}
          title={
            printDocumentState.format === "thermal"
              ? `POS Receipt #${printDocumentState.order?.orderNumber || ""}`
              : `Invoice #${printDocumentState.order?.orderNumber || ""}`
          }
          defaultPageSize={printDocumentState.format === "thermal" ? "thermal-80" : "a4-portrait"}
          allowPageSizeSwitch={true}
        >
          {printDocumentState.format === "thermal" ? (
            <PosReceiptDocument
              store={{
                name: store?.name || "Store",
                address:
                  typeof (store as any)?.address === "string"
                    ? (store as any).address
                    : (store as any)?.address?.street || "",
                phone: (store as any)?.contactPhone || (store as any)?.phone || "",
                email: (store as any)?.contactEmail || (store as any)?.email || "",
                logoUrl: (store as any)?.logo,
              }}
              receipt={buildReceiptData(printDocumentState.order)}
            />
          ) : (
            <InvoiceDocument
              store={{
                name: store?.name || "Store",
                address:
                  typeof (store as any)?.address === "string"
                    ? (store as any).address
                    : (store as any)?.address?.street || "",
                phone: (store as any)?.contactPhone || (store as any)?.phone || "",
                email: (store as any)?.contactEmail || (store as any)?.email || "",
                logoUrl: (store as any)?.logo,
              }}
              invoice={buildInvoiceData(printDocumentState.order)}
            />
          )}
        </DocumentPreviewDialog>
      )}
    </>
  );
}

// ── FORMAT BUILDER HELPERS ──────────────────────────────────────
function buildReceiptData(order: any): PosReceiptData {
  const items =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items.map((it: any) => ({
          title: it.name || it.title || "Item",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.price ?? it.unitPrice ?? 0),
          discount: Number(it.discount ?? 0),
          total: Number(it.total ?? (Number(it.price ?? it.unitPrice ?? 0) * (Number(it.quantity) || 1))),
        }))
      : [
          {
            title: `In-Store Purchase (${order.itemCount || 1} items)`,
            quantity: order.itemCount || 1,
            unitPrice: Number(order.total || 0),
            total: Number(order.total || 0),
          },
        ];

  const subtotal = Number(order.subtotal ?? order.total ?? 0);
  const discount = Number(order.discount ?? 0);
  const tax = Number(order.tax ?? 0);
  const grandTotal = Number(order.total ?? 0);
  const tendered = Number(order.tenderedAmount || order.paymentDetails?.tenderedAmount || grandTotal);
  const change = Number(order.changeAmount || order.paymentDetails?.changeAmount || 0);

  return {
    receiptNumber: `REC-${order.orderNumber || String(order.id || order._id || "").slice(-6)}`,
    orderNumber: order.orderNumber,
    dateTime: order.createdAt ? new Date(order.createdAt) : new Date(),
    cashierName: "Register 1",
    customer: {
      name:
        order.customerName ||
        order.customerId?.name ||
        order.customerSnapshot?.name ||
        "Walk-in Customer",
      phone:
        order.customerPhone ||
        order.customerId?.phone ||
        order.customerSnapshot?.phone ||
        "",
    },
    items,
    subtotal,
    discount,
    tax,
    grandTotal,
    tenderedAmount: tendered,
    changeAmount: change,
    paymentMethod: String(order.paymentMethod || "CASH").toUpperCase(),
  };
}

function buildInvoiceData(order: any): InvoiceData {
  const items =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items.map((it: any, idx: number) => ({
          id: String(it.productId || it._id || idx),
          sku: it.sku || "",
          title: it.name || it.title || "Item",
          variantTitle: it.variantTitle || "",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.price ?? it.unitPrice ?? 0),
          discount: Number(it.discount ?? 0),
          tax: 0,
          total: Number(it.total ?? (Number(it.price ?? it.unitPrice ?? 0) * (Number(it.quantity) || 1))),
        }))
      : [
          {
            id: "1",
            title: `In-Store Sale (${order.itemCount || 1} items)`,
            quantity: order.itemCount || 1,
            unitPrice: Number(order.total || 0),
            total: Number(order.total || 0),
          },
        ];

  const subtotal = Number(order.subtotal ?? order.total ?? 0);
  const discountTotal = Number(order.discount ?? 0);
  const taxTotal = Number(order.tax ?? 0);
  const shippingCharge = Number(order.deliveryCharge ?? order.shipping ?? 0);
  const grandTotal = Number(order.total ?? 0);
  const isPaid = order.paymentStatus === "paid" || order.status === "delivered";

  return {
    invoiceNumber: order.invoiceNumber || `INV-${order.orderNumber || ""}`,
    orderNumber: order.orderNumber,
    issueDate: order.createdAt ? new Date(order.createdAt) : new Date(),
    status: isPaid ? "paid" : "unpaid",
    paymentMethod: String(order.paymentMethod || "CASH").toUpperCase(),
    customer: {
      name:
        order.customerName ||
        order.customerId?.name ||
        order.customerSnapshot?.name ||
        "Walk-in Customer",
      phone:
        order.customerPhone ||
        order.customerId?.phone ||
        order.customerSnapshot?.phone ||
        "",
      email:
        order.customerEmail ||
        order.customerId?.email ||
        order.customerSnapshot?.email ||
        "",
      billingAddress: order.customerSnapshot?.address || "Counter Sale Register",
    },
    items,
    subtotal,
    discountTotal,
    taxTotal,
    shippingCharge,
    grandTotal,
    paidAmount: isPaid ? grandTotal : 0,
    dueAmount: isPaid ? 0 : grandTotal,
  };
}
