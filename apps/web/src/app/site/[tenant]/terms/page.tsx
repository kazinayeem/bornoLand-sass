"use client";

import { useTenant } from "@/providers/tenant-provider";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const { theme } = useTenant();
  const { primaryColor, darkMode } = theme;
  const isDark = darkMode;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}12` }}>
          <FileText className="h-6 w-6" style={{ color: primaryColor }} />
        </div>
        <h1 className="text-4xl font-bold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Terms of Service</h1>
      </div>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>General</h2>
          <p className="mt-2">By using our website, you agree to these terms. If you do not agree, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Orders & Payments</h2>
          <p className="mt-2">All orders are subject to availability and acceptance. We reserve the right to cancel any order. Payment is due at the time of purchase.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Pricing</h2>
          <p className="mt-2">Prices are subject to change without notice. We are not responsible for pricing errors and reserve the right to cancel orders placed with incorrect prices.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold" style={{ color: isDark ? "#fafafa" : "#18181b" }}>Limitation of Liability</h2>
          <p className="mt-2">We are not liable for any indirect, incidental, or consequential damages arising from your use of our website or products.</p>
        </section>
      </div>
    </div>
  );
}
