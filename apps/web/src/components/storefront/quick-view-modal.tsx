"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ShoppingCart, Star, Minus, Plus, Heart, Share2, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Loader2, ExternalLink,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { getContrastColor } from "@/lib/color-utils";
import { StoreLink } from "./store-link";
import { addToCart, openCart } from "@/redux/slices/cart-slice";
import { toggleWishlist } from "@/redux/slices/wishlist-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { useGetPublicProductQuery } from "@/redux/api/product-api";
import type { Product, ProductVariant } from "@/redux/api/product-api";
import { useTenant } from "@/providers/tenant-provider";
import { useProductHref } from "@/lib/store-href";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { getProductGalleryUrls, getProductImageUrl } from "@/lib/product-media";
import { excerptContent, isHtmlContent } from "@/lib/html-content";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { ProductCardProduct } from "./product-card";

type Props = {
  product: ProductCardProduct;
  onClose: () => void;
};

function findVariant(product: Product, selected: Record<string, string>): ProductVariant | undefined {
  if (!product.variants?.length) return undefined;
  return product.variants.find((variant) => {
    if (!variant.enabled) return false;
    return Object.entries(selected).every(([key, value]) => variant.optionValues[key] === value);
  });
}

function firstAvailableVariant(product: Product): ProductVariant | undefined {
  return (
    product.variants?.find((variant) => variant.enabled && variant.stock > 0)
    ?? product.variants?.find((variant) => variant.enabled)
  );
}

