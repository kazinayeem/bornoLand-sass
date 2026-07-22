"use client";

import { useMemo } from "react";
import type { NavigationItemData } from "@/providers/tenant-provider";
import type { StoreContact } from "@/redux/api/store-contact-api";
import { useGetStoreContactQuery } from "@/redux/api/store-contact-api";
import { useTenant } from "@/providers/tenant-provider";
import {
  DEFAULT_FOOTER_LAYOUT,
  SECTION_TYPE_TO_FOOTER_TEMPLATE,
  type FooterLayoutSettings,
  type FooterTemplate,
} from "./footer-types";

export type FooterBranding = {
  storeName: string;
  shortName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
};

export type FooterSocialLink = {
  key: string;
  label: string;
  url: string;
};

export type FooterLinkGroup = {
  title: string;
  links: NavigationItemData[];
};

export type FooterGlobalData = {
  branding: FooterBranding;
  contact: StoreContact | null;
  copyright: string;
  quickLinks: NavigationItemData[];
  supportLinks: NavigationItemData[];
  policyLinks: NavigationItemData[];
  socialLinks: FooterSocialLink[];
  formattedAddress: string;
  hasMap: boolean;
  mapEmbedUrl: string;
  mapCoordinates: { lat: string; lng: string } | null;
  businessHours: string;
};

function formatAddress(contact: StoreContact | null): string {
  if (!contact) return "";
  const parts = [contact.address, contact.city, contact.postalCode, contact.country].filter(Boolean);
  return parts.join(", ");
}

function buildCopyright(storeName: string, businessName?: string): string {
  const name = businessName?.trim() || storeName;
  return `© ${new Date().getFullYear()} ${name}. All rights reserved.`;
}

function extractSocialLinks(contact: StoreContact | null): FooterSocialLink[] {
  if (!contact?.socialLinks) return [];
  const entries: Array<[string, string, string]> = [
    ["facebook", "Facebook", contact.socialLinks.facebook ?? ""],
    ["instagram", "Instagram", contact.socialLinks.instagram ?? ""],
    ["x", "X", contact.socialLinks.x ?? ""],
    ["linkedin", "LinkedIn", contact.socialLinks.linkedin ?? ""],
    ["youtube", "YouTube", contact.socialLinks.youtube ?? ""],
    ["telegram", "Telegram", contact.socialLinks.telegram ?? ""],
  ];
  return entries
    .filter(([, , url]) => Boolean(url?.trim()))
    .map(([key, label, url]) => ({ key, label, url: url.trim() }));
}

function splitFooterNavigation(items: NavigationItemData[]) {
  const visible = items.filter((item) => item.isVisible !== false);
  return {
    quickLinks: visible.slice(0, 5),
    supportLinks: visible.slice(5, 10),
    policyLinks: visible.slice(10, 13).length > 0 ? visible.slice(10, 13) : visible.slice(-3),
  };
}

export function resolveFooterLayoutSettings(
  footerSettings?: Record<string, unknown> | FooterLayoutSettings,
  sectionType?: string,
): FooterLayoutSettings {
  const fromSettings = (footerSettings ?? {}) as FooterLayoutSettings;
  const template =
    fromSettings.template ??
    (sectionType ? SECTION_TYPE_TO_FOOTER_TEMPLATE[sectionType] : undefined) ??
    DEFAULT_FOOTER_LAYOUT.template;

  return {
    ...DEFAULT_FOOTER_LAYOUT,
    ...fromSettings,
    template,
    columns: Number(fromSettings.columns ?? DEFAULT_FOOTER_LAYOUT.columns),
  };
}

export function useFooterData(options?: {
  footerSettings?: Record<string, unknown> | FooterLayoutSettings;
  sectionType?: string;
  contactOverride?: StoreContact | null;
}): { layout: FooterLayoutSettings; data: FooterGlobalData; template: FooterTemplate } {
  const { store, navigations, contact: tenantContact } = useTenant();
  const { data: fetchedContact } = useGetStoreContactQuery(store._id, {
    skip: !store._id || Boolean(tenantContact),
  });

  const contact = tenantContact ?? fetchedContact ?? options?.contactOverride ?? null;
  const layout = useMemo(
    () => resolveFooterLayoutSettings(options?.footerSettings, options?.sectionType),
    [options?.footerSettings, options?.sectionType],
  );

  const data = useMemo<FooterGlobalData>(() => {
    const footerNav = navigations.find((nav) => nav.key === "footer" && nav.isActive);
    const footerItems = footerNav?.items ?? [];
    const { quickLinks, supportLinks, policyLinks } = splitFooterNavigation(footerItems);

    const branding: FooterBranding = {
      storeName: store.name,
      shortName: store.shortName ?? store.name,
      tagline: store.tagline ?? "",
      description: store.description ?? "",
      logoUrl: store.logoUrl ?? "",
      faviconUrl: store.faviconUrl ?? "",
    };

    const lat = contact?.latitude?.trim();
    const lng = contact?.longitude?.trim();
    const embedUrl = contact?.googleMapsEmbedUrl?.trim() ?? "";

    return {
      branding,
      contact,
      copyright: buildCopyright(branding.storeName, contact?.businessName),
      quickLinks,
      supportLinks,
      policyLinks,
      socialLinks: extractSocialLinks(contact),
      formattedAddress: formatAddress(contact),
      hasMap: Boolean((lat && lng) || embedUrl),
      mapEmbedUrl: embedUrl,
      mapCoordinates: lat && lng ? { lat, lng } : null,
      businessHours: contact?.businessHours?.trim() ?? "",
    };
  }, [store, navigations, contact]);

  return {
    layout,
    data,
    template: layout.template ?? "commerce",
  };
}
