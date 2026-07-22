"use client";

import { motion } from "framer-motion";
import { User, MapPin, Package, Heart, Bell, Shield, LockKeyhole } from "lucide-react";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";

const cards = [
  { href: "/account/profile", title: "Profile", desc: "Edit name, phone and avatar", icon: User },
  { href: "/account/addresses", title: "Saved Addresses", desc: "Manage up to 2 addresses", icon: MapPin },
  { href: "/account/orders", title: "My Orders", desc: "Track, download invoices and buy again", icon: Package },
  { href: "/account/wishlist", title: "Wishlist", desc: "Move saved items to cart", icon: Heart },
  { href: "/account/notifications", title: "Notifications", desc: "Order updates and security alerts", icon: Bell },
  { href: "/account/security", title: "Security", desc: "Sessions, login history and device access", icon: Shield },
  { href: "/account/password", title: "Password", desc: "Change your password", icon: LockKeyhole },
];

export default function AccountOverviewPage() {
  return (
    <CustomerAccountShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Choose what you want to manage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-apple-lg border p-4 transition-colors hover:border-apple-primary"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-apple-ink-muted-48" /> {c.title}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
                      {c.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-apple-primary group-hover:opacity-90">Open</div>
              </Link>
            );
          })}
        </div>
      </div>
    </CustomerAccountShell>
  );
}
