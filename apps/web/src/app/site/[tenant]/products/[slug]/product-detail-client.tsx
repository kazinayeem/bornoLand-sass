"use client";

import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, ArrowLeft, ChevronRight, Check, RefreshCcw, MessageSquare, Award, ZoomIn } from "lucide-react";
import { addToCart, openCart } from "@/redux/slices/cart-slice";
import { toggleWishlist } from "@/redux/slices/wishlist-slice";
import { useAddToCartMutation } from "@/redux/api/cart-api";
import { ProductCard } from "@/components/storefront/product-card";
import { useTenant } from "@/providers/tenant-provider";
import { formatCurrency } from "@/lib/format-currency";
import { getProductGalleryUrls, getProductImageUrl } from "@/lib/product-media";
import { toast } from "sonner";

type Product = {
  _id: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; sku: string;
  imageUrl?: string; thumbnailUrl?: string; galleryImageUrls?: string[]; images: string[]; featured: boolean;
};

export function ProductDetailClient({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme, products, settings } = useTenant();
  const { primaryColor, darkMode } = theme;
  const [addToCartRemote] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "specs" | "reviews" | "shipping" | "refund">("description");
  const [selectedImage, setSelectedImage] = useState(getProductImageUrl(product));
  const isDark = darkMode;

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const gallery = useMemo(() => getProductGalleryUrls(product), [product]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p._id !== product._id && p.category === product.category && p.status === "active")
      .slice(0, 4);
  }, [products, product]);

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "features" as const, label: "Features" },
    { id: "specs" as const, label: "Specs" },
    { id: "reviews" as const, label: "Reviews" },
    { id: "shipping" as const, label: "Shipping" },
    { id: "refund" as const, label: "Refunds" },
  ];

  const features = [
    "Premium build with refined materials",
    "Fast delivery and easy returns",
    "Designed for daily use and long-term durability",
    "Works seamlessly with modern lifestyles",
  ];

  const specs = [
    ["SKU", product.sku],
    ["Category", product.category],
    ["Stock", `${product.stock} units`],
    ["Material", "Premium composite"],
    ["Care", "Wipe clean"],
    ["Warranty", "1 year limited"],
  ];

  const reviews = [
    { name: "Sarah J.", text: "Excellent quality and beautiful packaging.", rating: 5 },
    { name: "Mike R.", text: "Feels premium and the delivery was fast.", rating: 5 },
    { name: "Emily L.", text: "Exactly what I expected from a premium store.", rating: 4 },
  ];

  const handleAddToCart = async (showToast = true) => {
    dispatch(addToCart({
      productId: product._id, name: product.name,
      price: product.price, quantity, image: getProductImageUrl(product)
    }));
    try { await addToCartRemote({ productId: product._id, quantity }).unwrap(); } catch {}
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

  return (
    <div className="bg-white" style={{ backgroundColor: isDark ? "#ffffff" : "#ffffff" }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80" style={{ color: isDark ? "#71717a" : "#52525b" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              <div className="group relative aspect-square overflow-hidden bg-white">
                {selectedImage ? (
                  <img src={selectedImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-24 w-24 text-zinc-200" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm backdrop-blur">{product.category}</span>
                  {product.featured && <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">Featured</span>}
                </div>
                {discount > 0 && (
                  <span className="absolute right-4 top-4 rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
                    -{discount}%
                  </span>
                )}
                <button className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-zinc-700 shadow-lg backdrop-blur">
                  <ZoomIn className="h-4 w-4" /> Zoom
                </button>
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {gallery.map((image) => (
                  <button key={image} onClick={() => setSelectedImage(image)} className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${selectedImage === image ? "border-zinc-950 ring-2 ring-zinc-950/10" : "border-zinc-200 hover:border-zinc-300"}`}>
                    <img src={image} alt={`${product.name} thumbnail`} className="h-full w-full object-cover" />
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
                  <Icon className="h-5 w-5 text-zinc-900" />
                  <p className="mt-3 text-sm font-semibold text-zinc-900">{title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{copy}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                <span>Premium Product</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span>{product.sku}</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{product.name}</h1>

              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-sm text-zinc-500">4.8 · 24 reviews</span>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span className="text-4xl font-semibold tracking-tight text-zinc-950">{formatCurrency(product.price, settings)}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="pb-1 text-lg text-zinc-400 line-through">{formatCurrency(product.comparePrice, settings)}</span>
                    <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Save {discount}%</span>
                  </>
                )}
              </div>

              <p className="mt-5 text-sm leading-7 text-zinc-600">{product.description || "No description available."}</p>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Availability</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-950">
                    <Check className="h-4 w-4 text-emerald-600" /> {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Category</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{product.category}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-zinc-200 bg-white p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-50">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-zinc-950">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-50">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={() => dispatch(toggleWishlist({ productId: product._id, name: product.name, price: product.price, image: getProductImageUrl(product) }))}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-500 transition-colors hover:border-red-200 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  style={{ backgroundColor: primaryColor }}>
                  <ShoppingCart className="h-4 w-4" /> {added ? "Added to Cart" : "Add to Cart"}
                </button>
                <button onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-950 bg-zinc-950 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]">
                  Buy Now
                </button>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Award className="h-5 w-5 text-zinc-700" />
                <div>
                  <p className="text-sm font-semibold text-zinc-950">Premium customer experience</p>
                  <p className="text-xs text-zinc-500">Fast support, smooth checkout, and quality products.</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        <section className="mt-12">
          <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 pb-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap rounded-t-2xl px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-zinc-950 text-zinc-950" : "text-zinc-500 hover:text-zinc-900"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              {activeTab === "description" && (
                <div className="space-y-4 text-sm leading-7 text-zinc-600">
                  <p>{product.description || "No description available."}</p>
                  <p>This product is presented in a premium ecommerce layout with a focus on clarity, confidence, and conversion.</p>
                </div>
              )}

              {activeTab === "features" && (
                <ul className="space-y-3 text-sm text-zinc-600">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "specs" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {specs.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
                      <p className="mt-2 text-sm font-medium text-zinc-950">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.name} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-600">{review.text}</p>
                      <p className="mt-3 text-xs font-semibold text-zinc-900">{review.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4 text-sm leading-7 text-zinc-600">
                  <p>Orders usually ship within 24-48 hours. Standard delivery takes 3-5 business days depending on location.</p>
                  <p>Free shipping is available on qualified orders and tracking is provided as soon as your package leaves the warehouse.</p>
                </div>
              )}

              {activeTab === "refund" && (
                <div className="space-y-4 text-sm leading-7 text-zinc-600">
                  <p>We offer a 30-day return window for unopened or defective items. Contact support to start a return.</p>
                  <p>Refunds are processed after inspection and credited to your original payment method.</p>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                <MessageSquare className="h-4 w-4 text-zinc-500" /> Customer confidence
              </div>
              <div className="grid gap-3">
                {[
                  "Secure checkout",
                  "Fast support response",
                  "Premium packaging",
                  "Easy returns",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    <Check className="h-4 w-4 text-emerald-600" /> {item}
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] bg-zinc-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Need help?</p>
                <p className="mt-2 text-lg font-semibold">We can help with sizing, shipping, and returns.</p>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">More from this store</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Related Products</h2>
              </div>
              <Link href="/shop" className="text-sm font-medium text-zinc-500 hover:text-zinc-950">View all</Link>
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
              <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">Total</p>
              <p className="truncate text-sm font-semibold text-zinc-950">{formatCurrency(product.price * quantity, settings)}</p>
            </div>
            <button onClick={handleAddToCart} className="rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
