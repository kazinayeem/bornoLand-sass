import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

const textEncoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "bornoland-dev-secret";
  return textEncoder.encode(secret);
}

export async function signToken(payload: Record<string, unknown>, expiresIn = "15m") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken<T extends Record<string, unknown>>(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as T;
}
