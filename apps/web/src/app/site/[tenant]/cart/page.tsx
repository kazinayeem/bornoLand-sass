"use client";

import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import type { RootState } from "@/redux/store";
import { updateQuantity, removeFromCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { SmartImage } from "@/components/ui/smart-image";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontCard,
  StorefrontButtonLink,
  StorefrontEmptyState,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const dispatch = useDispatch();
  const { settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const { items } = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeThreshold = settings.freeShippingEnabled ? (settings.freeShippingMin ?? 0) : (settings.currencyCode === "BDT" ? 5000 : 100);
  const defaultShippingRate = settings.currencyCode === "BDT" ? 99 : 9.99;
  const shipping = settings.freeShippingEnabled && subtotal >= freeThreshold ? 0 : defaultShippingRate;
  const taxRate = settings.taxEnabled ? (settings.taxRate ?? 0) : 0;
  const taxAmount = taxRate > 0 && !settings.taxIncluded ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + taxAmount + shipping;

  const handleQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  if (items.length === 0) {
    return (
      <StorefrontEmptyState
        icon={<ShoppingBag className="h-16 w-16" />}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet."
        action={
          <StorefrontButtonLink href="/">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </StorefrontButtonLink>
        }
      />
    );
  }

  return (
    <StorefrontPage maxWidth="md">
      <StorefrontPageHeader title="Shopping Cart" />

      <div className="grid gap-apple-xl lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item, idx) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <StorefrontCard className="flex gap-4 !p-4">
                <div className={cn("relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-apple-sm", classes.imageWell)}>
                  {item.image ? (
                    <SmartImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-apple-ink-muted-48/40" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h3 className={cn("text-body-strong", classes.heading)}>{item.name}</h3>
                      <p className="mt-0.5 text-body text-apple-primary" style={{ color: primaryColor }}>
                        {formatCurrency(item.price, settings)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      aria-label="Remove item"
                      className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-apple-ink-muted-48 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex items-center gap-2 rounded-apple-sm border p-0.5", classes.divider)}>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                        className={cn("flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-apple-xs", classes.muted)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className={cn("w-8 text-center text-caption font-medium", classes.heading)}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                        className={cn("flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-apple-xs", classes.muted)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className={cn("text-body font-semibold", classes.heading)}>
                      {formatCurrency(item.price * item.quantity, settings)}
                    </span>
                  </div>
                </div>
              </StorefrontCard>
            </motion.div>
          ))}
        </div>

        <StorefrontCard className="h-fit">
          <h3 className={cn("mb-4 text-body-strong", classes.heading)}>Order Summary</h3>
          <div className="space-y-2 text-caption">
            <div className={cn("flex justify-between", classes.muted)}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, settings)}</span>
            </div>
            <div className={cn("flex justify-between", classes.muted)}>
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatCurrency(shipping, settings)}</span>
            </div>
            {taxAmount > 0 && (
              <div className={cn("flex justify-between", classes.muted)}>
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount, settings)}</span>
              </div>
            )}
            {settings.freeShippingEnabled && subtotal < freeThreshold && (
              <p className="text-fine-print text-apple-ink-muted-48">
                Free shipping on orders over {formatCurrency(freeThreshold, settings)}
              </p>
            )}
            <div className={cn("border-t pt-2", classes.divider)}>
              <div className={cn("flex justify-between text-body-strong", classes.heading)}>
                <span>Total</span>
                <span>{formatCurrency(total, settings)}</span>
              </div>
            </div>
          </div>
          <StorefrontButtonLink href="/checkout" className="mt-4 w-full">
            Checkout <ArrowRight className="h-4 w-4" />
          </StorefrontButtonLink>
          <StorefrontButtonLink href="/" variant="secondary" className="mt-2 w-full text-fine-print">
            <ArrowLeft className="h-3 w-3" /> Continue Shopping
          </StorefrontButtonLink>
        </StorefrontCard>
      </div>
    </StorefrontPage>
  );
}
