const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/logout",
  "/auth",
  "/admin/login",
] as const;

const MAX_REDIRECT_LENGTH = 2_048;

function hasRoutePrefix(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function safelyDecode(value: string) {
  let decoded = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      return null;
    }
  }
  return decoded;
}

/**
 * Accepts only same-application absolute paths. Protocol-relative URLs, encoded
 * external URLs, auth pages, control characters, and backslash variants are rejected.
 */
export function validateInternalRedirect(value: string | null | undefined): string | null {
  if (!value || value.length > MAX_REDIRECT_LENGTH || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;

  const decoded = safelyDecode(value);
  if (!decoded || decoded.startsWith("//") || decoded.includes("\\") || /[\u0000-\u001f\u007f]/.test(decoded)) return null;

  try {
    const base = new URL("https://bornoland.internal");
    const parsed = new URL(value, base);
    if (parsed.origin !== base.origin || parsed.username || parsed.password) return null;

    const pathname = parsed.pathname.replace(/\/{2,}/g, "/");
    const normalizedPath = safelyDecode(pathname)?.toLowerCase();
    if (!normalizedPath || normalizedPath.startsWith("//")) return null;
    if (AUTH_PATHS.some((route) => hasRoutePrefix(normalizedPath, route))) return null;

    return `${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function buildLoginUrl(destination: string | null | undefined, loginPath = "/login") {
  const safeDestination = validateInternalRedirect(destination);
  if (!safeDestination) return loginPath;
  return `${loginPath}?redirect=${encodeURIComponent(safeDestination)}`;
}

export function isAuthenticationPath(pathname: string) {
  const normalized = pathname.toLowerCase().replace(/\/{2,}/g, "/");
  return AUTH_PATHS.some((route) => hasRoutePrefix(normalized, route));
}
