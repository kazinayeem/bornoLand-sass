"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Settings,
  Truck,
  CreditCard,
  Percent,
  Bell,
  FileText,
  ShoppingCart,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { href: "", label: "General", icon: Settings },
  { href: "/shipping", label: "Shipping", icon: Truck },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/taxes", label: "Taxes", icon: Percent },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/invoice", label: "Invoice", icon: FileText },
  { href: "/checkout", label: "Checkout", icon: ShoppingCart },
  { href: "/localization", label: "Localization", icon: Globe },
] as const;

export default function StoreSettingsLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname() || "";
  const storeSlug = params.storeSlug as string;
  const base = `/store/${storeSlug}/settings`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-apple-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-apple-ink-muted-48">
          Configure shipping, payments, taxes, and checkout for your store.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible" aria-label="Settings">
          {SETTINGS_TABS.map((tab) => {
            const href = `${base}${tab.href}`;
            const active =
              tab.href === ""
                ? pathname === base || pathname === `${base}/`
                : pathname.startsWith(href);
            return (
              <Link
                key={tab.href || "general"}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-apple-primary/10 text-apple-primary"
                    : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
