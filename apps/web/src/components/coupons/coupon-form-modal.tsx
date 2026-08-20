"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Search, Check, Tag, Users, Package, Calendar, Loader2, DollarSign, Percent, Truck, Gift } from "lucide-react";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetStoreCustomersQuery } from "@/redux/api/store-customers-api";
import type { Coupon, CouponType, CouponStatus } from "@/redux/api/coupon-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CouponFormModalProps = {
  open: boolean;
  storeId: string;
  initialData?: Coupon | null;
  onClose: () => void;
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
  isLoading?: boolean;
};

export function CouponFormModal({
  open,
  storeId,
  initialData,
  onClose,
  onSubmit,
  isLoading = false,
}: CouponFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [value, setValue] = useState(10);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [getQuantity, setGetQuantity] = useState(1);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
  const [maximumDiscount, setMaximumDiscount] = useState(0);
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [usageLimit, setUsageLimit] = useState(0);
  const [usagePerCustomer, setUsagePerCustomer] = useState(0);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState<CouponStatus>("active");

  // Targeting scope selections
  const [productScope, setProductScope] = useState<"all" | "products" | "categories">("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [customerScope, setCustomerScope] = useState<"all" | "customers">("all");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Search queries for pickers
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Queries for pickers
  const { data: productsData } = useGetProductsQuery({ storeId }, { skip: !open || !storeId });
  const { data: categoriesData } = useGetCategoriesQuery({ storeId }, { skip: !open || !storeId });
  const { data: customersData } = useGetStoreCustomersQuery({ storeId, search: customerSearch }, { skip: !open || !storeId });

  const productsList = productsData?.data?.products ?? [];
  const categoriesList = categoriesData?.data?.categories ?? [];
  const customersList = customersData?.data?.customers ?? [];

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || "");
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setType(initialData.type || "percentage");
      setValue(initialData.value || 0);
      setBuyQuantity(initialData.buyQuantity || 1);
      setGetQuantity(initialData.getQuantity || 1);
      setMinimumOrderAmount(initialData.minimumOrderAmount || 0);
      setMaximumDiscount(initialData.maximumDiscount || 0);
      setFirstOrderOnly(initialData.firstOrderOnly || false);
      setUsageLimit(initialData.usageLimit || 0);
      setUsagePerCustomer(initialData.usagePerCustomer || 0);
      setStartsAt(initialData.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : "");
      setExpiresAt(initialData.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : "");
      setStatus(initialData.status || "active");

      const pIds = (initialData.productIds || []).map((p: any) => typeof p === "string" ? p : p._id);
      const cIds = (initialData.categoryIds || []).map((c: any) => typeof c === "string" ? c : c._id);
      const custIds = (initialData.customerIds || []).map((cust: any) => typeof cust === "string" ? cust : cust._id);

      if (pIds.length > 0) {
        setProductScope("products");
        setSelectedProductIds(pIds);
      } else if (cIds.length > 0) {
        setProductScope("categories");
        setSelectedCategoryIds(cIds);
      } else {
        setProductScope("all");
      }

      if (custIds.length > 0) {
        setCustomerScope("customers");
        setSelectedCustomerIds(custIds);
      } else {
        setCustomerScope("all");
      }
    } else {
      setCode("");
      setName("");
      setDescription("");
      setType("percentage");
      setValue(10);
      setBuyQuantity(1);
      setGetQuantity(1);
      setMinimumOrderAmount(0);
      setMaximumDiscount(0);
      setFirstOrderOnly(false);
      setUsageLimit(0);
      setUsagePerCustomer(0);
      setStartsAt("");
      setExpiresAt("");
      setStatus("active");
      setProductScope("all");
      setSelectedProductIds([]);
      setSelectedCategoryIds([]);
      setCustomerScope("all");
      setSelectedCustomerIds([]);
    }
  }, [initialData, open]);

  if (!open) return null;

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!name.trim()) {
      toast.error("Coupon name is required");
      return;
    }

    const payload: Partial<Coupon> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      type,
      value: Number(value) || 0,
      buyQuantity: Number(buyQuantity) || 0,
      getQuantity: Number(getQuantity) || 0,
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscount: Number(maximumDiscount) || 0,
      firstOrderOnly,
      usageLimit: Number(usageLimit) || 0,
      usagePerCustomer: Number(usagePerCustomer) || 0,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      status,
      productIds: productScope === "products" ? selectedProductIds : [],
      categoryIds: productScope === "categories" ? selectedCategoryIds : [],
      customerIds: customerScope === "customers" ? selectedCustomerIds : [],
    };

    await onSubmit(payload);
  };

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="flex flex-col w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden"
          style={{ maxHeight: "min(90vh, 800px)" }}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-6 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-apple-primary" />
              <h3 className="text-sm font-bold text-apple-ink">
                {initialData ? "Edit Coupon" : "Create New Coupon"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Body */}
          <form id="coupon-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-apple-ink">
            {/* Section 1: Basic Info & Code */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Basic Information</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SAVE20"
                      className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100"
                      title="Generate random code"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Auto
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Promotion Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Sale 20% Off"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Internal Description / Note</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional internal note for campaign reference"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                />
              </div>
            </div>

            {/* Section 2: Discount Type & Values */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Discount Configuration</h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "percentage", label: "Percentage %", icon: Percent },
                  { id: "fixed", label: "Fixed Amount", icon: DollarSign },
                  { id: "free_shipping", label: "Free Shipping", icon: Truck },
                  { id: "buy_x_get_y", label: "Buy X Get Y", icon: Gift },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = type === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as CouponType)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5",
                        active
                          ? "border-apple-primary bg-apple-primary/5 text-apple-primary font-bold shadow-xs"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Value / Quantities */}
              {type === "percentage" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold">Discount Percentage (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Maximum Discount Amount (BDT)</label>
                    <input
                      type="number"
                      min={0}
                      value={maximumDiscount}
                      onChange={(e) => setMaximumDiscount(Number(e.target.value))}
                      placeholder="0 for unlimited max cap"
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                    />
                  </div>
                </div>
              )}

              {type === "fixed" && (
                <div className="space-y-1">
                  <label className="font-semibold">Discount Amount (BDT) *</label>
                  <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>
              )}

              {type === "buy_x_get_y" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold">Customer Buys (Qty)</label>
                    <input
                      type="number"
                      min={1}
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Customer Gets (Qty Free/Discounted)</label>
                    <input
                      type="number"
                      min={1}
                      value={getQuantity}
                      onChange={(e) => setGetQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Limits & Requirements */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Limits & Requirements</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold">Minimum Order Amount (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
                    placeholder="0 for no min subtotal"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Total Usage Limit</label>
                  <input
                    type="number"
                    min={0}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    placeholder="0 for unlimited total uses"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Usage Limit Per Customer</label>
                  <input
                    type="number"
                    min={0}
                    value={usagePerCustomer}
                    onChange={(e) => setUsagePerCustomer(Number(e.target.value))}
                    placeholder="0 for unlimited per customer"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="firstOrderOnly"
                  checked={firstOrderOnly}
                  onChange={(e) => setFirstOrderOnly(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-zinc-300 text-apple-primary focus:ring-apple-primary"
                />
                <label htmlFor="firstOrderOnly" className="text-xs font-semibold cursor-pointer select-none">
                  Valid for first-time customer orders only
                </label>
              </div>
            </div>

            {/* Section 4: Product Eligibility */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Product Targeting</h4>

              <div className="flex items-center gap-4">
                {[
                  { id: "all", label: "All Products" },
                  { id: "products", label: "Specific Products" },
                  { id: "categories", label: "Specific Categories" },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="productScope"
                      checked={productScope === item.id}
                      onChange={() => setProductScope(item.id as any)}
                      className="text-apple-primary focus:ring-apple-primary"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Specific Products Search Picker */}
              {productScope === "products" && (
                <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search store products…"
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
                    {filteredProducts.map((p) => {
                      const selected = selectedProductIds.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => {
                            setSelectedProductIds((prev) =>
                              selected ? prev.filter((id) => id !== p._id) : [...prev, p._id]
                            );
                          }}
                          className="flex items-center justify-between p-2 hover:bg-zinc-50 cursor-pointer"
                        >
                          <span className="font-semibold truncate max-w-xs">{p.name}</span>
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border text-xs", selected ? "border-apple-primary bg-apple-primary text-white" : "border-zinc-300")}>
                            {selected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-zinc-400">{selectedProductIds.length} product(s) selected</span>
                </div>
              )}

              {/* Specific Categories Picker */}
              {productScope === "categories" && (
                <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
                  <div className="max-h-36 overflow-y-auto divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
                    {categoriesList.map((cat) => {
                      const selected = selectedCategoryIds.includes(cat._id);
                      return (
                        <div
                          key={cat._id}
                          onClick={() => {
                            setSelectedCategoryIds((prev) =>
                              selected ? prev.filter((id) => id !== cat._id) : [...prev, cat._id]
                            );
                          }}
                          className="flex items-center justify-between p-2 hover:bg-zinc-50 cursor-pointer"
                        >
                          <span className="font-semibold">{cat.name}</span>
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border text-xs", selected ? "border-apple-primary bg-apple-primary text-white" : "border-zinc-300")}>
                            {selected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-zinc-400">{selectedCategoryIds.length} category(ies) selected</span>
                </div>
              )}
            </div>

            {/* Section 5: Customer Targeting */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Customer Targeting</h4>

              <div className="flex items-center gap-4">
                {[
                  { id: "all", label: "All Customers" },
                  { id: "customers", label: "Specific Customers" },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="customerScope"
                      checked={customerScope === item.id}
                      onChange={() => setCustomerScope(item.id as any)}
                      className="text-apple-primary focus:ring-apple-primary"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Specific Customers Search Picker */}
              {customerScope === "customers" && (
                <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search customers by name, email, or phone…"
                      className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
                    {customersList.map((cust) => {
                      const selected = selectedCustomerIds.includes(cust._id);
                      const displayName = cust.name || cust.email || "Customer";

                      return (
                        <div
                          key={cust._id}
                          onClick={() => {
                            setSelectedCustomerIds((prev) =>
                              selected ? prev.filter((id) => id !== cust._id) : [...prev, cust._id]
                            );
                          }}
                          className="flex items-center justify-between p-2 hover:bg-zinc-50 cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-apple-ink">{displayName}</p>
                            <p className="text-[10px] text-zinc-400">{cust.email} {cust.phone ? `• ${cust.phone}` : ""}</p>
                          </div>
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border text-xs", selected ? "border-apple-primary bg-apple-primary text-white" : "border-zinc-300")}>
                            {selected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-zinc-400">{selectedCustomerIds.length} customer(s) selected</span>
                </div>
              )}
            </div>

            {/* Section 6: Dates & Active Status */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Schedule & Availability</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CouponStatus)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-3 bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="coupon-form"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-apple-primary px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialData ? "Save Coupon" : "Create Coupon"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
