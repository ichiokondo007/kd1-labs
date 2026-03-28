/**
 * MinIO ストレージアダプタ（StoragePort 実装）
 * アップロード後に署名なし・有効期限なしの公開 URL を返す（バケットを公開読み取りにすること）。
 */
import { MinioStorageClient } from "@kd1-labs/storage";
import type { StoragePort } from "../ports/storage.port";

export interface MinioStorageAdapterConfig {
  endPoint: string;
  port?: number;
  useSSL?: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export function createMinioStorageAdapter(config: MinioStorageAdapterConfig): StoragePort {
  const client = new MinioStorageClient({
    endPoint: config.endPoint,
    port: config.port,
    useSSL: config.useSSL,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    bucket: config.bucket,
  });

  return {
    async upload(key: string, body: Buffer, contentType: string): Promise<string> {
      await client.upload(key, body, contentType);
      return key;
    },

    async list(prefix: string): Promise<{ key: string; lastModified: Date }[]> {
      const objects = await client.listObjects(prefix);
      return objects.map((o) => ({ key: o.key, lastModified: o.lastModified }));
    },

    async remove(key: string): Promise<void> {
      await client.delete(key);
    },

    buildPublicUrl(key: string): string {
      return client.buildPublicUrl(key);
    },
  };
}
