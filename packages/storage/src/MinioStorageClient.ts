import { Client } from "minio";
import { Readable } from "node:stream";
import type { StorageClient } from "./StorageClient.js";

export interface MinioStorageClientConfig {
  endPoint: string;
  port?: number;
  useSSL?: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

/**
 * MinIO (S3互換) ストレージクライアント。
 * docker-compose の MinIO: endPoint "localhost", port 9000, bucket "public" | "private"
 */
export class MinioStorageClient implements StorageClient {
  private readonly client: Client;
  private readonly bucket: string;

  constructor(config: MinioStorageClientConfig) {
    this.bucket = config.bucket;
    this.client = new Client({
      endPoint: config.endPoint,
      port: config.port ?? 9000,
      useSSL: config.useSSL ?? false,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, key, body, body.length, {
      "Content-Type": contentType,
    });
  }

  /**
   * 署名付き GET URL を返す。expiresIn は秒（デフォルト 7 日 = 604800）。
   */
  async getSignedUrl(key: string, expiresIn: number = 604_800): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expiresIn);
  }

  async getFile(key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, key);
    return streamToBuffer(stream);
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
