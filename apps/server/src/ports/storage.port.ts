/**
 * ファイル保存用ポート（MinIO / S3 / その他を差し替え可能）
 * アップロード後に取得した URL を返す。
 */
export interface StoragePort {
  /**
   * 指定キーでファイルをアップロードし、取得用 URL を返す。
   * @param key オブジェクトキー（例: avatars/user-1/abc.png）
   * @param body ファイル内容
   * @param contentType Content-Type（例: image/png）
   * @returns 取得用 URL（署名付きまたは公開 URL）
   */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;
}
