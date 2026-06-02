"use client";

import { Truck, Shield, Headphones, Zap, Package, Heart } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

const iconMap: Record<string, any> = { Truck, Shield, Headphones, Zap, Package, Heart };

export function WhyChooseUs({ section }: { section: SectionData }) {
  const p = section.props;
  const features = [
    { icon: p.feature1Icon || "Truck", text: p.feature1Text || "Free Shipping" },
    { icon: p.feature2Icon || "Shield", text: p.feature2Text || "Secure Payment" },
    { icon: p.feature3Icon || "Headphones", text: p.feature3Text || "24/7 Support" },
    { icon: p.feature4Icon || "Zap", text: p.feature4Text || "Fast Delivery" },
  ];
  const cols = p.columns || "3";

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Why Choose Us"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon] || Package;
            return (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50">
                  <Icon className="h-6 w-6 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">{f.text}</h3>
                  <p className="mt-1 text-xs text-zinc-400">Lorem ipsum dolor sit amet consectetur.</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
