"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, LockKeyhole, MapPin, Bell, Shield, User, Package, Settings, LogOut } from "lucide-react";
import { StorefrontPage, useStorefrontSurface } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import { useRequireCustomerAuth } from "@/hooks/use-require-customer-auth";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { resolveStoreHref } from "@/lib/store-href";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { key: "profile", label: "Profile", href: "/account/profile", icon: User },
  { key: "password", label: "Password", href: "/account/password", icon: LockKeyhole },
  { key: "addresses", label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
  { key: "orders", label: "My Orders", href: "/account/orders", icon: Package },
  { key: "wishlist", label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { key: "notifications", label: "Notifications", href: "/account/notifications", icon: Bell },
  { key: "security", label: "Security", href: "/account/security", icon: Shield },
];

export function CustomerAccountShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { classes } = useStorefrontSurface();
  const { showLoader } = useRequireCustomerAuth("/account");
  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    window.dispatchEvent(new Event("auth-change"));
    router.push(resolveStoreHref("/", pathname));
  };

  const activeKey = useMemo(() => {
    const found = NAV_ITEMS.find((i) => pathname.startsWith(i.href));
    return found?.key ?? "profile";
  }, [pathname]);

  if (showLoader) return <CustomerAuthLoader message="Loading your account…" />;

  return (
    <StorefrontPage maxWidth="lg" parchment>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className={cn("sticky top-[calc(var(--store-header-height,70px)+1.5rem)] rounded-apple-lg border p-2 transition-[top] duration-150", classes.divider ? "border-apple-hairline" : "border-zinc-100")}>
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">Account Center</p>
                <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>
                  Manage your profile, addresses, orders and security.
                </p>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === activeKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => router.push(resolveStoreHref(item.href, pathname))}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-left transition-colors",
                        active
                          ? "bg-apple-canvas-parchment text-apple-ink"
                          : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-apple-ink" : "text-apple-ink-muted-48")} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="mt-2 border-t border-apple-hairline pt-2">
                <button
                  type="button"
                  onClick={() => router.push(resolveStoreHref("/account/security", pathname))}
                  className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-left text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                >
                  <Settings className="h-4 w-4 text-apple-ink-muted-48" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-apple-lg px-3 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === activeKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => router.push(resolveStoreHref(item.href, pathname))}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-apple-pill border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                        active
                          ? "border-apple-primary bg-apple-canvas-parchment text-apple-ink"
                          : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-apple-primary" : "text-apple-ink-muted-48")} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={cn("rounded-apple-lg border p-4", classes.card)} style={{ borderColor: "#E5E7EB" }}>
              {children}
            </div>

            <div className="hidden" aria-hidden />
          </div>
        </div>
      </motion.div>
    </StorefrontPage>
  );
}
