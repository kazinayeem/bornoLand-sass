"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useGetProductsQuery, type Product, type ProductVariant } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreCustomersQuery } from "@/redux/api/store-customers-api";
import { useValidateCouponMutation, type ValidateCouponResponse } from "@/redux/api/coupon-api";
import { useCreateStoreOrderMutation } from "@/redux/api/store-order-api";
import { PosVariantModal } from "./pos-variant-modal";

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

export function PosOrderModal({
  open,
  storeId,
  onClose,
  onSuccess,
}: PosOrderModalProps) {
  const { store, settings } = useTenant();

  // Search & Catalog state
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

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
  const [shippingFee, setShippingFee] = useState(0);

  // API Hooks
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ storeId }, { skip: !open || !storeId });
  const { data: categoriesData } = useGetCategoriesQuery({ storeId }, { skip: !open || !storeId });
  const { data: customersData } = useGetStoreCustomersQuery({ storeId, search: customerSearch }, { skip: !open || !storeId });

  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const [createStoreOrder, { isLoading: isSubmittingOrder }] = useCreateStoreOrderMutation();

  const products = productsData?.data?.products ?? [];
  const categories = categoriesData?.data?.categories ?? [];
  const customers = customersData?.data?.customers ?? [];

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
      const matchCat = !selectedCategory || p.category === selectedCategory || (p.categoryIds && p.categoryIds.includes(selectedCategory));
      return matchSearch && matchCat;
    });
  }, [products, productSearch, selectedCategory]);

  if (!open) return null;

  // Add Product to POS Order Line
  const handleSelectProduct = (product: Product) => {
    const hasVariants = (product.options?.length ?? 0) > 0 || (product.variants?.length ?? 0) > 0;
    if (hasVariants) {
      setVariantProduct(product);
    } else {
      // Add simple product
      if (product.stock <= 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }

      setLineItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === product._id && !item.variantId);
        if (existingIndex > -1) {
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
            image: product.imageUrl || `https://placehold.co/100x100?text=Product`,
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
        const updated = [...prev];
        updated[index].quantity = Math.min(updated[index].stock || 999, newQty);
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

  // Complete POS Order Submission
  const handleCompleteOrder = async () => {
    if (isSubmittingOrder) return;
    if (lineItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const customerName = selectedCustomer ? selectedCustomer.name : "Walk-in Customer";
      const customerPhone = selectedCustomer ? selectedCustomer.phone : "";
      const customerEmail = selectedCustomer ? selectedCustomer.email : "";

      const payload = {
        storeId,
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
        shippingAddress: {
          fullName: customerName,
          phone: customerPhone || "01700000000",
          email: customerEmail,
          city: "POS Store Walk-in",
          street: "Counter Sales",
          orderNotes: `POS Counter Sale • Payment: ${paymentMethod.toUpperCase()}`,
        },
      };

      const res = await createStoreOrder({ storeId, body: payload }).unwrap();

      if (res.data?.order) {
        toast.success(`POS Order #${res.data.order.orderNumber} created!`);
        setLineItems([]);
        setAppliedCoupon(null);
        setProductSearch("");
        onSuccess?.();
        onClose();
      } else {
        toast.error((res as any).message || "Failed to create POS order");
      }

    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.message || "Failed to create POS order";
      toast.error(errorMsg);
    }
  };

  if (!open) return null;

  return (
    <div
      key="pos-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmittingOrder) onClose();
      }}
    >
      <div
        key="pos-modal-content"
        className="flex flex-col w-full max-w-6xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden text-apple-ink"
        style={{ height: "min(92vh, 850px)" }}
      >
        {/* Top POS Header Bar */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-6 bg-zinc-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-primary text-white font-bold text-xs">
                POS
              </div>
              <div>
                <h3 className="text-sm font-bold">{store?.name || "Store"} Terminal</h3>
                <p className="text-[10px] text-zinc-400">Point of Sale • Counter Register</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Customer Picker */}
              <div className="relative min-w-[200px]">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-1 text-xs text-white">
                    <span className="truncate font-semibold max-w-[130px]">{selectedCustomer.name}</span>
                    <button type="button" onClick={() => setSelectedCustomer(null)} className="ml-1 text-zinc-400 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Walk-in Customer (or search)"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-apple-primary"
                  />
                )}

                {/* Customer dropdown results */}
                {customerSearch && !selectedCustomer && customers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-36 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl divide-y divide-zinc-700">
                    {customers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setSelectedCustomer({ id: c._id, name: c.name, email: c.email, phone: c.phone });
                          setCustomerSearch("");
                        }}
                        className="p-2 hover:bg-zinc-700 cursor-pointer text-xs"
                      >
                        <p className="font-bold text-white">{c.name}</p>
                        <p className="text-[10px] text-zinc-400">{c.email} • {c.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main 2-Column POS Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
            {/* Left Column: Product Search & Catalog (7 cols) */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-50/50 p-4 min-h-0">
              {/* Product Search & Categories */}
              <div className="space-y-3 shrink-0 mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product name or SKU…"
                    className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-apple-ink focus:outline-none focus:ring-2 focus:ring-apple-primary/20 shadow-xs"
                  />
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className={cn(
                      "rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-all",
                      !selectedCategory ? "bg-apple-primary text-white font-bold" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={cn(
                        "rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-all",
                        selectedCategory === cat.name ? "bg-apple-primary text-white font-bold" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                {loadingProducts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 space-y-2">
                    <Package className="h-8 w-8 mx-auto" />
                    <p className="text-xs">No products match your search</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProducts.map((product) => {
                      const hasVariants = (product.options?.length ?? 0) > 0 || (product.variants?.length ?? 0) > 0;
                      return (
                        <div
                          key={product._id}
                          onClick={() => handleSelectProduct(product)}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xs transition-all hover:border-apple-primary/50 hover:shadow-md cursor-pointer"
                        >
                          <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-zinc-50 border border-zinc-100">
                            <img
                              src={product.imageUrl || `https://placehold.co/200x200?text=Product`}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            {hasVariants && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                Variants
                              </span>
                            )}
                          </div>

                          <h4 className="line-clamp-1 text-xs font-bold text-apple-ink">{product.name}</h4>
                          <p className="text-[10px] text-zinc-400 font-mono">SKU: {product.sku || "N/A"}</p>

                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-zinc-100">
                            <span className="text-xs font-extrabold text-apple-primary">
                              {formatCurrency(product.price, settings)}
                            </span>

                            <button
                              type="button"
                              className={cn(
                                "flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all",
                                hasVariants
                                  ? "bg-apple-primary/10 text-apple-primary hover:bg-apple-primary/20"
                                  : "bg-apple-primary text-white hover:opacity-90"
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
                )}
              </div>
            </div>

            {/* Right Column: POS Cart Order Lines & Checkout (5 cols) */}
            <div className="lg:col-span-5 flex flex-col bg-white p-4 min-h-0">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-3 shrink-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  POS Order Lines ({lineItems.length})
                </h4>
                {lineItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setLineItems([]);
                      setAppliedCoupon(null);
                    }}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
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
                    <p className="text-xs font-medium">No items in order</p>
                    <p className="text-[11px] text-zinc-400 max-w-[200px]">Select products from the catalog to build the register sale.</p>
                  </div>
                ) : (
                  lineItems.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.variantId || index}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white shadow-xs"
                    >
                      {/* Image Thumbnail */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                        <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                      </div>

                      {/* Product Name, Variant Title, SKU & Price calculation */}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold truncate text-apple-ink">{item.productName}</h5>
                        {item.variantTitle && (
                          <span className="inline-block rounded-md bg-apple-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-apple-primary mb-0.5">
                            {item.variantTitle}
                          </span>
                        )}
                        <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</p>

                        <p className="text-xs font-bold text-apple-ink mt-1">
                          {formatCurrency(item.price, settings)} × {item.quantity} ={" "}
                          <span className="text-apple-primary">{formatCurrency(item.price * item.quantity, settings)}</span>
                        </p>
                      </div>

                      {/* Quantity adjustment & Remove */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-zinc-600 shadow-xs hover:bg-zinc-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-zinc-600 shadow-xs hover:bg-zinc-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-zinc-400 hover:text-red-600"
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
              <div className="border-t border-zinc-200 pt-3 mt-3 shrink-0 space-y-3 bg-zinc-50/50 p-3 rounded-xl">
                {/* Coupon Input */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <span className="truncate">Coupon "{appliedCoupon.coupon.code}" applied</span>
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
                      placeholder="Coupon Code"
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-mono font-bold uppercase focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {isValidatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                    </button>
                  </form>
                )}

                {/* Totals Summary */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, settings)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount, settings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-apple-ink pt-1 border-t border-zinc-200">
                    <span>Total Pay</span>
                    <span className="text-apple-primary">{formatCurrency(grandTotal, settings)}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment Method</label>
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
                            "flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all gap-1",
                            active
                              ? "border-apple-primary bg-apple-primary text-white font-bold shadow-xs"
                              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Register Sale Button */}
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={isSubmittingOrder || lineItems.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmittingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Complete POS Order ({formatCurrency(grandTotal, settings)})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* POS Variant Selector Modal */}
        <PosVariantModal
          open={!!variantProduct}
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
          onSelectVariant={handleSelectVariant}
        />
      </div>
  );
}
