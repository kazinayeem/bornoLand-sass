import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { config } from "@/lib/config";

export type AppSession = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
};

function getSessionCookieName() {
  return config.sessionCookieName;
}

function getSecret() {
  const secret = config.jwtSecret;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(secret);
}

export async function getServerSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    const result = await jwtVerify(token, getSecret());
    return result.payload as unknown as AppSession;
  } catch {
    return null;
  }
}
