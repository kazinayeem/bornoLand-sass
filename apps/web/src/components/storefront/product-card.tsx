"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { StoreLink as Link } from "./store-link";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cart-slice";
import { toggleWishlist } from "@/redux/slices/wishlist-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { useTenant } from "@/providers/tenant-provider";
import { useIsBuilder } from "@/lib/device-context";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { getProductImageUrl } from "@/lib/product-media";
import { SmartImage } from "@/components/ui/smart-image";

const QuickViewModal = dynamic(
  () => import("./quick-view-modal").then((module) => module.QuickViewModal),
  { loading: () => null }
);

export type ProductCardProduct = {
  _id: string; storeId?: string; name: string; slug: string;
  description?: string; price: number; comparePrice?: number;
  category: string; stock: number; status?: string;
  sku?: string; images?: string[]; imageUrl?: string; thumbnailUrl?: string;
  featured?: boolean;
  categoryIds?: string[];
  createdAt?: string; updatedAt?: string;
};

type ProductCardProps = {
  product: ProductCardProduct;
  badge?: ReactNode;
};

export function ProductCard({ product, badge }: ProductCardProps) {
  const isBuilder = useIsBuilder();
  const dispatch = useDispatch();
  const { theme, settings } = useTenant();
  const { primaryColor, buttonStyle, font, darkMode } = theme;
  const [addToCartRemote] = useAddToCartMutation();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const isDark = darkMode;
  const isOutOfStock = product.stock <= 0;
  const imageUrl = useMemo(() => getProductImageUrl(product), [product]);

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock || isBuilder) return;
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
    if (isBuilder) return;
    setQuickViewOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isBuilder) return;
    dispatch(toggleWishlist({
      productId: product._id, name: product.name,
      price: product.price, image: getProductImageUrl(product)
    }));
  };

  const navHref = isBuilder ? "#" : `/products/${product.slug}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative flex flex-col overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas p-3 transition-colors"
        style={{
          borderColor: isDark ? "#27272a" : "#e4e4e7",
          fontFamily: font,
          backgroundColor: isDark ? "#18181b" : "#ffffff"
        }}
      >
        <Link href={navHref} className="flex flex-col">
          {/* ── Image ──────────────────────────────────── */}
          <div
            className="relative mb-3 aspect-square overflow-hidden rounded-lg"
            style={{ backgroundColor: isDark ? "#09090b" : "#f4f4f5" }}
          >
            {imageUrl && !imageFailed ? (
              <SmartImage
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageFailed(true)}
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-12 w-12" style={{ color: `${primaryColor}30` }} />
                  </div>
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-12 w-12" style={{ color: `${primaryColor}30` }} />
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <span className="absolute left-2 top-2 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                -{discount}%
              </span>
            )}

            {/* Out of stock */}
            {isOutOfStock && (
              <span className="absolute left-2 top-2 rounded-lg bg-zinc-800/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                Out of Stock
              </span>
            )}

            {/* Section-specific badge (e.g. New, Trending, Best Seller) */}
            {badge && (
              <div className="absolute right-2 top-2">
                {badge}
              </div>
            )}

          </div>

          {/* ── Content ──────────────────────────────────── */}
          <h3
            className="truncate text-sm font-semibold"
            style={{ color: isDark ? "#fafafa" : "#18181b" }}
          >
            {product.name}
          </h3>

          {/* Star rating */}
          <div className="mt-1.5 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
            ))}
            <span className="ml-1 text-[10px]" style={{ color: isDark ? "#71717a" : "#a1a1aa" }}>(24)</span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
              {formatCurrency(product.price, settings)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs line-through" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
                {formatCurrency(product.comparePrice, settings)}
              </span>
            )}
          </div>
        </Link>

        {/* Hover actions */}
        <div className="pointer-events-none absolute inset-3 flex items-center justify-center gap-2 rounded-[1.25rem] bg-black/40 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
            style={{ color: primaryColor }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-apple-ink-muted-80 shadow-lg transition-transform hover:scale-110"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-apple-ink-muted-80 shadow-lg transition-transform hover:scale-110 hover:text-red-400"
            aria-label={`Save ${product.name} to wishlist`}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Add to Cart button */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
        )}
      </motion.div>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
