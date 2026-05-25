"use client";

import { useTenant } from "@/providers/tenant-provider";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  const { store, theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}12` }}>
          <Shield className="h-6 w-6" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Privacy Policy</h1>
      </div>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Information We Collect</h2>
          <p className="mt-2">We collect information you provide directly: name, email address, shipping address, payment information, and communication preferences.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>How We Use Your Information</h2>
          <p className="mt-2">To process orders, send order updates, provide customer support, and send marketing communications (with your consent).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Data Protection</h2>
          <p className="mt-2">We implement industry-standard security measures including SSL encryption to protect your personal information.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Contact</h2>
          <p className="mt-2">For privacy-related inquiries, contact us at privacy@{store.slug || "store"}.com.</p>
        </section>
      </div>
    </div>
  );
}
