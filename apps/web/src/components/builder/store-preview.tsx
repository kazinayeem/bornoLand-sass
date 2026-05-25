"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { ShoppingBag, Star, Heart, Minus, Plus, Truck, Shield, Search, Menu, X, Layout } from "lucide-react";
import { useState } from "react";

type StorePreviewProps = {
  storeId: string;
  storeName: string;
  storeDescription: string;
};

function ProductCard({ product, theme }: { product: any; theme: any }) {
  const isOutOfStock = product.stock <= 0;
  const onSale = product.comparePrice && product.comparePrice > product.price;
  const discount = onSale ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0;
  const shadow = theme.shadowSize === "none" ? "" : theme.shadowSize === "sm" ? "shadow-sm" : theme.shadowSize === "md" ? "shadow-md" : "shadow-lg";

  return (
    <div className={`group overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 ${shadow}`}
      style={{
        borderColor: theme.darkMode ? "#27272a" : "#e4e4e7",
        backgroundColor: theme.darkMode ? "#18181b" : "#ffffff",
        fontFamily: theme.font,
      }}>
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: theme.darkMode ? "#09090b" : "#f4f4f5" }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-10 w-10" style={{ color: `${theme.primaryColor}30` }} />
          </div>
        )}
        {theme.showBadges && onSale && (
          <span className="absolute left-2 top-2 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {theme.showBadges && isOutOfStock && (
          <span className="absolute left-2 top-2 rounded-lg bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            Out of Stock
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
            style={{ color: theme.primaryColor }}>
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 text-zinc-600">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        {product.category && (
          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: `${theme.primaryColor}99` }}>
            {product.category}
          </p>
        )}
        <h3 className="mt-0.5 truncate text-sm font-semibold" style={{ color: theme.darkMode ? "#fafafa" : "#18181b" }}>
          {product.name}
        </h3>
        {theme.showRatings && (
          <div className="mt-1 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : ""}`} style={{ color: s > 4 ? "#d4d4d8" : undefined }} />
            ))}
            <span className="ml-1 text-[10px]" style={{ color: theme.darkMode ? "#71717a" : "#a1a1aa" }}>(24)</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-sm font-bold" style={{ color: theme.darkMode ? "#fafafa" : "#18181b" }}>
            ${product.price.toFixed(2)}
          </span>
          {onSale && (
            <span className="text-[11px] line-through" style={{ color: theme.darkMode ? "#52525b" : "#a1a1aa" }}>
              ${product.comparePrice!.toFixed(2)}
            </span>
          )}
        </div>
        {!isOutOfStock && (
          <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-white transition-all hover:opacity-90"
            style={{ borderRadius: theme.buttonStyle, backgroundColor: theme.primaryColor }}>
            <ShoppingBag className="h-3 w-3" /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export function StorePreview({ storeId, storeName, storeDescription }: StorePreviewProps) {
  const theme = useSelector((s: RootState) => s.theme);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const device = useSelector((s: RootState) => s.preview.device);
  const { data: productsData } = useGetProductsQuery(storeId);
  const products = productsData?.data?.products ?? [];
  const [mobileMenu, setMobileMenu] = useState(false);

  const isDark = theme.darkMode;
  const activeProducts = products.filter((p: any) => p.status === "active");

  const previewWidth = device === "mobile" ? 375 : device === "tablet" ? 768 : 1280;

  const bgColor = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#fafafa" : "#18181b";
  const mutedColor = isDark ? "#a1a1aa" : "#52525b";

  return (
    <div className="flex items-start justify-center overflow-y-auto p-4"
      style={{ backgroundColor: isDark ? "#09090b" : "#f4f4f5", minHeight: "100%" }}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300"
        style={{
          width: previewWidth,
          maxWidth: "100%",
          fontFamily: theme.font,
          backgroundColor: bgColor,
          color: textColor,
        }}>
        {/* ── Navbar ── */}
        <nav style={{
          position: theme.navbarStyle as any,
          top: 0, zIndex: 40, width: "100%",
          borderBottom: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
          backgroundColor: isDark ? "rgba(24,24,27,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
        }}>
          <div className="mx-auto flex h-14 items-center justify-between px-4"
            style={{ maxWidth: theme.layoutWidth }}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: theme.primaryColor }}>
                {storeName[0]}
              </div>
              <span className="text-sm font-bold" style={{ color: textColor }}>{storeName}</span>
            </div>
            <div className="hidden items-center gap-5 sm:flex">
              {["Home", "Shop", "Categories", "About", "Contact"].map((link) => (
                <span key={link} className="text-xs font-medium" style={{ color: mutedColor }}>{link}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" style={{ color: mutedColor }} />
              <ShoppingBag className="h-4 w-4" style={{ color: mutedColor }} />
              <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden">
                {mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Sections ── */}
        {sections.filter((s) => s.visible).map((section) => {
          switch (section.type) {
            case "hero": {
              const heroH = theme.heroHeight === "sm" ? "py-16" : theme.heroHeight === "md" ? "py-24" : "py-32";
              return (
                <section key={section.id} className={`relative overflow-hidden ${heroH} px-4`}
                  style={{ background: `linear-gradient(135deg, ${theme.secondaryColor}08 0%, ${theme.primaryColor}05 100%)` }}>
                  <div className="mx-auto max-w-3xl text-center" style={{ maxWidth: theme.layoutWidth }}>
                    <span className="inline-block rounded-full px-3 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}>
                      Welcome to {storeName}
                    </span>
                    <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
                      style={{ color: textColor }}>
                      {section.props.headline || "Discover Products You'll Love"}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: mutedColor }}>
                      {section.props.subheadline || "Shop the latest collection of curated products."}
                    </p>
                    <button className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                      style={{ borderRadius: theme.buttonStyle, backgroundColor: theme.primaryColor }}>
                      <ShoppingBag className="h-4 w-4" /> {section.props.buttonText || "Shop Now"}
                    </button>
                  </div>
                </section>
              );
            }

            case "features": {
              const categories = ["Clothing", "Electronics", "Accessories", "Footwear", "Home", "Beauty"];
              return (
                <section key={section.id} className="px-4 py-12">
                  <div className="mx-auto" style={{ maxWidth: theme.layoutWidth }}>
                    <h2 className="text-center text-2xl font-bold" style={{ color: textColor }}>
                      {section.props.title || "Shop by Category"}
                    </h2>
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      {categories.map((cat) => (
                        <div key={cat} className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 transition-all hover:shadow-md"
                          style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#fafafa" }}>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${theme.primaryColor}15` }}>
                            <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>{cat[0]}</span>
                          </div>
                          <span className="text-xs font-medium" style={{ color: textColor }}>{cat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            case "products": {
              const cols = theme.gridColumns;
              const gridClass = `grid-cols-${Math.min(cols, 6)}`.replace("grid-cols-", "grid-cols-");
              return (
                <section key={section.id} className="px-4 py-12">
                  <div className="mx-auto" style={{ maxWidth: theme.layoutWidth }}>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${theme.primaryColor}12`, color: theme.primaryColor }}>
                          Featured Products
                        </span>
                        <h2 className="mt-2 text-2xl font-bold" style={{ color: textColor }}>
                          {section.props.title || "Featured Products"}
                        </h2>
                      </div>
                      <span className="text-xs font-medium" style={{ color: theme.primaryColor }}>View All →</span>
                    </div>
                    <div className="mt-6 grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(cols, activeProducts.length || 4)}, minmax(0, 1fr))`,
                      }}>
                      {activeProducts.slice(0, Math.min(cols, 8)).map((product: any) => (
                        <ProductCard key={product._id} product={product} theme={theme} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            case "testimonials": {
              const testimonials = [
                { name: "Sarah J.", text: "Amazing quality! The products exceeded my expectations.", rating: 5 },
                { name: "Mike R.", text: "Fast shipping and great customer service. Highly recommend!", rating: 5 },
                { name: "Emily L.", text: "My go-to store for everything. Always consistent quality.", rating: 4 },
              ];
              return (
                <section key={section.id} className="px-4 py-12"
                  style={{ backgroundColor: isDark ? "#09090b" : "#fafafa" }}>
                  <div className="mx-auto text-center" style={{ maxWidth: theme.layoutWidth }}>
                    <h2 className="text-2xl font-bold" style={{ color: textColor }}>
                      {section.props.title || "What Customers Say"}
                    </h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {testimonials.map((t, i) => (
                        <div key={i} className="rounded-2xl border p-5 text-left"
                          style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#ffffff" }}>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s <= t.rating ? "fill-amber-400 text-amber-400" : ""}`}
                                style={{ color: s > t.rating ? "#d4d4d8" : undefined }} />
                            ))}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed" style={{ color: mutedColor }}>"{t.text}"</p>
                          <p className="mt-3 text-xs font-semibold" style={{ color: textColor }}>{t.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            case "cta": {
              return (
                <section key={section.id} className="px-4 py-16 text-center"
                  style={{ background: `linear-gradient(135deg, ${theme.primaryColor}10 0%, ${theme.secondaryColor}08 100%)` }}>
                  <div className="mx-auto max-w-lg">
                    <h2 className="text-2xl font-bold" style={{ color: textColor }}>
                      {section.props.headline || "Stay in the Loop"}
                    </h2>
                    <p className="mt-3 text-sm" style={{ color: mutedColor }}>
                      Subscribe to get special offers and updates.
                    </p>
                    <div className="mt-6 flex gap-2">
                      <input type="email" placeholder="Enter your email"
                        className="h-10 flex-1 rounded-xl border bg-transparent px-3 text-xs focus:outline-none"
                        style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", color: textColor }} />
                      <button className="h-10 rounded-xl px-5 text-xs font-medium text-white hover:opacity-90"
                        style={{ borderRadius: theme.buttonStyle, backgroundColor: theme.primaryColor }}>
                        {section.props.buttonText || "Subscribe"}
                      </button>
                    </div>
                  </div>
                </section>
              );
            }

            case "footer": {
              return (
                <footer key={section.id} className="border-t px-4 py-10"
                  style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#09090b" : "#fafafa" }}>
                  <div className="mx-auto" style={{ maxWidth: theme.layoutWidth }}>
                    <div className="grid gap-8 sm:grid-cols-4">
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ backgroundColor: theme.primaryColor }}>{storeName[0]}</div>
                          <span className="text-sm font-bold" style={{ color: textColor }}>{storeName}</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: mutedColor }}>
                          {storeDescription || "Premium ecommerce store."}
                        </p>
                      </div>
                      {["Quick Links", "Support"].map((heading, i) => (
                        <div key={i}>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: textColor }}>{heading}</p>
                          <div className="space-y-2">
                            {["Home", "Shop", "About", "Contact"].slice(0, i === 0 ? 4 : 3).map((link) => (
                              <p key={link} className="text-xs" style={{ color: mutedColor }}>{link}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 border-t pt-6 text-center"
                      style={{ borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {section.props.copyright || `© 2026 ${storeName}. All rights reserved.`}
                      </p>
                    </div>
                  </div>
                </footer>
              );
            }

            default:
              return null;
          }
        })}

        {sections.filter((s) => s.visible).length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <Layout className="mx-auto h-12 w-12" style={{ color: mutedColor }} />
            <h3 className="mt-4 text-lg font-semibold" style={{ color: textColor }}>No sections yet</h3>
            <p className="mt-1 text-sm" style={{ color: mutedColor }}>Add sections from the left panel to build your store.</p>
          </div>
        )}

        {activeProducts.length === 0 && sections.some((s) => s.type === "products" && s.visible) && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm" style={{ color: mutedColor }}>No products available. Add products from your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
