"use client";

import { memo } from "react";
import Image from "next/image";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { StoreLink as Link } from "./store-link";
import { FooterMap } from "./footer-map";
import { FooterSocialLinks } from "./footer-social-links";
import { getContrastColor } from "@/lib/color-utils";
import { useStorefrontSurface } from "./storefront-ui";
import { useDevice } from "@/lib/device-context";
import { useFooterData } from "@/lib/storefront/use-footer-data";
import type { FooterLayoutSettings } from "@/lib/storefront/footer-types";
import type { NavigationItemData } from "@/providers/tenant-provider";
import { resolveNavigationItemHref } from "@/lib/storefront/navigation-href";
import { footerGridClass } from "@/lib/storefront/responsive-grid";
import { cn } from "@/lib/utils";

type DynamicFooterProps = {
  footerSettings?: Record<string, unknown> | FooterLayoutSettings;
  sectionType?: string;
  className?: string;
};

function FooterLinkList({
  title,
  links,
  fallback,
  textClassName,
  headingClassName,
}: {
  title: string;
  links: NavigationItemData[];
  fallback: NavigationItemData[];
  textClassName?: string;
  headingClassName?: string;
}) {
  const items = links.length > 0 ? links : fallback;
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className={cn("mb-4 text-caption-strong uppercase tracking-wider", headingClassName)}>{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id ?? `${item.title}-${item.link}`}>
            <Link
              href={resolveNavigationItemHref(item)}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noreferrer" : undefined}
              className={cn("text-body leading-[2.41] transition-colors hover:text-apple-primary", textClassName)}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandBlock({
  branding,
  tagline,
  showSocial,
  socialLinks,
  socialStyle,
  primaryColor,
  headingClassName,
  bodyClassName,
}: {
  branding: ReturnType<typeof useFooterData>["data"]["branding"];
  tagline: string;
  showSocial: boolean;
  socialLinks: ReturnType<typeof useFooterData>["data"]["socialLinks"];
  socialStyle: FooterLayoutSettings["socialIconStyle"];
  primaryColor: string;
  headingClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-2">
        {branding.logoUrl ? (
          <Image
            src={branding.logoUrl}
            alt={branding.storeName}
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-apple-sm object-contain"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-apple-sm text-sm font-semibold"
            style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
          >
            {branding.storeName[0]}
          </div>
        )}
        <span className={cn("text-tagline", headingClassName)}>{branding.shortName || branding.storeName}</span>
      </Link>
      {(tagline || branding.description) && (
        <p className={cn("text-caption leading-relaxed", bodyClassName)}>
          {tagline || branding.description}
        </p>
      )}
      {showSocial && <FooterSocialLinks links={socialLinks} style={socialStyle} />}
    </div>
  );
}

function ContactBlock({
  contact,
  formattedAddress,
  businessHours,
  showBusinessHours,
  bodyClassName,
  headingClassName,
}: {
  contact: ReturnType<typeof useFooterData>["data"]["contact"];
  formattedAddress: string;
  businessHours: string;
  showBusinessHours: boolean;
  bodyClassName?: string;
  headingClassName?: string;
}) {
  if (!contact && !formattedAddress) return null;

  return (
    <div>
      <h3 className={cn("mb-4 text-caption-strong uppercase tracking-wider", headingClassName)}>Contact</h3>
      <ul className="space-y-3">
        {contact?.email && (
          <li className={cn("flex items-center gap-2.5 text-caption", bodyClassName)}>
            <Mail className="h-4 w-4 shrink-0 text-apple-primary" />
            <a href={`mailto:${contact.email}`} className="hover:text-apple-primary">{contact.email}</a>
          </li>
        )}
        {contact?.phone && (
          <li className={cn("flex items-center gap-2.5 text-caption", bodyClassName)}>
            <Phone className="h-4 w-4 shrink-0 text-apple-primary" />
            <a href={`tel:${contact.phone}`} className="hover:text-apple-primary">{contact.phone}</a>
          </li>
        )}
        {formattedAddress && (
          <li className={cn("flex items-start gap-2.5 text-caption", bodyClassName)}>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-apple-primary" />
            <span>{formattedAddress}</span>
          </li>
        )}
        {showBusinessHours && businessHours && (
          <li className={cn("flex items-start gap-2.5 text-caption", bodyClassName)}>
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-apple-primary" />
            <span className="whitespace-pre-line">{businessHours}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

function NewsletterBlock({ textColor }: { textColor?: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-caption-strong uppercase tracking-wider" style={{ color: textColor }}>Newsletter</h3>
      <p className="text-caption opacity-80" style={{ color: textColor }}>Subscribe for updates and offers.</p>
      <div className="flex max-w-sm">
        <input
          type="email"
          placeholder="your@email.com"
          className="h-9 flex-1 rounded-l-lg border border-apple-hairline bg-transparent px-3 text-xs outline-none"
        />
        <button type="button" className="h-9 rounded-r-lg bg-apple-primary px-3 text-xs font-semibold text-apple-on-primary">
          Join
        </button>
      </div>
    </div>
  );
}

function FooterBottomBar({
  copyright,
  policyLinks,
  layout,
  divider,
  darkMode,
  classes,
}: {
  copyright: string;
  policyLinks: NavigationItemData[];
  layout: FooterLayoutSettings;
  divider: boolean;
  darkMode: boolean;
  classes: ReturnType<typeof useStorefrontSurface>["classes"];
}) {
  const fallbackPolicies: NavigationItemData[] = [
    { _id: "privacy", title: "Privacy Policy", link: "/privacy" },
    { _id: "terms", title: "Terms of Service", link: "/terms" },
    { _id: "contact", title: "Contact", link: "/contact" },
  ];

  const policies = policyLinks.length > 0 ? policyLinks : fallbackPolicies;

  return (
    <div
      className={cn(
        divider && "border-t",
        "py-6",
        classes.divider,
        darkMode ? "bg-apple-surface-black" : "bg-apple-canvas",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1440px] flex-col gap-4 px-4 sm:px-6 lg:px-8",
          layout.copyrightPosition === "center"
            ? "items-center text-center"
            : layout.copyrightPosition === "right"
              ? "items-end text-right sm:flex-row-reverse sm:justify-between"
              : "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        {layout.showCopyright !== false && (
          <p className="text-fine-print text-apple-ink-muted-48">{copyright}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-fine-print text-apple-ink-muted-48">
          {policies.map((link) => (
            <Link key={link._id ?? link.title} href={resolveNavigationItemHref(link)} className="hover:text-apple-primary">
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const DynamicFooter = memo(function DynamicFooter({
  footerSettings,
  sectionType,
  className,
}: DynamicFooterProps) {
  const { classes, primaryColor } = useStorefrontSurface();
  const device = useDevice();
  const { layout, data, template } = useFooterData({ footerSettings, sectionType });

  const isVisible =
    ((device === "desktop" || device === "laptop") && layout.visibleOnDesktop !== false) ||
    (device === "tablet" && layout.visibleOnTablet !== false) ||
    (device === "mobile" && layout.visibleOnMobile !== false);

  if (!isVisible) return null;

  const { branding, contact, copyright, quickLinks, supportLinks, policyLinks, socialLinks, formattedAddress, hasMap, mapEmbedUrl, mapCoordinates, businessHours } = data;

  const bgColor = layout.background || "";
  const textColor = layout.textColor || "";
  const tagline = branding.tagline;
  const showMap = layout.showMap && hasMap && layout.mapPosition !== "hidden";
  const columns = Math.min(Math.max(layout.columns ?? 4, 1), 5);

  const fallbackQuick: NavigationItemData[] = [
    { _id: "home", title: "Home", link: "/" },
    { _id: "shop", title: "Shop", link: "/shop" },
    { _id: "categories", title: "Categories", link: "/categories" },
    { _id: "about", title: "About", link: "/about" },
    { _id: "contact", title: "Contact", link: "/contact" },
  ];
  const fallbackSupport: NavigationItemData[] = [
    { _id: "faq", title: "FAQ", link: "/faq" },
    { _id: "shipping", title: "Shipping", link: "/shipping" },
    { _id: "returns", title: "Returns", link: "/returns" },
    { _id: "size-guide", title: "Size Guide", link: "/size-guide" },
    { _id: "contact-us", title: "Contact Us", link: "/contact" },
  ];

  const isMinimal = template === "minimal" || template === "centered";
  const isStacked = template === "stacked";
  const isSplit = template === "split" || template === "agency";

  return (
    <footer
      className={cn(!bgColor && "bg-apple-canvas-parchment dark:bg-apple-surface-tile-1", className)}
      style={{ backgroundColor: bgColor || undefined, color: textColor || undefined }}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8" style={{ padding: layout.padding || undefined }}>
        {layout.showNewsletter && layout.newsletterPosition === "top" && (
          <div className="py-apple-section border-b border-apple-hairline">
            <NewsletterBlock textColor={textColor} />
          </div>
        )}

        <div
          className={cn(
            "gap-apple-xl py-apple-section",
            isMinimal ? "text-center" : isStacked ? "flex flex-col" : cn("grid", footerGridClass(device, columns)),
          )}
        >
          {isMinimal ? (
            <div className="mx-auto max-w-2xl space-y-4">
              <BrandBlock
                branding={branding}
                tagline={tagline}
                showSocial={layout.showSocial !== false}
                socialLinks={socialLinks}
                socialStyle={layout.socialIconStyle}
                primaryColor={primaryColor}
                headingClassName={classes.heading}
                bodyClassName={classes.body}
              />
              {layout.showCopyright !== false && (
                <p className="text-fine-print text-apple-ink-muted-48">{copyright}</p>
              )}
            </div>
          ) : isSplit ? (
            <>
              <div className="space-y-6 lg:col-span-2">
                <BrandBlock
                  branding={branding}
                  tagline={tagline}
                  showSocial={layout.showSocial !== false}
                  socialLinks={socialLinks}
                  socialStyle={layout.socialIconStyle}
                  primaryColor={primaryColor}
                  headingClassName={classes.heading}
                  bodyClassName={classes.body}
                />
                {showMap && layout.mapPosition === "inline" && (
                  <FooterMap embedUrl={mapEmbedUrl} coordinates={mapCoordinates} />
                )}
              </div>
              <FooterLinkList title="Quick Links" links={quickLinks} fallback={fallbackQuick} textClassName={classes.body} headingClassName={classes.heading} />
              <FooterLinkList title="Support" links={supportLinks} fallback={fallbackSupport} textClassName={classes.body} headingClassName={classes.heading} />
              {layout.showContact !== false && (
                <ContactBlock
                  contact={contact}
                  formattedAddress={formattedAddress}
                  businessHours={businessHours}
                  showBusinessHours={layout.showBusinessHours === true}
                  bodyClassName={classes.body}
                  headingClassName={classes.heading}
                />
              )}
            </>
          ) : (
            <>
              <BrandBlock
                branding={branding}
                tagline={tagline}
                showSocial={layout.showSocial !== false}
                socialLinks={socialLinks}
                socialStyle={layout.socialIconStyle}
                primaryColor={primaryColor}
                headingClassName={classes.heading}
                bodyClassName={classes.body}
              />
              <FooterLinkList title="Quick Links" links={quickLinks} fallback={fallbackQuick} textClassName={classes.body} headingClassName={classes.heading} />
              <FooterLinkList title="Support" links={supportLinks} fallback={fallbackSupport} textClassName={classes.body} headingClassName={classes.heading} />
              {layout.showContact !== false && (
                <ContactBlock
                  contact={contact}
                  formattedAddress={formattedAddress}
                  businessHours={businessHours}
                  showBusinessHours={layout.showBusinessHours === true}
                  bodyClassName={classes.body}
                  headingClassName={classes.heading}
                />
              )}
              {layout.showNewsletter && layout.newsletterPosition === "inline" && (
                <NewsletterBlock textColor={textColor} />
              )}
            </>
          )}
        </div>

        {showMap && layout.mapPosition === "bottom" && (
          <div className="pb-apple-section">
            <FooterMap embedUrl={mapEmbedUrl} coordinates={mapCoordinates} />
          </div>
        )}

        {layout.showNewsletter && layout.newsletterPosition === "bottom" && (
          <div className="border-t border-apple-hairline py-apple-section">
            <NewsletterBlock textColor={textColor} />
          </div>
        )}
      </div>

      {!isMinimal && (
        <FooterBottomBar
          copyright={copyright}
          policyLinks={policyLinks}
          layout={layout}
          divider={layout.divider !== false}
          darkMode={false}
          classes={classes}
        />
      )}
    </footer>
  );
});
