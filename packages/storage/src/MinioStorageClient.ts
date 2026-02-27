import type { StorageClient } from "./StorageClient.js";

/** MinIO (S3互換) クライアント。実装は依存追加後に実装 */
export class MinioStorageClient implements StorageClient {
  private client: unknown;
  private bucket: string;

  constructor(bucket: string, _client?: unknown) {
    this.bucket = bucket;
    this.client = _client ?? null;
  }

  async upload(_key: string, _body: Buffer, _contentType: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getSignedUrl(_key: string, _expiresIn?: number): Promise<string> {
    throw new Error("Not implemented");
  }

  async getFile(_key: string): Promise<Buffer> {
    throw new Error("Not implemented");
  }

  async delete(_key: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
