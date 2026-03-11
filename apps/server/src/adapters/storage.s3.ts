/**
 * S3 ストレージアダプタ（StoragePort 実装）※未実装
 * 将来 AWS S3 等に切り替える際に実装する。
 */
import type { StoragePort } from "../ports/storage.port";

export function createS3StorageAdapter(_config: {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}): StoragePort {
  return {
    async upload(_key: string, _body: Buffer, _contentType: string): Promise<string> {
      throw new Error("S3 storage adapter is not implemented yet.");
    },
    async list(_prefix: string): Promise<{ key: string; lastModified: Date }[]> {
      throw new Error("S3 storage adapter is not implemented yet.");
    },
    async remove(_key: string): Promise<void> {
      throw new Error("S3 storage adapter is not implemented yet.");
    },
    buildPublicUrl(_key: string): string {
      throw new Error("S3 storage adapter is not implemented yet.");
    },
  };
}
