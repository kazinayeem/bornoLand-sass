import { cookies } from "next/headers";
import { config } from "@/lib/config";

export function getSessionCookieName() {
  return config.sessionCookieName;
}

export async function setSecureCookie(name: string, value: string, maxAgeSeconds: number) {
  (await cookies()).set(name, value, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds
  });
}
