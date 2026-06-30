import type { StorageProvider } from "./storage-provider.js";
import { LocalStorageProvider } from "./local-storage.provider.js";
import { S3StorageProvider } from "./s3-storage.provider.js";

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (provider) return provider;
  const type = process.env.STORAGE_PROVIDER ?? "local";
  provider = type === "s3" && process.env.AWS_S3_BUCKET ? new S3StorageProvider() : new LocalStorageProvider();
  return provider;
}
