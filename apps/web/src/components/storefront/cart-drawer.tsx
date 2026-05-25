"use client";

import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import type { RootState } from "@/redux/store";
import { closeCart, updateQuantity, removeFromCart } from "@/redux/slices/cart-slice";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";

type CartDrawerProps = {
  primaryColor: string;
};

export function CartDrawer({ primaryColor }: CartDrawerProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { settings } = useTenant();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);
  const [updateRemote] = useUpdateCartItemMutation();
  const [removeRemote] = useRemoveFromCartMutation();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
      removeRemote(productId);
    } else {
      dispatch(updateQuantity({ productId, quantity }));
      updateRemote({ productId, quantity });
    }
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => dispatch(closeCart())} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" style={{ color: primaryColor }} />
                <span className="font-semibold text-zinc-900">Cart ({itemCount})</span>
              </div>
              <button onClick={() => dispatch(closeCart())} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
                <ShoppingBag className="h-12 w-12 text-zinc-200" />
                <p className="text-sm text-zinc-400">Your cart is empty</p>
                <button onClick={handleContinueShopping}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3 rounded-xl border border-zinc-100 p-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-50">
                          <ShoppingBag className="h-6 w-6" style={{ color: `${primaryColor}30` }} />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-zinc-900 truncate max-w-[180px]">{item.name}</p>
                            <button onClick={() => handleRemove(item.productId)} className="text-zinc-300 hover:text-red-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                            {formatCurrency(item.price * item.quantity, settings)}
                          </p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-zinc-700">{item.quantity}</span>
                            <button onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Subtotal</span>
                    <span className="text-lg font-bold text-zinc-900">{formatCurrency(subtotal, settings)}</span>
                  </div>
                  <button onClick={handleViewCart}
                    className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{ borderRadius: "0.5rem", backgroundColor: primaryColor }}>
                    View Cart <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
