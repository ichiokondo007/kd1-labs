/**
 * クライアントに返す MinIO ストレージ URL をプロキシ URL に書き換える。
 * MinIO 直アクセスで CORS/403 になるため、API 経由で画像を返す。
 * アバター・GlobalImageUrl・その他 MinIO に保存した画像 URL に共通で利用する。
 */

const MINIO_BASE =
  process.env.MINIO_PUBLIC_URL_BASE ??
  `http://${process.env.MINIO_ENDPOINT ?? "localhost"}:${process.env.MINIO_PORT ?? "9000"}`;

const API_BASE = (process.env.API_PUBLIC_BASE ?? "").replace(/\/$/, "");

/**
 * MinIO の URL ならプロキシ URL に変換、それ以外はそのまま返す。
 * API_PUBLIC_BASE が未設定の場合は書き換えずにそのまま返す（従来の挙動）。
 */
export function toProxyStorageUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  if (!API_BASE) return url;
  const normalized = url.trim();
  if (!normalized.startsWith(MINIO_BASE)) return url;
  return `${API_BASE}/api/storage/proxy?url=${encodeURIComponent(normalized)}`;
}

/** @deprecated toProxyStorageUrl を使用（アバター以外の MinIO URL も同じ関数で扱う） */
export const toProxyAvatarUrl = toProxyStorageUrl;
