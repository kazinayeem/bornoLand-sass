"use client";

import { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, ArrowLeft, ChevronRight, Check, RefreshCcw, MessageSquare, Award, ZoomIn } from "lucide-react";
import { addToCart, openCart } from "@/redux/slices/cart-slice";
import { toggleWishlist } from "@/redux/slices/wishlist-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { ProductCard } from "@/components/storefront/product-card";
import { getContrastColor } from "@/lib/color-utils";
import { useTenant } from "@/providers/tenant-provider";
import { useTrackProductView } from "@/hooks/use-analytics-tracker";
import { formatCurrency } from "@/lib/format-currency";
import { getProductGalleryUrls, getProductImageUrl } from "@/lib/product-media";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { toast } from "sonner";
import { SmartImage } from "@/components/ui/smart-image";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { ProductRatingRow } from "@/components/storefront/product-rating-row";


type ProductOption = { _id?: string; name: string; values: string[] };
type ProductVariant = {
  _id?: string;
  title?: string;
  optionValues: Record<string, string>;
  price?: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  imageUrl: string;
  galleryUrls?: string[];
  enabled: boolean;
};

type Product = {
  _id: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; sku: string;
  imageUrl?: string; thumbnailUrl?: string; galleryImageUrls?: string[]; images: string[]; featured: boolean;
  options?: ProductOption[]; variants?: ProductVariant[];
};

function findVariant(product: Product, selected: Record<string, string>): ProductVariant | undefined {
  if (!product.variants?.length) return undefined;
  return product.variants.find((v) => {
    if (!v.enabled) return false;
    return Object.entries(selected).every(([k, val]) => v.optionValues[k] === val);
  });
}

function firstAvailableVariant(product: Product): ProductVariant | undefined {
  return product.variants?.find((variant) => variant.enabled && variant.stock > 0) ?? product.variants?.find((variant) => variant.enabled);
}

