"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart } from "lucide-react";
import type { Product } from "@/redux/api/product-api";

type ProductCardProps = {
  product: Product;
  primaryColor: string;
  buttonStyle: string;
  font: string;
  darkMode: boolean;
};

export function ProductCard({ product, primaryColor, buttonStyle, font, darkMode }: ProductCardProps) {
  const isDark = darkMode;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-xl hover:-translate-y-1"
      style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", fontFamily: font }}>
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12" style={{ color: `${primaryColor}30` }} />
          </div>
        </div>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-lg px-2 py-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: "#ef4444" }}>
            -{discount}%
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
            style={{ color: primaryColor }}>
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110 text-zinc-600">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: `${primaryColor}` }}>
          {product.category}
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`h-3 w-3 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
          ))}
          <span className="ml-1 text-[10px] text-zinc-400">(24)</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-zinc-400 line-through">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <span className="text-[11px] text-zinc-400">{product.stock} left</span>
        </div>
        <button
          className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
