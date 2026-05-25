"use client";

import { useTenant } from "@/providers/tenant-provider";
import { Truck } from "lucide-react";

export default function ShippingPage() {
  const { theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${primaryColor}12` }}>
          <Truck className="h-6 w-6" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Shipping Information</h1>
      </div>
      <div className="prose prose-zinc max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Delivery Options</h2>
          <p style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>We offer the following shipping methods:</p>
          <ul className="space-y-2" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
            <li><strong>Standard Shipping</strong> (3-5 business days) — $5.99 or FREE on orders over $100</li>
            <li><strong>Express Shipping</strong> (1-2 business days) — $14.99</li>
            <li><strong>International Shipping</strong> (7-14 business days) — Rates calculated at checkout</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Processing Time</h2>
          <p style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Orders are processed within 1-2 business days after payment confirmation. You will receive a shipping confirmation email with tracking information once your order ships.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Tracking</h2>
          <p style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>Track your order in real-time from your account dashboard or using the tracking link sent to your email.</p>
        </section>
      </div>
    </div>
  );
}
