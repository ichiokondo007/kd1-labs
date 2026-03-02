import { apiClient } from "./apiClient";

/**
 * 認証付きファイルアップロード（POST /api/storage/upload）
 * dataURL または base64 を送り、MinIO 等に保存された URL を返す。
 */

export interface UploadStorageResponse {
  success: boolean;
  data: { url: string };
}

/**
 * dataURL (data:image/png;base64,...) または base64 文字列をアップロードする。
 * @param dataUrlOrBase64 dataURL または base64 文字列
 * @param contentType 例: image/png
 * @param key オブジェクトキー（省略時はサーバーが uploads/{uuid}.{ext} を生成）
 * @returns 取得用 URL（署名付き URL 等）
 */
export async function uploadFile(
  dataUrlOrBase64: string,
  contentType: string,
  key?: string
): Promise<string> {
  const base64 = dataUrlOrBase64.replace(/^data:[^;]+;base64,/, "");
  const res = await apiClient.post<UploadStorageResponse>("/api/storage/upload", {
    data: base64,
    contentType,
    ...(key && { key }),
  });
  if (!res.data.success || !res.data.data?.url) {
    throw new Error("Upload failed");
  }
  return res.data.data.url;
}
