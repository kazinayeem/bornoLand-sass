/** CMS page slug → settings content URL segment */
export const CMS_SLUG_TO_PATH: Record<string, string> = {
  faq: "faq",
  "shipping-info": "shipping",
  returns: "returns",
  "size-guide": "size-guide",
  "contact-us": "contact",
  "privacy-policy": "privacy",
  "terms-conditions": "terms",
  "about-us": "about",
};

/** URL segment → CMS API slug */
export const CMS_PATH_TO_SLUG: Record<string, string> = {
  faq: "faq",
  shipping: "shipping-info",
  returns: "returns",
  "size-guide": "size-guide",
  privacy: "privacy-policy",
  terms: "terms-conditions",
  about: "about-us",
};

export function buildSettingsContentHref(storeSlug: string, cmsSlug: string): string {
  if (cmsSlug === "contact-us") {
    return `/store/${storeSlug}/settings/contact`;
  }
  const segment = CMS_SLUG_TO_PATH[cmsSlug] ?? cmsSlug;
  return `/store/${storeSlug}/settings/content/${segment}`;
}

export function buildSettingsFaqPageHref(storeSlug: string): string {
  return `/store/${storeSlug}/settings/content/faq`;
}

export function buildSettingsFaqItemsHref(storeSlug: string): string {
  return `/store/${storeSlug}/settings/content/faq/items`;
}

export function buildSettingsContactHref(storeSlug: string): string {
  return `/store/${storeSlug}/settings/contact`;
}

export function resolveCmsSlugFromPathSegment(segment: string): string {
  return CMS_PATH_TO_SLUG[segment] ?? segment;
}
