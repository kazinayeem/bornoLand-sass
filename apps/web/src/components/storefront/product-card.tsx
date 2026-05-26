"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart } from "@/redux/slices/cart-slice";
import { toggleWishlist } from "@/redux/slices/wishlist-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { QuickViewModal } from "./quick-view-modal";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { getProductImageUrl } from "@/lib/product-media";

type ProductCardProps = {
  product: {
    _id: string; storeId?: string; name: string; slug: string;
    description?: string; price: number; comparePrice?: number;
    category: string; stock: number; status?: string;
    sku?: string; images?: string[]; featured?: boolean;
    categoryIds?: string[];
    createdAt?: string; updatedAt?: string;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme, settings, categories } = useTenant();
  const { primaryColor, buttonStyle, font, darkMode } = theme;
  const categoryName = product.categoryIds?.length
    ? categories.find((c) => product.categoryIds!.includes(c._id))?.name ?? product.category
    : product.category;
  const [addToCartRemote] = useAddToCartMutation();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const isDark = darkMode;
  const isOutOfStock = product.stock <= 0;

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;
    dispatch(addToCart({
      productId: product._id, name: product.name,
      price: product.price, quantity: 1, image: getProductImageUrl(product)
    }));
    addToCartRemote({ productId: product._id, quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setQuickViewOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleWishlist({
      productId: product._id, name: product.name,
      price: product.price, image: getProductImageUrl(product)
    }));
  };

  const handleNav = () => {
    router.push(`/products/${product.slug}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={handleNav}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1"
        style={{
          borderColor: isDark ? "#27272a" : "#e4e4e7",
          fontFamily: font,
          backgroundColor: isDark ? "#18181b" : "#ffffff"
        }}>
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: isDark ? "#09090b" : "#f4f4f5" }}>
          {getProductImageUrl(product) ? (
            <Image src={getProductImageUrl(product)} alt={product.name}
              fill className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-12 w-12" style={{ color: `${primaryColor}30` }} />
            </div>
          )}

          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-lg px-2 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "#ef4444" }}>
              -{discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute left-3 top-3 rounded-lg bg-zinc-800/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              Out of Stock
            </span>
          )}

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={handleAddToCart}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
              style={{ color: primaryColor }}>
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button onClick={handleQuickView}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 text-zinc-600">
              <Eye className="h-5 w-5" />
            </button>
            <button onClick={handleWishlist}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 text-zinc-600 hover:text-red-400">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: primaryColor }}>
            {categoryName}
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-3 w-3 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
            ))}
            <span className="ml-1 text-[10px]" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>(24)</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
                {formatCurrency(product.price, settings)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm line-through" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>{formatCurrency(product.comparePrice, settings)}</span>
              )}
            </div>
            <span className="text-[11px]" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>{product.stock} left</span>
          </div>
          {!isOutOfStock && (
            <button onClick={handleAddToCart}
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
            </button>
          )}
        </div>
      </motion.div>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
