import { encrypt, decrypt } from "../../common/utils/encryption.js";
import type { CourierCredentials } from "./courier.types.js";

export function encryptCourierCredentials(credentials: CourierCredentials): string {
  return encrypt(JSON.stringify(credentials));
}

export function decryptCourierCredentials(blob: string): CourierCredentials {
  if (!blob) return {};
  try {
    const parsed = JSON.parse(decrypt(blob)) as CourierCredentials;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
