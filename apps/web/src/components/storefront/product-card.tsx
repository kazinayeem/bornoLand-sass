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
import { useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";

const QuickViewModal = dynamic(
  () => import("./quick-view-modal").then((module) => module.QuickViewModal),
  { loading: () => null }
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
  featured?: boolean;
  categoryIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ProductCardProps = {
  product: ProductCardProduct;
  badge?: ReactNode;
};

export function ProductCard({ product, badge }: ProductCardProps) {
  const isBuilder = useIsBuilder();
  const dispatch = useDispatch();
  const { settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const [addToCartRemote] = useAddToCartMutation();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const imageUrl = useMemo(() => getProductImageUrl(product), [product]);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock || isBuilder) return;
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: getProductImageUrl(product),
      })
    );
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
    dispatch(
      toggleWishlist({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: getProductImageUrl(product),
      })
    );
  };

  const navHref = isBuilder ? "#" : `/products/${product.slug}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="storefront-utility-card group relative flex flex-col overflow-hidden p-apple-lg transition-colors"
      >
        <Link href={navHref} className="flex flex-col">
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

          <h3 className={cn("truncate text-body-strong", classes.heading)}>{product.name}</h3>

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
        </Link>

        <div className="pointer-events-none absolute inset-3 flex items-center justify-center gap-2 rounded-apple-lg bg-apple-surface-black/40 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-press flex h-11 w-11 items-center justify-center rounded-full bg-apple-canvas text-apple-primary"
            style={{ color: primaryColor }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            className="btn-press flex h-11 w-11 items-center justify-center rounded-full bg-apple-canvas text-apple-ink-muted-80"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleWishlist}
            className="btn-press flex h-11 w-11 items-center justify-center rounded-full bg-apple-canvas text-apple-ink-muted-80 hover:text-red-500"
            aria-label={`Save ${product.name} to wishlist`}
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-press mt-3 flex w-full items-center justify-center gap-1.5 rounded-apple-pill py-2.5 text-caption font-semibold text-apple-on-primary transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
        )}
      </motion.div>

      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
}
