import { buildLoginUrl, validateInternalRedirect } from "@/lib/auth-redirect";

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

export function consumeRedirectAfterLogin(queryRedirect?: string | null, fallback = "/dashboard") {
  if (typeof window === "undefined") return fallback;
  const storedRedirect = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
  sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  return validateInternalRedirect(queryRedirect) ?? validateInternalRedirect(storedRedirect) ?? fallback;
}

export function peekRedirectAfterLogin(queryRedirect?: string | null, fallback = "/dashboard") {
  if (typeof window === "undefined") return fallback;
  return validateInternalRedirect(queryRedirect) ?? validateInternalRedirect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)) ?? fallback;
}

export function getLoginUrlForCurrentPage(loginPath = "/login") {
  const destination = rememberRedirectAfterLogin();
  return buildLoginUrl(destination, loginPath);
}
