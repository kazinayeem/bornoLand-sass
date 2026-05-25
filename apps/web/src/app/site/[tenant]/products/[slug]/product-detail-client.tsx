"use client";

import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, ArrowLeft } from "lucide-react";
import { addToCart, openCart } from "@/redux/slices/cart-slice";
import { toggleWishlist } from "@/redux/slices/wishlist-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { ProductCard } from "@/components/storefront/product-card";
import { useTenant } from "@/providers/tenant-provider";

type Product = {
  _id: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; sku: string;
  images: string[]; featured: boolean;
};

export function ProductDetailClient({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme, products } = useTenant();
  const { primaryColor, darkMode } = theme;
  const [addToCartRemote] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isDark = darkMode;

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p._id !== product._id && p.category === product.category && p.status === "active")
      .slice(0, 4);
  }, [products, product]);

  const handleAddToCart = async () => {
    dispatch(addToCart({
      productId: product._id, name: product.name,
      price: product.price, quantity, image: product.images?.[0] ?? ""
    }));
    try { await addToCartRemote({ productId: product._id, quantity }).unwrap(); } catch {}
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    dispatch(openCart());
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl"
          style={{ backgroundColor: isDark ? "#18181b" : "#f4f4f5" }}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ShoppingCart className="h-24 w-24" style={{ color: isDark ? "#27272a" : "#d4d4d8" }} />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
              {product.category}
            </span>
            {product.featured && (
              <span className="rounded-full bg-amber-50 px-3 py-0.5 text-[11px] font-medium text-amber-600">Featured</span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-0.5 text-[11px] font-medium text-red-500">Only {product.stock} left</span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{product.name}</h1>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-4 w-4 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
            ))}
            <span className="ml-1 text-sm" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>(24 reviews)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>${product.price.toFixed(2)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-lg line-through" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>${product.comparePrice.toFixed(2)}</span>
                <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-bold text-red-500">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-4 leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>{product.description || "No description available."}</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl p-1"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", borderWidth: 1, borderStyle: "solid" }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ color: isDark ? "#a1a1aa" : "#71717a" }}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>{product.stock} in stock</span>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}>
              {added ? "Added!" : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
            </button>
            <button onClick={handleBuyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ borderColor: primaryColor, color: primaryColor }}>
              Buy Now
            </button>
            <button onClick={() => dispatch(toggleWishlist({
              productId: product._id, name: product.name,
              price: product.price, image: product.images?.[0] ?? ""
            }))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border text-zinc-400 hover:bg-zinc-50 hover:text-red-400"
              style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 space-y-3 rounded-xl p-4"
            style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", borderWidth: 1, borderStyle: "solid" }}>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5" style={{ color: isDark ? "#52525b" : "#a1a1aa" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Free shipping on orders over $100</p>
                <p className="text-xs" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>Estimated delivery: 3-5 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" style={{ color: isDark ? "#52525b" : "#a1a1aa" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Secure checkout</p>
                <p className="text-xs" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>SSL encrypted payment</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>SKU: {product.sku}</p>
        </motion.div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Related Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