export function QuickViewModal({ product: initialProduct, onClose }: Props) {
  const dispatch = useDispatch();
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const { theme, settings, products } = useTenant();
  const { primaryColor, buttonStyle } = theme;
  const [addToCartRemote] = useAddToCartMutation();

  const { data: publicData, isLoading: loadingDetails } = useGetPublicProductQuery(initialProduct.slug, {
    skip: !initialProduct.slug,
  });

  const product = useMemo(() => {
    const fromTenant = products.find((item) => item._id === initialProduct._id);
    const fromPublic = publicData?.data?.product;
    return {
      ...initialProduct,
      ...fromTenant,
      ...fromPublic,
    } as ProductCardProduct & Product;
  }, [initialProduct, products, publicData]);

  const productHref = useProductHref(product.slug);
  const hasVariants = (product.options?.length ?? 0) > 0 && (product.variants?.length ?? 0) > 0;

  const initialVariant = hasVariants ? firstAvailableVariant(product as Product) : undefined;
  const initialSelections: Record<string, string> = {};
  if (hasVariants) {
    for (const option of product.options ?? []) {
      initialSelections[option.name] = initialVariant?.optionValues[option.name] ?? option.values[0] ?? "";
    }
  }

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialSelections);

  const activeVariant = useMemo(() => {
    if (!hasVariants) return undefined;
    return findVariant(product as Product, selectedOptions);
  }, [product, selectedOptions, hasVariants]);

  const displayPrice = activeVariant?.price ?? product.price;
  const displayComparePrice = activeVariant?.comparePrice ?? product.comparePrice;
  const displayStock = activeVariant?.stock ?? product.stock;
  const displaySku = activeVariant?.sku || product.sku;
  const inStock = displayStock > 0;
  const canPurchase = (!hasVariants || !!activeVariant) && inStock;

  const gallery = useMemo(() => {
    const variantImages = activeVariant?.galleryUrls?.length
      ? activeVariant.galleryUrls
      : activeVariant?.imageUrl
        ? [activeVariant.imageUrl]
        : [];
    if (variantImages.length > 0) return variantImages;
    return getProductGalleryUrls(product);
  }, [activeVariant, product]);

  const activeImage = gallery[activeImageIndex] || gallery[0] || getProductImageUrl(product);

  const discount =
    displayComparePrice && displayComparePrice > displayPrice
      ? Math.round((1 - displayPrice / displayComparePrice) * 100)
      : 0;

  const descriptionHtml = product.description || "";
  const descriptionPreview = excerptContent(descriptionHtml, 280);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
    setZoomed(false);
  }, [activeVariant?._id, product._id]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mounted, onClose]);

  const goToImage = useCallback((index: number) => {
    if (gallery.length === 0) return;
    const next = (index + gallery.length) % gallery.length;
    setActiveImageIndex(next);
    setZoomed(false);
  }, [gallery.length]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || gallery.length < 2) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 48) {
      goToImage(activeImageIndex + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const handleAddToCart = async (openDrawer = false) => {
    if (!canPurchase) return;
    const setter = openDrawer ? setBuying : setAdding;
    setter(true);
    try {
      dispatch(addToCart({
        productId: product._id,
        variantId: activeVariant?._id,
        variantTitle: activeVariant ? Object.values(selectedOptions).join(" / ") : undefined,
        name: product.name,
        price: displayPrice,
        quantity,
        image: activeImage,
      }));
      await addToCartRemote({
        productId: product._id,
        quantity,
        variantId: activeVariant?._id,
      }).unwrap();
      toast.success(`${product.name} added to cart`);
      if (openDrawer) {
        dispatch(openCart());
        onClose();
      }
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setter(false);
    }
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: displayPrice,
      image: activeImage,
    }));
    toast.success("Wishlist updated");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}${productHref}`
      : productHref;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      toast.error("Could not share product");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 p-0 backdrop-blur-md sm:items-center sm:p-4 md:p-6"
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex max-h-[96vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-t-apple-lg border border-apple-hairline bg-apple-canvas shadow-2xl sm:max-h-[92vh] sm:rounded-apple-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-apple-hairline bg-apple-canvas/90 text-apple-ink-muted-80 backdrop-blur-sm transition-colors hover:bg-apple-canvas-parchment"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.05fr_0.95fr] lg:overflow-hidden">
            {/* Gallery */}
            <div className="border-b border-apple-hairline bg-apple-canvas-parchment p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div
                className="relative overflow-hidden rounded-apple-lg bg-white"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className={cn(
                  "relative aspect-[4/5] w-full overflow-hidden bg-apple-canvas-parchment sm:aspect-square",
                  zoomed && "cursor-zoom-out",
                )}
                >
                  {activeImage ? (
                    <SmartImage
                      src={activeImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      priority
                      className={cn(
                        "object-cover transition-transform duration-500 ease-apple",
                        zoomed ? "scale-150" : "scale-100",
                      )}
                      onClick={() => setZoomed((value) => !value)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-apple-ink-muted-48/30" />
                    </div>
                  )}

                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => goToImage(activeImageIndex - 1)}
                        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-apple-hairline bg-apple-canvas/90 text-apple-ink backdrop-blur-sm transition-transform hover:scale-105"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToImage(activeImageIndex + 1)}
                        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-apple-hairline bg-apple-canvas/90 text-apple-ink backdrop-blur-sm transition-transform hover:scale-105"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setZoomed((value) => !value)}
                    className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-apple-hairline bg-apple-canvas/90 text-apple-ink backdrop-blur-sm"
                    aria-label={zoomed ? "Zoom out" : "Zoom in"}
                  >
                    {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                  </button>
                </div>

                {gallery.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => goToImage(index)}
                        className={cn(
                          "relative h-16 w-16 shrink-0 overflow-hidden rounded-apple-sm border-2 transition-all",
                          index === activeImageIndex
                            ? "border-apple-primary"
                            : "border-transparent opacity-70 hover:opacity-100",
                        )}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <SmartImage src={image} alt="" fill sizes="64px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product info */}
            <div className="flex min-h-0 flex-col p-5 sm:p-6 lg:overflow-y-auto lg:p-8">
              {loadingDetails && (
                <div className="mb-3 inline-flex items-center gap-2 text-caption text-apple-ink-muted-48">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading details…
                </div>
              )}

              {product.category && (
                <p className="text-caption font-semibold uppercase tracking-wider text-apple-primary">
                  {product.category}
                </p>
              )}

              <h2 id="quick-view-title" className="mt-2 text-display-md text-apple-ink">
                {product.name}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn("h-4 w-4", star <= 4 ? "fill-amber-400 text-amber-400" : "text-apple-divider-soft")}
                    />
                  ))}
                </div>
                <span className="text-caption text-apple-ink-muted-48">4.0 · 24 reviews</span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <span className="text-display-md font-semibold text-apple-ink">
                  {formatCurrency(displayPrice, settings)}
                </span>
                {displayComparePrice && displayComparePrice > displayPrice && (
                  <span className="text-body text-apple-ink-muted-48 line-through">
                    {formatCurrency(displayComparePrice, settings)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-apple-sm bg-red-50 px-2 py-0.5 text-caption font-semibold text-red-600">
                    Save {discount}%
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-2 text-caption text-apple-ink-muted-80 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-apple-ink">Availability:</span>{" "}
                  {inStock ? (
                    <span className="text-emerald-600">{displayStock} in stock</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </p>
                {displaySku && (
                  <p><span className="font-medium text-apple-ink">SKU:</span> {displaySku}</p>
                )}
                {product.brand && (
                  <p><span className="font-medium text-apple-ink">Brand:</span> {product.brand}</p>
                )}
              </div>

              {hasVariants && (
                <div className="mt-5 space-y-4">
                  {(product.options ?? []).map((option) => (
                    <div key={option.name}>
                      <p className="mb-2 text-caption font-medium text-apple-ink-muted-48">{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const selected = selectedOptions[option.name] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                              className={cn(
                                "rounded-apple-pill border px-3 py-1.5 text-caption font-medium transition-colors",
                                selected
                                  ? "border-apple-primary bg-apple-primary/10 text-apple-primary"
                                  : "border-apple-hairline text-apple-ink-muted-80 hover:border-apple-ink-muted-48",
                              )}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <p className="mb-2 text-caption font-medium text-apple-ink-muted-48">Quantity</p>
                <div className="inline-flex items-center gap-2 rounded-apple-lg border border-apple-hairline p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-apple-sm text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-body font-medium text-apple-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    disabled={!inStock || quantity >= displayStock}
                    className="flex h-9 w-9 items-center justify-center rounded-apple-sm text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {descriptionHtml && (
                <div className="mt-5 border-t border-apple-hairline pt-5">
                  <p className="text-caption font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                    Description
                  </p>
                  {isHtmlContent(descriptionHtml) ? (
                    <div
                      className="prose prose-sm mt-3 max-w-none text-body text-apple-ink-muted-80"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : (
                    <p className="mt-3 text-body leading-relaxed text-apple-ink-muted-80">
                      {descriptionPreview}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleAddToCart(false)}
                  disabled={!canPurchase || adding}
                  className="btn-press inline-flex flex-1 items-center justify-center gap-2 rounded-apple-pill py-3 text-body font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderRadius: buttonStyle, backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                  {adding ? "Adding…" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleAddToCart(true)}
                  disabled={!canPurchase || buying}
                  className="btn-press inline-flex flex-1 items-center justify-center gap-2 rounded-apple-pill border-2 py-3 text-body font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderRadius: buttonStyle, borderColor: primaryColor, color: primaryColor }}
                >
                  {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {buying ? "Processing…" : "Buy Now"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleWishlist}
                  className="inline-flex items-center gap-2 rounded-apple-pill border border-apple-hairline px-4 py-2 text-caption font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </button>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex items-center gap-2 rounded-apple-pill border border-apple-hairline px-4 py-2 text-caption font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <StoreLink
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-apple-pill border border-apple-hairline px-4 py-2 text-caption font-medium text-apple-primary transition-colors hover:bg-apple-canvas-parchment"
                >
                  <ExternalLink className="h-4 w-4" />
                  View full details
                </StoreLink>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
