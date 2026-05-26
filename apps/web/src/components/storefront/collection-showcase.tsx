"use client";

import Link from "next/link";
import { useTenant } from "@/providers/tenant-provider";
import { ProductCard } from "./product-card";
import type { StorefrontSectionLike } from "./storefront-types";

export function CollectionShowcase({ section }: { section?: StorefrontSectionLike }) {
  const { products } = useTenant();
  const props = section?.props ?? {};
  const title = (props.title as string) || "Collection Spotlight";
  const subtitle = (props.subtitle as string) || "";
  const imageUrl = (props.imageUrl as string) || "";
  const buttonText = (props.buttonText as string) || "View Collection";
  const buttonLink = (props.buttonLink as string) || "/shop";
  const layout = (props.layout as string) || "left";
  const bg = (props.backgroundColor as string) || "";

  const displayProducts = products.filter((p) => p.status === "active").slice(0, 3);
  if (displayProducts.length === 0) return null;

  const isLeft = layout === "left";

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: bg || undefined }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className={`flex flex-col gap-8 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
          {imageUrl && (
            <div className="relative lg:w-1/3">
              <div className="sticky top-8 h-64 overflow-hidden rounded-2xl lg:h-full lg:min-h-[300px]">
                <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-end p-6">
                  <Link href={buttonLink}
                    className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-900 shadow-lg transition hover:opacity-90">
                    {buttonText}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className={`grid flex-1 gap-5 sm:grid-cols-2 ${imageUrl ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
            {displayProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
