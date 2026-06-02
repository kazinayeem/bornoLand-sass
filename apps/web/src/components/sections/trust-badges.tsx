"use client";

import { ShieldCheck, Truck, CreditCard, Headphones, RotateCcw } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

const badges = [
  { key: "showPayment", icon: CreditCard, label: "Secure Payment", desc: "256-bit SSL encrypted" },
  { key: "showShipping", icon: Truck, label: "Free Shipping", desc: "On orders over $50" },
  { key: "showSecurity", icon: ShieldCheck, label: "Safe & Secure", desc: "Protected checkout" },
  { key: "showGuarantee", icon: RotateCcw, label: "30-Day Returns", desc: "Money-back guarantee" },
  { key: "showSupport", icon: Headphones, label: "24/7 Support", desc: "Always here to help" },
];

export function TrustBadges({ section }: { section: SectionData }) {
  const p = section.props;
  const visible = badges.filter((b) => p[b.key as keyof typeof p] !== "false");

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Why Shop With Us"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((badge) => (
            <div key={badge.key} className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50">
                <badge.icon className="h-6 w-6 text-zinc-700" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900">{badge.label}</h3>
              <p className="mt-1 text-xs text-zinc-400">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
