import { SignJWT, jwtVerify } from "jose";

const textEncoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

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
