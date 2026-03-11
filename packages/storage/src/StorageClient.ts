export interface StorageObjectInfo {
  key: string;
  lastModified: Date;
  size: number;
}

export interface StorageClient {
  upload(key: string, body: Buffer, contentType: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  getFile(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  listObjects(prefix: string): Promise<StorageObjectInfo[]>;
  /** キーからブラウザ向け公開 URL を組み立てる */
  buildPublicUrl(key: string): string;
}
