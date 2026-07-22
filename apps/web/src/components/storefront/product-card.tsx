"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { StoreLink as Link } from "./store-link";
import { useProductHref } from "@/lib/store-href";
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
};

export function ProductCard({ product, badge }: ProductCardProps) {
  const isBuilder = useIsBuilder();
  const router = useRouter();
  const dispatch = useDispatch();
  const { settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const [addToCartRemote] = useAddToCartMutation();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [adding, setAdding] = useState(false);

  const isOutOfStock = product.stock <= 0;
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
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onMouseEnter={prefetchProduct}
        onFocus={prefetchProduct}
        className="storefront-utility-card group relative flex flex-col overflow-hidden p-apple-lg transition-colors"
      >
        {!isBuilder && (
          <Link
            href={productHref}
            className="absolute inset-0 z-0 rounded-apple-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-primary/30"
            aria-label={`View ${product.name}`}
          >
            <span className="sr-only">View {product.name}</span>
          </Link>
        )}

        <div className="relative z-[1] pointer-events-none flex flex-col">
          <div className={cn("relative mb-3 aspect-square overflow-hidden rounded-apple-sm", classes.imageWell)}>
            {imageUrl && !imageFailed ? (
              <SmartImage
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="storefront-product-image object-cover transition-transform duration-300 ease-apple group-hover:scale-[1.02]"
                onError={() => setImageFailed(true)}
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-apple-ink-muted-48/30" />
                  </div>
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-apple-ink-muted-48/30" />
              </div>
            )}

            {discount > 0 && (
              <span className="absolute left-2 top-2 rounded-apple-sm bg-apple-primary px-2 py-0.5 text-fine-print font-semibold text-apple-on-primary">
                -{discount}%
              </span>
            )}

            {isOutOfStock && (
              <span className="absolute left-2 top-2 rounded-apple-sm bg-apple-surface-tile-1/90 px-2 py-1 text-fine-print font-medium text-apple-on-dark backdrop-blur-sm">
                Out of Stock
              </span>
            )}

            {badge && <div className="absolute right-2 top-2">{badge}</div>}
          </div>

          <h3 className={cn("line-clamp-2 min-h-[2.75rem] text-body-strong leading-snug", classes.heading)}>{product.name}</h3>

          <div className="mt-1.5 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn("h-3 w-3", s <= 4 ? "fill-amber-400 text-amber-400" : "text-apple-divider-soft")}
              />
            ))}
            <span className={cn("ml-1 text-fine-print", classes.muted)}>(24)</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={cn("text-body font-semibold", classes.heading)}>
              {formatCurrency(product.price, settings)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className={cn("text-caption line-through", classes.muted)}>
                {formatCurrency(product.comparePrice, settings)}
              </span>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-3 z-[2] flex items-center justify-center gap-2 rounded-apple-lg bg-apple-surface-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="btn-press pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-apple-canvas text-apple-primary transition-transform hover:scale-105 disabled:opacity-50"
            style={{ color: primaryColor }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className={cn("h-5 w-5", adding && "animate-pulse")} />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            className="btn-press pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-apple-canvas text-apple-ink-muted-80 transition-transform hover:scale-105"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            className="btn-press pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-apple-canvas text-apple-ink-muted-80 transition-transform hover:scale-105 hover:text-red-500"
            aria-label={`Save ${product.name} to wishlist`}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="btn-press relative z-[3] mt-3 flex w-full items-center justify-center gap-1.5 rounded-apple-pill py-2.5 text-caption font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        )}
      </motion.article>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
