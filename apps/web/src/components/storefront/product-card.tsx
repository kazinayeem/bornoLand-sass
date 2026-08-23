"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useProductHref } from "@/lib/store-href";
import { ProductRatingRow } from "./product-rating-row";
import { ShoppingCart, Heart, Eye } from "lucide-react";
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
import { getContrastColor } from "@/lib/color-utils";
import { useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";

const QuickViewModal = dynamic(
  () => import("./quick-view-modal").then((module) => module.QuickViewModal),
  { loading: () => null, ssr: false },
);

export type ProductCardProduct = {
  _id: string;
  storeId?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  category: string;
  stock: number;
  status?: string;
  sku?: string;
  images?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  featured?: boolean;
  categoryIds?: string[];
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProductCardProps = {
  product: ProductCardProduct;
  badge?: ReactNode;
  variant?: "default" | "grocery" | "electronics" | "minimal" | "bordered" | "elevated";
  showBadges?: boolean;
  showRatings?: boolean;
  showViewNow?: boolean;
  viewNowText?: string;
  categoryLabel?: string;
};

export function ProductCard({
  product,
  badge,
  variant: variantProp,
  showBadges = true,
  showRatings = true,
  showViewNow = false,
  viewNowText = "View Now",
  categoryLabel,
}: ProductCardProps) {
  const isBuilder = useIsBuilder();
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, settings, store } = useTenant();
  const themeId = (theme as any)?.themeId || (theme as any)?.preset || "grocery";
  const variant = variantProp || (themeId === "electronics" ? "electronics" : themeId === "grocery" ? "grocery" : "default");

  const { classes, primaryColor } = useStorefrontSurface();
  const [addToCartRemote] = useAddToCartMutation();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [adding, setAdding] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const ratingStoreId = product.storeId || store._id;
  const imageUrl = useMemo(() => getProductImageUrl(product), [product]);
  const productHref = useProductHref(product.slug, isBuilder);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const prefetchProduct = useCallback(() => {
    if (isBuilder || productHref === "#") return;
    router.prefetch(productHref);
  }, [isBuilder, productHref, router]);

  const navigateToProduct = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (isBuilder || productHref === "#") return;
      router.push(productHref);
    },
    [isBuilder, productHref, router],
  );

  const displayCategory = categoryLabel ?? product.brand ?? product.category ?? "";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock || isBuilder || adding) return;
    setAdding(true);
    try {
      dispatch(
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: getProductImageUrl(product),
        }),
      );
      await addToCartRemote({ productId: product._id, quantity: 1 }).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
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
    dispatch(
      toggleWishlist({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: getProductImageUrl(product),
      }),
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onMouseEnter={prefetchProduct}
        onFocus={prefetchProduct}
        className="h-full"
      >
        <div
          role={!isBuilder && productHref !== "#" ? "link" : undefined}
          tabIndex={!isBuilder && productHref !== "#" ? 0 : undefined}
          onClick={!isBuilder ? navigateToProduct : undefined}
          onKeyDown={
            !isBuilder && productHref !== "#"
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToProduct();
                  }
                }
              : undefined
          }
          className={cn(
            "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5",
            !isBuilder && productHref !== "#" && "cursor-pointer",
          )}
        >

          {/* Product Image Box */}
          <div className="relative mb-3 aspect-[4/5] sm:aspect-square w-full overflow-hidden rounded-xl bg-zinc-100/80">
            {imageUrl && !imageFailed ? (
              <SmartImage
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={() => setImageFailed(true)}
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-10 w-10 text-zinc-300" />
                  </div>
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-zinc-300" />
              </div>
            )}

            {/* Badges Top Left */}
            <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
              {showBadges && discount > 0 && (
                <span className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-tight text-white shadow-sm",
                  variant === "grocery" ? "bg-[#e05a00]" : variant === "electronics" ? "bg-[#e2136e]" : "bg-rose-600"
                )}>
                  {variant === "electronics" && product.comparePrice ? `Save ${formatCurrency(product.comparePrice - product.price, settings)}` : `-${discount}%`}
                </span>
              )}
              {isOutOfStock && (
                <span className="inline-flex items-center rounded-md bg-zinc-900/90 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm shadow-sm">
                  Sold Out
                </span>
              )}
            </div>

            {/* Quick Action Top Right */}
            <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleWishlist}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-rose-600"
                aria-label={`Save ${product.name} to wishlist`}
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleQuickView}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-zinc-900"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product Meta */}
          <div className="relative z-[1] flex flex-1 flex-col justify-between">
            <div>
              {/* Category / Brand */}
              {displayCategory ? (
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 truncate">
                  {displayCategory}
                </div>
              ) : null}

              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 leading-snug group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {showRatings && ratingStoreId ? (
                <ProductRatingRow storeId={ratingStoreId} productId={product._id} />
              ) : null}
            </div>

            {/* Pricing & CTA */}
            <div className="mt-3 pt-2 border-t border-zinc-100">
              <div className="flex items-baseline gap-2 mb-2.5">
                <span className={cn(
                  "text-base sm:text-lg font-black",
                  variant === "grocery" ? "text-[#055c3a]" : variant === "electronics" ? "text-[#ef4444]" : "text-zinc-900"
                )}>
                  {formatCurrency(product.price, settings)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xs line-through text-zinc-400">
                    {formatCurrency(product.comparePrice, settings)}
                  </span>
                )}
              </div>

              {showViewNow && !isBuilder ? (
                <button
                  type="button"
                  onClick={navigateToProduct}
                  className="relative z-10 mb-2 flex h-9 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm font-semibold text-zinc-900 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
                >
                  {viewNowText}
                </button>
              ) : null}

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={cn(
                    "relative z-10 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 text-white",
                    variant === "grocery" ? "bg-[#e05a00] hover:bg-[#c2410c]" : variant === "electronics" ? "bg-[#081621] hover:bg-[#0071dc]" : ""
                  )}
                  style={
                    variant !== "grocery" && variant !== "electronics"
                      ? {
                          backgroundColor: primaryColor || "#2563eb",
                          color: getContrastColor(primaryColor || "#2563eb"),
                        }
                      : undefined
                  }
                >
                  <ShoppingCart className={cn("h-3.5 w-3.5", adding && "animate-pulse")} />
                  <span>{adding ? "Adding…" : variant === "grocery" ? "অর্ডার করুন" : variant === "electronics" ? "Buy Now" : "Add to Cart"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}

