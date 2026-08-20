"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Check, X, Loader2 } from "lucide-react";
import type { RootState } from "@/redux/store";
import { closeCart, updateQuantity, removeFromCart } from "@/redux/slices/cart-slice";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cart-api";
import { useValidateCouponMutation, type ValidateCouponResponse } from "@/redux/api/coupon-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { useStorefrontSurface, StorefrontButton } from "./storefront-ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CartDrawerProps = {
  primaryColor: string;
};

export function CartDrawer({ primaryColor }: CartDrawerProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { store, settings } = useTenant();
  const { classes } = useStorefrontSurface();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);

  const [updateRemote] = useUpdateCartItemMutation();
  const [removeRemote] = useRemoveFromCartMutation();
  const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!store?._id) {
      toast.error("Store configuration missing");
      return;
    }

    try {
      const res = await validateCoupon({
        storeId: store._id,
        code: couponCode.trim(),
        subtotal,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      }).unwrap();

      if (res.data?.valid) {
        setAppliedCoupon(res.data);
        toast.success(`Coupon "${res.data.coupon.code}" applied!`);
      } else {
        toast.error(res.message || "Invalid coupon code");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({ productId, variantId }));
      removeRemote(productId);
    } else {
      dispatch(updateQuantity({ productId, variantId, quantity }));
      updateRemote({ productId, quantity, variantId });
    }
    // Reset coupon validation if subtotal changed
    setAppliedCoupon(null);
  };

  const handleRemove = (productId: string, variantId: string | undefined) => {
    dispatch(removeFromCart({ productId, variantId }));
    removeRemote(productId);
    setAppliedCoupon(null);
  };

  const handleViewCart = () => {
    dispatch(closeCart());
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    dispatch(closeCart());
    router.push("/shop");
  };

  const discountAmount = appliedCoupon?.discount ?? 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && dispatch(closeCart())}>
      <SheetContent side="right" className="flex h-full w-full max-w-md flex-col p-0 border-l border-border bg-card">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" style={{ color: primaryColor }} />
            <span>Cart ({itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground font-medium">Your cart is empty</p>
            <StorefrontButton variant="utility" size="compact" onClick={handleContinueShopping}>
              Continue Shopping
            </StorefrontButton>
          </div>
        ) : (
          <>
            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? ""}`} className={cn("flex gap-3 p-3 rounded-xl border border-border bg-card shadow-sm", classes.card)}>
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50", classes.imageWell)}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-primary/30" style={{ color: `${primaryColor}30` }} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <p className="line-clamp-2 text-xs font-semibold text-foreground">{item.name}</p>
                        {item.variantTitle && (
                          <p className="text-[11px] text-muted-foreground">{item.variantTitle}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId, item.variantId)}
                        aria-label={`Remove ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-primary" style={{ color: primaryColor }}>
                      {formatCurrency(item.price * item.quantity, settings)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.productId, item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.productId, item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input & Footer */}
            <div className="border-t border-border p-4 bg-muted/20 space-y-3">
              {/* Coupon Form / Applied Coupon Badge */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <span>Coupon "{appliedCoupon.coupon.code}" applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100"
                    title="Remove coupon"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isValidating || !couponCode.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isValidating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                  </button>
                </form>
              )}

              {/* Subtotal & Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, settings)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between font-bold text-emerald-600">
                    <span>Discount ({appliedCoupon?.coupon?.code})</span>
                    <span>-{formatCurrency(discountAmount, settings)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal, settings)}</span>
                </div>
              </div>

              <StorefrontButton className="w-full" onClick={handleViewCart}>
                View Cart <ArrowRight className="h-4 w-4" />
              </StorefrontButton>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
