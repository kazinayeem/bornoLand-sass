"use client";

type AuthLogLevel = "debug" | "info" | "warn" | "error";

const PREFIX = "[auth]";

function enabled() {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return window.localStorage.getItem("bornoland.auth.debug") === "1";
  } catch {
    return false;
  }
}

export function authLog(level: AuthLogLevel, message: string, detail?: Record<string, unknown>) {
  if (!enabled() && level === "debug") return;
  const payload = detail ? { ...detail } : undefined;
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  if (payload) fn(`${PREFIX} ${message}`, payload);
  else fn(`${PREFIX} ${message}`);
}

export function maskToken(token: string | null | undefined): string {
  if (!token) return "(none)";
  if (token.length <= 12) return "(set)";
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

export function readJwtExp(token: string | null | undefined): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string | null | undefined, skewSeconds = 30): boolean {
  const exp = readJwtExp(token);
  if (exp == null) return true;
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function hasDocumentCookie(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${name}=`));
}
