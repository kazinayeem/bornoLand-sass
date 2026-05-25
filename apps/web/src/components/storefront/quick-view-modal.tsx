"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart, openCart } from "@/redux/slices/cart-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { toast } from "sonner";

type ProductData = {
  _id: string; name: string; slug: string;
  description?: string; price: number; comparePrice?: number;
  category: string; stock: number;
  images?: string[];
};

type Props = { product: ProductData; onClose: () => void };

export function QuickViewModal({ product, onClose }: Props) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useTenant();
  const { primaryColor, buttonStyle } = theme;
  const [addToCartRemote] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product._id, name: product.name,
      price: product.price, quantity, image: product.images?.[0] ?? ""
    }));
    addToCartRemote({ productId: product._id, quantity });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    dispatch(openCart());
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-lg bg-white/80 p-1.5 text-zinc-400 hover:bg-white hover:text-zinc-600 shadow-sm">
          <X className="h-5 w-5" />
        </button>

        <div className="flex aspect-square items-center justify-center bg-zinc-50 p-8">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ShoppingCart className="h-20 w-20" style={{ color: `${primaryColor}30` }} />
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: primaryColor }}>{product.category}</p>
          <h2 className="mt-1 text-lg font-bold text-zinc-900">{product.name}</h2>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-bold text-zinc-900">${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-zinc-400 line-through">${product.comparePrice.toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-500">-{discount}%</span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-3.5 w-3.5 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
            ))}
            <span className="ml-1 text-xs text-zinc-400">(24 reviews)</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{product.description || "No description available."}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-zinc-400">{product.stock} in stock</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-zinc-700">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button onClick={handleBuyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-all hover:opacity-90"
              style={{ borderRadius: buttonStyle, borderColor: primaryColor, color: primaryColor }}>
              Buy Now
            </button>
          </div>

          <button onClick={() => { onClose(); router.push(`/products/${product.slug}`); }}
            className="mt-2 w-full text-center text-xs underline underline-offset-2"
            style={{ color: "#a1a1aa" }}>
            View Full Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
