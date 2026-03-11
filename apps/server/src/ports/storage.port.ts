/**
 * ファイル保存用ポート（MinIO / S3 / その他を差し替え可能）
 * アップロード後にオブジェクトキーを返す。
 */
export interface StoragePort {
  /**
   * 指定キーでファイルをアップロードし、オブジェクトキーを返す。
   * @param key オブジェクトキー（例: uploads/abc.png）
   * @param body ファイル内容
   * @param contentType Content-Type（例: image/png）
   * @returns オブジェクトキー（配信 URL への変換は呼び出し側で行う）
   */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;

  /**
   * 指定プレフィックスに一致するオブジェクト一覧を返す。
   * @param prefix オブジェクトキーのプレフィックス（例: svg-assets/）
   */
  list(prefix: string): Promise<{ key: string; lastModified: Date }[]>;

  /**
   * 指定キーのオブジェクトを削除する。
   * @param key オブジェクトキー
   */
  remove(key: string): Promise<void>;

  /**
   * オブジェクトキーからブラウザ向けの公開 URL を組み立てる。
   * @param key オブジェクトキー（例: uploads/abc.png）
   */
  buildPublicUrl(key: string): string;
}
