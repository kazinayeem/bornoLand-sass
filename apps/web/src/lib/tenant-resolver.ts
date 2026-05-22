export type TenantResolution = {
  tenantKey: string | null;
  source: "subdomain" | "custom-domain" | "session" | "none";
};

export function resolveTenant(hostname: string, sessionTenantId?: string): TenantResolution {
  const rootDomain = process.env.ROOT_DOMAIN ?? "bornoland.com";

  if (sessionTenantId) {
    return {
      tenantKey: sessionTenantId,
      source: "session"
    };
  }

  if (hostname === rootDomain) {
    return {
      tenantKey: null,
      source: "none"
    };
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const tenantKey = hostname.replace(`.${rootDomain}`, "").split(".")[0] ?? null;

    return {
      tenantKey,
      source: "subdomain"
    };
  }

  return {
    tenantKey: hostname,
    source: "custom-domain"
  };
}