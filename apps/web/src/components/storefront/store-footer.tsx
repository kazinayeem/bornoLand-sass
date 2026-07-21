"use client";

import { StoreLink as Link } from "./store-link";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { useStorefrontSurface } from "./storefront-ui";
import { cn } from "@/lib/utils";
import type { StorefrontSectionLike } from "./storefront-types";

type StoreFooterProps = {
  section?: StorefrontSectionLike;
  footerSections?: StorefrontSectionLike[];
};

export function StoreFooter({ section, footerSections: _footerSections }: StoreFooterProps = {}) {
  const { store, theme } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const { font, darkMode } = theme;
  const footerSection = section?.props
    ? section
    : _footerSections?.find((s) => s.type?.includes?.("footer")) ?? null;
  const footerProps: Record<string, string | number | boolean | null | undefined> = footerSection?.props ?? {};

  const bgColor = (footerProps.backgroundColor as string) || "";
  const showSocial = footerProps.showSocialLinks !== "false";
  const contactEmail = (footerProps.contactEmail as string) || "hello@example.com";
  const contactPhone = (footerProps.contactPhone as string) || "+1 (555) 123-4567";
  const contactAddress = (footerProps.contactAddress as string) || "123 Commerce St, NY 10001";

  return (
    <footer
      className={cn(!bgColor && (darkMode ? "bg-apple-surface-tile-1" : "bg-apple-canvas-parchment"))}
      style={{
        backgroundColor: bgColor || undefined,
        fontFamily: font,
      }}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-apple-section sm:px-6 lg:px-8">
        <div className="grid gap-apple-xl sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-apple-sm text-sm font-semibold text-apple-on-primary"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name[0]}
              </div>
              <span className={cn("text-tagline", classes.heading)}>{store.name}</span>
            </Link>
            <p className={cn("text-caption leading-relaxed", classes.body)}>
              {store.description ||
                "Premium ecommerce store offering curated products with fast shipping and exceptional service."}
            </p>
            {showSocial && (
              <div className="flex items-center gap-2">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-apple-sm transition-colors",
                      darkMode
                        ? "bg-apple-surface-tile-2 text-apple-body-muted hover:bg-apple-primary hover:text-apple-on-primary"
                        : "bg-apple-canvas text-apple-ink-muted-48 hover:bg-apple-primary hover:text-apple-on-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className={cn("mb-4 text-caption-strong uppercase tracking-wider", classes.heading)}>Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Shop All", href: "/shop" },
                { name: "Categories", href: "/categories" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn("text-body leading-[2.41] transition-colors hover:text-apple-primary", classes.body)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={cn("mb-4 text-caption-strong uppercase tracking-wider", classes.heading)}>Support</h3>
            <ul className="space-y-2">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Shipping Info", href: "/shipping" },
                { name: "Returns", href: "/returns" },
                { name: "Size Guide", href: "/size-guide" },
                { name: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn("text-body leading-[2.41] transition-colors hover:text-apple-primary", classes.body)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={cn("mb-4 text-caption-strong uppercase tracking-wider", classes.heading)}>Contact</h3>
            <ul className="space-y-3">
              <li className={cn("flex items-center gap-2.5 text-caption", classes.body)}>
                <Mail className="h-4 w-4 shrink-0 text-apple-primary" />
                <span>{contactEmail}</span>
              </li>
              <li className={cn("flex items-center gap-2.5 text-caption", classes.body)}>
                <Phone className="h-4 w-4 shrink-0 text-apple-primary" />
                <span>{contactPhone}</span>
              </li>
              <li className={cn("flex items-center gap-2.5 text-caption", classes.body)}>
                <MapPin className="h-4 w-4 shrink-0 text-apple-primary" />
                <span>{contactAddress}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={cn("border-t py-6", classes.divider, darkMode ? "bg-apple-surface-black" : "bg-apple-canvas")}>
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-fine-print text-apple-ink-muted-48">
            {footerProps.copyright ?? `© ${new Date().getFullYear()} ${store.name}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4 text-fine-print text-apple-ink-muted-48">
            <Link href="/privacy" className="hover:text-apple-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-apple-primary">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-apple-primary">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
