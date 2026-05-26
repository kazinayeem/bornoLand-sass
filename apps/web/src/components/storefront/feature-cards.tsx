"use client";

import { Truck, Shield, HeadphonesIcon, RefreshCw, CreditCard, Smile } from "lucide-react";
import type { StorefrontSectionLike } from "./storefront-types";

const defaultFeatures = [
  { icon: Truck, title: "Free Shipping", desc: "Free shipping on orders over $50" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock assistance" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: CreditCard, title: "Flexible Payment", desc: "Multiple payment options" },
  { icon: Smile, title: "Satisfaction", desc: "100% satisfaction guaranteed" },
];

const iconMap: Record<string, typeof Truck> = { Truck, Shield, HeadphonesIcon, RefreshCw, CreditCard, Smile };

export function FeatureCards({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const title = (props.title as string) || "Why Choose Us";
  const subtitle = (props.subtitle as string) || "";
  const columns = +(props.columns as string) || 3;
  const bg = (props.backgroundColor as string) || "";

  const colClass = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: bg || undefined }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className={`grid gap-6 ${colClass}`}>
          {defaultFeatures.map((feat, i) => {
            const Icon = iconMap[feat.icon.name] || Truck;
            return (
              <div key={i} className="group rounded-2xl border border-zinc-100 p-6 text-center transition hover:border-zinc-200 hover:shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-zinc-900 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">{feat.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
