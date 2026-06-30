import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "./storage-provider.js";

export class S3StorageProvider implements StorageProvider {
  readonly name = "s3" as const;
  private client: S3Client;
  private bucket: string;
  private publicBase: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET ?? "";
    this.publicBase = process.env.AWS_S3_PUBLIC_URL ?? `https://${this.bucket}.s3.amazonaws.com`;
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
          }
        : undefined,
    });
  }

  private key(storeSlug: string, folder: string, storedName: string) {
    return `stores/${storeSlug}/${folder}/${storedName}`;
  }

  getPublicUrl(storagePath: string) {
    return `${this.publicBase}/${storagePath}`;
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const storagePath = this.key(input.storeSlug, input.folder, input.storedName);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
        Body: input.buffer,
        ContentType: input.mimeType,
      })
    );
    return {
      storagePath,
      publicUrl: this.getPublicUrl(storagePath),
      size: input.buffer.length,
    };
  }

  async delete(storagePath: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storagePath }));
  }
}
