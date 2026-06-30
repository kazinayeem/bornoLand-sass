export type StorageUploadInput = {
  buffer: Buffer;
  mimeType: string;
  storeSlug: string;
  folder: string;
  storedName: string;
};

export type StorageUploadResult = {
  storagePath: string;
  publicUrl: string;
  size: number;
};

export interface StorageProvider {
  readonly name: "local" | "s3";
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  delete(storagePath: string): Promise<void>;
  getPublicUrl(storagePath: string): string;
}
