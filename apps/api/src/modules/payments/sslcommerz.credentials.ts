import { encrypt, decrypt } from "../../common/utils/encryption.js";

export function encryptSSLCommerzSecret(secret: string): string {
  if (!secret) return "";
  return encrypt(secret.trim());
}

export function decryptSSLCommerzSecret(blob: string): string {
  if (!blob) return "";
  try {
    return decrypt(blob).trim();
  } catch {
    return "";
  }
}

export function maskSecret(hasSecret: boolean): string {
  return hasSecret ? "••••••••••••" : "";
}
