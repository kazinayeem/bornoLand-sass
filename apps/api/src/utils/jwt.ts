import jwt from "jsonwebtoken";

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
};

const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "bornoland.session";

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export function signSessionToken(payload: SessionPayload, expiresIn: string) {
  return jwt.sign(payload, getSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, getSecret()) as SessionPayload;
}

export function getSessionCookieName() {
  return sessionCookieName;
}

export function getSessionCookieMaxAge(rememberMe = false) {
  return rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
}

export function getSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds * 1000
  };
}
