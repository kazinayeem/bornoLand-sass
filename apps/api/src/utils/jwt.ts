import jwt from "jsonwebtoken";
import { serverConfig } from "../config/server.js";

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
};

const sessionCookieName = serverConfig.SESSION_COOKIE_NAME;

function getSecret() {
  const secret = serverConfig.JWT_SECRET;

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
  const options: Record<string, unknown> = {
    httpOnly: true,
    secure: serverConfig.isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };

  if (serverConfig.isProd) {
    options.domain = serverConfig.WILDCARD_DOMAIN || `.${serverConfig.ROOT_DOMAIN}`;
  } else if (serverConfig.WILDCARD_DOMAIN) {
    options.domain = serverConfig.WILDCARD_DOMAIN;
  }

  return options;
}
