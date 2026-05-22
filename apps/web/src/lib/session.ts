import { cookies } from "next/headers";

export function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME ?? "bornoland.session";
}

export function setSecureCookie(name: string, value: string, maxAgeSeconds: number) {
  cookies().set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds
  });
}