export function ProductDetailClient({ product }: { product: Product }) {
  useTrackProductView(product._id, product.name);

  const dispatch = useDispatch();
  const { store, theme, products, settings } = useTenant();

  const { primaryColor } = theme;
  const [addToCartRemote] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "specs" | "reviews" | "shipping" | "refund">("description");
  const [selectedImage, setSelectedImage] = useState(getProductImageUrl(product));

  const hasVariants = (product.options?.length ?? 0) > 0 && (product.variants?.length ?? 0) > 0;

  const initialSelections: Record<string, string> = {};
  const initialVariant = hasVariants ? firstAvailableVariant(product) : undefined;
  if (hasVariants) {
    for (const opt of product.options ?? []) {
      initialSelections[opt.name] = initialVariant?.optionValues[opt.name] ?? opt.values[0] ?? "";
    }
  }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialSelections);

  const activeVariant = useMemo(() => {
    if (!hasVariants) return undefined;
    return findVariant(product, selectedOptions);
  }, [product, selectedOptions, hasVariants]);

  const displayPrice = activeVariant?.price ?? product.price;
  const displayComparePrice = activeVariant?.comparePrice ?? product.comparePrice;
  const displayStock = activeVariant?.stock ?? product.stock;
  const variantGallery = activeVariant?.galleryUrls?.length
    ? activeVariant.galleryUrls.map(resolveMediaUrl)
    : activeVariant?.imageUrl
      ? [resolveMediaUrl(activeVariant.imageUrl)]
      : [];
  const displayImage = resolveMediaUrl(variantGallery[0] || activeVariant?.imageUrl || selectedImage);
  const inStock = displayStock > 0;
  const enableAddToCart = (!hasVariants || !!activeVariant) && inStock;

  useEffect(() => {
    if (variantGallery.length > 0) setSelectedImage(variantGallery[0]);
  }, [activeVariant?._id, variantGallery]);

  const discount =
    displayComparePrice && displayComparePrice > displayPrice
      ? Math.round((1 - displayPrice / displayComparePrice) * 100)
      : 0;
  const gallery = useMemo(() => {
    if (variantGallery.length > 0) return variantGallery;
    return getProductGalleryUrls(product);
  }, [variantGallery, product]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p._id !== product._id && p.category === product.category && p.status === "active")
      .slice(0, 4);
  }, [products, product]);

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "specs" as const, label: "Specs" },
    { id: "reviews" as const, label: "Reviews" },
  ];

  const specs = [
    ["SKU", activeVariant?.sku || product.sku],
    ["Category", product.category],
    ["Stock", `${displayStock} units`],
  ].filter(([, value]) => Boolean(value));

  const handleAddToCart = async (showToast = true) => {
    dispatch(addToCart({
      productId: product._id,
      variantId: activeVariant?._id,
      variantTitle: activeVariant ? Object.values(selectedOptions).join(" / ") : undefined,
      name: product.name,
      price: displayPrice,
      quantity,
      image: displayImage
    }));
    try {
      await addToCartRemote({
        productId: product._id,
        quantity,
        variantId: activeVariant?._id
      }).unwrap();
    } catch {}
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (showToast) {
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart(false);
    dispatch(openCart());
    toast.success("Added to cart and ready to checkout");
  };

  const handleOptionSelect = (optName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optName]: value }));
  };

  const totalPrice = displayPrice * quantity;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80" style={{ color: "#52525b" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-apple-canvas-parchment shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              <div className="group relative aspect-square overflow-hidden bg-white">
                {displayImage ? (
                  <SmartImage
                    src={displayImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-24 w-24 text-zinc-200" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-apple-ink-muted-80 shadow-sm backdrop-blur">{product.category}</span>
                  {product.featured && <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">Featured</span>}
                </div>
                {discount > 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                    -{discount}%
                  </span>
                )}
                <button className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-apple-ink-muted-80 shadow-lg backdrop-blur">
                  <ZoomIn className="h-4 w-4" /> Zoom
                </button>
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {gallery.map((image) => (
                  <button key={image} onClick={() => setSelectedImage(image)} className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${selectedImage === image ? "border-zinc-950 ring-2 ring-zinc-950/10" : "border-zinc-200 hover:border-zinc-300"}`}>
                    <SmartImage
                      src={image}
                      alt={`${product.name} thumbnail`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Truck, title: "Fast shipping", copy: "2-5 business days" },
                { icon: Shield, title: "Secure checkout", copy: "Encrypted payments" },
                { icon: RefreshCcw, title: "Easy returns", copy: "30 day returns" },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <Icon className="h-5 w-5 text-apple-ink" />
                  <p className="mt-3 text-sm font-semibold text-apple-ink">{title}</p>
                  <p className="mt-1 text-xs text-apple-ink-muted-48">{copy}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-apple-ink-muted-48">
                <span>Premium Product</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{activeVariant?.sku || product.sku}</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-apple-ink sm:text-4xl">{product.name}</h1>

              <ProductRatingRow storeId={store._id} productId={product._id} className="mt-4" />

              <div className="mt-5 flex items-end gap-3">
                <span className="text-4xl font-semibold tracking-tight text-apple-ink">{formatCurrency(displayPrice, settings)}</span>
                {displayComparePrice && displayComparePrice > displayPrice && (
                  <>
                    <span className="pb-1 text-lg text-apple-ink-muted-48 line-through">{formatCurrency(displayComparePrice, settings)}</span>
                    <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Save {discount}%</span>
                  </>
                )}
              </div>

              {/* Variant Options */}
              {hasVariants && product.options?.map((opt) => (
                <div key={opt.name} className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">{opt.name}: <span className="text-apple-ink">{selectedOptions[opt.name]}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const testSelection = { ...selectedOptions, [opt.name]: val };
                      const match = findVariant(product, testSelection);
                      const isAvailable = match?.enabled && match.stock > 0;
                      const isSelected = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionSelect(opt.name, val)}
                          disabled={!isAvailable}
                          className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                            isSelected
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : isAvailable
                                ? "border-zinc-200 bg-white text-apple-ink-muted-80 hover:border-zinc-400"
                                : "border-zinc-100 bg-apple-canvas-parchment text-zinc-300 cursor-not-allowed"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {product.description ? (
                <div className="mt-5 prose prose-sm max-w-none text-sm leading-7 text-apple-ink-muted-80" dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : !hasVariants ? (
                <p className="mt-5 text-sm leading-7 text-apple-ink-muted-80">No description available.</p>
              ) : null}

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-apple-canvas-parchment px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">Availability</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-apple-ink">
                    <Check className="h-4 w-4 text-emerald-600" /> {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">Category</p>
                  <p className="mt-1 text-sm font-semibold text-apple-ink">{product.category}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-zinc-200 bg-white p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-apple-ink">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(displayStock || 999, quantity + 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => dispatch(toggleWishlist({ productId: product._id, slug: product.slug, name: product.name, price: displayPrice, image: displayImage }))}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 text-apple-ink-muted-48 transition-colors hover:border-red-200 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={() => handleAddToCart()} disabled={!enableAddToCart}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
                  <ShoppingCart className="h-4 w-4" /> {added ? "Added to Cart" : "Add to Cart"}
                </button>
                <button onClick={() => handleBuyNow()} disabled={!enableAddToCart}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-950 bg-zinc-950 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                  Buy Now
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-apple-canvas-parchment p-4">
                <Award className="h-5 w-5 text-apple-ink-muted-80" />
                <div>
                  <p className="text-sm font-semibold text-apple-ink">Premium customer experience</p>
                  <p className="text-xs text-apple-ink-muted-48">Fast support, smooth checkout, and quality products.</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <section className="mt-12">
          <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 pb-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-t-2xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-zinc-950 text-apple-ink" : "text-apple-ink-muted-48 hover:text-apple-ink"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              {activeTab === "description" && (
                <div className="prose prose-sm max-w-none text-sm leading-7 text-apple-ink-muted-80">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>No description available.</p>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                specs.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {specs.map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-zinc-100 bg-apple-canvas-parchment p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-apple-ink-muted-48">{label}</p>
                        <p className="mt-2 text-sm font-medium text-apple-ink">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-apple-ink-muted-80">No specifications available.</p>
                )
              )}

              {activeTab === "reviews" && (
                <ProductReviews
                  storeId={store._id}
                  productId={product._id}
                  productName={product.name}
                  primaryColor={primaryColor}
                />
              )}
            </div>

            <div className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-apple-ink">
                <MessageSquare className="h-4 w-4 text-apple-ink-muted-48" /> Customer confidence
              </div>
              <div className="grid gap-3">
                {[
                  "Secure checkout",
                  "Fast support response",
                  "Premium packaging",
                  "Easy returns",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-apple-canvas-parchment px-4 py-3 text-sm text-apple-ink-muted-80">
                    <Check className="h-4 w-4 text-emerald-600" /> {item}
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-zinc-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Need help?</p>
                <p className="mt-2 text-lg font-semibold">We can help with sizing, shipping, and returns.</p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-apple-ink">
                  Contact Support <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-apple-ink-muted-48">More from this store</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-apple-ink">Related Products</h2>
              </div>
              <Link href="/shop" className="text-sm font-medium text-apple-ink-muted-48 hover:text-apple-ink">View all</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-apple-ink-muted-48">Total</p>
              <p className="truncate text-sm font-semibold text-apple-ink">{formatCurrency(totalPrice, settings)}</p>
            </div>
            <button onClick={() => handleAddToCart()} disabled={!enableAddToCart}
              className="rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
