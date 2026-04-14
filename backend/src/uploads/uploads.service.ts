import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
/**
 * Supports both AWS S3 and Cloudflare R2 (S3-compatible API)
 * R2 is cheaper (~70% vs S3) and includes 10GB free per month
 * Switch providers by updating .env S3_ENDPOINT
 */ @Injectable()
export class UploadsService {
  private readonly client?: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly endpointUrl?: string;
  private readonly isDevelopment: boolean;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? "";
    this.publicUrl = process.env.S3_PUBLIC_URL ?? "";
    this.endpointUrl = process.env.S3_ENDPOINT ?? undefined;
    this.isDevelopment = process.env.NODE_ENV !== "production" && !this.bucket;

    if (this.bucket && this.endpointUrl) {
      this.client = new S3Client({
        region: process.env.S3_REGION ?? "auto",
        endpoint: this.endpointUrl,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
      });
    }
  }

  async createPresignedUploadUrl(
    filename: string,
    contentType = "application/octet-stream",
  ) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `products/${randomUUID()}-${sanitizedFilename}`;

    // In development without S3, return mock URLs
    if (this.isDevelopment || !this.client) {
      return {
        uploadUrl: `http://localhost:3000/mock-upload/${key}`,
        key,
        assetUrl: `https://placehold.co/400x500/f1f5f9/94a3b8?text=Product`,
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 900,
    });

    const assetUrl = this.publicUrl
      ? `${this.publicUrl.replace(/\/$/, "")}/${key}`
      : `${this.endpointUrl?.replace(/\/$/, "")}/${this.bucket}/${key}`;

    return {
      uploadUrl,
      key,
      assetUrl,
    };
  }
}
