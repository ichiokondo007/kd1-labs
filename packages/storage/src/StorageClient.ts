// サンプル
export interface StorageClient {
  upload(key: string, body: Buffer, contentType: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  getFile(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
