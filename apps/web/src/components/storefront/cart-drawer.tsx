"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import type { RootState } from "@/redux/store";
import { closeCart, updateQuantity, removeFromCart } from "@/redux/slices/cart-slice";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { useStorefrontSurface, StorefrontButton } from "./storefront-ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? ""}`} className={cn("flex gap-3 p-3 rounded-xl border border-border bg-card shadow-sm", classes.card)}>
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50", classes.imageWell)}>
                    <ShoppingBag className="h-6 w-6 text-primary/30" style={{ color: `${primaryColor}30` }} />
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

            <div className="border-t border-border p-4 bg-muted/20">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(subtotal, settings)}</span>
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
