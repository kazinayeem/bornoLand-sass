"use client";

import { useMemo, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useProductHref } from "@/lib/store-href";
import { ProductRatingRow } from "./product-rating-row";
import { ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cart-slice";
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
import { useStorefrontTracking } from "@/hooks/use-storefront-tracking";

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
  showAddToCart?: boolean;
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
  showAddToCart = true,
  viewNowText = "View Now",
  categoryLabel,
}: ProductCardProps) {
  const isBuilder = useIsBuilder();
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, settings, store } = useTenant();
  const themeId = (theme as { themeId?: string; preset?: string }).themeId || (theme as { preset?: string }).preset || "grocery";
  const variant =
    variantProp || (themeId === "electronics" ? "electronics" : themeId === "grocery" ? "grocery" : "default");

  const { primaryColor } = useStorefrontSurface();
  const [addToCartRemote] = useAddToCartMutation();
  const { trackAddToCart } = useStorefrontTracking();
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
  const showActions = showViewNow || (showAddToCart && !isOutOfStock);

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
      trackAddToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: displayCategory,
        currency: settings?.currencyCode || "BDT",
      });
      await addToCartRemote({ productId: product._id, quantity: 1 }).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
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
        <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-100/80 sm:aspect-square">
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

          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
            {badge ? <div className="pointer-events-auto">{badge}</div> : null}
            {showBadges && discount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-tight text-white shadow-sm",
                  variant === "grocery" ? "bg-[#e05a00]" : variant === "electronics" ? "bg-[#e2136e]" : "bg-rose-600",
                )}
              >
                {variant === "electronics" && product.comparePrice
                  ? `Save ${formatCurrency(product.comparePrice - product.price, settings)}`
                  : `-${discount}%`}
              </span>
            )}
            {isOutOfStock && (
              <span className="inline-flex items-center rounded-md bg-zinc-900/90 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
                Sold Out
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[1] flex flex-1 flex-col justify-between">
          <div>
            {displayCategory ? (
              <div className="mb-1 truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {displayCategory}
              </div>
            ) : null}

            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-primary">
              {product.name}
            </h3>

            {showRatings && ratingStoreId ? (
              <ProductRatingRow storeId={ratingStoreId} productId={product._id} />
            ) : null}
          </div>

          <div className="mt-3 border-t border-zinc-100 pt-2">
            <div className="mb-2.5 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-base font-black sm:text-lg",
                  variant === "grocery" ? "text-[#055c3a]" : variant === "electronics" ? "text-[#ef4444]" : "text-zinc-900",
                )}
              >
                {formatCurrency(product.price, settings)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatCurrency(product.comparePrice, settings)}
                </span>
              )}
            </div>

            {showActions ? (
              <div className={cn("grid gap-2", showViewNow && showAddToCart && !isOutOfStock ? "grid-cols-2" : "grid-cols-1")}>
                {showViewNow && !isBuilder ? (
                  <button
                    type="button"
                    onClick={navigateToProduct}
                    className="relative z-10 flex h-9 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] sm:text-sm"
                  >
                    {viewNowText}
                  </button>
                ) : null}

                {showAddToCart && !isOutOfStock ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding || isBuilder}
                    className={cn(
                      "relative z-10 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 sm:text-sm",
                      variant === "grocery" ? "bg-[#e05a00] hover:bg-[#c2410c]" : variant === "electronics" ? "bg-[#081621] hover:bg-[#0071dc]" : "",
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
                    <span>{adding ? "Adding…" : "Add to Cart"}</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
