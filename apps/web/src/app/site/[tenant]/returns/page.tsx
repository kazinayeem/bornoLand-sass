"use client";

import { useTenant } from "@/providers/tenant-provider";
import { RefreshCw } from "lucide-react";

export default function ReturnsPage() {
  const { theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}12` }}>
          <RefreshCw className="h-6 w-6" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Returns & Exchanges</h1>
      </div>
      <div className="space-y-6" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
        <section>
          <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>30-Day Return Policy</h2>
          <p className="mt-2">We accept returns within 30 days of delivery. Items must be unused and in original packaging with all tags attached.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>How to Return</h2>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Contact our support team to initiate a return</li>
            <li>Pack the item securely in its original packaging</li>
            <li>Ship the item back using the provided return label</li>
            <li>Refund is processed within 5-7 business days after we receive the item</li>
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Exchanges</h2>
          <p className="mt-2">For exchanges, please initiate a return and place a new order for the desired item. This ensures fastest processing.</p>
        </section>
      </div>
    </div>
  );
}
