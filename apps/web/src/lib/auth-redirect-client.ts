import { buildLoginUrl, validateInternalRedirect } from "./auth-redirect";

export const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";

export function getCurrentInternalUrl() {
  if (typeof window === "undefined") return null;
  return validateInternalRedirect(`${window.location.pathname}${window.location.search}`);
}

export function rememberRedirectAfterLogin(destination?: string | null) {
  if (typeof window === "undefined") return null;
  const safeDestination = validateInternalRedirect(destination ?? getCurrentInternalUrl());
  if (!safeDestination) {
    sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
    return null;
  }
  sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, safeDestination);
  return safeDestination;
}

export function clearRedirectAfterLogin() {
  if (typeof window !== "undefined") sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
}

export function consumeRedirectAfterLogin(queryRedirect?: string | null, fallback = "/workshops") {
  if (typeof window === "undefined") return fallback;
  const storedRedirect = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
  sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  return validateInternalRedirect(queryRedirect) ?? validateInternalRedirect(storedRedirect) ?? fallback;
}

export function peekRedirectAfterLogin(queryRedirect?: string | null, fallback = "/workshops") {
  if (typeof window === "undefined") return fallback;
  return validateInternalRedirect(queryRedirect) ?? validateInternalRedirect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)) ?? fallback;
}

export function getLoginUrlForCurrentPage(loginPath = "/login") {
  const destination = rememberRedirectAfterLogin();
  return buildLoginUrl(destination, loginPath);
}

export type AuthPayload = {
  user?: {
    id?: string;
    role?: string;
    defaultStoreSlug?: string | null;
    defaultLandingPath?: string | null;
    memberRole?: string;
    stores?: Array<{ id: string; slug: string; name: string }>;
  };
  session?: {
    role?: string;
    defaultStoreSlug?: string | null;
    mustChangePassword?: boolean;
    memberRole?: string;
  };
  defaultLandingPath?: string | null;
  defaultStoreSlug?: string | null;
  memberRole?: string;
  mustChangePassword?: boolean;
  stores?: Array<{ id: string; slug: string; name: string }>;
};

export function resolvePostLoginDestination(
  payload: AuthPayload,
  requestedRedirect?: string | null
): string {
  const userRole = payload.user?.role || payload.session?.role;
  const memberRole = payload.memberRole
    || payload.session?.memberRole
    || payload.user?.memberRole;
  const isSuperAdmin = userRole === "super_admin";
  const isMerchant = userRole === "admin" || userRole === "owner";
  const storesList = payload.stores || payload.user?.stores || [];
  const defaultSlug =
    payload.defaultStoreSlug ||
    payload.user?.defaultStoreSlug ||
    storesList[0]?.slug ||
    null;
  const defaultLandingPath =
    payload.defaultLandingPath || payload.user?.defaultLandingPath;

  let baseDestination: string;

  if (isSuperAdmin) {
    baseDestination = "/dashboard";
  } else if (isMerchant) {
    // Workspace-first architecture: All Merchant/Owner accounts default to /workshops
    baseDestination = "/workshops";
  } else if (userRole === "employee" || memberRole === "employee") {
    // Employee self-service
    if (defaultSlug) {
      baseDestination = `/store/${defaultSlug}/hrm/self-service`;
    } else if (defaultLandingPath && defaultLandingPath !== "/dashboard") {
      baseDestination = defaultLandingPath;
    } else {
      baseDestination = "/unauthorized";
    }
  } else {
    // Staff / Member -> Assigned store & permitted module
    if (defaultLandingPath && defaultLandingPath !== "/dashboard") {
      baseDestination = defaultLandingPath;
    } else if (defaultSlug) {
      baseDestination = `/store/${defaultSlug}/dashboard`;
    } else {
      baseDestination = "/unauthorized";
    }
  }

  // Handle redirect query parameter or remembered redirect
  const queryRedirect = validateInternalRedirect(requestedRedirect);
  if (!queryRedirect) {
    return baseDestination;
  }

  // Security checks for requested redirect based on role
  if (isSuperAdmin) {
    if (queryRedirect === "/admin/dashboard" || queryRedirect === "/admin/dashboard/") return "/dashboard";
    return queryRedirect;
  }

  if (isMerchant) {
    // Merchant cannot access /admin/* or root /dashboard platform overview
    if (
      queryRedirect.startsWith("/admin") ||
      queryRedirect === "/dashboard" ||
      queryRedirect === "/dashboard/"
    ) {
      return baseDestination;
    }

    // If queryRedirect points to a specific store route, verify access
    const match = queryRedirect.match(/^\/store\/([^/]+)/);
    if (match) {
      const requestedSlug = match[1];
      const isAuthorized =
        (defaultSlug && requestedSlug === defaultSlug) ||
        storesList.some((s) => s.slug === requestedSlug);
      if (isAuthorized) return queryRedirect;
      return baseDestination;
    }

    return queryRedirect;
  }

  // Staff / Employee
  if (
    queryRedirect.startsWith("/admin") ||
    queryRedirect === "/dashboard" ||
    queryRedirect === "/dashboard/" ||
    queryRedirect.startsWith("/workshops") ||
    queryRedirect === "/workshops"
  ) {
    return baseDestination;
  }

  const match = queryRedirect.match(/^\/store\/([^/]+)/);
  if (match) {
    const requestedSlug = match[1];
    const isAuthorized =
      (defaultSlug && requestedSlug === defaultSlug) ||
      storesList.some((s) => s.slug === requestedSlug);
    if (isAuthorized) return queryRedirect;
    return baseDestination;
  }

  return queryRedirect;
}
