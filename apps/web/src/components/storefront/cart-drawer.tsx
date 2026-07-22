"use client";

import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import type { RootState } from "@/redux/store";
import { closeCart, updateQuantity, removeFromCart } from "@/redux/slices/cart-slice";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { useStorefrontSurface, StorefrontButton } from "./storefront-ui";
import { cn } from "@/lib/utils";

type CartDrawerProps = {
  primaryColor: string;
};

export function CartDrawer({ primaryColor }: CartDrawerProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { settings } = useTenant();
  const { classes } = useStorefrontSurface();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);
  const [updateRemote] = useUpdateCartItemMutation();
  const [removeRemote] = useRemoveFromCartMutation();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({ productId, variantId }));
      removeRemote(productId);
    } else {
      dispatch(updateQuantity({ productId, variantId, quantity }));
      updateRemote({ productId, quantity, variantId });
    }
  };

  const handleRemove = (productId: string, variantId: string | undefined) => {
    dispatch(removeFromCart({ productId, variantId }));
    removeRemote(productId);
  };

  const handleViewCart = () => {
    dispatch(closeCart());
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    dispatch(closeCart());
    router.push("/shop");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-apple-surface-black/20 backdrop-blur-sm"
            onClick={() => dispatch(closeCart())}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-apple-hairline bg-apple-canvas"
          >
            <div className={cn("flex items-center justify-between border-b p-4", classes.divider)}>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-apple-primary" style={{ color: primaryColor }} />
                <span className="text-body-strong text-apple-ink">Cart ({itemCount})</span>
              </div>
              <button
                type="button"
                onClick={() => dispatch(closeCart())}
                aria-label="Close cart"
                className={classes.iconBtn}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
                <ShoppingBag className="h-12 w-12 text-apple-ink-muted-48/40" />
                <p className="text-caption text-apple-ink-muted-48">Your cart is empty</p>
                <StorefrontButton variant="utility" size="compact" onClick={handleContinueShopping}>
                  Continue Shopping
                </StorefrontButton>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.variantId ?? ""}`} className={cn("flex gap-3 p-3", classes.card)}>
                        <div className={cn("flex h-16 w-16 items-center justify-center rounded-apple-sm", classes.imageWell)}>
                          <ShoppingBag className="h-6 w-6 text-apple-primary/30" style={{ color: `${primaryColor}30` }} />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between">
                            <div>
                              <p className="line-clamp-2 text-caption font-medium text-apple-ink">{item.name}</p>
                              {item.variantTitle && (
                                <p className="text-fine-print text-apple-ink-muted-48">{item.variantTitle}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemove(item.productId, item.variantId)}
                              aria-label={`Remove ${item.name}`}
                              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-apple-ink-muted-48 transition-colors hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-caption font-semibold text-apple-primary" style={{ color: primaryColor }}>
                            {formatCurrency(item.price * item.quantity, settings)}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantity(item.productId, item.variantId, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className={cn(
                                "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-apple-xs border text-apple-ink-muted-48",
                                classes.divider
                              )}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-fine-print font-medium text-apple-ink-muted-80">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantity(item.productId, item.variantId, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className={cn(
                                "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-apple-xs border text-apple-ink-muted-48",
                                classes.divider
                              )}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cn("border-t p-4", classes.divider)}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-caption text-apple-ink-muted-48">Subtotal</span>
                    <span className="text-body-strong text-apple-ink">{formatCurrency(subtotal, settings)}</span>
                  </div>
                  <StorefrontButton className="w-full" onClick={handleViewCart}>
                    View Cart <ArrowRight className="h-4 w-4" />
                  </StorefrontButton>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
