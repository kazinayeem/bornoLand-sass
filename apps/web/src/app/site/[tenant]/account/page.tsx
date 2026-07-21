"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, Mail, ChevronRight, PackageSearch } from "lucide-react";
import {
  StorefrontPage,
  StorefrontButton,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { useRequireCustomerAuth } from "@/hooks/use-require-customer-auth";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { resolveStoreHref } from "@/lib/store-href";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const dispatch = useDispatch();
  const { customer } = useSelector((s: RootState) => s.customer);
  const { classes, primaryColor } = useStorefrontSurface();
  const { showLoader } = useRequireCustomerAuth("/account");

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    window.dispatchEvent(new Event("auth-change"));
    router.replace(resolveStoreHref("/", pathname));
  };

  if (showLoader || !customer) {
    return <CustomerAuthLoader />;
  }

  const links = [
    { icon: Package, label: "My Orders", desc: "View order history", href: "/orders" },
    { icon: PackageSearch, label: "Track order", desc: "Find a shipment by order number", href: "/order-tracking" },
    { icon: Heart, label: "Wishlist", desc: "View saved items", href: "/wishlist" },
  ];

  return (
    <StorefrontPage maxWidth="md">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={cn("flex items-center gap-4 p-6", classes.card)}>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-apple-on-primary"
            style={{ backgroundColor: primaryColor }}
          >
            {customer.name[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={cn("text-tagline", classes.heading)}>{customer.name}</h1>
            <p className={cn("mt-1 flex items-center gap-1 text-caption", classes.muted)}>
              <Mail className="h-3.5 w-3.5" /> {customer.email}
            </p>
          </div>
          <StorefrontButton variant="pearl" onClick={handleLogout} className="hidden sm:inline-flex">
            <LogOut className="h-4 w-4" /> Sign out
          </StorefrontButton>
        </div>

        <div className="mt-8 space-y-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center gap-4 p-4 transition-transform duration-200 ease-apple hover:-translate-y-0.5",
                classes.card,
              )}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-apple-md"
                style={{ backgroundColor: `${primaryColor}12` }}
              >
                <link.icon className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <p className={cn("font-medium", classes.heading)}>{link.label}</p>
                <p className={cn("text-caption", classes.muted)}>{link.desc}</p>
              </div>
              <ChevronRight className={cn("h-5 w-5", classes.muted)} />
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={cn("mt-6 flex w-full items-center justify-center gap-2 py-3 text-caption font-medium text-red-500 sm:hidden")}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>

        <p className={cn("mt-8 flex items-center gap-2 text-caption", classes.muted)}>
          <User className="h-3.5 w-3.5" /> Profile editing coming soon
        </p>
      </motion.div>
    </StorefrontPage>
  );
}
