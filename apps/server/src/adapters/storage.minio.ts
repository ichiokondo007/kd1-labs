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
  /**
   * 公開 URL のベース（署名なし・有効期限なし）。
   * クライアントからアクセスする MinIO の URL。例: http://localhost:9000
   * 未指定時は endPoint + port から組み立てる。
   */
  publicUrlBase?: string;
}

function buildPublicUrl(config: MinioStorageAdapterConfig, key: string): string {
  const base =
    config.publicUrlBase ??
    `${config.useSSL ? "https" : "http"}://${config.endPoint}:${config.port ?? 9000}`;
  return `${base.replace(/\/$/, "")}/${config.bucket}/${key}`;
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
      return buildPublicUrl(config, key);
    },
  };
}
