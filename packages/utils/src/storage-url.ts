/**
 * ストレージのオブジェクトキーと公開 URL を相互変換する純粋関数。
 *
 * MinIO / S3 等のストレージ実装に依存しない。
 * bucket は環境変数（MINIO_BUCKET 等）から呼び出し側が渡す。
 */

/**
 * オブジェクトキーからブラウザ向け公開 URL（相対パス）を組み立てる。
 * 既に URL/パス形式の場合はそのまま返す。
 *
 * @example
 * buildStorageUrl("public", "uploads/xxx.jpg")
 * // → "/storage/public/uploads/xxx.jpg"
 */
export function buildStorageUrl(bucket: string, key: string): string {
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  if (key.startsWith("/api/") || key.startsWith("/storage/")) return key;
  return `/storage/${bucket}/${key}`;
}

/**
 * 公開 URL またはパスからオブジェクトキーを抽出する。
 * 既にキーのみの場合はそのまま返す（後方互換）。
 *
 * @example
 * extractStorageKey("https://kd1-tech.net/storage/public/uploads/xxx.jpg")
 * // → "uploads/xxx.jpg"
 *
 * extractStorageKey("/storage/public/uploads/xxx.jpg")
 * // → "uploads/xxx.jpg"
 *
 * extractStorageKey("uploads/xxx.jpg")
 * // → "uploads/xxx.jpg"
 */
export function extractStorageKey(urlOrPath: string): string {
  let pathname = urlOrPath;

  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    try {
      pathname = new URL(urlOrPath).pathname;
    } catch {
      return urlOrPath;
    }
  }

  const match = pathname.match(/^\/storage\/[^/]+\/(.+)$/);
  return match ? match[1] : urlOrPath;
}
