export function getStoreUrl(subdomainOrSlug: string) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site";
  if (rootDomain.includes("localhost")) {
    const port = process.env.NEXT_PUBLIC_APP_PORT ?? "3000";
    return `http://${subdomainOrSlug}.localhost:${port}`;
  }
  return `https://${subdomainOrSlug}.${rootDomain}`;
}

export function getStoreDisplayDomain(subdomainOrSlug: string) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornosoftnr.site";
  if (rootDomain.includes("localhost")) {
    const port = process.env.NEXT_PUBLIC_APP_PORT ?? "3000";
    return `${subdomainOrSlug}.localhost:${port}`;
  }
  return `${subdomainOrSlug}.${rootDomain}`;
}
